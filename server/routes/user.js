const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');

const router = express.Router({});

// Register
router.post('/register', (req, res, next) => {
    console.log(req.body);
    let newUserData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        mail: req.body.mail,
        password: req.body.password,
        password2: req.body.password2,
        username: req.body.username
    };
    User.addUser(newUserData, (err, user) => {
        if (err) {
            res.json({success: false, msg: 'Failed to register user'})
        } else {
            res.json({success: true, msg: 'User successfully registered'})
        }
    })
});

// Login
router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        // if (err) throw err;
        if (!user) {
            return res.json({success: false, msg: 'User not found'});
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
            // if (err) throw err;
            if (isMatch) {
                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn: 604800
                });
                // Add here user data you want to access in client after login
                res.json({
                    success: true,
                    token: 'Bearer ' + token,
                    user: {
                        id: user._id,
                        username: user.username,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        mail: user.mail,
                        photo: user.photo
                    }
                });
            } else {
                res.json({success: false, msg: 'Wrong password'});
            }
        });
    });
});

// Profile
router.get('/profile', passport.authenticate('jwt', { session: false }), function (req, res) {
    res.json({user: req.user});
});

module.exports = router;
