const User = require('../models/user');

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

/* Method used to update username, firstname, username, email and language. */
exports.updateUser = function (req, res) {
    let errors = User.lookErrors(req.body.newInfo);

    if ((req.body.newInfo.first_name && errors['firstname_undefined'] !== true) ||
        (req.body.newInfo.last_name && errors['lastname_undefined'] !== true) ||
        (req.body.newInfo.language && errors['language_uncorrect'] !== true) ||
        (req.body.newInfo.username && errors['username_undefined'] !== true) ||
        (req.body.newInfo.email && errors['mail_undefined'] !== true &&
        errors['mail_uncorrect'] !== true)) {
        User.findOneAndUpdate(req.body.oldInfo, {$set: req.body.newInfo}, {new: true}, (err) => {
            if (err) {
                if (req.body.newInfo.username)
                    res.json({success: false, msg: "Something wrong when updating data! Username is probably already used."});
                else
                    res.json({success: false, msg: "Something wrong when updating data!"});
            }
            else {
                res.json({success: true, msg: 'Profile is successfully updated.'});
            }
        });
    }
    else
        res.json(errors);
};