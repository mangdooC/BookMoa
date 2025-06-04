// routes/bookReviews.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bookReviewController = require('../controllers/bookReviewController');
const authMiddleware = require('../middlewares/authMiddleware');

// 책 리뷰 목록 조회 API
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT br.review_id, br.content, br.rating, br.created_at,
             b.title AS book_title, b.isbn, u.nickname AS author
      FROM book_review br
      JOIN user u ON br.user_id = u.user_id
      JOIN book b ON br.book_id = b.book_id
      ORDER BY br.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('리뷰 조회 실패:', err);
    res.status(500).json({ message: '리뷰 불러오기 중 오류 발생' });
  }
});

// 책 리뷰 작성 API
router.post('/:isbn13', authMiddleware, bookReviewController.createReview);

module.exports = router;