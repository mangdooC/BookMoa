const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const bcrypt = require('bcrypt');
const pool = require('../db');
const authMiddleware = require('../middlewares/authMiddleware');

// 이미지 허용 확장자 & MIME 타입
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// 업로드 폴더 경로
const uploadDir = path.join(__dirname, '..', 'uploads', 'profile');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 저장소 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const ext = path.extname(safeOriginalName).toLowerCase();
    cb(null, `user_${req.user.user_id}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!IMAGE_EXTS.includes(ext) || !IMAGE_MIMES.includes(file.mimetype)) {
    return cb(new Error('이미지 파일만 업로드 가능합니다.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 유저 정보 조회 및 프로필 페이지 렌더
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [userRows] = await pool.query(
      'SELECT nickname, address FROM user WHERE user_id = ? AND is_deleted = 0',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).render('error', { message: '유저를 찾을 수 없습니다.' });
    }

    const [imageRows] = await pool.query(
      "SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile' ORDER BY image_id DESC LIMIT 1",
      [userId]
    );

    const profileImage = imageRows.length > 0 ? imageRows[0].image_url : null;

    return res.render('user/profile', {
      nickname: userRows[0].nickname,
      address: userRows[0].address,
      profileImage,
    });
  } catch (error) {
    console.error('profile GET 에러:', error);
    return res.status(500).render('error', { message: '서버 에러' });
  }
});

// 유저 정보 수정
router.post('/edit', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    let { password, nickname, address } = req.body;

    password = password?.trim();
    nickname = nickname?.trim();
    address = address?.trim();

    if (!password && !nickname && !address) {
      return res.status(400).render('user/profile', { error: '수정할 정보가 없습니다.' });
    }

    const fields = [];
    const values = [];

    if (password) {
      const pwRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{4,12}$/;
      if (!pwRegex.test(password)) {
        return res.status(400).render('user/profile', { error: '비밀번호는 영어와 숫자, 특수문자 4~12자만 가능합니다.' });
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
        return res.status(400).render('user/profile', { error: '이미 존재하는 닉네임입니다.' });
      }
      fields.push('nickname = ?');
      values.push(nickname);
    }

    if (address !== undefined) {
      fields.push('address = ?');
      values.push(address);
    }

    values.push(userId);

    const sql = `UPDATE user SET ${fields.join(', ')} WHERE user_id = ?`;
    await pool.query(sql, values);

    return res.redirect('/user/profile');
  } catch (error) {
    console.error('updateUserInfo 에러:', error);
    return res.status(500).render('error', { message: '서버 오류 발생' });
  }
});

// 프로필 이미지 업로드
router.post(
  '/upload-profile',
  authMiddleware,
  (req, res, next) => {
    upload.single('profileImage')(req, res, (err) => {
      if (err instanceof multer.MulterError || err) {
        return res.status(400).render('user/profile', { error: `업로드 실패: ${err.message}` });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const userId = req.user.user_id;

      if (!req.file) {
        return res.status(400).render('user/profile', { error: '파일이 업로드되지 않았습니다.' });
      }

      const filename = req.file.filename;
      const imageUrl = `/uploads/profile/${filename}`;

      // 기존 이미지 삭제
      const [existingImages] = await pool.query(
        "SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile'",
        [userId]
      );

      for (const img of existingImages) {
        const filePath = path.join(__dirname, '..', img.image_url.replace(/^\//, ''));
        try {
          await fsPromises.unlink(filePath);
        } catch (err) {
          console.warn('기존 이미지 삭제 실패:', filePath);
        }
      }

      await pool.query(
        "DELETE FROM image WHERE user_id = ? AND image_type = 'profile'",
        [userId]
      );

      await pool.query(
        "INSERT INTO image (user_id, image_url, image_type) VALUES (?, ?, ?)",
        [userId, imageUrl, 'profile']
      );

      return res.redirect('/user/profile');
    } catch (error) {
      console.error('uploadProfileImage 에러:', error);
      return res.status(500).render('error', { message: '서버 오류 발생' });
    }
  }
);

// 프로필 이미지 삭제
router.post('/delete-profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [existingImages] = await pool.query(
      "SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile'",
      [userId]
    );

    if (existingImages.length === 0) {
      return res.status(404).render('user/profile', { error: '삭제할 프로필 이미지가 없습니다.' });
    }

    for (const img of existingImages) {
      const filePath = path.join(__dirname, '..', img.image_url.replace(/^\//, ''));
      try {
        await fsPromises.unlink(filePath);
      } catch (error) {
        console.error('프로필 이미지 삭제 실패:', error);
      }
    }

    await pool.query(
      "DELETE FROM image WHERE user_id = ? AND image_type = 'profile'",
      [userId]
    );

    return res.redirect('/user/profile');
  } catch (error) {
    console.error('deleteProfileImage 에러:', error);
    return res.status(500).render('error', { message: '서버 오류 발생' });
  }
});

module.exports = router;
