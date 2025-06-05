const express = require('express');
const router = express.Router();
const { register, login, logout, getUserInfo } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getUserInfo);

module.exports = router;