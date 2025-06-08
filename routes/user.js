const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const router = express.Router();
const pool = require('../db');
const getUserProfile = require('./utils/getUserProfile');
const authMiddleware = require('../middlewares/authMiddleware');

// 이미지 저장 설정
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/profile');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, req.user.user_id + '_' + Date.now() + ext);
  }
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      return cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
    cb(null, true);
  }
});

// 프로필 이미지 업로드
router.post('/upload-profile-image', authMiddleware, upload.single('profileImage'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    if (!req.file) return res.status(400).json({ error: '파일이 없습니다.' });

    const user_id = req.user.user_id;
    const profileImagePath = `/uploads/profile/${req.file.filename}`;

    await connection.beginTransaction();

    // 기존 프로필 이미지 경로 가져오기
    const [oldImageRows] = await connection.query(
      `SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile'`,
      [user_id]
    );

    // 기존 이미지 파일 삭제 + DB 이미지 행 삭제
    if (oldImageRows.length > 0) {
      for (const row of oldImageRows) {
        if (row.image_url && row.image_url !== '/mypage/images/default.jpg') {
          const oldPath = path.join(__dirname, '../', row.image_url);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }
      await connection.query(
        `DELETE FROM image WHERE user_id = ? AND image_type = 'profile'`,
        [user_id]
      );
    }

    // 새 이미지 경로 DB 삽입
    await connection.query(
      `INSERT INTO image (user_id, image_url, image_type) VALUES (?, ?, 'profile')`,
      [user_id, profileImagePath]
    );

    await connection.commit();

    res.json({ message: '프로필 이미지가 변경되었습니다.', profileImage: profileImagePath });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: '서버 오류 발생' });
  } finally {
    connection.release();
  }
});

// 사용자 정보 수정
router.put('/update-info', authMiddleware, async (req, res) => {
  try {
    const { password, nickname, address } = req.body;
    const user_id = req.user.user_id;

    if (!nickname) return res.status(400).json({ error: '닉네임은 필수입니다.' });

    // 현재 비번 해시 가져오기
    const [userRows] = await pool.query(
      `SELECT password FROM user WHERE user_id = ? AND is_deleted = 0`,
      [user_id]
    );

    if (userRows.length === 0) return res.status(404).json({ error: '유저를 찾을 수 없습니다.' });

    const currentHashedPassword = userRows[0].password;

    // 비밀번호 바꾸려면
    if (password) {
      const isSame = await bcrypt.compare(password, currentHashedPassword);
      if (isSame) {
        return res.status(400).json({ error: '현재 사용 중인 비밀번호와 같습니다.' });
      }
    }

    let query = `UPDATE user SET nickname = ?, address = ?`;
    const params = [nickname, address];

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      query += `, password = ?`;
      params.push(hashed);
    }

    query += ` WHERE user_id = ? AND is_deleted = 0`;
    params.push(user_id);

    await pool.query(query, params);

    res.json({ message: '정보가 성공적으로 수정되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '정보 수정 중 서버 오류 발생' });
  }
});

// 프로필 데이터 불러오기
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT nickname, address FROM user WHERE user_id = ? AND is_deleted = 0`,
      [user_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: '유저를 찾을 수 없습니다.' });

    const { nickname, address } = rows[0];
    const { profileImage } = await getUserProfile(user_id);

    res.json({ nickname, address, profileImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '프로필 불러오기 실패' });
  }
});

// 유저 정보 초기화 (닉네임, 주소, 프로필 이미지 등 기본값으로 리셋)
router.delete('/reset', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;

    // users 테이블 정보 초기화
    await pool.query(
      `UPDATE user SET nickname = 'USER', address = NULL WHERE user_id = ?`,
      [userId]
    );

    // image 테이블에서 프로필 이미지 삭제 혹은 상태 업데이트
    await pool.query(
      `DELETE FROM image WHERE user_id = ? AND image_type = 'profile'`,
      [userId]
    );

    return res.json({ message: '유저 정보가 초기화되었습니다.' });
  } catch (error) {
    console.error('resetUserInfo 에러:', error);
    return res.status(500).json({ error: '서버 오류 발생' });
  }
});

// 닉네임 중복 체크 API
router.post('/check-nickname', authMiddleware, async (req, res) => {
  try {
    const { nickname } = req.body;
    if (!nickname) return res.status(400).json({ error: '닉네임을 입력하세요.' });

    const [rows] = await pool.query(
      `SELECT user_id FROM user WHERE nickname = ? AND is_deleted = 0`,
      [nickname]
    );

    // 자기 닉네임이면 중복 아님 처리
    if (rows.length === 0 || (rows.length === 1 && rows[0].user_id === req.user.user_id)) {
      return res.json({ available: true, message: '사용 가능한 닉네임입니다.' });
    }

    res.json({ available: false, message: '이미 사용 중인 닉네임입니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '닉네임 중복 검사 실패' });
  }
});

module.exports = router;
