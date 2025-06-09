const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const pool = require('../db');

router.delete('/:type/:id', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { type, id } = req.params;

    // 허용 타입 확장
    if (!['post', 'comment', 'bookReview', 'libraryReview'].includes(type)) {
      return res.status(400).json({ error: '유효하지 않은 삭제 타입입니다' });
    }

    if (type === 'post') {
      // 게시글에 댓글 있으면 삭제 불가
      const [comments] = await pool.query(
        'SELECT 1 FROM community_comment WHERE post_id = ? LIMIT 1',
        [id]
      );
      if (comments.length > 0) {
        return res.status(400).json({ error: '댓글이 있는 글은 삭제할 수 없습니다.' });
      }
      // 게시글 삭제
      const [result] = await pool.query(
        'DELETE FROM community_post WHERE post_id = ? AND user_id = ?',
        [id, user_id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '삭제할 항목이 없거나 권한이 없습니다' });
      }
      return res.status(200).json({ message: 'post 삭제 완료' });

    } else if (type === 'comment') {
      // 댓글 삭제
      const [result] = await pool.query(
        'DELETE FROM community_comment WHERE comment_id = ? AND user_id = ?',
        [id, user_id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '삭제할 항목이 없거나 권한이 없습니다' });
      }
      return res.status(200).json({ message: 'comment 삭제 완료' });

    } else if (type === 'bookReview') {
      // 책 리뷰 삭제
      const [result] = await pool.query(
        'DELETE FROM book_review WHERE review_id = ? AND user_id = ?',
        [id, user_id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '삭제할 항목이 없거나 권한이 없습니다' });
      }
      return res.status(200).json({ message: 'bookReview 삭제 완료' });

    } else if (type === 'libraryReview') {
      // 도서관 리뷰 삭제
      const [result] = await pool.query(
        'DELETE FROM library_review WHERE review_id = ? AND user_id = ?',
        [id, user_id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '삭제할 항목이 없거나 권한이 없습니다' });
      }
      return res.status(200).json({ message: 'libraryReview 삭제 완료' });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
