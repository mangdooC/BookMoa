const express = require('express');
const router = express.Router();
const { register, login, getUserInfo } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', getUserInfo);

module.exports = router;