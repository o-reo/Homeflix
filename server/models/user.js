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
    photo: {
        type: String,
        required: false
    },
    language: {
        type: String,
        default: 'english'
    }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
};

module.exports.getGoogleUser = function (id, callback) {
    User.findOne({token_google: id}, callback);
};

module.exports.getUserByUsername = function (username, callback) {
    User.findOne({username: username}, callback);
};

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
        token_google: newUserData.token_google ? newUserData.token_google : null
    });
    /* Hashes and add user to database or returns error if user couldn't be added to database. */
    bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                newUser.password = hash;
                newUser.save(callback);
            })
        }
    );
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
      if (err) {return callback(err, false); }
      return callback(null, isMatch);
  });
};


/* Function that looks for errors into inputs. */
module.exports.lookErrors = function(user) {
    let errors = {};
    /* Looks for errors in passwords. */
    if (!user.password || user.password === null)
        errors['password1_empty'] = true;
    if (!user.password2 || user.password2 === null)
        errors['password2_empty'] = true;
    if (user.password !== null && user.password2 !== null && user.password !== user.password2)
        errors['passwords_dont_match'] = true;
    let regex = new RegExp('^(?=.*[^a-zA-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})');
    if (Object.getOwnPropertyNames(errors).length === 0 && regex.test(user.password) === false)
        errors['password_uncorrect'] = true;
    /* Looks for errors in email. */
    if (!user.email || user.email === null)
        errors['mail_undefined'] = true;
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
    if (!user.path_picture || user.path_picture === null)
        errors['no_photo'] = true;
    return (errors);
};