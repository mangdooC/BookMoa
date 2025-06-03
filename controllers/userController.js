const pool = require('../db');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs').promises;

const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [userRows] = await pool.query(
      'SELECT nickname, address FROM user WHERE user_id = ? AND is_deleted = 0',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    }

    const [imageRows] = await pool.query(
      `SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile' ORDER BY image_id DESC LIMIT 1`,
      [userId]
    );

    const profileImage = imageRows.length > 0 ? imageRows[0].image_url : null;

    return res.json({
      nickname: userRows[0].nickname,
      address: userRows[0].address,
      profile_image: profileImage,
    });
  } catch (error) {
    console.error('getUserInfo 에러:', error);
    return res.status(500).json({ message: '서버 에러' });
  }
};

const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.user_id;
    let { password, nickname, address } = req.body;

    password = password?.trim();
    nickname = nickname?.trim();
    address = address?.trim();

    if (!password && !nickname && !address) {
      return res.status(400).json({ error: '수정할 정보가 없습니다.' });
    }

    const fields = [];
    const values = [];

    if (password) {
      const pwRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{4,12}$/;
      if (!pwRegex.test(password)) {
        return res.status(400).json({ error: '비밀번호는 영어와 숫자, 특수문자 4~12자만 가능합니다.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (nickname) {
      const [exist] = await pool.query(
        'SELECT user_id FROM user WHERE nickname = ? AND user_id != ? AND is_deleted = 0',
        [nickname, userId]
      );
      if (exist.length) {
        return res.status(400).json({ error: '이미 존재하는 닉네임입니다.' });
      }
      fields.push('nickname = ?');
      values.push(nickname);
    }

    if (address !== undefined) {
      fields.push('address = ?');
      values.push(address);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: '수정할 정보가 없습니다.' });
    }

    values.push(userId);
    const sql = `UPDATE user SET ${fields.join(', ')} WHERE user_id = ?`;

    await pool.query(sql, values);
    return res.json({ message: '회원정보가 성공적으로 수정되었습니다.' });
  } catch (err) {
    console.error('updateUserInfo 에러:', err);
    return res.status(500).json({ error: '서버 오류 발생' });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!req.file) {
      // 프로필 사진 안 바꿨으면 기본 이미지 경로로 설정
      // 기존 이미지 삭제
      const [existingImages] = await pool.query(
        `SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile'`,
        [userId]
      );

      for (const img of existingImages) {
        const filePath = path.join(__dirname, '..', img.image_url.replace(/^\//, ''));
        try {
          await fs.unlink(filePath);
        } catch {
          // 삭제 실패해도 무시
        }
      }

      await pool.query(
        `DELETE FROM image WHERE user_id = ? AND image_type = 'profile'`,
        [userId]
      );

      // 기본 이미지 경로 삽입
      const defaultImageUrl = '/mypage/images/default.jpg';
      await pool.query(
        `INSERT INTO image (user_id, image_url, image_type) VALUES (?, ?, 'profile')`,
        [userId, defaultImageUrl]
      );

      return res.json({ message: '기본 프로필 이미지로 설정되었습니다.', imageUrl: defaultImageUrl });
    } else {
      // 업로드한 파일 경로 저장
      const filename = req.file.filename;
      const imageUrl = `/uploads/profile/${filename}`;

      // 기존 이미지 삭제
      const [existingImages] = await pool.query(
        `SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile'`,
        [userId]
      );

      for (const img of existingImages) {
        const filePath = path.join(__dirname, '..', img.image_url.replace(/^\//, ''));
        try {
          await fs.unlink(filePath);
        } catch {
          // 삭제 실패해도 무시
        }
      }

      await pool.query(
        `DELETE FROM image WHERE user_id = ? AND image_type = 'profile'`,
        [userId]
      );

      await pool.query(
        `INSERT INTO image (user_id, image_url, image_type) VALUES (?, ?, 'profile')`,
        [userId, imageUrl]
      );

      const fullImageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
      return res.json({ message: '프로필 이미지 업로드 성공', imageUrl: fullImageUrl });
    }
  } catch (err) {
    console.error('uploadProfileImage 에러:', err);
    return res.status(500).json({ error: '서버 오류 발생' });
  }
};

const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [existingImages] = await pool.query(
      `SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile'`,
      [userId]
    );

    if (existingImages.length === 0) {
      return res.status(404).json({ message: '삭제할 프로필 이미지가 없습니다.' });
    }

    for (const img of existingImages) {
      const filePath = path.join(__dirname, '..', img.image_url.replace(/^\//, ''));
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error('프로필 이미지 삭제 실패:', err);
      }
    }

    await pool.query(
      `DELETE FROM image WHERE user_id = ? AND image_type = 'profile'`,
      [userId]
    );

    return res.json({ message: '프로필 이미지가 삭제되었습니다.' });
  } catch (err) {
    console.error('deleteProfileImage 에러:', err);
    return res.status(500).json({ error: '서버 오류 발생' });
  }
};

const updatePreferredArea = async (req, res) => {
  try {
    const userId = req.user.user_id;
    let { region_level1, region_level2, region_level3 } = req.body;

    region_level1 = region_level1?.trim();
    region_level2 = region_level2?.trim();
    region_level3 = region_level3?.trim();

    if (![region_level1, region_level2, region_level3].some(Boolean)) {
      return res.status(400).json({ error: '최소 한 개 이상의 지역 정보가 필요합니다.' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM preferred_region WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      const current = existing[0];
      await pool.query(
        `UPDATE preferred_region 
         SET region_level1 = ?, region_level2 = ?, region_level3 = ?
         WHERE user_id = ?`,
        [
          region_level1 || current.region_level1,
          region_level2 || current.region_level2,
          region_level3 || current.region_level3,
          userId,
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO preferred_region (user_id, region_level1, region_level2, region_level3)
         VALUES (?, ?, ?, ?)`,
        [userId, region_level1 || null, region_level2 || null, region_level3 || null]
      );
    }

    return res.json({ message: '선호 지역이 저장되었습니다.' });
  } catch (err) {
    console.error('updatePreferredArea 에러:', err);
    return res.status(500).json({ error: '서버 오류 발생' });
  }
};

const getPreferredArea = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await pool.query(
      'SELECT region_level1, region_level2, region_level3 FROM preferred_region WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '선호 지역 정보가 없습니다.' });
    }

    return res.json({ preferredArea: rows[0] });
  } catch (err) {
    console.error('getPreferredArea 에러:', err);
    return res.status(500).json({ error: '서버 오류 발생' });
  }
};

module.exports = {
  getUserInfo,
  updateUserInfo,
  uploadProfileImage,
  deleteProfileImage,
  updatePreferredArea,
  getPreferredArea,
};
