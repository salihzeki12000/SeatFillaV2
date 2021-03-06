/**
 * AuthController
 * Created by Dale
 *
 * @description :: Server-side logic for managing authentication.
 */

const passport = require('passport')

module.exports = {

  /**
   * Authenticate users for local logins (see passport.js for more info)
   * 
   * @param {returnType} req - the request object to login via the local provider
   * @param {returnType} res - the response object
   */
  local: function (req, res) {
    sails.log.debug('local auth request: ')
    sails.log.debug(req.allParams())

    AuthenticationService.authenticateLocal(req, res).then(function (result) {
      if (result.status == sails.config.passport.errorCodes().Success) {
        req.flash('toaster-success', 'You are now logged in!')

        if (!req.user.isEmailVerified) {
          req.flash('toaster-info', 'Your email is not currently verified')

          NotificationService.sendDedicatedNotificationAsync(req)({
            title: 'Email needs verification',
            message: 'Your email is not currently verified,' +
              'if you need the email resent please click here' +
              '<a href="/home/resendVerificationEmail">resend</a>',
            link: '/home/resendVerificationEmail'
          })
        }

        if (req.wantsJSON || req.xhr) {
          return res.json(ResponseStatus.OK, result)
        } else {
          sails.log.debug('Redirect with success ' + JSON.stringify(req.allParams()))
          return res.redirect(req.allParams().redirectSuccess || '/')
        }
      } else {
        sails.log.debug('Reject error logging in')
        return Promise.reject(result.error)
      }
    }).catch(function (err) {
      sails.log.debug('Redirect with failiure')

      // Make certain nothing went wrong
      req.logOut() || req.logout()

      if (req.wantsJSON || req.xhr) {
        return res.json(ResponseStatus.CLIENT_BAD_REQUEST, {error: err.message,errorMessages: [err.message]})
      }else {
        req.flash('info', ['Error whilst logging in. ' + err.message])
        req.flash('toaster-danger', 'Error logging in : ' + err.message)
        return res.redirect(req.allParams().redirectFailiure || '/login')
      }
    })
  },
  /**
   * Generates an API token (a JSON web token that is signed using HMAC to ensure integrity, 
   * see services/ApiService.js for more info). 
   * 
   * @param {returnType} arg1 - what is is.
   * @param {returnType} arg2 - what it is.
   */
  generateApiToken: function (req, res) {
    sails.log.debug('Generating API token..')
    sails.log.debug(JSON.stringify(req.body))

    const permissions = (function buildPermissions (req) {
      const requestPermission = {}

      ApiService.getApiPermissionKeys().forEach((key) => {
        sails.log.debug('Checking key : ' + key)
        if (req.param(key)) {
          requestPermission[key] = req.param(key)
        }
      })
      sails.log.debug('Built request permissions ' + JSON.stringify(requestPermission))
      return requestPermission
    })(req)

    const requestPermissionKeys = Object.keys(permissions)

    ;(function verifyRequest (req) {
      const errors = []

      if (!req.param('requestURL')) {
        errors.push('No request URL was supplied, this is required.')
      }

      if (requestPermissionKeys.length <= 0) {
        errors.push('At-least one permission must be used to create an API key.')
      }

      if (!req.param('sfKey') && !req.headers['x-seatfilla-key']) {
        errors.push('No secret key was provided! Cannot generated token.')
      }

      if (errors.length != 0) {
        return res.json(ResponseStatus.CLIENT_BAD_REQUEST, {
          status: ResponseStatus.CLIENT_BAD_REQUEST,
          errorMessage: 'Errors occurred verifying the request, was all information supplied?',
          errorMessages: errors
        })
      }
    })(req)

    sails.log.debug('Verified API token request params')

    ApiService.createApiToken(req, {
      id: req.user.id,
      permissions: requestPermissionKeys,
      validRequestURL: req.param('requestURL'),
      iat: Math.floor(new Date().getTime() / 1000) - 30,
      aud: 'SeatFilla',
      sub: 'SeatfillaApiToken'
    }, function (err, token, secret) {
      if (err) {
        sails.log.debug('Error generating API token, controllers/authcontroller.js')

        return res.json({
          status: ResponseStatus.CLIENT_BAD_REQUEST,
          error: err,
          errorMessage: err.message
        })
      } else {
        ApiService.createApiUser(req.user, token, secret, permissions).then(function (apiUser) {
          NotificationService.sendDedicatedNotificationAsync(req)({
            title: 'Api token has been succesfully generated! ',
            message: 'Your seatfilla API token has been succesfully generated. ' + apiUser.isVerified ?
              'It has been automatically verified for your use.' : 'We will verify this token shortly and send you an email when it has been approved.'
          })

          return res.json({
            status: ResponseStatus.OK,
            message: 'Succesfully created API token, it will be validated shortly',
            token: token,
            isVerified: apiUser.isVerified
          })
        }).catch(function (err) {
          sails.log.debug('Error creating ApiUser in controllers/authcontroller.js')

          return res.json({
            status: ResponseStatus.CLIENT_BAD_REQUEST,
            error: err,
            errorMessage: err.message
          })
        })
      }
    })
  },
  /** */

  removeApiToken(req, res) {
    sails.log.debug('Removing api token for user: ' + req.user)

    ApiService.removeApiUser({
      token: req.param('token'),
      user: req.user
    }).then(function () {
      return res.json(ResponseStatus.OK, {
        status: ResponseStatus.OK,
        message: 'Succesfully removed api user token'
      })
    }).catch(function (err) {
      return res.json(ResponseStatus.CLIENT_BAD_REQUEST, {
        error: err,
        errorMessage: err.message
      })
    })
  },
  removeAllApiTokens(req, res) {
    ApiService.removeAllApiTokens({
      user: req.user.id
    }).then(function () {
      return res.json(ResponseStatus.OK, {
        status: ResponseStatus.OK,
        message: 'Succesfully removed users API tokens'
      })
    }).catch(function (err) {
      return res.json(ResponseStatus.CLIENT_BAD_REQUEST, {
        error: err,
        errorMessage: err.message
      })
    })
  },

  /**
   * Authenticates a request object via facebook.
   * 
   * @param {returnType} arg1 - the req object to authenticate via facebook..
   * @param {returnType} arg2 - the response object.
   */
  facebook: function (req, res) {
    if (req.user) return res.redrect('/login')

    sails.log.debug('Made request to login via facebook')

    AuthenticationService.authenticateFacebook(req, res).catch(function (err) {
      sails.log.debug('Error auth fb : ')
      sails.log.error(err)
    })
  },
  /**
   * The facebook callback used during authentication, used to pass the request back to the control of
   * our app
   * 
   * @param {returnType} arg1 - what is is.
   * @param {returnType} arg2 - what it is.
   */
  facebookCallback: function (req, res) {
    passport.authenticate('facebook')(req, res, function (err, user) {
      if (err) {
        sails.log.debug('Error in facebook callback ' + err)
        sails.log.error(err)
        req.flash('toaster-warning', 'Error in facebook callback ' + err.message)
        delete req.session.tempUser
        return res.redirect(req.session.failiureRedirect || '/login')
      } else {
        UserService.logUserIn(req, {facebookId: req.session.tempUser.facebookId}, null)
          .then(function (loggedIn) {
            if (loggedIn) {
              delete req.session.tempUser
              res.redirect('/')
            }else if (req.session.tempUser) {
              req.flash('info', 'Thank-you for authentication via facebook. We require more details in order to create your account.')
              res.redirect('/home/register')
            }else {
              Promise.reject(new Error('Error: user was not logged in and req.session.tempUser does not exist'))
            }
          }).catch(function (err) {
          sails.log.error(err)
          res.redirect('/login')
        })
      }
    })
  },
  /**
   * Authenticates a request via twitter. See config/passport.js for more information. 
   * 
   * @param {returnType} arg1 - what is is.
   * @param {returnType} arg2 - what it is.
   */
  twitter: function (req, res) {
    if (req.user) return res.redrect('/login')

    AuthenticationService.authenticateTwitter(req, res).catch(function (err) {
      sails.log.debug('Recieved error when authenticating via twitter' + err.message)
      sails.log.error(err)
      req.flash('toaster-warning', 'Error authenticating via twitter ' + err.message)
      res.redirect('/')
    })
  },
  /**
   * The twitter callback used during authentication to return control to our application.
   * From here, we can redirect the users based on the result of authentication via the response object. 
   * 
   * @param {returnType} arg1 - what is is.
   * @param {returnType} arg2 - what it is.
   */
  twitterCallback: function (req, res) {
    passport.authenticate('twitter')(req, res, function (err, user) {
      if (err) {
        sails.log.debug('Error in twitter callback ' + err)
        sails.log.error(err)
        return res.badRequest({
          error: err,
          user: user
        })
      } else {
        UserService.logUserIn(req, {twitterId: req.session.tempUser.twitterId}, null)
          .then(function (loggedIn) {
            if (loggedIn) {
              delete req.session.tempUser
              res.redirect('/')
            }else if (req.session.tempUser) {
              req.flash('info', 'Thank-you for authentication via twitter. We require more details in order to create your account.')
              res.redirect('/home/register')
            }else {
              Promise.reject(new Error('Error: user was not logged in and req.session.tempUser does not exist'))
            }
          }).catch(function (err) {
          sails.log.error(err)
          res.redirect('/login')
        })
      }
    })
  },
  /**
   * Authenticates a request via google, see config/passport.js for more information. 
   * 
   * @param {returnType} arg1 - what is is.
   * @param {returnType} arg2 - what it is.
   */
  google: function (req, res) {
    if (req.user) return res.redrect('/login')
    AuthenticationService.authenticateGoogle(req, res).catch(function (err) {
      sails.log.error(err)
      res.redirect('/')
    })
  },
  /* 
   * The google callback used during authentication to return control of the request back to our application. 
   * Here we handle the response from google, and redirect the user to the appropriate web pages. For more information,
   * see config/passport.js.
   * 
   * @param {returnType} arg1 - what is is.
   * @param {returnType} arg2 - what it is.
   */

  googleCallback: function (req, res) {
    passport.authenticate('google')(req, res, function (err, user) {
      if (err) {
        sails.log.error(err)
        res.redirect('/login')
      }else {
        UserService.logUserIn(req, {googleId: req.session.tempUser.googleId}, null)
          .then(function (loggedIn) {
            if (loggedIn) {
              delete req.session.tempUser
              res.redirect('/')
            }else if (req.session.tempUser) {
              req.flash('info', 'Thank-you for authentication via google. We require more details in order to create your account.')
              res.redirect('/home/register')
            }else {
              Promise.reject(new Error('Error: user was not logged in and req.session.tempUser does not exist'))
            }
          }).catch(function (err) {
          sails.log.error(err)
          res.redirect('/login')
        })
      }
    })
  },
  /**
   * Via some providers, users will be redirected to this page to show system status. 
   * 
   * @param {returnType} arg1 - what is is.
   * @param {returnType} arg2 - what it is.
   */
  success: function (req, res) {
    return res.ok({
      user: req.user
    })
  },
  /**
   * Logs a user out  (this may be used to user controller,hmm)
   * 
   * @param {returnType} arg1 - what is is.
   * @param {returnType} arg2 - what it is.
   */
  logout: function (req, res) {
    UserService.logout(req)
    res.redirect(req.session.redirectPath || '/')
  }
}
