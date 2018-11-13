const express = require('express');

const movieController = require('../controllers/movie');
const authController = require('../controllers/auth');

const router = express.Router({});

router.route('/')
    .post(authController.validJWT, movieController.postComment);

module.exports = router;
