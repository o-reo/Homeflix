const express = require('express');

const authController = require('../controllers/auth');
const setupController = require('../controllers/setup');

const router = express.Router({});

router.route('/populate')
    .get(authController.validJWT, setupController.populate);

router.route('/informations')
    .get(authController.validJWT, setupController.infos);

router.route('/reset')
    .get(authController.validJWT, setupController.reset);

module.exports = router;
