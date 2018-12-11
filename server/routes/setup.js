const express = require('express');

const authController = require('../controllers/auth');
const setupController = require('../controllers/setup');

const router = express.Router({});

router.route('/populate')
    .post(authController.validJWT, setupController.populate);

router.route('/informations')
    .get(authController.validJWT, setupController.infos);

router.route('/reset')
    .delete(authController.validJWT, setupController.reset);

module.exports = router;
