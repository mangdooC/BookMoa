const pool = require('../db');

const getUserInfo = async (req, res) => {
  const user_id = req.user_id; // authMiddleware에서 넣어준 user_id

  try {
    const [rows] = await pool.query('SELECT user_id, nickname, address FROM user WHERE user_id = ?', [user_id]);
    if (rows.length === 0) return res.status(404).json({ error: '유저 정보가 없습니다.' });

    res.json(rows[0]);
  } catch (error) {
    console.error('유저 정보 조회 에러:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};

module.exports = { getUserInfo };