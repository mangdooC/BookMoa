const pool = require('../db');

const editUserInfo = async (req, res) => {
  const user_id = req.user_id;
  const { nickname, address } = req.body;

  if (!nickname || nickname.trim() === '') {
    return res.status(400).json({ error: '닉네임을 입력하세요.' });
  }

  try {
    // 닉네임 중복 체크
    const [nicknameRows] = await pool.query('SELECT user_id FROM user WHERE nickname = ? AND user_id != ?', [nickname, user_id]);
    if (nicknameRows.length > 0) {
      return res.status(400).json({ error: '이미 존재하는 닉네임입니다.' });
    }

    await pool.query('UPDATE user SET nickname = ?, address = ? WHERE user_id = ?', [nickname, address, user_id]);

    res.json({ message: '회원정보가 수정되었습니다.' });
  } catch (error) {
    console.error('회원정보 수정 에러:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};

module.exports = { editUserInfo };