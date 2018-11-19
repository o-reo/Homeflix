const Movie = require('../models/movie');
const User = require('../models/user');
const MovieComment = require('../models/movie-comment');
const https = require('https');
const request = require('request');
const MovieInfos = require('../models/movie-infos');
// const imdb = require('imdb-api');

// exports.accessMovie = function (req, res) {
//     console.log('1');
//     Movie.findOne({$and: [{id_api: req.params.id_api}, {api: req.params.api}]}, function (err, movie) {
//         if (err) {
//             res.json(err)
//         }
//         else if (movie) {
//             res.json(movie);
//             console.log('2');
//         } else {
//             //Creer le movie
//             if (req.params.api === "yts") {
//                 request('https://yts.am/api/v2/movie_details.json?movie_id=' + req.params.id_api, function (error, response, body) {
//                     if (error) {
//                         res.json(error)
//                     }
//                     else {
//                         data = JSON.parse(body);
//                         let newMovie = Movie({
//                             id_api: req.params.id_api,
//                             api: req.params.api,
//                             hash: data.data.movie.torrents[0].hash
//                         });
//                         console.log('Sauvegarde ...');
//                         newMovie.save((err2, movie) => {
//                             console.log('SAVING');
//                             if (err2) {
//                                 console.log('ERROR:', err2);
//                                 res.json(err2)
//                             }
//                             else {
//                                 console.log('ENVOIE DU MOVIE --------');
//                                 res.json(movie);
//                             }
//                         });
//                     }
//                 });
//             } else if (req.params.api === 'nyaapantsu') {
//                 request('https://nyaa.pantsu.cat/api/search?id=' + req.params.id_api, function (error, response, body) {
//                     if (error) {
//                         res.json(error)
//                     }
//                     else {
//                         data = JSON.parse(body);
//                         let newMovie = Movie({
//                             id_api: req.params.id_api,
//                             api: req.params.api,
//                             hash: data.torrents[0].hash
//                         });
//                         console.log('Sauvegarde ...');
//                         newMovie.save((err2, movie) => {
//                             console.log('SAVING');
//                             if (err2) {
//                                 console.log('ERROR:', err2);
//                                 res.json(err2)
//                             }
//                             else {
//                                 console.log('ENVOIE DU MOVIE --------');
//                                 res.json(movie);
//                             }
//                         });
//                     }
//                 });
//             }
//         }
//     });
// };

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

// function dlPage(page) {
//     if (dlPage >= 170)
//         return;
//     setTimeout(function () {
//         let options = {
//             url: 'https://yts.am/api/v2/list_movies.json?limit=50&page=' + page + '&with_images=true&with_cast=true',
//             headers: {
//                 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36',
//                 'cookie': '__cfduid=df636e11815501063a8271a09ea634e271539350245; PHPSESSID=5seuhn4gbp8o5df0h5ftibe9s6; __test; __atuvc=4%7C41; cf_clearance=ef6c8834664556c48bd215b322e2a7b77ac6e863-1539354307-3600-150'
//             }
//         };
//         request(options, function (error, response, body) {
//             //console.log('SousReq');
//             let data = JSON.parse(body);
//             if (!error) {
//                 data.data.movies.forEach(function (val) {
//                     console.log(val);
//                     const newMovie = MovieInfos(val);
//                     // MovieInfos.findOne({imdb_code: val.imdb_code}, function (err, data) {
//                     //if (!data) {
//                     newMovie.save((err, movie) => {
//                         if (err) {
//                             console.log('Erreur lors de l\'ajout du film');
//                         }
//                         else {
//                             console.log('Ajout du film ' + movie.title);
//                         }
//                     });
//                     //}
//                     //});
//                 });
//             } else {
//                 console.log('Erreur lors de la premiere requete');
//             }
//         });
//         dlPage(page + 1);
//     }, 1500);
// }

// function getImage(imdb_code) {
//     console.log('imdb code:', imdb_code);
//     imdb.get({id: imdb_code}, {apiKey: 'be761138'}).then((rep) => {
//         let request = {
//             background_image: rep.poster,
//             background_image_original: rep.poster,
//             small_cover_image: rep.poster,
//             medium_cover_image: rep.poster,
//             large_cover_image: rep.poster
//         };
//         MovieInfos.updateOne(
//             {imdb_code: imdb_code},
//             {$set: request},
//             function (err, result) {
//                 if (err)
//                     console.log('error lors de lupdate');
//                 console.log('image updated');
//             });
//
//     });
// }

// exports.UpdateImages = function (req, res) {
//     var q = MovieInfos.find().limit(950).skip(950);
//     q.exec(function (err, movie) {
//         if (movie) {
//             // console.log(movie[0].imdb_code);
//             movie.forEach(function (val) {
//                 getImage(val.imdb_code);
//             });
//             res.json('finish');
//         }
//     })
// };

// exports.dlAllMovies = function (req, res) {
//     dlPage(1);
// };