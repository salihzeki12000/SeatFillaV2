/*
    A basic cache implementation for storing global data accross services.

    At this present stage data decays due to certain expiration policies.
    
    This cache has the following features:
    1) Switching in and out of process memory and secondary storage (file/database)
    2) File based storage for json objects, serialize least accessed data items to file,
     whilst leaving the more frequently accessed items in memory
    3) Add support for memory based expiration policies
    4) Generic store method so that implementation does not matter and items can be serialized in any way.

    In production, implementations of this cache on the Seatfilla website
    can take advantage of the Redis session storage so that cached items
    can be stored and retrieved over multiple app instances in a shared way.

    Created by Dale.
*/

const FileUtils = require('../utils/FileUtils'),
    MemoryConversionUtils = require('../utils/MemoryConversionUtils'),
    FunctionalUtils = require('../utils/FunctionalUtils')
sizeof = require('object-sizeof')

/*
    Stores global cache implementations.
*/
const cacheObj = cacheObj || {}

function GlobalCache(object) {
    if (!object) throw new Error('Invalid object passed to GlobalCache.js GlobalCache constructor')

    const _self = this

    _self.key = object.GlobalCache
    _self.Data = object.Data || {}
}

GlobalCache.prototype.getCacheKey = function() {
    const _self = this
    return _self.key
}

GlobalCache.prototype.getDataObject = function(key) {
    const _self = this

    if (!_self.Data) throw new Error('Invalid state in GlobalCache.js/getDataObject')

    return new Promise(function(resolve, reject) {
        // Run the expiration policy on the data to make sure that the data being retrievied is 'clean'
        sails.log.debug('GlobalCache (' + _self.key + ') deleting ' + key + ' if it has expired. (getData())')

        if (_self.deleteIfExpired(key)) {
            sails.log.debug('GlobalCache: (' + _self.key + '):' + ' key ' +
                key + 'has now expired and will be removed from the cache. (getData())')

            return resolve(null)
        } else if (_self.isSerialized(key)) {
            sails.log.debug('GlobalCache: (' + _self.key + '): retrieving serialized data item : ' +
                key + ' from store')

            _self.retrieveAndDeserialize(key, function(err, deserialized) {
                if (err) {
                    sails.log.error(err)
                    return reject(err)
                } else {
                    deserialized.numberOfTimesDeserialized++
                        deserialized.lastAccessed = new Date()
                    delete deserialized.isSerialized
                    return resolve(deserialized)
                }
            })
        } else {
            if (_self.Data[key])
                _self.Data[key].lastAccessed = new Date()

            return resolve(_self.Data[key])
        }
    })
}

GlobalCache.prototype.setDataAttribute = function(key, attr, value) {
    return _self.getDataObject(key).then(function(exists) {
        if (exists) {
            exists[attr] = value
            return Promise.resolve(true)
        } else {
            return Promise.resolve(false)
        }
    })
}

GlobalCache.prototype.getDataAttribute = function(key, attr) {
    return _self.getDataObject(key).then(function(exists) {
        return Promise.resolve(exists[attr])
    })
}

GlobalCache.prototype.setLastAccessed = function(key, date) {
    const _self = this
    return _self.setDataAttribute(key, 'lastAccessed', date)
}

GlobalCache.prototype.getLastAccessed = function(key) {
    const _self = this
    return _self.getDataAttribute(key, 'lastAccessed')
}

GlobalCache.prototype.getLastModified = function(key) {
    const _self = this
    return _self.getDataAttribute(key, 'lastModified')
}

GlobalCache.prototype.setLastModified = function(key, date) {
    const _self = this
    return _self.setDataAttribute(key, 'lastModified', date)
}

GlobalCache.prototype.getInsertationTime = function(key) {
    const _self = this
    return _self.getDataAttribute(key, 'insertationTime')
}

GlobalCache.prototype.setInsertationTime = function(key, date) {
    const _self = this
    return _self.setDataAttribute(key, 'insertationTime', date)
}

GlobalCache.prototype.getData = function(key) {
    const _self = this
    return _self.getDataObject(key).then(function(data) {
        if (data != null && 'value' in data) {
            sails.log.debug('Found data in GlobalCache for key ' + key);
            sails.log.debug(JSON.stringify(data.value));
            if (!data.value) {
                sails.log.debug('GlobalCache: (' + _self.key + '):' +
                    ' Value for global cache object with key ' + key + ' is null ');
            }
            return Promise.resolve(data.value)
        }

        return Promise.resolve(data)
    }).catch(function(err) {
        sails.log.error(err)
        return Promise.reject(err)
    })
}

