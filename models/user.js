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
        required: true
    },
    grant: {
        type: Number,
        default: 0
    },
    googleId: {
        type: Number,
        required: false
    },
    photo: {
        type: String
    }
});

UserSchema.pre('save', function(callback) {
    var user = this;

    if (!user.isModified('password')) return callback();

    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) return callback(err);
        user.password = hash;
        callback();
    });
});

UserSchema.methods.verifyPassword = function(password, callback) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
       if (err) {
           return callback(err);
       }
       callback(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);
