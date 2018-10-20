const express = require('express');
const config = require('../config/database');

const subtitlesController = require('../controllers/subtitles');

const router = express.Router({});

router.route('/')
    .get(subtitlesController.getSubtitles);

module.exports = router;
