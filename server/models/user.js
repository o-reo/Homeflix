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
    mail: {
        type: String,
        required: true
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
        type: Number,
        required: false
    },
    token_42: {
        type: Number,
        required: false
    },
    photo: {
        type: String,
        required: false
    },
    lang: {
        type: String,
        required: false
    }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
};

module.exports.getUserByUsername = function (username, callback) {
    const query = {username: username};
    User.findOne(query, callback);
};

module.exports.addUser = function (newUserData, callback) {
    // Here you check the user
    const newUser = User({
        first_name: newUserData.first_name,
        last_name: newUserData.last_name,
        username: newUserData.username,
        mail: newUserData.mail,
        password: newUserData.password
    });
    bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                newUser.password = hash;
                newUser.save(callback);
            })
        }
    )
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
      if (err) throw err;
      callback(null, isMatch);
  });
};