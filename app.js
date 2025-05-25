const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// 테스트 라우터
app.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT 1 + 1 AS result');
  res.send(`DB 연결 성공! 결과: ${rows[0].result}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` 서버가 포트 ${PORT}에서 실행 중`);
});
