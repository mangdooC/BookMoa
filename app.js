const express = require('express');
const pool = require('./db');
require('dotenv').config();
const path = require('path');

const session = require('express-session');
const ejsLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')

const app = express();

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
        user_id: decoded.user_id,
        nickname: decoded.nickname
      };
    } catch (err) {
      console.error('JWT 인증 실패:', err.message);
    }
  }
  next();
});

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'public')));

// 테스트 라우터
// app.get('/', async (req, res) => {
//   const [rows] = await pool.query('SELECT 1 + 1 AS result');
//   res.send(`DB 연결 성공! 결과: ${rows[0].result}`);
// });

// 루트 라우터
//app.get('/', (req, res) => {
//  res.send('책모아 서버에 오신 것을 환영합니다!');
//});

//  루트 라우터 (EJS 렌더링)
app.get('/', (req, res) => {
  res.render('index', {title: '책모아 메인 페이지', user: req.session.user });
});

//post 라우터
const postsRouter = require('./routes/posts');
app.use('/posts', postsRouter);

//comment 라우터
const commentsRouter = require('./routes/comments');
app.use('/comments', commentsRouter);

//회원 관련 라우터
const authRouter = require('./routes/auth');
const editInfoRouter = require('./routes/editInfo');
const checkIdRouter = require('./routes/checkId');
const userRouter = require('./routes/user');
const userContentsRouter = require('./routes/userContents');

app.use('/api/auth', authRouter); // 회원가입, 로그인
app.use('/api/user', editInfoRouter); // 마이페이지 관련
app.use('/api/check-id', checkIdRouter); // 아이디 중복체크
app.use('/user', userRouter); // 유저 관련 라우터
app.use('/api/user-contents', userContentsRouter); // 유저가 작성한 글, 댓글 목록
// 예시 요청 경로:
// - 내가 쓴 도서 리뷰:        GET /api/user-contents/reviews/book/:user_id
// - 내가 쓴 도서관 리뷰:      GET /api/user-contents/reviews/library/:user_id
// - 내가 쓴 커뮤니티 글:      GET /api/user-contents/posts/community/:user_id
// - 내가 쓴 커뮤니티 댓글:    GET /api/user-contents/comments/community/:user_id



//도서관 관련 라우터
const favoritelibRouter = require('./routes/favoritelib');
app.use('/api/favorites', favoritelibRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` 서버가 포트 ${PORT}에서 실행 중`);
});
