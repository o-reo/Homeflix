const Datastore = require('nedb');
const db_movies = new Datastore({
    filename: './data/movies.db',
    autoload: true
});

const User = require('../models/user');

module.exports.get = (query, callback) => {
    db_movies.findOne(query, (err, movie) => {
        console.log(query);
        if (!err && movie) {
            User.countViews(movie.imdb_code, (err, views) => {
                movie.views = views;
                callback(err, movie);
            });
        }
        else {
            callback(false, '')
        }
    })
};

module.exports.search = (query, options, callback) => {
  db_movies.find({}).limit(20).exec((err, movies) => {
    callback(err, movies);
  })
};

module.exports.getAll = (callback) => {
    db_movies.find({}, (err, movies) => {
        callback(err, movies);
    })
};

module.exports.save = (object, callback) => {
    db_movies.update({imdb_code: object.imdb_code}, object, { upsert: true }, (err, user) => {
        callback(err, object);
    })
};

module.exports.remove = (object, callback) => {
    db_movies.remove(object, (err, conf) => {
        callback(err, conf)
    })
};

module.exports.delete = (err, callback) => {
    db_movies.remove({},{multi: true}, (err, conf) => {
        callback(err, conf)
    })
};