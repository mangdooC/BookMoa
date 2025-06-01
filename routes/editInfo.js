const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
  const userId = req.user.id; // JWT에서 가져옴
  const { password, nickname, address } = req.body;

  try {
    let hashedPassword;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const query = [];
    const params = [];

    if (nickname) {
      query.push('nickname = ?');
      params.push(nickname);
    }
    if (address) {
      query.push('address = ?');
      params.push(address);
    }
    if (hashedPassword) {
      query.push('password = ?');
      params.push(hashedPassword);
    }

    if (query.length === 0) {
      return res.status(400).json({ message: '수정할 정보가 없습니다.' });
    }

    params.push(userId);

    const sql = `UPDATE user SET ${query.join(', ')} WHERE user_id = ?`;
    await pool.query(sql, params);

    res.json({ message: '정보 수정 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;