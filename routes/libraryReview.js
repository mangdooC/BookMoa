const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/libraryReview', async (req, res) => {
  const libname = req.query.name;

  try {
    //  도서관 기본 정보 가져오기
    const [libInfoRows] = await db.query(
      `SELECT * FROM library WHERE name = ?`, [libname]
    );

    if (libInfoRows.length === 0) {
      return res.status(404).send('해당 도서관 정보를 찾을 수 없습니다.');
    }

    const libInfo = libInfoRows[0];
    // 리뷰 조회
    const [libraryReviews] = await db.query(
      `SELECT lr.review_id, lr.rating, library.name, u.nickname AS user_nickname
       FROM library_review lr
       JOIN library ON library.lib_code = lr.library_id
       JOIN user u ON lr.user_id = u.user_id
       WHERE library.name = ?
       ORDER BY lr.created_at DESC`,[libname]);
  

    res.render('library/libraryReview', {
      libraryName: libInfo.name,
      libInfo,
      libraryReviews
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류');
  }
});

module.exports = router;
