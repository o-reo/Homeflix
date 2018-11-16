const express = require('express');
const config = require('../config/database');
const authController = require('../controllers/auth');

const torrentController = require('../controllers/torrent');
const movieController = require('../controllers/movie');
const streamController = require('../controllers/stream');

const router = express.Router({});


router.route('/:id')
    .get(authController.validJWT, movieController.getMovieInfos);

router.route('/stream/:hash')
    .post(authController.validJWT, torrentController.streamTorrent)
    .put(authController.validJWT, torrentController.liveTorrent);

// router.route('/streaming/:file')
//     .get(streamController.getStream);

// router.route('/streaming/:directory/:file')
//     .get(streamController.getStreamDirectory);

module.exports = router;
