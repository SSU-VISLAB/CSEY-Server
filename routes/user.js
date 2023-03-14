const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

/** url: /api/signup */
router.post('/signup', userController.signup);

/** url: /api/login */
router.post('/login', userController.login);

module.exports = router;
