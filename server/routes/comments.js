const express = require('express');
const config = require('../config/database');

const movieController = require('../controllers/movie');

const router = express.Router({});

router.route('/')
    .get(movieController.getAllComments);

router.route('/:id_movie')
.get(movieController.getComments);

module.exports = router;
