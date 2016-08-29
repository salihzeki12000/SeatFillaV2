    /*
        CREATED BY DALE
      
    RESTFUL API TOKEN GENERATION USING JSON WEB TOKENS (INDUSTRY STANDARD RFC 7519). 
    THIS ALLOWS DEVELOPERS TO CONTROL WHO IS AUTHORIZED TO ACCESS CERTAIN METHODS WITHIN THE RESTFUL API, 
    AND ALSO ASSOCIATE REQUESTS WITH A PARTICULAR USER. THEY CAN BE USED FOR BOTH AUTHENTICATION AND AUTHORIZATION 
    AND ARE BECOMING POPULAR AS THEY ALLOW DEVELOPERS TO CREATE GRANULAR PERMISSIONS AND ACCESS TO RESOURCES, 
    SIMILAR TO WHEN A DBA ADMINISTRATES SINGLE USER DATABASE PERMISSIONS FOR CREATING, READING, UPDATING, DELETING AND DROPPING TABLES.
    THE WAY THEY WORK IS BY USING BASE64 - A BINARY TO STRING ENCODING ALGORITHM - 
    ON BOTH A HEADER (CONSISTING OF AN ALGORITHM AND CERTAIN OTHER ATTRIBUTES) AND A PAYLOAD, 
    WHICH CAN CONTAIN ANY INFORMATION REQUIRED BY THE APPLICATION E.G. APPLICATION SPECIFIC INFORMATION. 
    FOR THIS PROJECT, WE ENCODED THE PERMISSIONS A CERTAIN TOKEN (OR USER OF A TOKEN) HAS WHEN ACCESSING 
    API ROUTES INTO THE PAYLOAD AND THE USER THAT THE TOKEN WAS GENERATED BY SO WE COULD ASSOCIATE IT WITH A 
    PARTICULAR USER LATER WHEN A HTTP REQUEST IS MADE TO THE UNDERLYING PLATFORMS API.  AFTER BOTH THE HEADER AND THE 
    PAYLOAD HAVE BEEN ENCODED IN BASE64, THEY ARE APPENDED VIA A SEPARATOR ‘.’ AND SIGNED USING A CRYPTOGRAPHIC HASH FUNCTION 
    (IN THE CASE OF THIS PROJECT, HMACSHA256 WAS USED AS THE HASH FUNCTION). THE HASH FUNCTION IS DESIGNED TO PROTECT THE MESSAGE
    FROM BEING TAMPERED WITH, BUT INFORMATION WITHIN THE MESSAGE CAN STILL BE SEEN BY PRYING EYES BY SIMPLY BASE64 DECODING THE FIRST
    TWO PARTS OF THE TOKEN. AS SUCH, CONFIDENTIAL INFORMATION SUCH AS PASSWORDS, SHOULD NOT BE STORED WITHIN THE PAYLOAD OR HEADER. 
    THE HASH FUNCTION TAKES A SECRET KEY AS INPUT WHICH CAN BE GENERATED ON THE SERVER AND KEPT SAFE. IF THE SECRET KEY BECOMES COMPROMISED, 
    IT SHOULD BE IMMEDIATELY ROTATED. AN EXAMPLE OF HOW THE THE PAYLOAD AND HEADER ARE SIGNED BY THE HMAC ALGORITHM IS SHOWN BELOW:
    
    HMACSHA256(
      BASE64URLENCODE(HEADER) + "." +
      BASE64URLENCODE(PAYLOAD),
      SECRET //
    )
    
    THE END RESULT OF THIS IS A TOKEN WITH 3 PARTS, WHICH LOOKS SOMETHING LIKE:
    
    	EYJHBGCIOIJIUZI1NIISINR5CCI6IKPXVCJ9.EYJZDWIIOIIXMJM0NTY3ODKWIIWIBMFTZSI6IKPVAG4GRG9LIIWIYWRTAW4IONRYDWV9.TJVA95ORM7E2CBAB30RMHRHDCEFXJOYZGEFONFH7HGQ
    
    ALTHOUGH THE TOKEN IS INHERENTLY SAFE, AS THE SECRET USED FOR THE CRYPTOGRAPHIC HASH FUNCTION IS STORED ON THE SERVER
    (IN A EXTERNAL FILE,  CONFIG FILE ECT) WE DECIDED TO MAKE IT EVEN SAFER, BY MAKING EACH API TOKEN SIGNED WITH A DIFFERENT SECRET. 
    TO DO THIS, API USERS ARE RESPONSIBLE FOR SUPPLYING HALF OF THE SECRET USED IN CRYPTOGRAPHIC HASH ALGORITHM. THIS ‘USER-HALF’ OF THE SECRET KEY 
    IS NOT STORED ANYWHERE BY OUR PLATFORM ITSELF, IT IS UP TO THE USER TO RETAIN THIS SECRET KEY AND SUPPLY IT ON EACH REQUEST SO THAT WE CAN SUCCESSFULLY 
    VERIFY THE PAYLOAD AND HEADER. WITHOUT THE USER HALF OF THE SECRET, DECODING THE HEADER AND PAYLOAD IS POSSIBLE,
    BUT VERIFICATION OF THE TOKEN BY OUR PLATFORM WILL FAIL. THE USER HALF OF THE SECRET ALSO HAS THE ADDED BENEFIT THAT ANY API TOKENS STORED WITHIN OUR DATABASE ARE 
    USELESS AND UNUSABLE UNLESS THE USER HALF OF THE SECRET KEY IS ALSO COMPROMISED, WHICH WOULD BE AN UNLIKELY SITUATION AS IT IS NOT STORED ON THE SERVER.
    API TOKENS ARE STORED WITHIN OUR DATABASE TO ENABLE US TO TRACK WHICH USERS USE CERTAIN ROUTES WITHIN THE API, AND INVALIDATE THE USE OF THE API KEY
    AS A WHOLE (SHOULD IT BE USED FOR IMPROPER PURPOSES) BY SETTING A BOOLEAN FLAG WITHIN THE MODEL WHERE THE API KEYS ARE STORED. 

    */
    
    
    //Require the jwt module
    const jwt = require('jsonwebtoken');
    
    //Required the UUID module
    const uuid = require('node-uuid');
    
    //Our secret API key, (remember to move this to our config files later when can be bothered >:) )
    const apiKey = 'secret-half';
    
    const tokenParam = 'sfToken';
    const keyParam = 'sfKey';
    const tokenHeaderSecretKey = 'x-seatfilla-key';
    const tokenHeaderToken = 'x-access-token';
    
    const createApiSecret = function(apiKey, sharedSecret) {
        return sails.config.session.secret + sharedSecret;
    }
    
    module.exports = {
    
        //Create an api token from the given request and payload
        createApiToken: function(obj, payload, cb) {
            //Grab the key..
            const key = this.findApiKeyFromRequest(obj);
    
            //If we have the payload and the key...
            if (payload && key) {
                //Sign it and return.
                return cb(null, jwt.sign(payload, createApiSecret(apiKey, key)));
            }
            else {
                //Something went wrong.. lets debug.
                sails.log.debug('Error creating API token in services/jwtService.js')
                    //return control, call callback.
                return cb(new Error('Did not recieve all information required for creating API token'), null);
            }
        },
        //Looks up an api route via the ApiRoutes model
        locateApiRoute: function(obj){
            return new Promise(function(resolve,reject){
                 ApiRoutes.find({path:obj}).exec(function(err,route){
                        if(err) {
                           sails.log.debug('An error in apiReqestPolicy.js occurred,most likely the API route is missing from the database.')
                           return reject(err);
                        }
                        return resolve(route);
                    });
            });
        },
        //finds the user half of the secret api key from a request object
        findApiKeyFromRequest: function(req){
            return req.param(keyParam) || req.headers[tokenHeaderSecretKey];
        },
        //finds the api token from the request object
        findApiTokenFromRequest: function(req){
            return req.param(tokenParam) || req.headers[tokenHeaderToken];
        },
        //Locates an api user via supplying a token, the request object or the user associated with the request.
        //If a user is supplied, since users can have many API tokens.. an array of api users will be returned.
        locateApiUser: function(obj){
            new Promise(function(resolve,reject){
                if(obj.token || obj.request){
                    ApiUsers.findOne({apiToken: obj.token || this.findApiTokenFromRequest(obj.request)})
                    .exec(function(err,user){
                        if(err) return reject(err)
                        else return resolve(user);
                        
                    });
                }else if(obj.user){
                    ApiUsers.find({user: obj.user.id}).exec(function(err,user){
                        if(err) return reject(err)
                        else return resolve(user);
                    });
                }else{
                    return reject(new Error('Invalid object attributes passed to services/ApiService.js, function locateApiUser'));
                }
            })
        },
        //Attempts to create a new API request given an object that contains
        // request: req object
        // path: request path
        // token: api token
        // Not that if the request object is not supplied, both path and token must be supplied.
        createApiRequest: function(obj){
            return new Promise(function(resolve,reject){
                this.locateApiRoute(obj.path || obj.request.path).then(function(route){
                    this.locateApiUser(obj.token || this.findApiTokenFromRequest(obj.request)).then(function(apiUser){
                        ApiRequest.create({
                            apiUser: apiUser.apiToken,
                            apiRoute: route.id
                        }).exec(function(err,result){
                            if(err) return reject(err)
                            else return resolve(result);
                        })
                    }).catch(function(err){
                        return reject(err);
                    })
                  }).catch(function(err){
                      return reject(err);
                  })
                }
            })
        }
        //Verify an api token.
        verifyApiToken: function(req, cb) {
    
            //Grab the token and the key
            const token = this.findApiTokenFromRequest(req);
            const key = this.findApiKeyFromRequest(req);
    
            //We haven't been supplied with the right information.. return.
            if (!token || !key) {
                return cb(new Error('Missing token or key'));
            }
    
            //Lets verify our token... and return to the callers cb.
            jwt.verify(token, createApiSecret(apiKey, key), (err, decoded) => {
                if (err) return cb(err)
                else return cb(null, decoded, token);
            });
        },
        createApiUser:function(user, apiToken){
            return new Promise(function(resolve,reject){
                ApiUsers.create({
                    apiToken: apiToken,
                    isVerified: false,
                    isBlocked: false,
                    user: user.id,
                }).exec(function(err,ApiUser){
                    if(err) return reject(err)
                    else return resolve(ApiUser);
                })
            })
        }
      }
    };