GlobalCache.prototype.removeData = function(key) {
    const _self = this

    if (key in _self.Data) {
        if (_self.ExpirationSettings.runExpirationPolicyOnDeletions &&
            typeof _self.ExpirationSettings.runExpirationPolicyOnDeletions == 'function' &&
            _self.ExpirationSettings.runExpirationPolicyOnDeletions())
            _self.runExpirationPolicy()

        // Add support for removing serialized items

        delete _self.Data[key]
        return true
    } else {
        return false
    }
}

GlobalCache.prototype.getSizeBytes = function() {
    return sizeof(this)
}

GlobalCache.prototype.insertData = function(key, data) {
    const _self = this;

    if (!('Data' in _self))
        throw new Error('Invalid object state for GlobalCache in GlobalCache.js/insertData, Data object must be defined.');

    if (key in _self.Data) {
        return false;
    }

    if (_self.expirationSettings.runExpirationPolicyOnInserts &&
        typeof _self.expirationSettings.runExpirationPolicyOnInserts == 'function' &&
        _self.expirationSettings.runExpirationPolicyOnInserts())
        _self.runExpirationPolicy()


    const dataObject = {
        value: data,
        insertationTime: new Date(),
        lastAccessed: null,
        lastModified: null,
        numberOfTimesSerialized: 0,
        numberOfTimesDeserialized: 0
    }

    _self.Data[key] = dataObject
    return true;
}

GlobalCache.prototype.setData = function(key, data) {
    const _self = this

    if (key in _self.Data) {
        _self.Data[key].lastModified = new Date()
            // Make sure we dont override the changed data later..
        delete _self.Data[key].isSerialized
        _self.Data[key].value = data
    } else {
        return _self.insertData(key, data)
    }
}

/*
  Turn the cached data into a format ready for storage in a DB/Filesystem
  */
GlobalCache.prototype.serialize = function(key, dataItem, callback) {
    try {
        return callback(null, JSON.stringify(dataItem))
    } catch (err) {
        sails.log.error(err)
        callback(err, null)
    }
}

/*
    Turn serialized data back into a format for memory.
*/
GlobalCache.prototype.deserialize = function(data, callback) {
    FileUtils.safeParseJsonAsync(data).then(function(obj) {
        return callback(null, obj)
    }).catch(function(err) {
        return callback(err, null)
    })
}

/*
    Store the item in some way, away from process memory
*/
GlobalCache.prototype.store = function(key, dataItem, callback) {
    const _self = this

    FileUtils.createTempDirAndWrite(_self.key, 'GlobalCacheItem-' + key, dataItem)
        .then(function(dirInfo) {
            sails.log.debug('Storing to : ' + JSON.stringify(dirInfo))
            callback(null, dirInfo)
        }).catch(function(err) {
            sails.log.error(err)
            callback(err)
        })

    return true
}

