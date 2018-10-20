const express = require('express');
const config = require('../config/database');

const torrentController = require('../controllers/torrent');
const movieController = require('../controllers/movie');
const streamController = require('../controllers/stream');

const router = express.Router({});

router.route('/stream/:hash')
    .get(torrentController.streamTorrent);

router.route('/streaming/:file')
    .get(streamController.getStream);

router.route('/streaming/:directory/:file')
    .get(streamController.getStreamDirectory);

module.exports = router;
