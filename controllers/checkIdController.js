const pool = require('../db');

const checkUserId = async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: '아이디를 입력하세요.' });
  }

  try {
    const [rows] = await pool.query('SELECT user_id FROM user WHERE user_id = ? AND is_deleted = 0', [user_id]);
    if (rows.length > 0) {
      return res.json({ available: false, message: '이미 존재하는 아이디입니다.' });
    }
    res.json({ available: true, message: '사용 가능한 아이디입니다.' });
  } catch (error) {
    console.error('아이디 체크 에러:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};

module.exports = { checkUserId };