/*
    Retrieve data from its storage location.
*/
GlobalCache.prototype.retrieve = function(key, callback) {
    const _self = this

    if (!(key in _self.Data) || !('isSerialized' in _self.Data[key])) throw new Error('Invalid param key')

    FileUtils.readFromDir(_self.Data[key].isSerialized.dirPath, 'GlobalCacheItem-' + key).then(function(data) {
        callback(null, data)
    }).catch(function(err) {
        sails.log.error(err)
        callback(err, null)
    })
}
GlobalCache.prototype.retrieveAndDeserialize = function(key, callback) {
    const _self = this

    _self.retrieve(key, function(err, data) {
        if (err) {
            sails.log.error(err)
            return callback(err, null)
        } else {
            _self.deserialize(data, function(err, deserialized) {
                delete _self.Data[key].isSerialized
                _self.Data[key].value = deserialized
                _self.Data[key].lastAccessed = new Date()
                return callback(null, _self.Data[key])
            })
        }
    })
}
GlobalCache.prototype.isSerialized = function(key) {
    const _self = this

    if (_self.Data && key in _self.Data && 'isSerialized' in _self.Data[key]) {
        return true
    } else {
        return false
    }
}
GlobalCache.prototype.runExpirationPolicy = function() {
    const _self = this

    if (!_self.expirationPolicies && !_self.secondaryStoragePolicies) return

    return new Promise(function(resolve, reject) {
        if ('Data' in _self) {

            // Check to see if the whole cache should be serialized, 
            // normally upon the cache memory constraints becoming to heavy
            const shouldSerialize = _self.shouldSerializeCache()

            // Iterate each of the cache data items..
            for (var key in _self['Data']) {
                if (_self['Data'].hasOwnProperty(key)) {

                    // Holds state specifying whether or not a cached item was deleted if it was expired
                    const wasDeleted = false

                    // Delete the cached item if it has expired.
                    if (_self.deleteIfExpired(key)) {
                        sails.log.debug('GlobalCache: (' + _self.key + '):' + ' key: ' +
                            key + 'has now expired and will be removed from the cache.')

                        // We have deleted the item
                        wasDeleted = true

                        // If there is a refresh policy, the item is refreshed and no longer deleted.
                        if (_self.refreshPolicy && typeof _self.refreshPolicy === 'function') {
                            _self.setData(key, _self.refreshPolicy(key))
                            if (_self['Data'][key] != null) {
                                wasDeleted = false
                            }
                        }
                    }

                    // If should serialize is set, or this item should be moved to secondary storage, then serialize and store the item.
                    if ((shouldSerialize && !wasDeleted && 'value' in _self.Data[key]) ||
                        (!wasDeleted && _self.shouldMoveToSecondaryStorage(key) &&
                            'value' in _self.Data[key])) {
                        sails.log.debug('GlobalCache: (' + _self.key + '): serializing data object with ' + key)

                        try {
                            // Serialize our data before moving it out of mem..
                            _self.serialize(key, _self.Data[key].value, function serializeCalled(err, data) {
                                if (err || !data) {
                                    sails.log.debug('GlobalCache: (' + _self.key + '): error when serializing data with key ' + key + ' data was ' + _self['Data'][key])
                                    sails.log.error(err)
                                    return reject(err)
                                } else {
                                    sails.log.debug('GlobalCache: (' + _self.key + '): storing data with key: ' + key)

                                    // Store our item
                                    _self.store(key, data,
                                        function storeCalled(err, path) {
                                            if (err) {
                                                sails.log.debug('Error when storing item with key ' + key + ' in global cache ' + _self.key)
                                                sails.log.error(err)
                                                return reject(err)
                                            } else {
                                                // Handle stored item, delete it from memory or whatever
                                                _self.Data[key].value = null
                                                _self.Data[key].numberOfTimesSerialized++
                                                    _self.Data[key].isSerialized = path
                                                sails.log.debug('GlobalCache: (' + _self.key + '): succesfully stored ata with key: ' + key)
                                                return resolve(true)
                                            }
                                        })
                                }
                            })
                        } catch (err) {
                            sails.log.error(err)
                            sails.log.debug('Error when trying to store/serialize object in GlobalCache ( ' + _self.key + '), key was ' + key + ' data was ' + _self.Data[key])
                            return reject(err)
                        }
                    } else {
                        sails.log.debug('GlobalCache: (' + _self.key + '): did not move ' + key + ' into secondary storage/serialize because it was already serialized. ')
                    }
                }
            }
        } else {
            return reject(new Error('Invalid state for cache ' + _self.key + ' in GlobalCache.js/runExpirationPolicy'))
        }
    }).catch(function(err) {
        sails.log.error(err)
    })
}
GlobalCache.prototype.checkExpired = function(key) {
    const _self = this
    return _self.checkPolicies('expirationPolicies', key)
}
GlobalCache.prototype.deleteIfExpired = function(key) {
    const _self = this

    if (_self.checkExpired(key)) {
        delete _self.Data[key]
        return true
    } else {
        sails.log.debug('GlobalCache (' + _self.key + '): ' + key + ' has not expired')
        return false
    }
}
GlobalCache.prototype.checkPolicies = function(attr, key) {
    const _self = this

    if (attr in _self || !_self[attr] || !Array.isArray(_self[attr])) {
        return false
    }

    for (var i = 0; i < _self[attr].length; i++) {
        if (_self.checkPolicy(_self[attr][i], _self.Data[key] || undefined)) {
            return true
        }
    }
    return false
}
GlobalCache.prototype.checkPolicy = function(policy, dataItem) {
    if (typeof policy == 'function' && policy(dataItem)) {
        return true
    } else {
        return false
    }
}
GlobalCache.prototype.shouldMoveToSecondaryStorage = function(key) {
    const _self = this
    if (!_self.secondaryStorageSettings.UseSecondaryStorage || !(key in _self.Data) || _self.isSerialized(key)) {
        return false
    } else {
        sails.log.debug(_self.Data[key])
    }
    return _self.checkPolicies('secondaryStoragePolicies', key)
}

