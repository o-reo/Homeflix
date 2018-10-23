const passportJwt = require('passport-jwt');
const JwtStrategy = passportJwt.Strategy;
const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const User = require('../models/user');
const config = require('../config/database');
const credentials = require('../config/credentials');

module.exports = function (passport) {
    let opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.secret
    };
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        User.getUserById(jwt_payload._id, function (err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
    }));

    passport.use(new GoogleStrategy({
            clientID: credentials.google.clientID,
            clientSecret: credentials.google.clientSecret,
            callbackURL: "http://localhost:3000/user/authenticate/google/callback",
            passReqToCallback: true
        }, (request, accessToken, refreshToken, profile, done) => {
            User.find({token_google: profile.id}, function (err, user) {
                if (user.length === 0) {
                    let newUser = new User({
                        first_name: profile.name.givenName,
                        last_name: profile.name.familyName,
                        password: accessToken,
                        email: profile.email,
                        username: profile.name.givenName,
                        token_google: profile.id,
                        photo: profile.photos[0].value.split('?')[0]
                    });
                    newUser.save((err, userSave) => {
                        if (err) {
                            return done(err);
                        } else {
                            return done(null, userSave);
                        }
                    });
                }
                else {
                    return done(null, user);
                }
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });
};
