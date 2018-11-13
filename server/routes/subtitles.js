const express = require('express');
const config = require('../config/database');

const authController = require('../controllers/auth');
const subtitlesController = require('../controllers/subtitles');

const router = express.Router({});

router.route('/')
    .get(authController.validJWT, subtitlesController.getSubtitles);

module.exports = router;