GlobalCache.prototype.shouldSerializeCache = function() {
    return this.checkPolicies('serializationPolicies', null)
}

GlobalCache.prototype.deleteCache = function() {
    const _self = this

    _self.stopScheduledExpirationPolicy()
    _self.runExpirationPolicy()
    delete cacheObj[_self.key]
}

GlobalCache.prototype.setPolicies = function(attr, obj) {
    const _self = this

    if (!Array.isArray(obj))
        throw new Error('Invalid object passed to GlobalCache.js/setPolicies, must be an array')

    if (!(attr in _self) || !_self[attr])
        _self[attr] = []

    if (!(Array.isArray(_self[attr])))
        throw new Error('Invalid attribute specified for setPolicies in GlobalCache.js : ' + attr)

    obj.forEach(function(expiriationPolicy) {
        _self.setPolicy(attr, expiriationPolicy)
        sails.log.debug('GlobalCache (' + _self.key + ') setting policy ' + attr)
    })
}

GlobalCache.prototype.setPolicy = function(attr, policy) {
    if (!(typeof policy == 'function')) {
        throw new Error('Invalid state in GlobalCache.js/setPolicy ' + policy + ' is not a function ' + JSON.stringify(policy))
    }

    if (Array.isArray(this[attr])) {
        this[attr].push(policy)
    } else {
        this[attr] = policy
    }
}

GlobalCache.prototype.setExpirationPolicies = function(obj) {
    this.setPolicies('expirationPolicies', obj)
}

GlobalCache.prototype.getSecondaryStoragePolicies = function() {
    return this.secondaryStoragePolicies
}
GlobalCache.prototype.getExpirationPolicies = function() {
    return this.expirationPolicies
}

GlobalCache.prototype.setSecondaryStoragePolicies = function(obj) {
    this.setPolicies('secondaryStoragePolicies', obj)
}

GlobalCache.prototype.setSerializationPolicies = function(obj) {
    this.setPolicies('serializationPolicies', obj)
}

GlobalCache.prototype.setRefreshPolicy = function(refreshPolicy) {
    const _self = this
    _self.setPolicy('refreshPolicy', refreshPolicy)
}

GlobalCache.prototype.getRefreshPolicy = function() {
    return this.refreshPolicy
}

GlobalCache.prototype.stopScheduledExpirationPolicy = function() {
    const _self = this

    if (!_self.ScheduledTask) return

    if (!(ScheduledExecutorService.stopScheduledTask(_self.GlobalCache + '-GlobalCache'))) {
        sails.log.debug('Tried to stop scheduled execution service for  ' +
            _self.GlobalCache + ' but failed, setting event listener')

        ScheduledExecutorService.setOn('scheduled', function() {
            sails.log.debug('Succesfully hooked scheduled event for scheduled exector service on ' +
                _self.GlobalCache)

            sails.log.debug('Attempting to remove ' + _self.GlobalCache + ' executor service')

            if (ScheduledExecutorService.stopScheduledTask(_self.GlobalCache + '-GlobalCache')) {
                sails.log.debug('Succesfully stopped scheduled execution service for global cache ' + _self.GlobalCache)
            } else {
                delete _self.ScheduledTask
            }
        })
    } else {
        sails.log.debug('Succesfully stopped scheduled execution service for global cache ' + _self.GlobalCache)
        delete _self.ScheduledTask
    }
}

