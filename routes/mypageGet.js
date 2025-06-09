const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!userId) return res.status(401).json({ error: '유저 인증 실패' });

    // 책 리뷰 조회
    const [bookReviews] = await pool.query(`
      SELECT br.review_id, br.content, br.rating, br.created_at, b.title AS book_title
      FROM book_review br
      JOIN book b ON br.book_id = b.book_id
      WHERE br.user_id = ?
      ORDER BY br.created_at DESC
    `, [userId]);

    // 도서관 리뷰 조회
    const [libraryReviews] = await pool.query(`
      SELECT lr.review_id, lr.content, lr.rating, lr.created_at, l.name AS library_name
      FROM library_review lr
      JOIN library l ON lr.library_id = l.lib_code
      WHERE lr.user_id = ?
      ORDER BY lr.created_at DESC
    `, [userId]);

    // 커뮤니티 글 조회
    const [posts] = await pool.query(`
      SELECT post_id, title, created_at, view_count
      FROM community_post
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);

    // 커뮤니티 댓글 조회 (댓글 + 해당 글 제목)
    const [comments] = await pool.query(`
      SELECT c.comment_id, c.content, c.created_at, p.title AS post_title
      FROM community_comment c
      JOIN community_post p ON c.post_id = p.post_id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `, [userId]);

    res.render('mypage', { 
      user: req.user,
      bookReviews,
      library_reviews: libraryReviews,
      posts,
      comments,
      activeTab: 'content' 
    });

  } catch (err) {
    console.error('마이페이지 콘텐츠 로딩 실패:', err);
    res.status(500).json({ error: '서버 에러' });
  }
});

module.exports = router;