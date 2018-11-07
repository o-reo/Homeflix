const express = require('express');
const UserController = require('../controllers/user');
const authController = require('../controllers/auth');
const multer = require('multer');
const router = express.Router({});

const DIR = './public/profil_pictures';

// Register
router.route('/register')
    .post(authController.register);

// Login
router.route('/login').post(authController.login);

// OAuth
router.route('/oauth').post(authController.oauth);

// Sends a new password to the user
router.route('/recovery')
    .get(UserController.recovery);

// User info
router.route('/:id')
    .get(authController.validJWT, UserController.getUser);

// Personal info, with a put for updating user info
router.route('/')
    .get(authController.validJWT, UserController.getUser)
    .put(authController.validJWT, UserController.updateUser);

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
