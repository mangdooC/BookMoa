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
  deleteProfileImage,
} = require('../controllers/userController');

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

// 파일 필터링
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
});

// --- 라우터 정의 ---

// 유저 정보 조회
router.get('/info', authMiddleware, getUserInfo);

// 선호 지역 조회
router.get('/preferred-area', authMiddleware, getPreferredArea);

// 선호 지역 수정
router.put('/preferred-area', authMiddleware, updatePreferredArea);

// 유저 정보 수정 (비밀번호, 닉네임, 주소)
router.put('/edit', authMiddleware, updateUserInfo);

// 프로필 이미지 업로드
router.post(
  '/upload-profile',
  authMiddleware,
  (req, res, next) => {
    upload.single('profileImage')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `업로드 실패: ${err.message}` });
      }
      if (err) {
        return res.status(400).json({ message: `에러 발생: ${err.message}` });
      }
      next();
    });
  },
  uploadProfileImage
);

// 프로필 이미지 삭제
router.delete('/delete-profile', authMiddleware, deleteProfileImage);

module.exports = router;
