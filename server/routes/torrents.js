const express = require('express');
const config = require('../config/database');

const torrentController = require('../controllers/torrent');

const router = express.Router({});

router.route('/')
    .get(torrentController.getTorrents);

module.exports = router;
