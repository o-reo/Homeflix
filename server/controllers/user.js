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
                        language: result.language
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

    if ((req.body.newInfo.first_name && errors['firstname_undefined'] !== true) ||
        (req.body.newInfo.last_name && errors['lastname_undefined'] !== true) ||
        (req.body.newInfo.language && errors['language_uncorrect'] !== true) ||
        (req.body.newInfo.username && errors['username_undefined'] !== true) ||
        (req.body.newInfo.photo && errors['no_photo'] !== true) ||
        (req.body.newInfo.email && errors['mail_undefined'] !== true && errors['mail_uncorrect'] !== true)) {
        User.findOneAndUpdate(req.body.oldInfo, {$set: req.body.newInfo}, (err) => {
            if (err) {
                if (req.body.newInfo.username || req.body.newInfo.email)
                    res.json({
                        success: false,
                        msg: "Something wrong when updating data! Username or email is probably already used."
                    });
                else
                    res.json({success: false, msg: "Something wrong when updating data!"});
            }
            else {
                /* Delete picture if update is a picture. */
                if (req.body.oldInfo.photo) {
                    fs.unlinkSync('./public/' + req.body.oldInfo.photo);
                }
                res.json({success: true, msg: 'Profile is successfully updated.'});
            }
        });
    }
    else if (req.body.newInfo.password && errors['password1_empty'] !== true && errors['password2_empty'] !== true
        && errors['passwords_dont_match'] !== true && errors['password_uncorrect'] !== true) {
        bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.newInfo.password, salt, (err, hash) => {
                    User.findOneAndUpdate(req.body.oldInfo, {$set: {password: hash}}, (err) => {
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
    }
    else
        res.json(errors);
};