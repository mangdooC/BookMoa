const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const bookDetailController = require('../controllers/bookDetailController');
const bookReviewController = require('../controllers/bookReviewController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/search/results', bookController.searchBooks);
router.get('/search', bookController.searchForm);
// 도서 상세
router.get('/:isbn13', bookDetailController.bookDetail);

// 리뷰 작성 폼
router.get('/:isbn13/review/new', bookReviewController.reviewForm);
// 리뷰 작성 처리
router.post('/:isbn13/review', authMiddleware, bookReviewController.createReview);

module.exports = router;