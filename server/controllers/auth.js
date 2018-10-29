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
            User.findById(decoded._id, (err, user) => {
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