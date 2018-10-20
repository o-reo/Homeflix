const express = require('express');
const config = require('../config/database');

const movieController = require('../controllers/movie');

const router = express.Router({});

router.route('/:id_comment')
  .get(movieController.getComment);

module.exports = router;
