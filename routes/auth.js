require('dotenv').config();
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET;

const idRegex = /^[a-zA-Z0-9]{4,12}$/;
const passwordRegex = /^[a-zA-Z0-9!@#$%^&*]{4,12}$/;

// 프로필 사진 업로드 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/profile/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 회원가입 페이지
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// 회원가입 처리
router.post('/register', upload.single('profilePic'), async (req, res) => {
  let { user_id, password, nickname, address } = req.body;

  if (!user_id || !password || !nickname || !address?.trim()) {
    return res.render('register', { error: '아이디, 비번, 닉네임, 주소 필수' });
  }
  if (!idRegex.test(user_id)) return res.render('register', { error: '아이디 형식 오류' });
  if (!passwordRegex.test(password)) return res.render('register', { error: '비밀번호 형식 오류' });

  try {
    // 닉네임 소문자 변환 일관성 적용
    nickname = nickname.toLowerCase();

    const [[idExist]] = await pool.query(
      'SELECT user_id FROM user WHERE user_id = ? AND is_deleted = 0',
      [user_id]
    );
    if (idExist) return res.render('register', { error: '이미 존재하는 아이디' });

    const [[nickExist]] = await pool.query(
      'SELECT nickname FROM user WHERE nickname = ? AND is_deleted = 0',
      [nickname]
    );
    if (nickExist) return res.render('register', { error: '이미 존재하는 닉네임' });

    const hashed = await bcrypt.hash(password, 10);

    // 프로필 사진 경로 저장
    const profilePicPath = req.file ? `/uploads/profile/${req.file.filename}` : null;

    await pool.query(
      'INSERT INTO user (user_id, password, nickname, address, profile_pic) VALUES (?, ?, ?, ?, ?)',
      [user_id, hashed, nickname, address, profilePicPath]
    );

    const token = jwt.sign({ user_id, nickname }, JWT_SECRET);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.redirect('/'); // 회원가입 성공 후 홈으로 리다이렉트
  } catch (err) {
    console.error(err);
    return res.render('register', { error: '서버 에러' });
  }
});

// 닉네임 중복 검사 API (추가)
router.post('/check-nickname', async (req, res) => {
  try {
    let { nickname } = req.body;
    if (!nickname) return res.status(400).json({ message: '닉네임 필요' });

    nickname = nickname.toLowerCase();

    const [[nickExist]] = await pool.query(
      'SELECT nickname FROM user WHERE nickname = ? AND is_deleted = 0',
      [nickname]
    );

    if (nickExist) {
      return res.json({ isDuplicate: true });
    }
    res.json({ isDuplicate: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 로그인 페이지
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// 로그인 처리
router.post('/login', async (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res.render('login', { error: '아이디/비번 누락' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM user WHERE user_id = ? AND is_deleted = 0', [user_id]);
    const user = users[0];
    if (!user) return res.render('login', { error: '존재하지 않는 아이디' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.render('login', { error: '비밀번호 불일치' });

    const token = jwt.sign({ user_id: user.user_id, nickname: user.nickname }, JWT_SECRET);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.redirect('/'); // 로그인 성공 후 홈으로 리다이렉트
  } catch (err) {
    console.error(err);
    return res.render('login', { error: '서버 에러' });
  }
});

// 로그아웃
router.get('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.redirect('/auth/login');
});

module.exports = router;
