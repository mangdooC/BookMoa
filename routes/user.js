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

// 허용 확장자 및 MIME 타입 정의
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// 업로드 폴더 경로
const uploadDir = path.join(__dirname, '..', 'uploads', 'profile');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 저장소 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 파일 이름 인젝션 방지 + 안전하게 변경
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const ext = path.extname(safeOriginalName).toLowerCase();
    cb(null, `user_${req.user.user_id}_${Date.now()}${ext}`);
  },
});

// 파일 필터링 설정
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!IMAGE_EXTS.includes(ext) || !IMAGE_MIMES.includes(file.mimetype)) {
    return cb(new Error('이미지 파일만 업로드 가능합니다.'));
  }
  cb(null, true);
};

// multer 업로더
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
});

// ----- 📌 라우팅 정의 -----
router.get('/info', authMiddleware, getUserInfo);
router.get('/preferred-area', authMiddleware, getPreferredArea);
router.put('/preferred-area', authMiddleware, updatePreferredArea);
router.put('/edit', authMiddleware, updateUserInfo);

// 프로필 이미지 업로드 (multer 에러 핸들링 포함)
router.post(
  '/upload-profile',
  authMiddleware,
  (req, res, next) => {
    upload.single('profileImage')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `업로드 실패: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: `에러 발생: ${err.message}` });
      }
      next();
    });
  },
  uploadProfileImage
);

module.exports = router;