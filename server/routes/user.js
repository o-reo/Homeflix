const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const fs = require('fs');
const multer = require('multer');
let path = require('path');
const router = express.Router({});

const DIR = './profil_pictures';

// User info
router.get('/:user_id', passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('req', req);
    res.json({
        success: true, user: {
            _id: req.user._id,
            username: req.user.username,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            language: req.user.language,
            photo: req.user.photo
        }
    });
});


// Register
router.post('/register', (req, res, next) => {
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

//login google
router.get('/authenticate/google', passport.authenticate('google',
    {
        scope: [ 'email', 'profile' ],
        session: false
}));

router.get('/authenticate/google/callback',
    passport.authenticate('google',
        {
            failureRedirect: 'http://localhost:4200/auth'
        }),
    function (req, res) {
        res.redirect('http://localhost:4200/auth?code=' + req.query.code);
    });

// Profile
router.get('/profile', passport.authenticate(['jwt', 'google'], {session: false}), function (req, res) {
    res.json({
        success: true, user: {
            _id: req.user._id,
            username: req.user.username,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            language: req.user.language,
            mail: req.user.mail
        }
    });
});

/* Creates storage for uploader. */
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + '.' + file.mimetype.split('/')[1]);
    }
});

/* Creates uploader. */
let upload = multer({
    storage: storage
});

/* Request to send picture. */
router.post('/upload', upload.single('photo'), function (req, res) {
    if (!req.file) {
        return res.send({
            success: false
        });
    } else {
        return res.send({
            success: true
        })
    }
});

module.exports = router;
