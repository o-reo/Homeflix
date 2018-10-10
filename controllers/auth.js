const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const User = require('../models/user');
const Client = require('../models/client');
const BearerStrategy = require('passport-http-bearer').Strategy;
const Token = require('../models/token');
const bcrypt = require('bcrypt');
const GoogleStrategy = require('passport-google-oauth2' ).Strategy;
const CustomStrategy = require('passport-custom').Strategy;
const jwt = require('jsonwebtoken');

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


exports.sign_in = function (req, res) {
    // find the user
    User.findOne({ mail: req.body.username }, function(err, user) {

        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
            console.log('USERNAME: ', req.body.username);
        } else if (user) {
            if (user.password != '') {
                // check if password matches
                bcrypt.compare(req.body.password, user.password, function (err, rs) {
                    if (err)
                        res.json({success: false, message: 'Authentication failed. Wrong password.'})
                    else {
                        return res.json({
                            success: true,
                            token: jwt.sign({email: user.mail, username: user.username, _id: user._id}, 'RESTFULAPIs'),
                            user
                        });
                    }

                });
            } else { res.json({ succes: false, msg: 'dont find user' }) }
        }
    });
};

exports.sign_in_social = function (req, res) {
    if (req.params.social === 'google') {
        User.findOne({googleId: req.body.id}, function (err, user) {
            if (err)
                res.json({msg: err});
            else if (!user) {
                //On cree l'user
                let newUser = new User({
                    username: req.body.name,
                    password: 'undefined',
                    mail: req.body.email,
                    first_name: req.body.firstName,
                    last_name: req.body.lastName,
                    googleId: req.body.id,
                    photo: req.body.photoUrl
                });
                newUser.save(function (err, new_user) {
                    if (err) {
                        res.json({success: false, msg: err})
                    }
                    else {
                        return res.json({
                            success: true,
                            token: jwt.sign({
                                email: new_user.mail,
                                username: new_user.username,
                                _id: new_user._id
                            }, 'RESTFULAPIs'),
                            new_user
                        });
                    }
                });
            } else {
                //On retourne l'utilisateur trouve
                return res.json({
                    success: true,
                    token: jwt.sign({email: user.mail, username: user.username, _id: user._id}, 'RESTFULAPIs'),
                    user
                });
            }
        });
    } else  if (req.params.social === '42') {
        console.log('42');
        User.findOne({Id42: req.body.id}, function (err, user) {
            if (err)
                res.json({msg: err});
            else if (!user) {
                //On cree l'user
                let newUser = new User({
                    username: req.body.login,
                    password: 'undefined',
                    mail: req.body.email,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    Id42: req.body.id,
                    photo: req.body.image_url
                });
                newUser.save(function (err, new_user) {
                    if (err) {
                        res.json({success: false, msg: err})
                    }
                    else {
                        return res.json({
                            success: true,
                            token: jwt.sign({
                                email: new_user.mail,
                                username: new_user.username,
                                _id: new_user._id
                            }, 'RESTFULAPIs'),
                            new_user
                        });
                    }
                });
            } else {
                //On retourne l'utilisateur trouve
                return res.json({
                    success: true,
                    token: jwt.sign({email: user.mail, username: user.username, _id: user._id}, 'RESTFULAPIs'),
                    user
                });
            }
        });
    }
};

exports.loginRequired = function(req, res, next) {
    if (req.user) {
        next();
    } else {
        return res.json({success: false, msg: 'Unauthorize'});
    }
}


exports.authGoogle = passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read'] });
exports.authGoogleCallback = passport.authenticate('google', {  successRedirect: 'http://localhost:4200/auth/google/success', failureRedirect: 'http://localhost:4200/auth/google/failure' });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });
exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });
exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], { session: false });
exports.isAdmin = passport.authenticate('admin', { session: false });