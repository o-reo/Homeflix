const MovieInfos = require('../models/movie-infos');

exports.getMovieInfos = function (req, res) {
    MovieInfos.get({_id: req.params.id}, function (err, movie) {
        if (err)
            res.json(err);
        else {
            res.json(movie);
        }
    });
};