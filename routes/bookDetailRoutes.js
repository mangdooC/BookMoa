const express = require('express');
const router = express.Router();
const bookDetailController = require('../controllers/bookDetailController');

router.get('/book/detail', bookDetailController.bookDetail);
// 기존 방식도 유지하려면 아래도 추가
router.get('/book/:isbn13', bookDetailController.bookDetail);

router.get('/book/:isbn13/review/new', bookDetailController.reviewForm);
router.post('/book/:isbn13/review', bookDetailController.createReview);

module.exports = router;