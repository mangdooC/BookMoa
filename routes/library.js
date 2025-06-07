const express = require('express');
const router = express.Router();
const db = require('../db');

// EJS 템플릿 페이지
router.get('/librarySrch', async (req, res) => {
  try {
    const [libraries] = await db.query(`
      SELECT name, phone, address, homepage 
      FROM library
    `);
    res.render('library/librarySrch', { libraries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 내부 에러가 발생했습니다.' });
  }
});

// API: 전체 또는 검색 키워드에 따른 목록 반환
router.get('/api/list', async (req, res) => {
  try {
    const keyword = req.query.keyword;

    let query = `SELECT name, phone, address, homepage FROM library`;
    const params = [];

    if (keyword) {
      query += ` WHERE name LIKE ? OR address LIKE ?`;
      const likeKeyword = `%${keyword}%`;
      params.push(likeKeyword, likeKeyword);
    }

    const [libraries] = await db.query(query, params);
    res.json(libraries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '도서관 목록 조회 실패' });
  }
});

router.get('/libraryReview', async (req, res) => {
  const libname = req.query.name;

  try {
    res.render('library/libraryReview', {
      libraryName: libname // libname 넘겨줘서 JS에서 쓸 수 있도록
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류');
  }
});


router.get('/libraryReviews', async (req, res) => {
  const libname = req.query.name;

  try {
    const [libraryReviews] = await db.query(
      `SELECT lr.review_id, lr.rating, library.name, u.nickname AS user_nickname
       FROM library_review lr
       JOIN library ON library.lib_code = lr.library_id
       JOIN user u ON lr.user_id = u.user_id
       WHERE library.name = ?
       ORDER BY lr.created_at DESC`,
      [libname]
    );

    res.json(libraryReviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '도서관 리뷰 조회 실패' });
  }
});

module.exports = router;
