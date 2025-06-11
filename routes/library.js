const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middlewares/authMiddleware');
const libraryReviewController = require('../controllers/libraryReviewController');

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
router.get('/api/list', libraryReviewController.SrchLibrary);

router.get('/libraryReview', async (req, res) => {
  try {
    const libname = req.query.name;

    const [libInfos] = await db.query(
      `SELECT library.name, library.address, library.phone, library.homepage
       FROM library
       WHERE library.name = ?`, 
      [libname]
    );

    const libInfo = libInfos[0];

    res.render('library/libraryReview', {
      libraryName: libname,
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
