const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config(); // .env 설정 적용

const app = express();

// ---------- 미들웨어 ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- 정적 파일 제공 ----------
app.use('/uploads/profile', express.static(path.join(__dirname, 'uploads/profile')));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- 라우터 등록 ----------
app.get('/', (req, res) => {
  res.send('책모아 서버에 오신 것을 환영합니다!');
});

// 게시글 관련
const postsRouter = require('./routes/posts');
app.use('/posts', postsRouter);

// 댓글 관련
const commentsRouter = require('./routes/comments');
app.use('/comments', commentsRouter);

// 유저 인증/정보 관련
app.use('/api/auth', require('./routes/auth'));               // 회원가입 / 로그인
app.use('/api/checkId', require('./routes/checkId'));         // 아이디 중복확인
app.use('/api/user', require('./routes/user'));               // 마이페이지
app.use('/api/user-contents', require('./routes/userContents')); // 작성한 글/댓글 목록

// 도서관 즐겨찾기 관련
const favoritelibRouter = require('./routes/favoritelib');
app.use('/api/favorites', favoritelibRouter);

// ---------- 에러 핸들링 ----------
app.use((err, req, res, next) => {
  console.error('서버 에러:', err.stack);
  res.status(500).json({ message: '서버 내부 에러가 발생했습니다.' });
});

// ---------- 서버 실행 ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중`);
});
