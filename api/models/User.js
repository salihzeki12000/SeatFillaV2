/**
 * User.js
 * This model represents a website user.
 */

//For ids (v4 is used)
const uuid = require('node-uuid');

//For hashing the password
const bcrypt = require('bcrypt');

//How hard we work on the salt
const SALT_WORK_FACTOR = 10;

module.exports = {
    autoPK: false,
    attributes: {
        id: {
            type: 'string',
            primaryKey: true,
            defaultsTo: function() {
                return uuid.v4();
            }
        },
        facebookId: {
            type: 'string',
            required: false,
            notNull: false
        },
        twitterId: {
            type: 'string',
            required: false,
            notNull: false
        },
        googleId: {
            type: 'string',
            required: false,
            notNull: false
        },
        firstName: {
            type: 'string',
            notNull: false,
        },
        middleName: {
            type: 'string',
            required: false,
            notNull:false,
        },
        lastName: {
            type: 'string',
        },
        home: {
            type: 'string',
            notNull:false
        },
        mobile: {
            type: 'string',
            notNull:false
        },
        email: {
            type: 'string',
            notNull:false
        },
        username: {
            type: 'string',
        },
        displayName: {
            type: 'string',
            minLength: 3,
            maxLength: 20
        },
        password: {
            type: 'string',
            minLength: 7, //8-25
            maxLength: 61,
        },
        passwordConfirmation: {
            type: 'string',
            equals: function(cb) {
                cb(this.password);
            }
        },
        birthDay: {
            type: 'string',
        },
        birthMonth: {
            type: 'string',
        },
        birthYear: {
            type: 'string',
        },
        isEmailVerified: {
            type: 'boolean',
            defaultsTo: false
        },
        isLockedOut: {
            type: 'boolean',
            defaultsTo: false
        },
        //One to many on requests
        flightRequests: {
            collection: 'FlightRequest',
            via: 'user'
        },
        //One to many on addresses (may have duplicates however stops synchornization issues)
        addresses: {
            collection: 'Address',
            via: 'user'
        },
        hotelBids: {
            collection: 'HotelBid',
            via: 'user'
        },
        flightBids:{
          collection:'FlightBid',
          via:'user'
        },
        apiKeys: {
            collection: 'ApiUsers',
            via: 'user'
        },
        roles: {
            collection: 'UserRole',
            via: 'user',
            dominant: true
        },
        image: {
            type:'string'
        },
        notifications: {
            collection: 'Notifications',
            via: 'user'
        },
        userSettings: {
            collection: 'UserSettings',
            via: 'user'
        },
        userLocations: {
            collection: 'UserLocation',
            via: 'user'
        },
        hotels: {
            collection: 'Hotel',
            via: 'user'
        },
        creditCards:{
            collection:'CreditCard',
            via:'payer_id'
        },
        //A user can have many support tickets.
        supportTickets: {
            collection: 'SupportTicket',
            via: 'user'
        },
        flightGroups: {
            collection: 'FlightGroup',
            via: 'members'
        },
        userProfile: {
            collection: 'UserProfile',
            via:'user'
        },
        emailConfirmed: () => {
            return this.isEmailConfirmed;
        },
        hasRole: (role) => {
            if (this.roles.filter((r) => {
                    r.role === role
                }).length > 0) {
                return true;
            }
            return false;
        },
        logout(req) {
            req.logout();
        },
        verifyPassword: function(password) {
            return bcrypt.compareSync(password, this.password);
        },
        changePassword: function(newPassword, cb) {
            this.newPassword = newPassword;
            this.save(function(err, u) {
                return cb(err, u);
            });
        },
        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            delete obj.passwordConfirmation;
            return obj;
        }
    },
    //Here we will hash the pass before it enters the db..
    beforeCreate: function(attrs, cb) {
        if (attrs.username) attrs.username.toLowerCase();

        if (attrs.provider === 'local') {
            bcrypt.hash(attrs.password, SALT_WORK_FACTOR, function(err, hash) {
                if (err) return cb(err);

                attrs.password = hash;
                attrs.passwordConfirmation = hash;
                return cb();
            });
        }
    },
    beforeUpdate: function(attrs, cb) {
        delete attrs.username;
        delete attrs.id;
        if (attrs.newPassword) {
            bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                if (err) return cb(err);

                bcrypt.hash(attrs.newPassword, salt, function(err, crypted) {
                    if (err) return cb(err);

                    delete attrs.newPassword;
                    attrs.password = crypted;
                    return cb();
                });
            });
        } else {
            return cb();
        }
    }
};
