const express = require('express');
const config = require('../config/database');
const passport = require('passport');

const movieController = require('../controllers/movie');

const router = express.Router({});

// router.route('/:id_comment')
//     .get(movieController.getComment());

router.route('/', passport.authenticate('jwt', {session: false}))
    .post( movieController.postComment);

// router.post('/:id_movie', passport.authenticate('jwt', {session: false}), function (req, res) {
//     movieController.postComment(req, res);
// });

module.exports = router;
