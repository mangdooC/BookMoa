const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const bcrypt = require('bcrypt');
const pool = require('../db');
const authMiddleware = require('../middlewares/authMiddleware');

const IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const uploadDir = path.join(__dirname, '..', 'uploads', 'profile');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `profile_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (IMAGE_MIMES.includes(file.mimetype)) cb(null, true);
  else cb(new Error('지원하지 않는 파일 형식입니다.'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const defaultProfileImage = '/mypage/images/default.jpg';

// 마이페이지 GET
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [userRows] = await pool.query(
      'SELECT nickname, address FROM user WHERE user_id = ? AND is_deleted = 0',
      [userId]
    );
    if (userRows.length === 0) return res.redirect('/login');

    const [imageRows] = await pool.query(
      "SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile' ORDER BY image_id DESC LIMIT 1",
      [userId]
    );

    let profileImage;
    if (imageRows.length > 0) {
      const imgPath = path.join(__dirname, '..', imageRows[0].image_url.replace(/^\//, ''));
      try {
        await fsPromises.access(imgPath);
        profileImage = imageRows[0].image_url;
      } catch {
        profileImage = defaultProfileImage;
      }
    } else {
      profileImage = defaultProfileImage;
    }

    res.render('mypage', {
      error: null,
      nickname: userRows[0].nickname,
      address: userRows[0].address,
      profileImage,
      inputValues: {}
    });
  } catch (err) {
    console.error('mypage GET 에러:', err);
    res.status(500).send('서버 에러');
  }
});

// 마이페이지 정보 수정 POST
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    let { password, nickname, address } = req.body;

    password = password?.trim();
    nickname = nickname?.trim();
    address = address?.trim();

    const fields = [];
    const values = [];

    if (password) {
      const pwRegex = /^[a-zA-Z0-9!@#$%^&]{4,12}$/;
      if (!pwRegex.test(password)) {
        const [userRows] = await pool.query(
          'SELECT nickname, address FROM user WHERE user_id = ? AND is_deleted = 0',
          [userId]
        );
        const [imageRows] = await pool.query(
          "SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile' ORDER BY image_id DESC LIMIT 1",
          [userId]
        );

        let profileImage;
        if (imageRows.length > 0) {
          const imgPath = path.join(__dirname, '..', imageRows[0].image_url.replace(/^\//, ''));
          try {
            await fsPromises.access(imgPath);
            profileImage = imageRows[0].image_url;
          } catch {
            profileImage = defaultProfileImage;
          }
        } else {
          profileImage = defaultProfileImage;
        }

        return res.render('mypage', {
          error: '비밀번호 형식이 잘못됨',
          nickname: userRows[0].nickname,
          address: userRows[0].address,
          profileImage,
          inputValues: { password, nickname, address }
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (nickname) {
      const [exist] = await pool.query(
        'SELECT user_id FROM user WHERE LOWER(nickname) = LOWER(?) AND user_id != ? AND is_deleted = 0',
        [nickname.toLowerCase(), userId]
      );
      if (exist.length) {
        const [userRows] = await pool.query(
          'SELECT nickname, address FROM user WHERE user_id = ? AND is_deleted = 0',
          [userId]
        );
        const [imageRows] = await pool.query(
          "SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile' ORDER BY image_id DESC LIMIT 1",
          [userId]
        );

        let profileImage;
        if (imageRows.length > 0) {
          const imgPath = path.join(__dirname, '..', imageRows[0].image_url.replace(/^\//, ''));
          try {
            await fsPromises.access(imgPath);
            profileImage = imageRows[0].image_url;
          } catch {
            profileImage = defaultProfileImage;
          }
        } else {
          profileImage = defaultProfileImage;
        }

        return res.render('mypage', {
          error: '닉네임 중복',
          nickname: userRows[0].nickname,
          address: userRows[0].address,
          profileImage,
          inputValues: { password, nickname, address }
        });
      }
      fields.push('nickname = ?');
      values.push(nickname);
    }

    if (address !== undefined) {
      fields.push('address = ?');
      values.push(address);
    }

    if (fields.length > 0) {
      values.push(userId);
      const sql = `UPDATE user SET ${fields.join(', ')} WHERE user_id = ?`;
      await pool.query(sql, values);
    }

    res.redirect('/mypage');
  } catch (err) {
    console.error('mypage update 에러:', err);
    res.status(500).send('서버 에러');
  }
});

// 프로필 이미지 업로드 (multer 에러 처리 포함)
router.post('/upload-image', authMiddleware, (req, res, next) => {
  upload.single('profileImage')(req, res, async (err) => {
    if (err) {
      console.error('multer 업로드 에러:', err);

      const userId = req.user.user_id;
      try {
        const [userRows] = await pool.query(
          'SELECT nickname, address FROM user WHERE user_id = ? AND is_deleted = 0',
          [userId]
        );
        const [imageRows] = await pool.query(
          "SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile' ORDER BY image_id DESC LIMIT 1",
          [userId]
        );

        let profileImage;
        if (imageRows.length > 0) {
          const imgPath = path.join(__dirname, '..', imageRows[0].image_url.replace(/^\//, ''));
          try {
            await fsPromises.access(imgPath);
            profileImage = imageRows[0].image_url;
          } catch {
            profileImage = defaultProfileImage;
          }
        } else {
          profileImage = defaultProfileImage;
        }

        return res.render('mypage', {
          error: err.message || '파일 업로드 에러',
          nickname: userRows[0].nickname,
          address: userRows[0].address,
          profileImage,
          inputValues: {}
        });
      } catch (error) {
        console.error(error);
        return res.status(500).send('서버 에러');
      }
    }
    next();
  });
}, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.user_id;

    if (!req.file) return res.redirect('/mypage');

    const imageUrl = `/uploads/profile/${req.file.filename}`;

    await conn.beginTransaction();

    const [oldImages] = await conn.query(
      "SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile'",
      [userId]
    );
    for (const img of oldImages) {
      const imgPath = path.join(__dirname, '..', img.image_url.replace(/^\//, ''));
      try {
        await fsPromises.unlink(imgPath);
      } catch (err) {
        if (err.code !== 'ENOENT') console.warn('이미지 삭제 실패:', imgPath);
      }
    }

    await conn.query("DELETE FROM image WHERE user_id = ? AND image_type = 'profile'", [userId]);

    await conn.query(
      "INSERT INTO image (user_id, image_url, image_type) VALUES (?, ?, ?)",
      [userId, imageUrl, 'profile']
    );

    await conn.commit();
    res.redirect('/mypage');
  } catch (err) {
    await conn.rollback();
    console.error('프로필 이미지 업로드 에러:', err);
    res.status(500).send('서버 에러');
  } finally {
    conn.release();
  }
});

// 프로필 이미지 삭제
router.post('/delete-image', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [images] = await pool.query(
      "SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile'",
      [userId]
    );
    for (const img of images) {
      const filePath = path.join(__dirname, '..', img.image_url.replace(/^\//, ''));
      try {
        await fsPromises.unlink(filePath);
      } catch (err) {
        if (err.code !== 'ENOENT') console.warn('삭제 실패:', filePath);
      }
    }

    await pool.query(
      "DELETE FROM image WHERE user_id = ? AND image_type = 'profile'",
      [userId]
    );

    res.redirect('/mypage');
  } catch (err) {
    console.error('프로필 이미지 삭제 에러:', err);
    res.status(500).send('서버 에러');
  }
});

module.exports = router;
