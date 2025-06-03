const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();

const session = require('express-session');
const ejsLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')

const app = express();

// ---------- 미들웨어 ----------
//  EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(ejsLayouts);

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//  세션 설정
app.use(session({
  secret: 'bookmoa-secret',
  resave: false,
  saveUninitialized: true
}));

//  로그인된 사용자 동기화 (쿠키에서 JWT → 세션)
const JWT_SECRET = process.env.JWT_SECRET;
app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token && !req.session.user) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.session.user = {
        user_id: decoded.user_id
        // 닉네임 등은 필요 시 DB에서 추가 조회
      };
    } catch (err) {
      console.error('JWT 인증 실패:', err.message);
    }
  }
  next();
});

// ---------- 정적 파일 제공 ----------
app.use(express.static(path.join(__dirname, 'public')));
app.use('/mypage/images', express.static(path.join(__dirname, 'public/mypage/images')));

// profile 이미지 직접 핸들링
app.get('/uploads/profile/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads/profile', filename);
  const defaultPath = path.join(__dirname, 'public/mypage/images/default.jpg');

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.sendFile(defaultPath);
  }
});

// ---------- 라우터 등록 ----------
// 루트 라우터
//app.get('/', (req, res) => {
//  res.send('책모아 서버에 오신 것을 환영합니다!');
//});

//  루트 라우터 (EJS 렌더링)
//app.get('/', (req, res) => {
//  res.render('index', {title: '책모아 메인 페이지', user: req.session.user });
//});
const { getTop4Books } = require('./controllers/popularController');

app.get('/', async (req, res) => {
  try {
    const popularBooks = await getTop4Books();
    res.render('index', {
      title: '책모아 메인 페이지',
      user: req.session.user,
      popularBooks 
    });
  } catch (err) {
    console.error('[메인 인기 도서 로딩 실패]', err);
    res.render('index', {
      title: '책모아 메인 페이지',
      user: req.session.user,
      popularBooks: [] // 실패 시 빈 배열 전달
    });
  }
});

//post 라우터
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
