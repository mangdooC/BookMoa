const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const router = express.Router();
const pool = require('../db');
const getUserProfile = require('./utils/getUserProfile');
const authMiddleware = require('../middlewares/authMiddleware');

// 업로드 저장 경로랑 파일명 지정
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/profile');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.user_id + ext);
  }
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      return cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 👉 프로필 이미지 업로드
router.post('/user/upload-profile-image', authMiddleware, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '파일이 없습니다.' });

    const user_id = req.user.user_id;

    // 기존 이미지 경로 가져오기
    const [oldImageRows] = await pool.query(
      `SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile' ORDER BY created_at DESC LIMIT 1`,
      [user_id]
    );

    // 기존 이미지 삭제
    if (oldImageRows.length && oldImageRows[0].image_url !== '/mypage/images/default.jpg') {
      const oldPath = path.join(__dirname, '../', oldImageRows[0].image_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // 새 이미지 경로 저장
    const profileImagePath = `/uploads/profile/${req.file.filename}`;
    await pool.query(
      `INSERT INTO image (user_id, image_url, image_type, created_at)
       VALUES (?, ?, 'profile', NOW())`,
      [user_id, profileImagePath]
    );

    res.json({ message: '프로필 이미지가 변경되었습니다.', profileImage: profileImagePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류 발생' });
  }
});

// 👉 내 정보 수정
router.put('/user/update-info', authMiddleware, async (req, res) => {
  try {
    const { password, nickname, address } = req.body;
    const user_id = req.user.user_id;

    if (!nickname) return res.status(400).json({ error: '닉네임은 필수입니다.' });

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

// 👉 프로필 이미지 + 닉네임 + 주소 반환
router.get('/user/profile', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // 기본 정보 가져오기
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

module.exports = router;
