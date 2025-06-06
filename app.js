const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const pool = require('./db');
const session = require('express-session');
const ejsLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

const JWT_SECRET = process.env.JWT_SECRET;

// multer 설정 추가
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// 정적 파일 제공
app.use('/uploads/profile', express.static(path.join(__dirname, 'uploads/profile')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// 뷰 엔진 세팅
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(ejsLayouts);

// 요청 바디 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 쿠키 파서
app.use(cookieParser());

// 세션 설정
app.use(session({
  secret: 'bookmoa-secret',
  resave: false,
  saveUninitialized: true
}));

// JWT 토큰 쿠키 → 세션 동기화 미들웨어 (닉네임 DB 조회 포함)
app.use(async (req, res, next) => {
  const token = req.cookies.token;
  if (token && !req.session.user) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const [rows] = await pool.query('SELECT nickname FROM user WHERE user_id = ?', [decoded.user_id]);
      if (rows.length > 0) {
        req.session.user = {
          user_id: decoded.user_id,
          nickname: rows[0].nickname
        };
      }
    } catch (err) {
      console.error('JWT 인증 실패:', err.message);
    }
  }
  next();
});

// 레이아웃용 기본 변수 설정
app.use((req, res, next) => {
  res.locals.title = '책모아';
  res.locals.user = req.session.user || null;
  next();
});

// 로그아웃 라우터 (뷰용 POST 로그아웃 라우터)
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('세션 삭제 실패:', err);
    res.clearCookie('token');
    res.redirect('/');
  });
});

// 컨트롤러들 require
const { getTopBooks } = require('./controllers/popularController');
const { getLatestPosts } = require('./controllers/postsController');

// 메인 페이지
app.get('/', async (req, res) => {
  try {
    const popularBooks = await getTopBooks();
    const latestPosts = await getLatestPosts();

    res.render('index', {
      title: '책모아 메인 페이지',
      user: req.session.user,
      popularBooks,
      latestPosts
    });
  } catch (err) {
    console.error('[메인 페이지 로딩 실패]', err);
    res.render('index', {
      title: '책모아 메인 페이지',
      user: req.session.user,
      popularBooks: [],
      latestPosts: []
    });
  }
});

// 기타 라우터 등록
app.use('/posts', require('./routes/posts'));
app.use('/comments', require('./routes/comments'));
// app.use('/book-reviews', require('./routes/bookReviews'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/checkId', require('./routes/checkId'));
app.use('/api/user', require('./routes/user'));
app.use('/api/user-contents', require('./routes/userContents'));
app.use('/api/favorites', require('./routes/favoritelib'));

//인기도서 
const communityRouter = require('./routes/community');
app.use('/community', communityRouter);

//커뮤니티
const popularRoute = require('./routes/popularRoute');
app.use('/', popularRoute);

// 도서 상세
const bookRouter = require('./routes/book');
app.use('/book', bookRouter);

//bookReviews 라우터
const bookReviewsRouter = require('./routes/bookReviews');
app.use('/book-reviews', bookReviewsRouter);

//새 bookReview 라우터
const bookReviewRouter = require('./routes/bookReviewRouter');
app.use('/bookReview', bookReviewRouter);

//도서관 관련 라우터
const favoritelibRouter = require('./routes/favoritelib');
app.use('/api/favorites', favoritelibRouter);

//책검색 라우터
const bookSearchRouter = require('./routes/book');
app.use('/', bookSearchRouter);

const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

//도서관 검색 라우터
const libraryRouter = require('./routes/library');
app.use('/library', libraryRouter);

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error('서버 에러:', err.stack);
  res.status(500).json({ message: '서버 내부 에러가 발생했습니다.' });
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중`);
});