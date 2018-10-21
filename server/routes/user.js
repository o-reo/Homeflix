const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');

const router = express.Router({});

// Register
router.post('/register', (req, res, next) => {
    let newUserData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password,
        password2: req.body.password2,
        language: req.body.language,
        username: req.body.username
    };
    /* Looks for errors into inputs. */
    let errors = lookErrors(newUserData);
    /* Return message containing all errors if some were found. */
    if (Object.getOwnPropertyNames(errors).length !== 0)
        res.json({success: false, errors: errors});
    /* Sends data to model if no errors were found. */
    else {
        User.addUser(newUserData, (err) => {
            /* Returns error if user couldn't register. */
            if (err)
                res.json({success: false, msg: 'Failed to register user, your email or username must already be used.', err: err});
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

// Profile
router.get('/profile', passport.authenticate('jwt', {session: false}), function (req, res) {
    res.json({user: req.user});
});

/* Function that looks for errors into inputs. */
function lookErrors(user) {
    let errors = {};
    /* Looks for errors in passwords. */
    if (!user.password || user.password === null)
        errors['password1_empty'] = true;
    if (!user.password2 || user.password2 === null)
        errors['password2_empty'] = true;
    if (user.password !== null && user.password2 !== null && user.password !== user.password2)
        errors['passwords_dont_match'] = true;
    let regex = new RegExp('^(?=.*[^a-zA-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})');
    if (Object.getOwnPropertyNames(errors).length === 0  && regex.test(user.password) === false)
        errors['password_uncorrect'] = true;
    /* Looks for errors in email. */
    if (!user.email || user.email === null)
        errors['mail_undefined'] = true ;
    let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (regexp.test(user.email) === false)
        errors['mail_uncorrect'] = true;
    /* Looks for other errors. */
    if (!user.firstname || user.firstname === null)
        errors['firstname_undefined'] = true;
    if (!user.lastname || user.lastname === null)
        errors['lastname_undefined'] = true;
    if (!user.username || user.username === null)
        errors['username_undefined'] = true;
    if (user.language && user.language !== 'english' && user.language !== 'french' && user.language !== 'spanish')
        errors['language_uncorrect'] = true;
    return (errors);
}

function isEmptyObject(obj) {
    for (var key in obj) {
        return false;
    }
    return true;
}

module.exports = router;
