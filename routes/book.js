const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const bookDetailController = require('../controllers/bookDetailController');

// 검색 결과 처리
router.get('/search/results', bookController.searchBooks);
router.get('/search', bookController.searchForm);
// 도서 상세 페이지
router.get('/:isbn13/review/new', bookDetailController.reviewForm);
router.post('/:isbn13/review', bookDetailController.createReview);
router.get('/:isbn13', bookDetailController.bookDetail);

module.exports = router;
