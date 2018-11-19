const express = require('express');

const authController = require('../controllers/auth');
const setupController = require('../controllers/setup');

const router = express.Router({});

router.route('/populate')
    .get(setupController.populate);

router.route('/informations')
    .get(setupController.infos);

module.exports = router;
