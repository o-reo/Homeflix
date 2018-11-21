const MovieComment = require('../models/movie-comment');
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

/*  get.api/movie_comments */
exports.getAllComments = function (req, res) {
    MovieComment.find(function (err, comments) {
        if (err) {
            res.json(err)
        }
        else if (comments) {
            res.json(comments)
        }
    });
};

/* get.api/movie_comments/:id_movie */
exports.getComments = function (req, res) {
    MovieComment.find({id_movie: req.params.id_movie}, function (err, comments) {
        if (err) {
            res.json(err)
        }
        else if (comments) {
            res.json(comments)
        }
    });
};

/*  get.api/movie_comment/:id_comment */
exports.getComment = function (req, res) {
    MovieComment.findOne({_id: req.params.id_comment}, function (err, comment) {
        if (err) {
            res.json(err)
        }
        else if (comment) {
            res.json(comment)
        }
    });
};

/* post.comment */
exports.postComment = function (req, res) {
    const newComment = MovieComment({
        id_movie: req.body.id_movie,
        id_user: req.userdata._id,
        content: req.body.content
    });
    newComment.save((err, comment) => {
        if (err) {
            res.json(err)
        }
        else {
            res.json(comment)
        }
    });
};