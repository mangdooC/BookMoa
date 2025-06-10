const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middlewares/authMiddleware');
const libraryReviewController = require('../controllers/libraryReviewController')

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
  const [libInfos] = await db.query(
    `SELECT library.name, library.address, library.phone, library.homepage
    from library
    where library.name = ?`,[libname]
  );
  const libInfo = libInfos[0];

  try {
    res.render('library/libraryReview', {
      libraryName: libname, // libname 넘겨줘서 JS에서 쓸 수 있도록
      libInfo
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류');
  }
});


router.get('/libraryReviews', libraryReviewController.getLibReview);

router.get('/writeReview', (req, res) => {
  const libraryName = req.query.name;
  res.render('library/writeReview', { libraryName });
});

router.post('/writeReview', authMiddleware, libraryReviewController.createLibReview);
module.exports = router;