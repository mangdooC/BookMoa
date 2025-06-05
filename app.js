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

const session = require('express-session');
const ejsLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')

const app = express();

// ---------- 정적 파일 제공 ----------Add commentMore actions
app.use('/uploads/profile', express.static(path.join(__dirname, 'uploads/profile')));

// ---------- 미들웨어 설정 ----------
// EJS 뷰 엔진 세팅
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');            // ejs-layouts 기본 레이아웃 파일 지정
app.use(ejsLayouts);

// 요청 바디 파싱
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
        user_id: decoded.user_id,
        nickname: decoded.nickname
      };
    } catch (err) {
      console.error('JWT 인증 실패:', err.message);
    }
  }
  next();
});

// layout용 기본 변수 설정
app.use((req, res, next) => {
  res.locals.title = '책모아'; // 기본 타이틀
  res.locals.user = req.session.user || null; // 로그인 사용자 정보
  next();
});

// 로그아웃 라우터 추가
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('세션 삭제 실패:', err);
    }
    res.clearCookie('token'); // 쿠키에 jwt 삭제
    res.redirect('/'); // 메인 페이지로 리디렉션
  });
});


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


// JWT 토큰 쿠키 → 세션 동기화 미들웨어 (닉네임까지 DB 조회 포함)
app.use(async (req, res, next) => {
  const token = req.cookies.token;
  if (token && !req.session.user) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // user_id로 닉네임 조회
      const [rows] = await pool.query('SELECT nickname FROM user WHERE user_id = ?', [decoded.user_id]);
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

//bookReviews 라우터
const bookReviewsRouter = require('./routes/bookReviews');
app.use('/book-reviews', bookReviewsRouter);

// community 라우터
const communityRouter = require('./routes/community');
app.use('/community', communityRouter);

//회원 관련 라우터
const authRouter = require('./routes/auth');
const checkIdRouter = require('./routes/checkId');
const userRouter = require('./routes/user');
const userContentsRouter = require('./routes/userContents');

app.use('/api/auth', authRouter); // 회원가입, 로그인
app.use('/api/checkId', checkIdRouter); // 아이디 중복체크
app.use('/api/user', userRouter); // 유저 관련 라우터 (마이페이지 관련)
app.use('/api/user-contents', userContentsRouter); // 유저가 작성한 글, 댓글 목록

//도서관 관련 라우터
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
