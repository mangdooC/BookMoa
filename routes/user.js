const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getUserInfo,
  updatePreferredArea,
  getPreferredArea,
  updateUserInfo,
} = require('../controllers/userController');

// 내 정보 조회
router.get('/info', authMiddleware, getUserInfo);

// 선호지역 조회
router.get('/preferred-area', authMiddleware, getPreferredArea);

// 선호지역 업데이트
router.put('/preferred-area', authMiddleware, updatePreferredArea);

// 회원정보 수정 (아이디, 비번, 닉네임, 주소 등)
router.put('/edit', authMiddleware, updateUserInfo);

module.exports = router;