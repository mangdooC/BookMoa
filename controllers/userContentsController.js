const pool = require('../db');

// 유저가 작성한 도서 리뷰 조회
exports.getBookReviewsByUser = async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const [rows] = await pool.query(
      `SELECT review_id, book_id, content, rating, created_at 
       FROM book_review WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러' });
  }
};

// 유저가 작성한 도서관 리뷰 조회
exports.getLibraryReviewsByUser = async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const [rows] = await pool.query(
      `SELECT review_id, library_id, content, rating, created_at 
       FROM library_review WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러' });
  }
};

// 유저가 작성한 커뮤니티 게시글 조회
exports.getCommunityPostsByUser = async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const [rows] = await pool.query(
      `SELECT post_id, title, content, view_count, created_at 
       FROM community_post WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러' });
  }
};

// 유저가 작성한 커뮤니티 댓글 조회
exports.getCommunityCommentsByUser = async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const [rows] = await pool.query(
      `SELECT comment_id, post_id, content, created_at 
       FROM community_comment WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러' });
  }
};
