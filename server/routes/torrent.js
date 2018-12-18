const express = require('express');
const authController = require('../controllers/auth');

const torrentController = require('../controllers/torrent');
const movieController = require('../controllers/movie');

const router = express.Router({});


router.route('/:id')
    .get(authController.validJWT, movieController.getMovieInfos);

router.route('/stream/:hash')
    .post(authController.validJWT, torrentController.streamTorrent)
    .put(authController.validJWT, torrentController.liveTorrent);

module.exports = router;