GlobalCache.prototype.trySchedule = function() {
    const self = this

    if (self.scheduledTimes.scheduledPolicyInterval || self.scheduledTimes.scheduledPolicyInitialDelay) {
        const interval = self.scheduledTimes.scheduledPolicyInterval ?
            self.scheduledTimes.scheduledPolicyInterval.toMilliseconds() : 0

        const delay = self.scheduledTimes.scheduledPolicyInitialDelay ?
            self.scheduledTimes.scheduledPolicyInitialDelay.toMilliseconds() : 0

        ScheduledExecutorService.execute({
            key: self.GlobalCache + '-GlobalCache',
            on: {
                executionBegan(date) {
                    sails.log.debug('Running expiration policy for cache ' +
                        self.GlobalCache + ' on ' + date)
                },
                executionFinished(date, output) {
                    sails.log.debug('Finished running expiration policy for cache ' +
                        self.GlobalCache + ' on ' + date)
                },
                error(date, error) {
                    sails.log.debug('Error running expiration policy for cache ' +
                        self.GlobalCache + ' on ' + date)
                    sails.log.error(error)
                },
                stop(date) {
                    sails.log.debug('Stopped scheduled task of global cache ' +
                        self.GlobalCache)
                }
            },
            work() {
                self.runExpirationPolicy()
            },
            maxExecutions: 0
        }, interval, delay)

        sails.log.debug('Succesfully scheduled ' + self.GlobalCache + ' expiration policy to run every ' +
            ((interval.getValue && interval.getValue()) || 0) + ' ms with an initial delay of ' + ((delay.getValue())) + ' ms ')

        self.ScheduledTask = true
    }
}

