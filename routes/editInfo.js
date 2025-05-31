const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/editInfo', authMiddleware, async (req, res) => {
  const { user_id, password, nickname, address } = req.body;
  const userId = req.user.id;

  if (!user_id && !password && !nickname && !address) {
    return res.status(400).json({ message: '수정할 정보가 없습니다.' });
  }

  try {
    let hashedPassword;
    if (password && password.trim() !== '') {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updateFields = [];
    const updateValues = [];

    if (user_id) {
      updateFields.push('user_id = ?');
      updateValues.push(user_id);
    }
    if (nickname) {
      updateFields.push('nickname = ?');
      updateValues.push(nickname);
    }
    if (address) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }
    if (hashedPassword) {
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    updateValues.push(userId);

    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

    const conn = await pool.getConnection();
    try {
      await conn.execute(sql, updateValues);
    } finally {
      conn.release();
    }

    return res.json({ message: '정보가 수정되었습니다.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;