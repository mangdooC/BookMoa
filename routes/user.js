const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getUserInfo,
  updatePreferredArea,
  getPreferredArea,
  updateUserInfo,
  uploadProfileImage,
} = require('../controllers/userController');

const allowedExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// 자동으로 uploads/profile 폴더 생성
const uploadDir = path.join(__dirname, '..', 'uploads', 'profile');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `user_${req.user.user_id}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExt.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('이미지 파일만 업로드 가능합니다.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 최대 5MB 제한
});

// 라우터 정의
router.get('/info', authMiddleware, getUserInfo);
router.get('/preferred-area', authMiddleware, getPreferredArea);
router.put('/preferred-area', authMiddleware, updatePreferredArea);
router.put('/edit', authMiddleware, updateUserInfo);
router.post('/upload-profile', authMiddleware, upload.single('profileImage'), uploadProfileImage);

module.exports = router;