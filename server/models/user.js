const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    grant: {
        type: Number,
        default: 0,
        required: false
    },
    token_google: {
        type: String,
        required: false
    },
    token_42: {
        type: String,
        required: false
    },
    token_github: {
        type: String,
        required: false
    },
    token_slack: {
        type: String,
        required: false
    },
    photo: {
        type: String,
        required: false
    },
    language: {
        type: String,
        default: 'english'
    },
    views: [new mongoose.Schema({imdbid: 'string'})]
});


const User = module.exports = mongoose.model('User', UserSchema);


module.exports.getUserById = function (id, callback) {
    User.findById(id, (err, user) => {
        callback(err, user);
    });
};


module.exports.addView = function (info, callback) {
    User.findOne({
        _id: info.user_id
    }, (err, user) => {
        const has_viewed = user.views.toString().includes(info.imdbid);
        if (user && !has_viewed) {
            user.views.push({imdbid: info.imdbid});
            user.save((err) => {
                if (!err) {
                    callback(true, null)
                } else {
                    callback(false, 'Could not save view')
                }
            });
        } else {
            callback(false, 'User has already viewed this movie');
        }
    })
};


module.exports.countViews = function (imdbid, callback) {
    User.countDocuments({
        views: {
            $elemMatch: {
                imdbid: imdbid
            }
        }
    }, (err, views) => {
        callback(err, views);
    });
};


module.exports.getUser = function (query, callback) {
    User.findOne(query, (err, user) => {
        if (user && !user.photo.includes('http://') && !user.photo.includes('https://')) {
            user.photo = 'http://localhost:3000/' + user.photo;
        }
        callback(err, user);
    });
};


module.exports.getUserByUsername = function (username, callback) {
    User.findOne({
        username: username
    }, (err, user) => {
        if (user && !user.photo.includes('http://') && !user.photo.includes('https://')) {
            user.photo = 'http://localhost:3000/' + user.photo;
        }
        callback(err, user);
    });
};


module.exports.resetPassword = function (email, callback) {
    User.findOne({
        email: email
    }, (err, user) => {
        if (!err && user) {
            let pwdChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^*()-_+=?[]}{|~`";
            let pwdLen = 10;
            let new_password = Array(pwdLen).fill(pwdChars).map(function (x) {
                return x[Math.floor(Math.random() * x.length)]
            }).join('');
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(new_password, salt, (err, hash) => {
                    user.password = hash;
                    user.save((err, new_user) => {
                        callback(true, {
                            password: new_password
                        })
                    })
                })
            })
        } else {
            callback(false, {
                msg: 'Invalid email address'
            });
        }
    });
};

/* Method used to add user. */
module.exports.addUser = function (newUserData, callback) {
    /* Creates object from data passed by router. */
    const newUser = User({
        first_name: newUserData.firstname,
        last_name: newUserData.lastname,
        username: newUserData.username,
        email: newUserData.email,
        password: newUserData.password,
        photo: newUserData.path_picture,
        language: newUserData.language,
        token_google: newUserData.token_google ? newUserData.token_google : null,
        token_github: newUserData.token_github ? newUserData.token_github : null,
        token_slack: newUserData.token_slack ? newUserData.token_slack : null,
        token_42: newUserData.token_42 ? newUserData.token_42 : null
    });
    /* Hashes and add user to database or returns error if user couldn't be added to database. */
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            newUser.password = hash;
            newUser.save((err, user) => {
                callback(err, user);
            });
        })
    });
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) {
            return callback(err, false);
        }
        return callback(null, isMatch);
    });
};

/* Function that looks for errors into inputs. */
module.exports.lookErrors = function (user) {
    let errors = {};
    /* Looks for errors in passwords. */
    this.checkPassword(user.password, user.password2, errors);
    /* Looks for errors in email. */
    this.checkEmail(user.email, errors);
    /* Looks for errors in username, first name and last name. */
    this.checkName('username', user.username, errors);
    this.checkName('firstname', user.firstname, errors);
    this.checkName('lastname', user.lastname, errors);
    if (user.language && user.language !== 'english' && user.language !== 'french' && user.language !== 'spanish')
        errors['language_uncorrect'] = true;
    if ((!user.path_picture || user.path_picture === null) && (!user.photo || user.photo === null))
        errors['no_photo'] = true;
    return (errors);
};

module.exports.checkPassword = function (password, confirmation, errors) {
    if (!password || password === null)
        errors['password1_empty'] = true;
    if (!confirmation || confirmation === null)
        errors['password2_empty'] = true;
    if (password !== null && confirmation !== null && password !== confirmation)
        errors['passwords_dont_match'] = true;
    let regex = new RegExp('^(?=.*[^a-zA-Z])(?=.*[0-9])(?=.*[ `~!@#$%^&*()_+\\-=\[\\]{};\':"\\\\|,.<>\\/?])(?=.{8,})');
    if (Object.getOwnPropertyNames(errors).length === 0 && regex.test(password) === false)
        errors['password_uncorrect'] = true;
    return (errors);
};

module.exports.checkName = function (key, name, errors) {
    if (!name || name === null)
        errors[key + '_undefined'] = true;
    let regexp = new RegExp(/[ `~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/);
    if (regexp.test(name))
        errors[key + '_uncorrect'] = true;
    return (errors);
};

module.exports.checkEmail = function (email, errors) {
    if (!email || email === null)
        errors['mail_undefined'] = true;
    let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (regexp.test(email) === false)
        errors['mail_uncorrect'] = true;
    return (errors);
};

module.exports.updateUser = function (id, data, callback) {
    User.findByIdAndUpdate(id, {
        $set: data
    }, (err, user) => {
        callback(err, user);
    });
};
