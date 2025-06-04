const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();

const session = require('express-session');
const ejsLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();

// ---------- 미들웨어 설정 ----------
// EJS 뷰 엔진 세팅
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');            // ejs-layouts 기본 레이아웃 파일 지정
app.use(ejsLayouts);

// 요청 바디 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 쿠키 파서 적용
app.use(cookieParser());

// 정적 파일 경로 설정 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));

// 세션 설정
app.use(session({
  secret: 'bookmoa-secret',
  resave: false,
  saveUninitialized: true
}));

// JWT 비밀키 (환경변수에서)
const JWT_SECRET = process.env.JWT_SECRET;

// JWT 토큰 쿠키 → 세션 동기화 미들웨어 (닉네임까지 DB 조회 포함)
app.use(async (req, res, next) => {
  const token = req.cookies.token;
  if (token && !req.session.user) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // user_id로 닉네임 조회
      const [rows] = await pool.query('SELECT nickname FROM users WHERE user_id = ?', [decoded.user_id]);
      if (rows.length > 0) {
        req.session.user = {
          user_id: decoded.user_id,
          nickname: rows[0].nickname
        };
      }
    } catch (err) {
      console.error('JWT 인증 실패:', err.message);
      // 실패 시 세션 user 초기화 혹은 냅둬도 됨
    }
  }
  next();
});

// 특정 정적 경로 추가 (mypage/images)
app.use('/mypage/images', express.static(path.join(__dirname, 'public/mypage/images')));

// 프로필 이미지 라우팅 (파일이 없으면 기본 이미지 제공)
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

// 인기 도서 컨트롤러
const { getTop4Books } = require('./controllers/popularController');

// 메인 페이지 라우트
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
      popularBooks: []
    });
  }
});

// 게시글 라우터
const postsRouter = require('./routes/posts');
app.use('/posts', postsRouter);

// 댓글 라우터
const commentsRouter = require('./routes/comments');
app.use('/comments', commentsRouter);

// 인증/유저 정보 라우터
app.use('/api/auth', require('./routes/auth'));               // 회원가입 / 로그인
app.use('/api/checkId', require('./routes/checkId'));         // 아이디 중복확인
app.use('/api/user', require('./routes/user'));               // 마이페이지
app.use('/api/user-contents', require('./routes/userContents')); // 작성한 글/댓글 목록

// 도서관 즐겨찾기 라우터
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
