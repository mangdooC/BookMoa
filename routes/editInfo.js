const express = require('express');
const router = express.Router();
const { updateUserInfo } = require('./editInfoController');
const authMiddleware = require('./authMiddleware'); // 로그인 검사 미들웨어

router.put('/updateUserInfo', authMiddleware, updateUserInfo);

module.exports = router;