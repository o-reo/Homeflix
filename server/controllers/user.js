const User = require('../models/user');
const bcrypt = require('bcrypt');
const fs = require('fs');
const nodemailer = require('nodemailer');
const credentials = require('../config/credentials');

exports.getUser = function (req, res) {
    if (!req.params.id) {
        User.getUserById(req.userdata._id, function (err, result) {
            if (!result || err) {
                res.json({success: false, msg: 'Could not fetch this user'});
            }
            else {
                if (result.password === req.userdata.password) {
                    res.json({
                        _id: result._id,
                        first_name: result.first_name,
                        last_name: result.last_name,
                        username: result.username,
                        email: result.email,
                        photo: result.photo,
                        language: result.language,
                        views: result.views,
                        grant: result.grant
                    });
                } else {
                    res.json({success: false, msg: 'Corrupted user data'});
                }
            }
        });
    }
    else {
        User.getUserById(req.params.id, function (err, result) {
            if (!result || err) {
                res.json({success: false, msg: 'Could not fetch this user'});
            }
            else {
                res.json({
                    _id: result._id,
                    first_name: result.first_name,
                    last_name: result.last_name,
                    username: result.username,
                    photo: result.photo,
                    language: result.language
                });
            }
        });
    }
};


exports.recovery = function (req, res) {
    User.resetPassword(req.query.email, (success, resp) => {
        if (success) {
            const transporter = nodemailer.createTransport(credentials.mail);
            transporter.verify(function (error, success) {
                if (success) {
                    let mailOptions = {
                        from: 'matcha.o-reo@yandex.com',
                        to: req.query.email,
                        subject: 'Hypertube - Your new password',
                        text: `Your new password is ${resp['password']}`
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            res.json({success: false, msg: 'Could not send recovery email'});
                        } else {
                            res.json({success: true, msg: 'A recovery email has been sent'});
                        }
                    });
                }
            });
        } else {
            res.json({success: false, msg: resp['msg']})
        }
    });
};

/* Method used to update username, firstname, lastname, email and language. */
exports.updateUser = function (req, res) {
    let errors = User.lookErrors(req.body.newInfo);

    if ((req.body.newInfo.language && req.body.newInfo.language !== "" && errors['language_uncorrect'] !== true) ||
        (req.body.newInfo.username && errors['username_undefined'] !== true && errors['username_uncorrect'] !== true) ||
        (req.body.newInfo.lastname && errors['lastname_undefined'] !== true && errors['lastname_uncorrect'] !== true) ||
        (req.body.newInfo.firstname && errors['firstname_undefined'] !== true && errors['firstname_uncorrect'] !== true) ||
        (req.body.newInfo.photo && errors['no_photo'] !== true) ||
        (req.body.newInfo.email && errors['mail_undefined'] !== true && errors['mail_uncorrect'] !== true)) {
        User.findOneAndUpdate(req.body.oldInfo, {$set: req.body.newInfo}, {new: false}, (err, doc) => {
            if (err) {
                if (req.body.newInfo.username) {
                    res.json({place: 'err_username', message: 'Username is already taken.'});
                }
                else if (req.body.newInfo.email) {
                    res.json({place: 'err_email', message: 'Email is already taken.'});
                }
                else
                    res.json({success: false, msg: "Something wrong when updating data!"});
            }
            else {
                /* Delete picture if update is a picture. */
                if (req.body.newInfo.photo) {
                    if (fs.existsSync('./public/' + doc['photo'])) {
                        fs.unlinkSync('./public/' + doc['photo']);
                    }
                }
                /* Rename on database and server photo path if username is changed. */
                // else if (req.body.newInfo.username) {
                //     const username = req.body.newInfo.username;
                //     const oldPath = doc['photo'];
                //     const newPath = 'profil_pictures/' + username + '.' + oldPath.split('.')[oldPath.split('.').length - 1];
                //     fs.rename('./public/' + oldPath, './public/' + newPath, function (err) {
                //         if (err)
                //             console.log(err);
                //     });
                //
                // }
                if (doc)
                    res.json({success: true, msg: 'Profile is successfully updated.'});
            }
        });
    }
    else if (req.body.newInfo.password && errors['password1_empty'] !== true && errors['password2_empty'] !== true
        && errors['passwords_dont_match'] !== true && errors['password_uncorrect'] !== true) {
        bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.newInfo.password, salt, (err, hash) => {
                    User.updateUser(req.body.oldInfo, {password: hash}, (err, user) => {
                        if (err) {
                            if (req.body.newInfo.username)
                                res.json({
                                    success: false,
                                    msg: "Something wrong when updating data! Username is probably already used."
                                });
                            else
                                res.json({success: false, msg: "Something wrong when updating data!"});
                        }
                        else {
                            res.json({success: true, msg: 'Profile is successfully updated.'});
                        }
                    });
                })
            }
        );
    } else {
        /* Return errors as json. */
        let msg = {};

        if (req.body.newInfo.firstname === "") {
            msg = {place: 'err_firstname', message: 'First name is empty.'};
        }
        else if (errors['firstname_uncorrect'] === true) {
            msg = {place: 'err_firstname', message: 'First name contains special characters.'};
        }
        if (req.body.newInfo.lastname === "") {
            msg = {place: 'err_lastname', message: 'Last name is empty.'};
        }
        else if (errors['lastname_uncorrect'] === true) {
            msg = {place: 'err_lastname', message: 'Last name contains special characters.'};
        }
        if (req.body.newInfo.username === "") {
            msg = {place: 'err_username', message: 'Username is empty.'};
        }
        else if (errors['username_uncorrect'] === true) {
            msg = {place: 'err_username', message: 'Username contains special characters.'};
        }
        if (req.body.newInfo.email === "") {
            msg = {place: 'err_email', message: 'Email is empty.'};
        }
        if (req.body.newInfo.email && errors['mail_uncorrect'] === true) {
            msg = {place: 'err_email', message: 'Email is uncorrect.'};
        }
        if (errors['password1_empty'] !== true && errors['password2_empty'] !== true &&
            errors['passwords_dont_match'] !== true && errors['password_uncorrect'] === true) {
            msg = {place: 'err_password2', message: 'Password is not strong enough.'};
        }
        res.json(msg);
    }
};