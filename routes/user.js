const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // 토큰 검증 미들웨어
const { getUserInfo, updatePreferredArea, getPreferredArea } = require('../controllers/userController');

router.get('/me', authMiddleware, getUserInfo);
router.patch('/preferred-area', authMiddleware, updatePreferredArea);
router.get('/preferred-area', authMiddleware, getPreferredArea);

router.get('/mypage', authMiddleware, (req, res) => {
  res.send(`환영합니다, 사용자 ${req.user_id}님!`);
});

module.exports = router;