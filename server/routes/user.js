const express = require('express');
const config = require('../config/database');
const User = require('../models/user');
const UserController = require('../controllers/user');
const authController = require('../controllers/auth');
const multer = require('multer');
const router = express.Router({});
const jwt = require('jsonwebtoken');

const DIR = './profil_pictures';


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
router.route('/login').post(authController.login);


// User info
router.route('/:id')
    .get(authController.validJWT, UserController.getUser);

// Complete user info
router.route('/')
    .get(authController.validJWT, UserController.getUser);

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
