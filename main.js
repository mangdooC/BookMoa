// main.js
require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

const bookRoutes = require('./routes/bookRoutes');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// 메인 홈 라우트
app.get('/', (req, res) => {
  res.send(`
    <h1>책모아 홈!</h1>
    <button onclick="location.href='/book/search'">책 검색하러 가기</button>
  `);
});

// 라우터 적용
app.use('/book', bookRoutes);

app.listen(port, () => {
  console.log(`서버 실행 중: http://localhost:${port}`);
});
