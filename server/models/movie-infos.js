var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
const User = require('../models/user');

var MovieInfosSchema = new mongoose.Schema({
    imdb_code: {type: String, required: true, unique: true},
    type: {type: String, required: true},
    title: {type: String, required: true},
    year: {type: Number, required: true},
    rating: {type: Number, required: true},
    runtime: {type: Number, required: true},
    genres: {type: [String], required: true},
    summary: {type: String, required: true},
    synopsis: {type: String, required: true},
    background_image: {type: String, required: true},
    background_image_original: {type: String, required: true},
    small_cover_image: {type: String, required: true},
    medium_cover_image: {type: String, required: true},
    large_cover_image: {type: String, required: true},
    language: {type: String, required: true},
    cast: [],
    torrents: [{
        magnet: {type: String},
        hash: {type: String, required: true},
        quality: {type: String, required: true},
        seeds: {type: Number, required: true},
        peers: {type: Number, required: true},
        size: {type: String, required: true}
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
