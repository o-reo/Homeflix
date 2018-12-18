const express = require('express');

const authController = require('../controllers/auth');
const torrentController = require('../controllers/torrent');

const router = express.Router({});

router.route('/')
    .get(authController.validJWT, torrentController.getTorrents);

module.exports = router;
