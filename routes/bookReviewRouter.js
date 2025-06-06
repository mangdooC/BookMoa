const express = require('express');
const router = express.Router();
const db = require('../db');
const bookReviewController = require('../controllers/bookReviewController');

// 리뷰 목록 조회
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
    SELECT br.review_id, br.rating, b.author, b.publisher, u.nickname AS user_nickname, COALESCE(b.title, '등록된 도서 없음') AS book_title
    FROM book_review br
    JOIN book b ON br.book_id = b.book_id
    JOIN user u ON br.user_id = u.user_id
    ORDER BY br.created_at DESC
  `);
    res.render('bookReview/bookReviewList', { reviews: rows });
  } catch (error) {
    console.error('리뷰 목록 조회 오류:', error);
    res.status(500).send('리뷰를 불러오는 중 오류가 발생했습니다.');
  }
});

router.get('/write/:isbn13', bookReviewController.reviewForm);
router.post('/:isbn13', bookReviewController.createReview);

// 리뷰 작성 페이지 렌더링
router.get('/write', (req, res) => {
  const isbn13 = req.query.isbn || ''; // 필요하다면 쿼리에서 ISBN을 받아서 전달
  res.render('bookReview/write', { isbn13 });
});

// 리뷰 작성 페이지 렌더링 (isbn 안받는 테스트 용)
router.get('/write', (req, res) => {
  res.render('bookReview/write'); 
});

module.exports = router;