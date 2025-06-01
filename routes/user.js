const express = require('express');
const router = express.Router();
const { getUserInfo } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); // 토큰 검증 미들웨어

router.get('/info', authMiddleware, getUserInfo);

module.exports = router;