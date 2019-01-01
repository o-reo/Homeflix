const Datastore = require('nedb');
const db_user = new Datastore({
        filename: './data/user.db',
        autoload: true
});

db_user.ensureIndex({
    fieldName: 'username',
    unique: true
});


module.exports.getUserById = function (id, callback) {
    db_user.findOne({"_id": id}, (err, user) => {
            callback(err, user);
    });
};


module.exports.addView = function (info, callback) {
    db_user.findOne({
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
    db_user.count({
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
    db_user.findOne(query, (err, user) => {/* 
        if (user && !user.photo.includes('http://') && !user.photo.includes('https://')) {
            user.photo = 'http://localhost:3000/' + user.photo;
        } */
        callback(err, user);
    });
};


module.exports.getUserByUsername = function (username, callback) {
    db_user.findOne({
        username: username
    }, (err, user) => {/* 
        if (user && !user.photo.includes('http://') && !user.photo.includes('https://')) {
            user.photo = 'http://localhost:3000/' + user.photo;
        } */
        callback(err, user);
    });
};

/* Method used to add user. */
module.exports.addUser = function (newUserData, callback) {
    const newUser = {
        username: newUserData.username,
        language: newUserData.language
    };
    db_user.insert(newUser, (err, user) => {
        callback(err, user);
    })
};

/* Function that looks for errors into inputs. */
module.exports.lookErrors = function (user) {
    let errors = {};
    /* Looks for errors in username, first name and last name. */
    this.checkName('username', user.username, errors);
    if (user.language && user.language !== 'english' && user.language !== 'french' && user.language !== 'spanish')
        errors['language_uncorrect'] = true;
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

module.exports.updateUser = function (id, data, callback) {
    db_user.update({_id: id}, {
        $set: data
    }, (err, user) => {
        callback(err, user);
    });
};
