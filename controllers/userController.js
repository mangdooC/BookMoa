const pool = require('../db');
const bcrypt = require('bcrypt');

// 내 정보 수정
const updateUserInfo = async (req, res) => {
  const user_id = req.user_id;
  const { password, nickname, address } = req.body;

  try {
    let hashedPassword = null;

    if (password) {
      const passwordRegex = /^[a-zA-Z0-9]{4,12}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: '비밀번호는 영어와 숫자 4~12자만 가능합니다.' });
      }

      hashedPassword = await bcrypt.hash(password, 10);
    }

    const [result] = await pool.query(
      `UPDATE user 
       SET 
         ${hashedPassword ? 'password = ?,' : ''} 
         nickname = ?, 
         address = ? 
       WHERE user_id = ?`,
      hashedPassword
        ? [hashedPassword, nickname, address, user_id]
        : [nickname, address, user_id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: '업데이트 실패' });

    res.json({ message: '회원 정보가 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error('회원 정보 수정 에러:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};

const updatePreferredArea = async (req, res) => {
  const user_id = req.user_id;
  const { preferred_area } = req.body;

  if (!preferred_area || preferred_area.trim() === '') {
    return res.status(400).json({ error: '선호지역을 입력하세요.' });
  }

  try {
    await pool.query('UPDATE user SET preferred_area = ? WHERE user_id = ?', [preferred_area, user_id]);
    res.json({ message: '선호지역이 저장되었습니다.' });
  } catch (error) {
    console.error('선호지역 저장 에러:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};

const getPreferredArea = async (req, res) => {
  const user_id = req.user_id;

  try {
    const [rows] = await pool.query('SELECT preferred_area FROM user WHERE user_id = ?', [user_id]);
    const preferred_area = rows[0]?.preferred_area || null;

    res.json({ preferred_area, isSet: !!preferred_area });
  } catch (error) {
    console.error('선호지역 조회 에러:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};

const getUserInfo = async (req, res) => {
  const user_id = req.user_id;

  try {
    const [rows] = await pool.query('SELECT * FROM user WHERE user_id = ?', [user_id]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ error: '사용자 정보 없음' });
    }

    res.json({ user });
  } catch (error) {
    console.error('getUserInfo 에러:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};

module.exports = {
  getUserInfo,
  updateUserInfo,
  updatePreferredArea,
  getPreferredArea,
};