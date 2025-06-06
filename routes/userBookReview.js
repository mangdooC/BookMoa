const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middlewares/authMiddleware');

const errorMessages = {
  NOT_FOUND: '리뷰를 찾을 수 없습니다.',
  LOGIN_REQUIRED: '로그인이 필요합니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
  INVALID_RATING: '평점은 1~5 사이의 숫자여야 합니다.',
  FORBIDDEN: '권한이 없습니다.',
};

// 404 처리 헬퍼 함수
async function handle404(res, message = errorMessages.NOT_FOUND) {
  return res.status(404).render('error', { message });
}

// 내가 쓴 도서 리뷰 목록 + 렌더링 (마이페이지에서)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [reviews] = await db.query(`
      SELECT br.review_id, br.content, br.rating, br.created_at,
             b.title AS book_title, b.isbn
      FROM book_review br
      JOIN book b ON br.book_id = b.book_id
      WHERE br.user_id = ?
      ORDER BY br.created_at DESC
    `, [userId]);

    res.render('userBookReviewList', { reviews, user: req.user });
  } catch (err) {
    console.error('내 도서 리뷰 목록 조회 실패:', err);
    res.status(500).render('error', { message: errorMessages.SERVER_ERROR });
  }
});

// 리뷰 수정 처리 (AJAX)
router.post('/edit/:id', authMiddleware, async (req, res) => {
  const reviewId = req.params.id;
  const { content, rating } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM book_review WHERE review_id = ?', [reviewId]);
    if (rows.length === 0) return res.status(404).json({ error: errorMessages.NOT_FOUND });

    if (req.user.user_id !== rows[0].user_id) return res.status(403).json({ error: errorMessages.FORBIDDEN });

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: errorMessages.INVALID_RATING });
    }

    await db.query('UPDATE book_review SET content = ?, rating = ? WHERE review_id = ?', [content, ratingNum, reviewId]);

    res.json({ success: true, message: '리뷰가 수정되었습니다.' });
  } catch (error) {
    console.error('리뷰 수정 실패:', error);
    res.status(500).json({ error: errorMessages.SERVER_ERROR });
  }
});

// 리뷰 삭제 처리 (AJAX)
router.post('/delete/:id', authMiddleware, async (req, res) => {
  const reviewId = req.params.id;
  try {
    const [rows] = await db.query('SELECT * FROM book_review WHERE review_id = ?', [reviewId]);
    if (rows.length === 0) return res.status(404).json({ error: errorMessages.NOT_FOUND });

    if (req.user.user_id !== rows[0].user_id) return res.status(403).json({ error: errorMessages.FORBIDDEN });

    await db.query('DELETE FROM book_review WHERE review_id = ?', [reviewId]);

    res.json({ success: true, message: '리뷰가 삭제되었습니다.' });
  } catch (error) {
    console.error('리뷰 삭제 실패:', error);
    res.status(500).json({ error: errorMessages.SERVER_ERROR });
  }
});

module.exports = router;
