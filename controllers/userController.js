const pool = require('../db');
const bcrypt = require('bcrypt');

  const getUserInfo = async (req, res) => {
    const userId = req.user.user_id;

    try {
      const [rows] = await pool.query(
        'SELECT user_id, nickname, address FROM user WHERE user_id = ? AND is_deleted = 0',
        [userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      }

      res.json(rows[0]);
    } catch (err) {
      console.error('유저 정보 가져오기 실패:', err);
      res.status(500).json({ error: '서버 에러' });
    }
  };

  const updateUserInfo = async (req, res) => {
  const currentUserId = req.user.user_id; // 로그인 된 유저 아이디
  const { user_id, password, nickname, address } = req.body;

  // 아이디 변경 시 검증 (변경하지 않으면 패스)
  if (user_id && user_id !== currentUserId) {
    const idRegex = /^[a-zA-Z0-9]+$/; // 영어, 숫자만 +빈문자열 불가
    if (!idRegex.test(user_id)) {
      return res.status(400).json({ error: '아이디는 영어와 숫자만 가능합니다.' });
    }

    // 중복 체크
    const [existingUsers] = await pool.query(
      'SELECT user_id FROM user WHERE user_id = ? AND is_deleted = 0',
      [user_id]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: '이미 존재하는 아이디입니다.' });
    }
  }

  // 비밀번호 변경 시 검증 및 해시화
  let hashedPassword = null;
  if (password) {
    const passwordRegex = /^[a-zA-Z0-9]{4,12}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: '비밀번호는 영어와 숫자 4~12자만 가능합니다.' });
    }
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // 닉네임 중복 검사
  if (nickname) {
    const [nicknameRows] = await pool.query(
      'SELECT user_id FROM user WHERE nickname = ? AND is_deleted = 0',
      [nickname, currentUserId]
    );
    if (nicknameRows.length > 0) {
      return res.status(400).json({ error: '이미 존재하는 닉네임입니다.' });
    }
  }

  try {
    const fields = [];
    const values = [];

    if (user_id && user_id !== currentUserId) {
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

    return res.json({ message: '회원정보가 수정되었습니다.' });
  } catch (error) {
    console.error('회원정보 수정 에러:', error);
    return res.status(500).json({ error: '서버 에러 발생' });
  }
};

  const updatePreferredArea = async (req, res) => {
  const userId = req.user.user_id;
  const { region_level1, region_level2, region_level3 } = req.body;

  if (!region_level1 || !region_level2 || !region_level3) {
    return res.status(400).json({ error: '모든 지역 정보가 필요합니다.' });
  }

  try {
    // 이미 등록된 선호지역이 있는지 확인
    const [existing] = await pool.query(
      'SELECT region_id FROM preferred_region WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      // 있으면 업데이트
      await pool.query(
        `UPDATE preferred_region 
         SET region_level1 = ?, region_level2 = ?, region_level3 = ?
         WHERE user_id = ?`,
        [region_level1, region_level2, region_level3, userId]
      );
    } else {
      // 없으면 새로 추가
      await pool.query(
        `INSERT INTO preferred_region (user_id, region_level1, region_level2, region_level3)
         VALUES (?, ?, ?, ?)`,
        [userId, region_level1, region_level2, region_level3]
      );
    }

      res.json({ message: '선호 지역이 저장되었습니다.' });
    } catch (err) {
      console.error('선호 지역 저장 에러:', err);
      res.status(500).json({ error: '서버 에러 발생' });
    }
  };

const getPreferredArea = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [rows] = await pool.query(
      'SELECT region_level1, region_level2, region_level3 FROM preferred_region WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '선호 지역 정보가 없습니다.' });
    }

      res.json({ preferredArea: rows[0] });
    } catch (error) {
      console.error('선호 지역 조회 에러:', error);
      res.status(500).json({ error: '서버 에러 발생' });
    }
  };

module.exports = {
  getUserInfo,
  updateUserInfo,
  updatePreferredArea,
  getPreferredArea,
};