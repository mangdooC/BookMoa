const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/libraryReview', async (req, res) => {
  const libname = req.query.name;

  try {
    // 리뷰 조회
    const [libraryReviews] = await db.query(
      `SELECT lr.review_id, lr.rating, library.name, u.nickname AS user_nickname
       FROM library_review lr
       JOIN library ON library.lib_code = lr.library_id
       JOIN user u ON lr.user_id = u.user_id
       WHERE library.name = ?
       ORDER BY lr.created_at DESC`,[libname]);
  

    res.render('library/libraryReview', {
      libraryReviews
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류');
  }
});

module.exports = router;