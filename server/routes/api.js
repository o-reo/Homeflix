const express = require('express');
// const userController = require('../controllers/user');
// const authController = require('../controllers/auth');
// const clientController = require('../controllers/client');
// const oauth2Controller = require('../controllers/oauth2');
const torrentController = require('../controllers/torrent');
const movieController = require('../controllers/movie');
const streamController = require('../controllers/stream');

const router = express.Router({});

/* Users */
// router.route('/auth')
//     .post(authController.isAuth);

// router.route('/users')
//     .post(userController.postUsers)
//     .get(userController.getUsers);

// router.route('/user/:id')
//     .get(userController.getUser)
//     .delete(authController.isAdmin, userController.removeUser)
//     .put(authController.isAdmin, userController.modifyUser);

// router.route('/myuser')
//     .get(authController.loginRequired, userController.getMyUser)
//     .put(authController.loginRequired, userController.modifyMyUser);

// router.route('/myuserphoto')
//     .put(authController.loginRequired, userController.modifyMyUserPhoto);

// router.route('/clients')
//     .post(authController.loginRequired, clientController.postClients)
//     .get(authController.loginRequired, clientController.getClients);

// router.route('/oauth2/authorize')
//     .get(authController.loginRequired, oauth2Controller.authorization)
//     .post(authController.loginRequired, oauth2Controller.decision);

// router.route('/oauth2/token')
//     .post(authController.isClientAuthenticated, oauth2Controller.token);

// router.route('/auth/google')
//     .get(authController.authGoogle);

// router.route('/auth/google/callback')
//     .get(authController.authGoogleCallback);

// router.route('/auth/sign_in')
//     .post(authController.sign_in);

// router.route('/auth/sign_in/:social')
//     .post(authController.sign_in_social);

router.route('/torrents/:title')
    .get(torrentController.getTorrents);

router.route('/subtitles/:imdbid')
    .get(torrentController.getSubtitles);

router.route('/stream/:hash')
    .get(torrentController.streamTorrent);

/*router.route('/movie/:api/:id_api')
    .get(movieController.accessMovie);*/

router.route('/movie/:id')
    .get(movieController.getMovieInfos);

router.route('/movie_comment/:id_comment')
    .get(movieController.getComment);

router.route('/movie_comments')
    .get(movieController.getAllComments);

router.route('/movie_comments/:id_movie')
    .get(movieController.getComments);

// router.route('/movie_comment')
//     .post(authController.loginRequired, movieController.postComment);

/* tools */
// router.route('/dlmovies')
//     .get(movieController.dlAllMovies);

// router.route('/updateimages')
//     .get(movieController.UpdateImages);

// router.route('/updateusers')
//     .get(userController.UpdateUsers);

router.route('/streaming/:file')
    .get(streamController.getStream);

router.route('/streaming/:directory/:file')
    .get(streamController.getStreamDirectory);

module.exports = router;
