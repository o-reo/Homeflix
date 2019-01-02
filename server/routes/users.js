const express = require('express');
const UserController = require('../controllers/user');
const router = express.Router({});


// Get all users
router.route('/')
    .get(UserController.getUsers);

module.exports = router;
