const User = require('../models/user');

exports.getUser = function (req, res) {
    if (!req.params.id) {
        User.getUserById(req.userdata._id, function (err, result) {
                    res.json({
                        _id: result._id,
                        username: result.username,
                        photo: result.photo,
                        language: result.language,
                        views: result.views,
                        grant: result.grant
                    });
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
                    username: result.username,
                    photo: result.photo,
                    language: result.language
                });
            }
        });
    }
};

/* Method used to update username, photo and language. */
exports.updateUser = function (req, res) {
    let errors = User.lookErrors(req.body);
    if ((req.body.language && req.body.language !== "" && errors['language_uncorrect'] !== true) ||
        (req.body.username && errors['username_undefined'] !== true && errors['username_uncorrect'] !== true) ||
        (req.body.photo && errors['no_photo'] !== true)) {
        User.updateUser(req.userdata._id, req.body, (err, doc) => {
            if (err) {
                if (req.body.username) {
                    res.json({place: 'err_username', message: 'Username is already taken.'});
                }
                else
                    res.json({success: false, msg: "Something wrong when updating data!"});
            }
            else {
                if (doc)
                    res.json({success: true, msg: 'Profile is successfully updated.'});
            }
        });
    } else {
        /* Return errors as json. */
        let msg = {};

        if (req.body.username === "") {
            msg = {place: 'err_username', message: 'Username is empty.'};
        }
        else if (errors['username_uncorrect'] === true) {
            msg = {place: 'err_username', message: 'Username contains special characters.'};
        }
        res.json(msg);
    }
};