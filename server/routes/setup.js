const express = require('express');

const authController = require('../controllers/auth');
const setupController = require('../controllers/setup');

const router = express.Router({});

router.route('/populate')
    .get(authController.validJWT, setupController.populate);

router.route('/informations')
    .get(authController.validJWT, setupController.infos);

module.exports = router;
