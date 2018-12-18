const User = require('../models/user');
const config = require('../config/database');
const jwt = require("jsonwebtoken");

// Middleware to get JsonWebToken data
module.exports.validJWT = (req, res, next) => {
    if (!req.headers.authorization) {
        res.json({success: false, msg: 'No Authorization was sent'});
    } else {
        jwt.verify(req.headers.authorization.substring(7), config.secret, (err, decoded) => {
            if (err) {
                res.json({success: false, msg: err})
            }
            else {
                User.getUserById(decoded._id, (err, user) => {
                    if (err || !user) {
                        res.json({success: false, msg: 'Could not find user'})
                    }
                    else {
                        req.userdata = user;
                        next();
                    }
                });
            }
        });
    }
};

// Login controller
module.exports.login = (req, res) => {
    const username = req.body.username;
    User.getUserByUsername(username, (err, user) => {
        if (!user) {
            return res.json({success: false, msg: 'User not found'});
        }
        const token = jwt.sign(user, config.secret, {
            expiresIn: 604800
        });
        res.json({
            success: true,
            token: token
        });
    });
};

// Register controller
module.exports.register = (req, res) => {
    let newUserData = {
        username: req.body.username,
        language: req.body.language,
        path_picture: req.body.path_picture
    };
    /* Looks for errors into inputs. */
    let errors = User.lookErrors(newUserData);
    /* Return message containing all errors if some were found. */
    if (Object.getOwnPropertyNames(errors).length !== 0) {
        console.log(errors);
        res.json({success: false, err: errors});
    }
    /* Sends data to model if no errors were found. */
    else {
        User.addUser(newUserData, (err, user) => {
            /* Returns error if user couldn't register. */
            if (err) {
                res.json({
                    success: false,
                    msg: 'Failed to register user, your email or username must already be used.',
                    err: err
                });
            }
            else {
                res.json({success: true, msg: 'User successfully registered.', id: user._id});
            }
        });
    }
};