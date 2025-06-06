const express = require('express');
const router = express.Router();
const db = require('../db');

// HTML 페이지 렌더링 라우터
router.get('/librarySrch', async (req, res) => {
  try {
    const [libraries] = await db.query(`
      SELECT name, phone, address, homepage 
      FROM library
    `);
    res.render('library/librarySrch', { libraries }); // ← EJS 템플릿으로 렌더링
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 내부 에러가 발생했습니다.' });
  }
});

// 프론트 JS에서 사용하는 API (JSON 리턴)
router.get('/api/list', async (req, res) => {
  try {
    const [libraries] = await db.query(`
      SELECT name, phone, address, homepage 
      FROM library
    `);
    res.json(libraries); // ← 프론트 fetch()로 사용
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '도서관 목록 조회 실패' });
  }
});

module.exports = router;

router.get('/api/list', async (req, res) => {
  try {
    const [libraries] = await db.query(`SELECT name, phone, address, homepage FROM library`);
    res.json(libraries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '도서관 목록 조회 실패' });
  }
});


module.exports = router;