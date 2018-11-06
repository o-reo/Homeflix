const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config/database');


// Middleware to check JsonWebToken validity
module.exports.validJWT = (req, res, next) => {
    jwt.verify(req.headers.authorization.substring(7), config.secret, (err, decoded) => {
        if (err) {
            res.json({success: false, msg: err})
        }
        else {
            User.findOne({_id: decoded._id}, (err, user) => {
                if (err || !user) {
                    res.json({success: false, msg: err})
                }
                else {
                    req.userdata = user;
                }
                next();
            });
        }
    });
};

// Login controller
module.exports.login = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    User.getUserByUsername(username, (err, user) => {
        if (!user) {
            return res.json({success: false, msg: 'User not found'});
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
            if (isMatch) {
                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn: 604800
                });
                // Add here user data you want to access in client after login
                res.json({
                    success: true,
                    token: token
                });
            } else {
                res.json({success: false, msg: 'Wrong password'});
            }
        });
    });
};

// OAuth controller

module.exports.oauth = (req, res) => {
    let query = '';
    let newUser = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        username: Math.random().toString(36).substring(7),
        token_google: null,
        token_42: null,
        token_github: null,
        password: Math.random().toString(36).slice(-12),
        path_picture: req.body.path_picture
    };
    if (req.body.provider === 'GOOGLE') {
        query = {token_google: req.body.id};
        newUser.token_google = req.body.id;
    } else if (req.body.provider === '42') {
        query = {token_42: req.body.id};
        newUser.token_42 = req.body.id;
        newUser.username = req.body.username;
    } else if (req.body.provider === 'github') {
        query = {token_github: String(req.body.id)};
        newUser.token_github = String(req.body.id);
        newUser.username = req.body.username;
    }
    if (!newUser.email || !newUser.firstname || !newUser.lastname || !newUser.path_picture) {
        res.json({success: false, msg: `Your ${req.body.provider} profile is incomplete`})
    } else {
        User.getUser(query, (err, user) => {
            if (!user) {
                User.addUser(newUser, (err, user) => {
                    if (err) {
                        if (err.code === 11000) {
                            err.errmsg = 'Your email is already registered';
                        }
                        res.json({success: false, msg: err.errmsg})
                    } else {
                        const token = jwt.sign(user.toJSON(), config.secret, {
                            expiresIn: 604800
                        });
                        res.json({success: true, token: token});
                    }
                });
            } else {
                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn: 604800
                });
                res.json({success: true, token: token})
            }
        });
    }
};

// Register controller
module.exports.register = (req, res) => {
    let newUserData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password,
        password2: req.body.password2,
        language: req.body.language,
        path_picture: req.body.path_picture,
        username: req.body.username
    };
    /* Looks for errors into inputs. */
    let errors = User.lookErrors(newUserData);
    /* Return message containing all errors if some were found. */
    if (Object.getOwnPropertyNames(errors).length !== 0)
        res.json({success: false, err: errors});
    /* Sends data to model if no errors were found. */
    else {
        User.addUser(newUserData, (err) => {
            /* Returns error if user couldn't register. */
            if (err)
                res.json({
                    success: false,
                    msg: 'Failed to register user, your email or username must already be used.',
                    err: err
                });
            else
                res.json({success: true, msg: 'User successfully registered.'});
        });
    }
};