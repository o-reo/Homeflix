var mongoose = require('mongoose');

var MovieInfosSchema = new mongoose.Schema({
    imdb_code: {type:String, required: true},
    title: {type:String, required: true},
    year: {type:Number, required: true},
    rating: {type:Number, required: true},
    runtime: {type:Number, required: true},
    genres: {type: [String], required: true},
    summary: {type:String, required: true},
    synopsis: {type:String, required: true},
    background_image: {type:String, required: true},
    background_image_original: {type:String, required: true},
    small_cover_image: {type:String, required: true},
    medium_cover_image: {type:String, required: true},
    large_cover_image: {type:String, required: true},
    torrents: [{
        url: { type: String, required: true },
        hash: { type: String, required: true },
        quality: { type: String, required: true },
        seeds: { type: Number, required: true },
        peers: { type: Number, required: true },
        size: { type: String, required: true },
        quality: { type: String, required: true },
    }]
});

// Export the Mongoose model
module.exports = mongoose.model('MovieInfos', MovieInfosSchema);