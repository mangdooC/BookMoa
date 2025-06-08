const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const pool = require('../db');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user.user_id;

    // 도서 리뷰 조회
    const [bookReviews] = await pool.query(`
      SELECT review_id, title, rating 
      FROM book_reviews 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [userId]);

    // 도서관 리뷰 조회
    const [libraryReviews] = await pool.query(`
      SELECT review_id, library_name 
      FROM library_reviews 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [userId]);

    // 커뮤니티 글 조회
    const [posts] = await pool.query(`
      SELECT post_id, title, created_at 
      FROM community_post 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [userId]);

    // 커뮤니티 댓글 조회 (댓글 + 해당 글 제목)
    const [comments] = await pool.query(`
      SELECT 
        c.comment_id, c.post_id, c.content, c.created_at, 
        p.title AS post_title
      FROM community_comment c
      JOIN community_post p ON c.post_id = p.post_id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `, [userId]);

    res.render('user-content', {
      user: req.session.user,
      bookReviews,
      libraryReviews,
      posts,
      comments
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('마이페이지 로딩 중 오류 발생');
  }
});

module.exports = router;
