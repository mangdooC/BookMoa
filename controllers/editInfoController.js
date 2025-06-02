const pool = require('../db');
const bcrypt = require('bcrypt');

const updateUserInfo = async (req, res) => {
  const currentUserId = req.user_id; // 로그인한 유저 아이디 (기존)
  const { user_id, password, nickname, address } = req.body;

  // 아이디 변경 시
  if (user_id) {
    const idRegex = /^[a-zA-Z0-9]*$/;
    if (!idRegex.test(user_id)) {
      return res.status(400).json({ error: '아이디는 영어와 숫자만 가능합니다.' });
    }

    // 아이디 중복 체크
    const [existingUsers] = await pool.query(
      'SELECT user_id FROM user WHERE user_id = ? AND user_id != ? AND is_deleted = 0',
      [user_id, currentUserId]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: '이미 존재하는 아이디입니다.' });
    }
  }

  // 비밀번호 변경 시
  let hashedPassword = null;
  if (password) {
    const passwordRegex = /^[a-zA-Z0-9]{4,12}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: '비밀번호는 영어와 숫자 4~12자만 가능합니다.' });
    }
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // 닉네임 변경 시 중복 체크
  if (nickname) {
    const [nicknameRows] = await pool.query(
      'SELECT user_id FROM user WHERE nickname = ? AND user_id != ?',
      [nickname, currentUserId]
    );
    if (nicknameRows.length > 0) {
      return res.status(400).json({ error: '이미 존재하는 닉네임입니다.' });
    }
  }

  try {
    // 업데이트할 필드만 모음
    const fields = [];
    const values = [];

    if (user_id) {
      fields.push('user_id = ?');
      values.push(user_id);
    }
    if (hashedPassword) {
      fields.push('password = ?');
      values.push(hashedPassword);
    }
    if (nickname) {
      fields.push('nickname = ?');
      values.push(nickname);
    }
    if (address) {
      fields.push('address = ?');
      values.push(address);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: '수정할 정보가 없습니다.' });
    }

    values.push(currentUserId);

    const sql = `UPDATE user SET ${fields.join(', ')} WHERE user_id = ?`;

    await pool.query(sql, values);

    res.json({ message: '회원정보가 수정되었습니다.' });
  } catch (error) {
    console.error('회원정보 수정 에러:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};

module.exports = { updateUserInfo };
