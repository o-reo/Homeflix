const express = require('express');

const movieController = require('../controllers/movie');
const authController = require('../controllers/auth');

const router = express.Router({});

// router.route('/:id_comment')
//     .get(movieController.getComment());

router.route('/')
    .post(authController.validJWT, movieController.postComment);

// router.post('/:id_movie', passport.authenticate('jwt', {session: false}), function (req, res) {
//     movieController.postComment(req, res);
// });

module.exports = router;
