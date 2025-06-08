const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const pool = require('../db');

router.delete('/delete', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // 내가 작성한 댓글 먼저 삭제
    await pool.query('DELETE FROM comment WHERE user_id = ?', [user_id]);

    // 내가 작성한 글 삭제
    await pool.query('DELETE FROM post WHERE user_id = ?', [user_id]);

    res.status(200).send('작성한 글/댓글 삭제 완료');
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류');
  }
});

module.exports = router;
