const express = require('express');
const pool = require('./db');
require('dotenv').config();
const path = require('path');

const app = express();

//미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, 'public')));

// 테스트 라우터
app.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT 1 + 1 AS result');
  res.send(`DB 연결 성공! 결과: ${rows[0].result}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` 서버가 포트 ${PORT}에서 실행 중`);
});

//post 라우터
const postsRouter = require('./routes/posts');

app.use(express.json()); // JSON 요청을 파싱
app.use(express.static('public'));
app.use('/posts', postsRouter);

//comment 라우터
const commentsRouter = require('./routes/comments');
app.use('/comments', commentsRouter);

app.get('/', (req, res) => {
  res.send('책모아 서버에 오신 것을 환영합니다!');
});

//회원가입/로그인 라우터
const authRouter = require('./routes/auth');
app.use('/api', authRouter);

//마이페이지 라우터
const editInfoRouter = require('./routes/editInfo');
app.use('/api', editInfoRouter);

//사용자 중복 체크 라우터
const checkIdRouter = require('./api/checkId');
app.use('/api/checkId', checkIdRouter);