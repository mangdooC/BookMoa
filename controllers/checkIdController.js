const pool = require('../db');

const checkUserId = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: '아이디를 입력하세요.' });
  }

  try {
    const [rows] = await pool.query('SELECT user_id FROM user WHERE user_id = ? AND is_deleted = 0', [user_id]);
    if (rows.length > 0) {
      return res.json({ exists: true, message: '이미 존재하는 아이디입니다.' });
    }
    res.json({ exists: false, message: '사용 가능한 아이디입니다.' });
  } catch (error) {
    console.error('아이디 체크 에러:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};

module.exports = { checkUserId };