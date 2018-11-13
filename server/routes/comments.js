const express = require('express');
const config = require('../config/database');

const movieController = require('../controllers/movie');
const authController = require('../controllers/auth');

const router = express.Router({});

router.route('/')
    .get(authController.validJWT, movieController.getAllComments);

router.route('/:id_movie')
    .get(authController.validJWT, movieController.getComments);

module.exports = router;
