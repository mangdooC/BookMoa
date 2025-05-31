const express = require('express');
const router = express.Router();
const pool = require('../db');
const authController = require('../controllers/authController');

// 회원가입 처리
router.post('/register', authController.register);

// 로그인 처리
router.post('/login', authController.login);

// 아이디 중복 체크 API 라우터
router.get('/checkId', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: 'user_id가 필요합니다.' });
  }

  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute('SELECT id FROM user WHERE user_id = ?', [user_id]);

      if (rows.length > 0) {
        res.json({ exists: true });
      } else {
        res.json({ exists: false });
      }
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;