const express = require('express');
const router = express.Router();
const bookDetailController = require('../controllers/bookDetailController');
const bookReviewController = require('../controllers/bookReviewController');
const authMiddleware = require('../middlewares/authMiddleware'); // JWT 인증 미들웨어

router.get('/book/detail', bookDetailController.bookDetail);
router.get('/book/:isbn13', bookDetailController.bookDetail);

router.get('/book/:isbn13/review/new', bookReviewController.reviewForm);
router.post('/book/:isbn13/review', authMiddleware, bookReviewController.createReview);


module.exports = router;