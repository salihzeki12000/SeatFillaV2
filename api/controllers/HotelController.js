const _find = require('../out/find'),
      _create = require('../out/create'),
      _findOne = require('../out/findOne'),
      _add = require('../out/add');

module.exports = {
  retrieveSkyScannerListings(req, res) {
    async.auto({
      getPrefferedCurrency: function (callback) {
        if(req.param('prefferedCurrency'))
          return callback(null,req.param('prefferedCurrency'))

        UserSettingsService.getUserCurrencyCodePreference(req).then(function (preference) {
          sails.log.debug('User currency code preference was : ' + preference)
          return callback(null, preference)
        }).catch(function (err) {
          sails.log.error(err)
          return callback(err, null)
        })
      },
      getUserLocation: function (callback) {
        if(req.param('userLocation'))
            return callback(null,req.param('userLocation'))

        UserSettingsService.getUserCurrentLocation(req).then(function (result) {
          sails.log.debug('User location was : ' + JSON.stringify(result))
          return callback(null, result)
        }).catch(function (err) {
          sails.log.error(err)
          return callback(err, null)
        })
      },
      getUserLocalePreference: function (callback) {
        if(req.headers['accept-language'])
          return callback(null,req.headers['accept-language'])

        UserSettingsService.getUserLocalePreference(req).then(function (result) {
          sails.log.debug('User locale preference was :' + result)
          return callback(null, result || 'en-US')
        }).catch(function (err) {
          sails.log.error(err)
          return callback(err, null)
        })
      },
      retrieveMostReleventHotel: ['getPrefferedCurrency', 'getUserLocation', 'getUserLocalePreference', function (callback, results) {
  
         if(req.param('entityId'))
            return callback(null,{mostRelevent:{'individual_id':req.param('entityId')}})

         sails.log.debug('Getting hotel auto suggest results');
         sails.log.debug(req.allParams())

         const queryObj = {
          countryCode: (results.getUserLocation && results.getUserLocation.countryCode) || 'NZ',
          currencyCode:  results.getPrefferedCurrency,
          locale:  results.getUserLocalePreference,
          query: req.param('city') || req.param('country') || results.getUserLocation && results.getUserLocation.region ||
            results.getUserLocation && results.getUserLocation.city || 
            results.getUserLocation && results.getUserLocation.country || 'Auckland'
        }

        sails.log.debug('Querying hotel auto suggest with ' + JSON.stringify(queryObj))

        SkyScannerLookupService.getHotelAutoSuggestResults(queryObj).then(function (result) {
          sails.log.debug('Results from getHotel auto suggestions: ' + JSON.stringify(result))
          const hotelSuggestions = result.results

          // No results obtained
          if (!hotelSuggestions || !Array.isArray(hotelSuggestions) || hotelSuggestions.length == 0)
            return callback(null, null)

          // Link the results to their places
          const mappedSuggestions = hotelSuggestions.map(function (suggestion) {
            const parentPlace = result.places.find(function (element) {
              return element['place_id'] == suggestion['parent_place_id']
            })

            if (!parentPlace)
              callback(new Error('Invalid mapping in response from hotel auto suggestion service in ListingsController.js/retrieveMostReleventHotels'), null)

            suggestion['parent_place_id'] = parentPlace
            return suggestion
          })

  
          sails.log.debug('Found ' + mappedSuggestions.length + ' suggestions for query');

          return callback(null, {suggestions:(mappedSuggestions.length && mappedSuggestions) 
            || null,mostRelevent:(mappedSuggestions.length && 
            mappedSuggestions[(Math.floor(Math.random() * (mappedSuggestions.length-1)))]['individual_id']) || null})
        }).catch(function (err) {
          sails.log.error(err)
          return callback(err, null)
        })
      }],
      buildSessionObject: ['retrieveMostReleventHotel', function (callback, results) {
        const sessionObject = SkyScannerHotelService.getDefaultSessionObject()
        sails.log.debug('Results are: ' + JSON.stringify(results))
        sails.log.debug('Args are: ' + JSON.stringify(arguments))
        // The country id of the destination hotel
        sessionObject.market = (req.param('destination') && req.param('destination').countryId) || (results.getUserLocation && results.getUserLocation.countryCode) || 'NZ'
        // The users currency
        sessionObject.currency = req.param('prefferedCurrency') || results.getPrefferedCurrency
        // The users locale
        sessionObject.locale = req.headers['accept-language'] || results.getUserLocalePreference

        // Where the hotel is (Here we will check countryInfo for long lat to a country if we can't get it from users location)
        sessionObject.entityId = (results.retrieveMostReleventHotel && results.retrieveMostReleventHotel.mostRelevent['individual_id']) ||
          (((results.getUserLocation &&  results.getUserLocation.coords && parseFloat(results.getUserLocation.coords.latitude)) || 36.8485) +
          ',' + ((results.getUserLocation && results.getUserLocation.coords && parseFloat(results.getUserLocation.coords.longitude)) || 174.7633)) + '-latlong'

        sails.log.debug('Entity id was : ' + sessionObject.entityId);
        // The check in date for the hotel
        sessionObject.checkindate = (req.param('dates') && req.param('dates').departure) || (new Date().toISOString().slice(0, 10))

        // The check out date
        const week = new Date()
        week.setDate(new Date().getDate() + 7)
        sessionObject.checkoutdate = (req.param('dates') && req.param('dates').arrival) || (week.toISOString().slice(0, 10))
        // The number of guests
        sessionObject.guests = req.param('numberOfGuests') || 1

        sessionObject.rooms = req.param('numRooms') || 1

        sails.log.debug('Created hotels session object : ' + JSON.stringify(sessionObject))
        return callback(null, sessionObject)
      }],
      initiateSession: ['buildSessionObject', function (callback, results) {
        SkyScannerHotelService.createSession(results.buildSessionObject).then(function (result) {
          return callback(null, result)
        }).catch(function (err) {
          sails.log.error(err)
          callback(err, null)
        })
      }]
    }, function (err, results) {
      if (err) {
        sails.log.error(err)
        return res.badRequest(err)
      } else {
        sails.log.debug('Results were : ' + JSON.stringify(results))
        results.status = 200;
        return res.ok(results)
      }
    })
  },
  pollSkyScannerSession(req,res){

      if(!req.param('nextPollUrl') || !req.wantsJSON)
          return res.badRequest();

      const defaultHotelRequestObject = SkyScannerHotelService.getDefaultHotelRequestObject();
      const nextPollUrl = req.param('nextPollUrl');
      defaultHotelRequestObject.pageSize = req.param('pageSize') ||  defaultHotelRequestObject.pageSize;
      defaultHotelRequestObject.pageIndex = req.param('pageIndex') ||  defaultHotelRequestObject.pageIndex;
      defaultHotelRequestObject.imageLimit = req.param('imageLimit') ||defaultHotelRequestObject.imageLimit;
      defaultHotelRequestObject.sortOrder = req.param('sortOrder') || defaultHotelRequestObject.sortOrder;
      defaultHotelRequestObject.sortColumn = req.param('sortColumn') ||   defaultHotelRequestObject.sortColumn;

      SkyScannerHotelService.requestHotelDetails(nextPollUrl, defaultHotelRequestObject)
      .then(function(result){
        sails.log.debug('Recieved result from requesting hotel details');
        sails.log.debug(JSON.stringify(result));
        return res.ok(result);
      }).catch(function(err){
        sails.log.err(err);
        return res.badRequest(err);
      })
  },
  hotelDetails(req,res){
    if(!req.param('detailsUrl') || !req.param('hotelIds') || !req.wantsJSON)
      return res.badRequest('Invalid parameters supplied')

    SkyScannerHotelService.createHotelDetails(req.param('detailsUrl'),
    req.param('hotelIds')).then(function(result){
        return res.ok(result);
    }).catch(function(err){
      sails.log.error(err);
      return res.badRequest(err);
    })
  },
  create(req, res) {
    sails.log.debug('In hotel/create')

    // Allow ajax get request for html content
    if (req.isGET() && req.wantsJSON) {
      sails.log.debug('Request was get and wants json, returning HTML...')
      res.locals.layout = null
      req.options.layout = null
      return res.view('hotel/create', {
        user: req.user,
        UserProfile: req.options.userprofile,
        layout: null
      })
    }

    sails.log.debug('Creating hotel: recieved params: ')
    sails.log.debug(req.allParams())

    return async.auto({

      // Create the hotel address record
      createAddress: function (callback) {
        Address.create(req.allParams()).then(function (address) {
          return callback(null, address)
        }).catch(function (err) {
          sails.log.error(err)
          return callback(err, null)
        })
      },
      // Create the hotel
      createHotelTuple: [function (callback, results) {

        function handleError (err) {
          sails.log.error(err)
          return callback(err, null)
        }

        req.setParam('user', req.user.id)
        _create(req).then(function (hotel) {
            sails.log.debug('Created hotel record ' + JSON.stringify(hotel));
            return callback(null, hotel)
        }).catch(handleError)

      }],
      // Create hotel info
      createHotelInfo: ['createAddress','createHotelTuple', function (callback, results) {
        const obj = req.allParams()
        obj.address = results.createAddress.id;
        obj.hotel = results.createHotelTuple.id;
        return HotelInfo.create(obj).then(function (hotelInfo) {
          return callback(null, hotelInfo)
        }).catch(function (err) {
          return callback(err,null);
        })
      }],
      createAssociation:['createHotelInfo',function(callback,results){
         results.createHotelTuple.hotelInfo.add(results.createHotelInfo);
         results.createHotelTuple.save(function(err){
           if(err){
             sails.log.error(err);
             return callback(err,null);
           }else{
             return callback(null,'success');
           }
         })
      }],
      // Retrieves the incoming images from the stream
      downloadHotelImages: ['createHotelTuple', function (callback, results) {

        //Make sure we have our file data info
        if(!req.param('fileData')){
          return callback(new Error('File data must be supplied'),null);
        }
        
        var fileData = null;

        try{
          //Parse info about our file data
          fileData = JSON.parse(req.param('fileData'));
          
          //Check to make sure we have info about our file
          if(!Array.isArray(fileData) || fileData.length == 0){
            throw new Error('No files sent with request');
          }
        }catch(err){
          //Catch and return any errors
          return callback(err,null);
        }

        //Loop through our file data asynchrnously
        async.forEachOf(fileData, function (fileData,index,feCb) {

          sails.log.debug('Saving file to ' + sails.config.appPath +  require('util')
            .format('/assets/images/hotels/%s/%s', req.user.id, results.createHotelTuple.id))
          
          //Start file upload from incoming request
          req.file('file[' + index + ']').upload({
            dirname: sails.config.appPath +  require('util')
            .format('/assets/images/hotels/%s/%s', req.user.id, results.createHotelTuple.id),
            maxBytes: 1024 * 1024 * 200 // 200mb
          }, function whenDone (err, uploadedFiles) {

            //If there is an error, return it to the callback
            if (err) {
              sails.log.error(err)
              sails.log.debug(JSON.stringify(uploadedFiles))
              return callback(err, null)
            } else if (uploadedFiles.length === 0) {
              sails.log.debug('No images provided to hotel/create')
              sails.log.debug(JSON.stringify(uploadedFiles))
              return callback(new Error('No images uploaded'))
            }

            //Debug our uploaded files
            sails.log.debug('Uploaded files were: ' + JSON.stringify(uploadedFiles))

            // Loop through each uploaded file asynchronously, save its file descriptor
            async.each(uploadedFiles, function (file, asyncCb) {

              sails.log.debug('File was : ' + JSON.stringify(file))


              // Create a hotel image record, linked to our previously created hotel
              HotelImage.create({
                hotelInfo:results.createHotelInfo.id,
                fileDescriptor: file.fd,
                width:fileData.width,
                height:fileData.height,
                mimeType:file.type,
                fileName:file.filename,
                fileExt: require('path').extname(file.filename)
              }).then(function (createdHotelImage) {
                results.createHotelInfo.hotelImages.add(createdHotelImage);
                results.createHotelInfo.save(function(err){
                  if(err){
                    sails.log.error(err);
                    return asyncCb(err);
                  }else{
                    return asyncCb();
                  }
                })
              }).catch(function(err){
                  return asyncCb(err);
              })
            }, function (err) {
              // if any of the file processing produced an error, err would equal that error
              if (err) {
                return feCb(err)
              } else {
                return feCb(null)
              }
            })
          })
          }, function (err) {
            // if any of the file processing produced an error, err would equal that error
            if (err) {
              return callback(err, null)
            } else {
              return callback(null, 'success')
            }
        })
    }]
    }, function (err, results) {
      // Check for errors
      if (err) {
        sails.log.error(err)
        sails.log.debug('Returning server error in hotel/create')
        res.serverError()
      } else {
        // Check if we need to respond using JSON
        if (res.wantsJSON) {
          results.createHotelTuple.hotelInfo = results.createHotelInfo
          return res.ok(ResponseStatus.OK, {})
        } else {
          // Redirect to the created hotel.
          return res.redirect('hotel/findOne?id=' + results.createHotelTuple.id)
        }
      }
    })
  },
  find(req, res) {
    return _find(req, res).then(function (hotels) {
      return res.ok({
        status: 200,
        hotels: hotels
      })
    }).catch(function (err) {
      return res.badRequest()
    })
  },
  index(req, res) {
    return res.ok({
      user: req.user,
      params: req.allParams()
    }, {
      view: 'search/listings/hotels/search-hotels',
      layout: 'layouts/search-layout'
    })
  },
  add(req,res){
    req.setParam('user',req.user.id);
    _add(req,res);
  },
  findOne(req, res) {
    async.auto({
      findOrCreateHotel(callback) {

        if (!req.param('hotelData') && !req.param('id'))
          return callback(new Error('Invalid request'),null);

        sails.log.debug(req.allParams())

        var hotelData = null
        var id = null
        var provider = null

        if (req.param('hotelData')) {
          try {
            hotelData = JSON.parse(req.param('hotelData'))
          } catch (err) {
            return callback(new Error('Error parsing hotelData'), null)
          }
          if ('hotel_id' in hotelData) {
            id = hotelData['hotel_id']
            provider = 'Skyscanner'
          } else {
            return callback(new Error('No id supplied via hotelData parameter, invalid request'), null)
          }
        } else if (req.param('id')) {
          hotelData = null
          id = req.param('id')
          provider = 'Seatfilla'
        } else {
          return callback(new Error('Request requires either hotelData || id parameter to be set, both were null.'), null)
        }

        if (provider == 'Seatfilla') {
          // No need to check if hotel isn't null, error will be thrown by _findOne.
          // This will subscribe the requestee to all events via -
          // .publishUpdate(), .publishDestroy(), .publishAdd(), .publishRemove(), and .message().
          async.auto({
            findHotel:function(callback){
                 _findOne(req).then(function (hotel) {
                  return callback(null, {
                    id,
                    hotel,
                  provider})
                }).catch(function (err) {
                  sails.log.error(err)
                  return callback(err, null)
                })
            },
             populateHotelInfo:['findHotel',function(callback,results){
                HotelInfo.findOne({hotel:results.findHotel.id}).then(function(hotelInfo){
                  if(!hotelInfo){
                     const error = new Error('Invalid state ');
                     error.code = 117;
                     return callback(error,null);
                  }
                  results.findHotel.hotelInfo = hotelInfo;
                  return callback(null,results.findHotel)
                }).catch(function(err){
                  sails.log.error(err);
                  return callback(err,null);
                })
             }
            ]
          },function(err,results){
              if(err){
                return callback(err,null);
              }else{
                return callback(null,results.populateHotelInfo);
              }
          })

        } else {
          Hotel.findOrCreate({
          id}, { 
                id,
                user:null,
                hotelInfo:null
              }).then(function () {

              //Find hotel info...
              return callback(null, {
                id,
                hotel:hotelData,
                provider })
          }).catch(function (err) {
            return callback(err, null)
        })
        }
      }
    }, function (err, results) {
      sails.log.debug('Results:')
      sails.log.debug(JSON.stringify(results));
      if (err) {
        if(err.code == 117) return res.redirect('/hotel');
        sails.log.error(err);
        sails.log.debug('Retruning server error')
        return res.serverError(err)
      }
      else {
        sails.log.debug('Hotel results : ' + JSON.stringify(results.findOrCreateHotel))
        return res.ok(results.findOrCreateHotel || {})
      }
    })
  }
}
