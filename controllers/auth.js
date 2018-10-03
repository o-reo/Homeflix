const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const User = require('../models/user');
const Client = require('../models/client');
const BearerStrategy = require('passport-http-bearer').Strategy;
const Token = require('../models/token');
const bcrypt = require('bcrypt');
const GoogleStrategy = require('passport-google-oauth2' ).Strategy;
const CustomStrategy = require('passport-custom').Strategy;

passport.use(new BasicStrategy(
    function(mail, password, callback) {
        User.findOne({ mail: mail }, function (err, user) {
            if (err) { return callback(err); }

            // No user found with that username
            if (!user) { return callback(null, false); }

            // Make sure the password is correct
            user.verifyPassword(password, function(err, isMatch) {
                if (err) { return callback(err); }

                // Password did not match
                if (!isMatch) { return callback(null, false); }

                // Success
                return callback(null, user);
            });
        });
    }
));

passport.use('client-basic', new BasicStrategy(
    function(mail, password, callback) {
        Client.findOne({ id: mail }, function (err, client) {
            if (err) { return callback(err); }

            // No client found with that id or bad password
            if (!client || client.secret !== password) { return callback(null, false); }

            // Success
            return callback(null, client);
        });
    }
));

passport.use('admin', new BasicStrategy(
   function(mail, password, callback) {
       User.findOne({mail: mail}, function (err, user) {
           if (err) { return callback(err); }

           // No user found with that username
           if (!user) { return callback(null, false); }

           // Make sure the password is correct
           user.verifyPassword(password, function(err, isMatch) {
               if (err) { return callback(err); }

               // Password did not match
               if (!isMatch) { return callback(null, false); }

               if (user.grant < 2) { return callback(null, false); }
               // Success
               return callback(null, user);
           });
       });
   }
));


passport.use(new BearerStrategy(
    function(accessToken, callback) {
        Token.findOne({value: accessToken }, function (err, token) {
            if (err) { return callback(err); }

            // No token found
            if (!token) { return callback(null, false); }

            User.findOne({ _id: token.userId }, function (err, user) {
                if (err) { return callback(err); }

                // No user found
                if (!user) { return callback(null, false); }

                // Simple example with no scope
                callback(null, user, { scope: '*' });
            });
        });
    }
));

passport.use(new GoogleStrategy({
        clientID:           '569953618887-eo3v9mq5ps5mu3403alandmrinid3051.apps.googleusercontent.com',
        clientSecret:       'oW5BWKfGmcCezIqM2Jk31c9G',
        callbackURL:        'http://localhost:3000/api/auth/google/callback',
        passReqToCallback:  true
    },
    function(request, accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            User.find({ googleId: profile.id }, function (err, user) {
                if (!user) {
                    let newUser = new User({
                        first_name: profile.name.givenName,
                        last_name: profile.name.familyName,
                        password: 'pass',
                        mail: profile.email,
                        username: 'hellotest',
                        googleId: profile.id
                    });

                    newUser.save((err, userSave) => {
                        if (err){
                            console.log(err);
                            return done(err);
                        }else {
                            return done(null, userSave);
                        }
                    });
                }
                else {
                    return done(null, user);
                }
            });
        });
    }
));

exports.isAuth = function (req, res) {
    let password = req.body.password;

    User.findOne({mail: req.body.mail}, function (req, result) {
        if (result) {
            bcrypt.compare(password, result.password, function (err, rs) {
                if (rs) {
                    res.json(result);
                } else {
                    res.json({msg: 'error'});
                }
            });
        }
        else
            res.json({msg: 'error'});
    })
};


exports.authGoogle = passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read'] });
exports.authGoogleCallback = passport.authenticate('google', {  successRedirect: 'http://localhost:4200/auth/google/success', failureRedirect: 'http://localhost:4200/auth/google/failure' });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });
exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });
exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], { session: false });
exports.isAdmin = passport.authenticate('admin', { session: false });