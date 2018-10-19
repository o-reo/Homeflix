const express = require('express');
// const userController = require('../controllers/user');
// const authController = require('../controllers/auth');
// const clientController = require('../controllers/client');
// const oauth2Controller = require('../controllers/oauth2');
// const torrentController = require('../controllers/torrent');
// const movieController = require('../controllers/movie');
// const streamController = require('../controllers/stream');

const router = express.Router({});


/*router.route('/movie/:api/:id_api')
    .get(movieController.accessMovie);*/
//
// router.route('/movie/:id')
//     .get(movieController.getMovieInfos);
//
// router.route('/movie_comment/:id_comment')
//     .get(movieController.getComment);
//
// router.route('/movie_comments')
//     .get(movieController.getAllComments);
//
// router.route('/movie_comments/:id_movie')
//     .get(movieController.getComments);

// router.route('/movie_comment')
//     .post(authController.loginRequired, movieController.postComment);

/* tools */
// router.route('/dlmovies')
//     .get(movieController.dlAllMovies);

// router.route('/updateimages')
//     .get(movieController.UpdateImages);

// router.route('/updateusers')
//     .get(userController.UpdateUsers);
//
// router.route('/streaming/:file')
//     .get(streamController.getStream);
//
// router.route('/streaming/:directory/:file')
//     .get(streamController.getStreamDirectory);

module.exports = router;
