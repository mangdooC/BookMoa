const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const libraryReviewController = require('../controllers/libraryReviewController');

// EJS 템플릿 페이지
router.get('/librarySrch', libraryReviewController.LibraryListforSrch);

// API: 전체 또는 검색 키워드에 따른 목록 반환
router.get('/api/list', libraryReviewController.SrchLibrary);

router.get('/libraryReview', libraryReviewController.getLibInfo);

router.get('/libraryReviews', libraryReviewController.getLibReview);

router.get('/writeReview', (req, res) => {
  const libraryName = req.query.name;
  res.render('library/writeReview', { libraryName });
});

router.post('/writeReview', authMiddleware, libraryReviewController.createLibReview);
module.exports = router;
