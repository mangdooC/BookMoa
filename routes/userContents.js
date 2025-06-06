const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateJWT = require('../middlewares/authMiddleware');

// 1. 도서 리뷰 조회 (사용자 기준)
const getBookReviewsByUser = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const [bookReviews] = await pool.query(`
      SELECT br.review_id, br.content, br.rating, br.created_at,
             b.title AS book_title, b.isbn
      FROM book_review br
      JOIN book b ON br.book_id = b.book_id
      WHERE br.user_id = ?
      ORDER BY br.created_at DESC
    `, [user_id]);
    res.render('bookReviews', { bookReviews });
  } catch (err) {
    console.error('도서 리뷰 조회 실패:', err);
    res.status(500).render('error', { message: '도서 리뷰 조회 중 오류 발생' });
  }
};

// 2. 도서 리뷰 수정 폼 렌더링
const editBookReviewForm = async (req, res) => {
  const user_id = req.user.user_id;
  const review_id = req.params.reviewId;
  try {
    const [rows] = await pool.query(`
      SELECT review_id, content, rating FROM book_review WHERE review_id = ? AND user_id = ?
    `, [review_id, user_id]);
    if (rows.length === 0) {
      return res.status(404).render('error', { message: '도서 리뷰가 없거나 권한이 없습니다.' });
    }
    res.render('editBookReview', { review: rows[0] });
  } catch (err) {
    console.error('도서 리뷰 수정 폼 조회 실패:', err);
    res.status(500).render('error', { message: '도서 리뷰 수정 폼 조회 중 오류 발생' });
  }
};

// 3. 도서 리뷰 수정 처리
const updateBookReview = async (req, res) => {
  const user_id = req.user.user_id;
  const review_id = req.params.reviewId;
  const { content, rating } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE book_review SET content = ?, rating = ? WHERE review_id = ? AND user_id = ?`,
      [content, rating, review_id, user_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).render('error', { message: '도서 리뷰가 없거나 권한이 없습니다.' });
    }
    res.redirect('/reviews/books');
  } catch (err) {
    console.error('도서 리뷰 수정 실패:', err);
    res.status(500).render('error', { message: '도서 리뷰 수정 중 오류 발생' });
  }
};

// 4. 도서 리뷰 삭제 처리
const deleteBookReview = async (req, res) => {
  const user_id = req.user.user_id;
  const review_id = req.params.reviewId;
  try {
    const [result] = await pool.query(
      `DELETE FROM book_review WHERE review_id = ? AND user_id = ?`,
      [review_id, user_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).render('error', { message: '도서 리뷰가 없거나 권한이 없습니다.' });
    }
    res.redirect('/reviews/books');
  } catch (err) {
    console.error('도서 리뷰 삭제 실패:', err);
    res.status(500).render('error', { message: '도서 리뷰 삭제 중 오류 발생' });
  }
};

// 5. 도서관 리뷰 조회 (사용자 기준)
const getLibraryReviewsByUser = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const [libraryReviews] = await pool.query(`
      SELECT lr.review_id, lr.content, lr.rating, lr.created_at,
             l.name AS library_name
      FROM library_review lr
      JOIN library l ON lr.library_id = l.library_id
      WHERE lr.user_id = ?
      ORDER BY lr.created_at DESC
    `, [user_id]);
    res.render('libraryReviews', { libraryReviews });
  } catch (err) {
    console.error('도서관 리뷰 조회 실패:', err);
    res.status(500).render('error', { message: '도서관 리뷰 조회 중 오류 발생' });
  }
};

// 6. 도서관 리뷰 수정 폼 렌더링
const editLibraryReviewForm = async (req, res) => {
  const user_id = req.user.user_id;
  const review_id = req.params.reviewId;
  try {
    const [rows] = await pool.query(`
      SELECT review_id, content, rating FROM library_review WHERE review_id = ? AND user_id = ?
    `, [review_id, user_id]);
    if (rows.length === 0) {
      return res.status(404).render('error', { message: '도서관 리뷰가 없거나 권한이 없습니다.' });
    }
    res.render('editLibraryReview', { review: rows[0] });
  } catch (err) {
    console.error('도서관 리뷰 수정 폼 조회 실패:', err);
    res.status(500).render('error', { message: '도서관 리뷰 수정 폼 조회 중 오류 발생' });
  }
};

// 7. 도서관 리뷰 수정 처리
const updateLibraryReview = async (req, res) => {
  const user_id = req.user.user_id;
  const review_id = req.params.reviewId;
  const { content, rating } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE library_review SET content = ?, rating = ? WHERE review_id = ? AND user_id = ?`,
      [content, rating, review_id, user_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).render('error', { message: '도서관 리뷰가 없거나 권한이 없습니다.' });
    }
    res.redirect('/reviews/libraries');
  } catch (err) {
    console.error('도서관 리뷰 수정 실패:', err);
    res.status(500).render('error', { message: '도서관 리뷰 수정 중 오류 발생' });
  }
};

