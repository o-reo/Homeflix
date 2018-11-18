var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
const User = require('../models/user');

var MovieInfosSchema = new mongoose.Schema({
    imdb_code: {type: String, required: true, unique: true},
    type: {type: String, required: true},
    title: {type: String, required: true},
    year: {type: Number},
    rating: {type: Number},
    runtime: {type: Number},
    genres: {type: [String]},
    summary: {type: String},
    synopsis: {type: String},
    medium_cover_image: {type: String, required: true},
    language: {type: String},
    cast: [],
    torrents: [{
        magnet: {type: String, required: true},
        hash: {type: String, required: true},
        quality: {type: String},
        seeds: {type: Number},
        peers: {type: Number},
        size: {type: String},
        season: {type: String},
        episode: {type: String}
    }]
});

// Export the Mongoose model
MovieInfosSchema.plugin(mongoosePaginate);
const MovieInfo = module.exports = mongoose.model('MovieInfos', MovieInfosSchema);


module.exports.get = (query, callback) => {
    MovieInfo.findOne(query, (err, movie) => {
        if (!err && movie) {
            User.countViews(movie.imdb_code, (err, views) => {
                movie = movie.toJSON();
                movie.views = views;
                callback(err, movie);
            });
        }
        else {
            callback(true, '')
        }
    })
};

module.exports.getAll = (callback) => {
  Movie.find({}, (err, movies) => {
    callback(err, movies);
  })
}