module.exports = {
    cache(object) {
        if (!object) {
            throw new Error('Invalid params to exported function in GlobalCache.js.')
        } else if (!object.GlobalCache) {
            throw new Error('Invalid params to exported function in GlobalCache.js. Object.globalCache || Object.CacheSettings must exist')
        }

        if (object.GlobalCache in cacheObj) {
            return cacheObj[object.GlobalCache]
        }

        const cache = new GlobalCache(object)
        cache.creationTime = new Date()
        cacheObj[object.GlobalCache] = cache

        cache.GlobalCache = object.GlobalCache

        cache.expirationSettings = {}

        cache.expirationSettings.runExpirationPolicyOnInserts = (object.ExpirationSettings && object.ExpirationSettings.runExpirationPolicyOnInserts) || null

        cache.expirationSettings.runExpirationPolicyOnDeletions = (object.ExpirationSettings && object.ExpirationSettings.runExpirationPolicyOnDeletions) || null

        cache.setExpirationPolicies(object.ExpirationPolicies || [])
        cache.setSecondaryStoragePolicies(object.SecondaryStoragePolicies || [])
        cache.setSerializationPolicies(object.SerializationPolicies || [])

        cache.scheduledTimes = {}

        cache.scheduledTimes.scheduledPolicyInterval = object.ScheduledPolicyInterval || null
        cache.scheduledTimes.scheduledPolicyInitialDelay = object.ScheduledPolicyIntialDelay || null
        cache.secondaryStorageSettings = {}
        cache.secondaryStorageSettings.UseSecondaryStorage = object.UseSecondaryStorage || true

        cache.refereshPolicy = 'RefreshPolicy' in object && typeof object.RefreshPolicy === 'function' && object.RefreshPolicy

        if (object.SecondaryStorageSettings) {
            if (object.SecondaryStorageSettings.serialize && typeof object.SecondaryStorageSettings.serialize == 'function')
                cache.serialize = object.SecondaryStorageSettings.serialize

            if (object.SecondaryStorageSettings.deserialize && object.SecondaryStorageSettings.deserialize == 'function')
                cache.deserialize = object.SecondaryStorageSettings.deserialize

            if (object.SecondaryStorageSettings.retrieve && object.SecondaryStorageSettings.retrieve == 'function')
                cache.retrieve = object.SecondaryStorageSettings.retrieve

            if (object.SecondaryStorageSettings.store && object.SecondaryStorageSettings.store == 'function')
                cache.store = object.SecondaryStorageSettings.store
        }

        if (!('ScheduledTask' in cache)) {
            sails.log.debug('Cache ' + cache.GlobalCache + ' is not scheduled, attempting to schedule ')
            cache.trySchedule()
        }
        return cacheObj[object.GlobalCache]
    },
    SerializationPolicies: {
        sizeOfCachePolicy(cacheKey, memoryUnit, cmpFunc) {
            if (!cacheKey || !cacheKey in cacheObj) throw new Error('Invalid cache key in GlobalCache.js/sizeOfCachePolicy')
            return function() {
                return cmpFunc(cacheObj[cacheKey].getSizeBytes(), memoryUnit.toBytes());
            }
        },
        sizeOfCacheLessThan(memoryUnit, key) {
            return this.sizeOfCachePolicy(key, memoryUnit, FunctionalUtils.lessThan)
        },
        sizeOfCacheLessThanOrEqualTo(memoryUnit, key) {
            return this.sizeOfCachePolicy(key, memoryUnit, FunctionalUtils.lessThanOrEqualTo)
        },
        sizeOfCacheGreaterThan(memoryUnit, key) {
            return this.sizeOfCachePolicy(key, memoryUnit, FunctionalUtils.greaterThan)
        },
        sizeOfCacheGreaterThanOrEqualTo(memoryUnit, key) {
            return this.sizeOfCachePolicy(key, memoryUnit, FunctionalUtils.greaterThanOrEqualTo)
        },
        sizeOfCacheEquals(memoryUnit, key) {
            return this.sizeOfCachePolicy(key, memoryUnit, FunctionalUtils.equalTo)
        }
    },
    DataItemPolicies: {
        /*
            Creates a new storage policy.
        */
        buildStoragePolicy(memoryUnit, dataItemAttribute, cmpFunc) {
            return function(dataItem) {
                if (!(dataItemAttribute in dataItem) || !dataItem[dataItemAttribute] || !typeof cmpFunc == 'function') return

                return cmpFunc(sizeof(dataItem[dataItemAttribute]), memoryUnit.toBytes())
            }
        },
        /*
            Builds a new expiration policy from the specified timeUnit & dataItemAttribute
        */
        buildExpirationPolicy(timeUnit, dataItemAttribute, cmpFunc) {
            return function(dataItem) {
                if (!(dataItemAttribute in dataItem) || !dataItem[dataItemAttribute] ||
                    !dataItem[dataItemAttribute] instanceof Date) return

                return cmpFunc(new Date().getTime() - dataItem[dataItemAttribute].getTime(), timeUnit.toMilliseconds())
            }
        },

        /*
            The following functions specify default implementations of different types of in-built secondary storage policies.

            Secondary storage policies are checked to match predicates as to when a cached item should be serialized
            to a secondary data storage mechanism, rather than process memory.
        */

        /*
            A storage policy that expires a cached item should it be lt (<), 
            lte (<=), gt (>), gte (>=), or et (==) to the specified memory unit.
        */
        sizeOfCachedItemPolicy(memoryUnit, cmpFunc) {
            return this.buildStoragePolicy(memoryUnit, 'value', cmpFunc)
        },

        /*
            The following functions specify different types of inbuilt expiration policies.
            
            Expiration policies specify when a cached item should be removed completely from the cache, or refreshed
            so that the cached data is up to date.

            Users of the cache can trivially create their own using the exported buildExpirationPolicy function.
        */
        lastAccessedPolicy(timeUnit, cmpFunc) {
            return this.buildExpirationPolicy(timeUnit, 'lastAccessed', cmpFunc)
        },
        insertationTimePolicy(timeUnit, cmpFunc) {
            return this.buildExpirationPolicy(timeUnit, 'insertationTime', cmpFunc)
        },
        lastModifiedPolicy(timeUnit, cmpFunc) {
            return this.buildExpirationPolicy(timeUnit, 'lastModified', cmpFunc)
        },

        /*
            A secondary storage policy that removes a cached item should its size amount to less than the specified memory unit.
        */
        sizeOfCachedItemLessThan(memoryUnit) {
            return this.sizeOfCachedItemPolicy(memoryUnit, FunctionalUtils.lessThan)
        },
        /*
          A secondary storage policy that removes a cached item should its size be greater than or equal to the specified memory unit.
        */
        sizeOfCachedItemGreaterThan(memoryUnit) {
            return this.sizeOfCachedItemPolicy(memoryUnit, FunctionalUtils.greaterThan)
        },
        /*
          A secondary storage policy that removes a cached item should its size be greater than or rqual to the specified memory unit.
        */
        sizeOfCachedItemGreaterThanOrEqualTo(memoryUnit) {
            return this.sizeOfCachedItemPolicy(memoryUnit, FunctionalUtils.greaterThanOrEqualTo)
        },
        /*
          A secondary storage policy that removes a cached item should its size be less than or equal to the specified memory unit.
        */
        sizeOfCachedItemLessThanOrEqualTo(memoryUnit) {
            return this.sizeOfCachedItemPolicy(memoryUnit, FunctionalUtils.lessThanOrEqualTo)
        },
        /*
            A secondary storage policy that removes a cached item should its size be equal to the specified memory unit.
        */
        sizeOfCachedItemEqualTo(memoryUnit) {
            return this.sizeOfCachedItemPolicy(memoryUnit, FunctionalUtils.equalTo)
        },
        /*
            An expiration policy that removes a cached item should it be accessed in less than the specified time.
        */
        lastAccessedLessThan(timeUnit) {
            return this.lastAccessedPolicy(timeUnit, FunctionalUtils.lessThan)
        },
        /*
            An expiration policy that removes a cached item should it have been accessed in less or equal to the specified time.
        */
        lastAccessedLessThanOrEqualTo(timeUnit) {
            return this.lastAccessedPolicy(timeUnit, FunctionalUtils.lessThanOrEqualTo)
        },
        /*
            An expiration policy that removes a cached item should it have been accessed in a time amounting to more than the specified time.
        */
        lastAccessedGreaterThan(timeUnit) {
            return this.lastAccessedPolicy(timeUnit, FunctionalUtils.greaterThan)
        },
        /*
            An expiration policy that removes a cached item should it have been accessed in a time amounting to more than the specified time.
        */
        lastAccessedGreaterThanOrEqualTo(timeUnit) {
            return this.lastAccessedPolicy(timeUnit, FunctionalUtils.greaterThanOrEqualTo)
        },
        /*
            An expiration policy that removes a cached item should it have been accessed equal to the given time.
        */
        lastAccessedEqualTo(timeUnit) {
            return this.lastAccessedPolicy(timeUnit, FunctionalUtils.equalTo)
        },
        /*
            An expiration policy that removes a cached item should its insertation time execeed the specified time unit.
        */
        insertedLessThan(timeUnit) {
            return this.insertationTimePolicy(timeUnit, FunctionalUtils.lessThan)
        },
        /*
            An expiration policy that removes a cached item should its insertation time be less than or equal to the specified time unit.
        */
        insertedLessThanOrEqualTo(timeUnit) {
            return this.insertationTimePolicy(timeUnit, FunctionalUtils.lessThanOrEqualTo)
        },
        /*
            An expiration policy that removes a cached item should its insertation time be greater than the specified time unit.
        */
        insertedGreaterThan(timeUnit) {
            return this.insertationTimePolicy(timeUnit, FunctionalUtils.greaterThan)
        },
        /*
            An expiration policy that removes a cached item should its insertation time be greater than or equal to the specified time unit.
        */
        insertedGreaterThanOrEqualTo(timeUnit) {
            return this.insertationTimePolicy(timeUnit, FunctionalUtils.greaterThanOrEqualTo)
        },
        /*
            An expiration policy that removes a cached item should its insertation time equal to the specified time unit.
        */
        insertedEqualTo(timeUnit) {
            return this.insertationTimePolicy(timeUnit, FunctionalUtils.equalTo)
        },
        /*
                An expiration policy that removes a cached item should it be accessed in less than the specified time.
            */
        lastModifiedLessThan(timeUnit) {
            return this.lastModifiedPolicy(timeUnit, FunctionalUtils.lessThan)
        },
        /*
            An expiration policy that removes a cached item should it have been accessed in less or equal to the specified time.
        */
        lastModifiedLessThanOrEqualTo(timeUnit) {
            return this.lastModifiedPolicy(timeUnit, FunctionalUtils.lessThanOrEqualTo)
        },
        /*
            An expiration policy that removes a cached item should it have been accessed in a time amounting to more than the specified time.
        */
        lastModifiedGreaterThan(timeUnit) {
            return this.lastModifiedPolicy(timeUnit, FunctionalUtils.greaterThan)
        },
        /*
            An expiration policy that removes a cached item should it have been accessed in a time amounting to more than the specified time.
        */
        lastModifiedGreaterThanOrEqualTo(timeUnit) {
            return this.lastModifiedPolicy(timeUnit, FunctionalUtils.greaterThanOrEqualTo)
        },
        /*
            An expiration policy that removes a cached item should it have been accessed equal to the given time.
        */
        lastModifiedEqualTo(timeUnit) {
            return this.lastModifiedPolicy(timeUnit, FunctionalUtils.equalTo)
        }
    }
}