// 8. 도서관 리뷰 삭제 처리
const deleteLibraryReview = async (req, res) => {
  const user_id = req.user.user_id;
  const review_id = req.params.reviewId;
  try {
    const [result] = await pool.query(
      `DELETE FROM library_review WHERE review_id = ? AND user_id = ?`,
      [review_id, user_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).render('error', { message: '도서관 리뷰가 없거나 권한이 없습니다.' });
    }
    res.redirect('/reviews/libraries');
  } catch (err) {
    console.error('도서관 리뷰 삭제 실패:', err);
    res.status(500).render('error', { message: '도서관 리뷰 삭제 중 오류 발생' });
  }
};

// 9. 커뮤니티 글 조회 (사용자 기준)
const getCommunityPostsByUser = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const [posts] = await pool.query(`
      SELECT post_id, title, content, created_at
      FROM community_post
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [user_id]);
    res.render('communityPosts', { posts });
  } catch (err) {
    console.error('커뮤니티 글 조회 실패:', err);
    res.status(500).render('error', { message: '커뮤니티 글 조회 중 오류 발생' });
  }
};

// 10. 커뮤니티 글 수정 폼 렌더링
const editCommunityPostForm = async (req, res) => {
  const user_id = req.user.user_id;
  const post_id = req.params.postId;
  try {
    const [rows] = await pool.query(
      `SELECT post_id, title, content FROM community_post WHERE post_id = ? AND user_id = ?`,
      [post_id, user_id]
    );
    if (rows.length === 0) {
      return res.status(404).render('error', { message: '게시글이 없거나 권한이 없습니다.' });
    }
    res.render('editCommunityPost', { post: rows[0] });
  } catch (err) {
    console.error('게시글 수정 폼 조회 실패:', err);
    res.status(500).render('error', { message: '게시글 수정 폼 조회 중 오류 발생' });
  }
};

// 11. 커뮤니티 글 수정 처리
const updateCommunityPost = async (req, res) => {
  const user_id = req.user.user_id;
  const post_id = req.params.postId;
  const { title, content } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE community_post SET title = ?, content = ? WHERE post_id = ? AND user_id = ?`,
      [title, content, post_id, user_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).render('error', { message: '게시글이 없거나 권한이 없습니다.' });
    }
    res.redirect('/community/posts');
  } catch (err) {
    console.error('게시글 수정 실패:', err);
    res.status(500).render('error', { message: '게시글 수정 중 오류 발생' });
  }
};

// 12. 커뮤니티 글 삭제 처리
const deleteCommunityPost = async (req, res) => {
  const user_id = req.user.user_id;
  const post_id = req.params.postId;
  try {
    const [result] = await pool.query(
      `DELETE FROM community_post WHERE post_id = ? AND user_id = ?`,
      [post_id, user_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).render('error', { message: '게시글이 없거나 권한이 없습니다.' });
    }
    res.redirect('/community/posts');
  } catch (err) {
    console.error('게시글 삭제 실패:', err);
    res.status(500).render('error', { message: '게시글 삭제 중 오류 발생' });
  }
};

