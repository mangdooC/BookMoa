const pool = require('../db');

// 1. 도서 리뷰 조회 (사용자 기준)
const getBookReviewsByUser = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const [bookReviews] = await pool.query(`
      SELECT br.review_id, br.content, br.rating, br.created_at,
             b.title AS book_title, b.isbn,
             CONCAT('/books/reviews/', br.review_id) AS url
      FROM book_review br
      JOIN book b ON br.book_id = b.book_id
      WHERE br.user_id = ?
      ORDER BY br.created_at DESC
    `, [user_id]);

    res.json(bookReviews);
  } catch (err) {
    console.error('도서 리뷰 조회 실패:', err);
    res.status(500).json({ message: '도서 리뷰 조회 중 오류 발생' });
  }
};

// 2. 도서 리뷰 수정
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
      return res.status(404).json({ message: '도서 리뷰가 없거나 권한이 없습니다.' });
    }

    res.json({ message: '도서 리뷰 수정 완료' });
  } catch (err) {
    console.error('도서 리뷰 수정 실패:', err);
    res.status(500).json({ message: '도서 리뷰 수정 중 오류 발생' });
  }
};

// 3. 도서 리뷰 삭제
const deleteBookReview = async (req, res) => {
  const user_id = req.user.user_id;
  const review_id = req.params.reviewId;

  try {
    const [result] = await pool.query(
      `DELETE FROM book_review WHERE review_id = ? AND user_id = ?`,
      [review_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '도서 리뷰가 없거나 권한이 없습니다.' });
    }

    res.json({ message: '도서 리뷰 삭제 완료' });
  } catch (err) {
    console.error('도서 리뷰 삭제 실패:', err);
    res.status(500).json({ message: '도서 리뷰 삭제 중 오류 발생' });
  }
};

// 4. 도서관 리뷰 조회 (사용자 기준)
const getLibraryReviewsByUser = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const [libraryReviews] = await pool.query(`
      SELECT lr.review_id, lr.content, lr.rating, lr.created_at,
             l.name AS library_name,
             CONCAT('/libraries/reviews/', lr.review_id) AS url
      FROM library_review lr
      JOIN library l ON lr.library_id = l.library_id
      WHERE lr.user_id = ?
      ORDER BY lr.created_at DESC
    `, [user_id]);

    res.json(libraryReviews);
  } catch (err) {
    console.error('도서관 리뷰 조회 실패:', err);
    res.status(500).json({ message: '도서관 리뷰 조회 중 오류 발생' });
  }
};

// 5. 도서관 리뷰 수정
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
      return res.status(404).json({ message: '도서관 리뷰가 없거나 권한이 없습니다.' });
    }

    res.json({ message: '도서관 리뷰 수정 완료' });
  } catch (err) {
    console.error('도서관 리뷰 수정 실패:', err);
    res.status(500).json({ message: '도서관 리뷰 수정 중 오류 발생' });
  }
};

// 6. 도서관 리뷰 삭제
const deleteLibraryReview = async (req, res) => {
  const user_id = req.user.user_id;
  const review_id = req.params.reviewId;

  try {
    const [result] = await pool.query(
      `DELETE FROM library_review WHERE review_id = ? AND user_id = ?`,
      [review_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '도서관 리뷰가 없거나 권한이 없습니다.' });
    }

    res.json({ message: '도서관 리뷰 삭제 완료' });
  } catch (err) {
    console.error('도서관 리뷰 삭제 실패:', err);
    res.status(500).json({ message: '도서관 리뷰 삭제 중 오류 발생' });
  }
};

// 7. 커뮤니티 글 조회 (사용자 기준)
const getCommunityPostsByUser = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const [posts] = await pool.query(`
      SELECT post_id, title, content, created_at,
             CONCAT('/community/posts/', post_id) AS url
      FROM community_post
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [user_id]);

    res.json(posts);
  } catch (err) {
    console.error('커뮤니티 글 조회 실패:', err);
    res.status(500).json({ message: '커뮤니티 글 조회 중 오류 발생' });
  }
};

// 8. 커뮤니티 글 수정
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
      return res.status(404).json({ message: '게시글이 없거나 권한이 없습니다.' });
    }

    res.json({ message: '게시글 수정 완료' });
  } catch (err) {
    console.error('게시글 수정 실패:', err);
    res.status(500).json({ message: '게시글 수정 중 오류 발생' });
  }
};

// 9. 커뮤니티 글 삭제
const deleteCommunityPost = async (req, res) => {
  const user_id = req.user.user_id;
  const post_id = req.params.postId;

  try {
    const [result] = await pool.query(
      `DELETE FROM community_post WHERE post_id = ? AND user_id = ?`,
      [post_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '게시글이 없거나 권한이 없습니다.' });
    }

    res.json({ message: '게시글 삭제 완료' });
  } catch (err) {
    console.error('게시글 삭제 실패:', err);
    res.status(500).json({ message: '게시글 삭제 중 오류 발생' });
  }
};

// 10. 커뮤니티 댓글 조회 (사용자 기준)
const getCommunityCommentsByUser = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const [comments] = await pool.query(`
      SELECT c.comment_id, c.content, c.created_at, p.title AS post_title,
             CONCAT('/community/posts/', c.post_id) AS post_url
      FROM community_comment c
      JOIN community_post p ON c.post_id = p.post_id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `, [user_id]);

    res.json(comments);
  } catch (err) {
    console.error('커뮤니티 댓글 조회 실패:', err);
    res.status(500).json({ message: '커뮤니티 댓글 조회 중 오류 발생' });
  }
};

// 11. 커뮤니티 댓글 수정
const updateComment = async (req, res) => {
  const user_id = req.user.user_id;
  const comment_id = req.params.commentId;
  const { content } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE community_comment SET content = ? WHERE comment_id = ? AND user_id = ?`,
      [content, comment_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '댓글이 없거나 권한이 없습니다.' });
    }

    res.json({ message: '댓글 수정 완료' });
  } catch (err) {
    console.error('댓글 수정 실패:', err);
    res.status(500).json({ message: '댓글 수정 중 오류 발생' });
  }
};

// 12. 커뮤니티 댓글 삭제
const deleteComment = async (req, res) => {
  const user_id = req.user.user_id;
  const comment_id = req.params.commentId;

  try {
    const [result] = await pool.query(
      `DELETE FROM community_comment WHERE comment_id = ? AND user_id = ?`,
      [comment_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '댓글이 없거나 권한이 없습니다.' });
    }

    res.json({ message: '댓글 삭제 완료' });
  } catch (err) {
    console.error('댓글 삭제 실패:', err);
    res.status(500).json({ message: '댓글 삭제 중 오류 발생' });
  }
};

module.exports = {
  getBookReviewsByUser,
  updateBookReview,
  deleteBookReview,
  getLibraryReviewsByUser,
  updateLibraryReview,
  deleteLibraryReview,
  getCommunityPostsByUser,
  updateCommunityPost,
  deleteCommunityPost,
  getCommunityCommentsByUser,
  updateComment,
  deleteComment,
};