// 13. 커뮤니티 댓글 조회 (사용자 기준)
const getCommunityCommentsByUser = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const [comments] = await pool.query(`
      SELECT cc.comment_id, cc.content, cc.created_at,
             cp.title AS post_title
      FROM community_comment cc
      JOIN community_post cp ON cc.post_id = cp.post_id
      WHERE cc.user_id = ?
      ORDER BY cc.created_at DESC
    `, [user_id]);
    res.render('communityComments', { comments });
  } catch (err) {
    console.error('커뮤니티 댓글 조회 실패:', err);
    res.status(500).render('error', { message: '커뮤니티 댓글 조회 중 오류 발생' });
  }
};

// 14. 커뮤니티 댓글 수정 폼 렌더링
const editCommunityCommentForm = async (req, res) => {
  const user_id = req.user.user_id;
  const comment_id = req.params.commentId;
  try {
    const [rows] = await pool.query(
      `SELECT comment_id, content FROM community_comment WHERE comment_id = ? AND user_id = ?`,
      [comment_id, user_id]
    );
    if (rows.length === 0) {
      return res.status(404).render('error', { message: '댓글이 없거나 권한이 없습니다.' });
    }
    res.render('editCommunityComment', { comment: rows[0] });
  } catch (err) {
    console.error('댓글 수정 폼 조회 실패:', err);
    res.status(500).render('error', { message: '댓글 수정 폼 조회 중 오류 발생' });
  }
};

// 15. 커뮤니티 댓글 수정 처리
const updateCommunityComment = async (req, res) => {
  const user_id = req.user.user_id;
  const comment_id = req.params.commentId;
  const { content } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE community_comment SET content = ? WHERE comment_id = ? AND user_id = ?`,
      [content, comment_id, user_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).render('error', { message: '댓글이 없거나 권한이 없습니다.' });
    }
    res.redirect('/community/comments');
  } catch (err) {
    console.error('댓글 수정 실패:', err);
    res.status(500).render('error', { message: '댓글 수정 중 오류 발생' });
  }
};

// 16. 커뮤니티 댓글 삭제 처리
const deleteCommunityComment = async (req, res) => {
  const user_id = req.user.user_id;
  const comment_id = req.params.commentId;
  try {
    const [result] = await pool.query(
      `DELETE FROM community_comment WHERE comment_id = ? AND user_id = ?`,
      [comment_id, user_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).render('error', { message: '댓글이 없거나 권한이 없습니다.' });
    }
    res.redirect('/community/comments');
  } catch (err) {
    console.error('댓글 삭제 실패:', err);
    res.status(500).render('error', { message: '댓글 삭제 중 오류 발생' });
  }
};

router.use(authenticateJWT);

// 도서 리뷰 라우트
router.get('/reviews/books', getBookReviewsByUser);
router.get('/reviews/books/edit/:reviewId', editBookReviewForm);
router.post('/reviews/books/edit/:reviewId', updateBookReview);
router.post('/reviews/books/delete/:reviewId', deleteBookReview);

// 도서관 리뷰 라우트
router.get('/reviews/libraries', getLibraryReviewsByUser);
router.get('/reviews/libraries/edit/:reviewId', editLibraryReviewForm);
router.post('/reviews/libraries/edit/:reviewId', updateLibraryReview);
router.post('/reviews/libraries/delete/:reviewId', deleteLibraryReview);

// 커뮤니티 게시글 라우트
router.get('/community/posts', getCommunityPostsByUser);
router.get('/community/posts/edit/:postId', editCommunityPostForm);
router.post('/community/posts/edit/:postId', updateCommunityPost);
router.post('/community/posts/delete/:postId', deleteCommunityPost);

// 커뮤니티 댓글 라우트
router.get('/community/comments', getCommunityCommentsByUser);
router.get('/community/comments/edit/:commentId', editCommunityCommentForm);
router.post('/community/comments/edit/:commentId', updateCommunityComment);
router.post('/community/comments/delete/:commentId', deleteCommunityComment);

module.exports = router;
