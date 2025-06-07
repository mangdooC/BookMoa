const express = require('express');
const router = express.Router();
const db = require('../db');

// 마이페이지에서 내 도서관 리뷰 목록 보여주기
router.get('/mypage/:user_id', async (req, res) => {
  const user_id = req.params.user_id;

  try {
    // 유저 기본정보 (닉네임 등) + 리뷰 목록 같이 가져오기
    const [userRows] = await db.query('SELECT user_id, nickname FROM user WHERE user_id = ?', [user_id]);
    if (userRows.length === 0) return res.status(404).send('유저없음');

    const [libraryReviews] = await db.query(`
      SELECT lr.review_id, lr.rating, lr.content, l.library_name
      FROM library_review lr
      JOIN library l ON lr.library_id = l.library_id
      WHERE lr.user_id = ?
      ORDER BY lr.created_at DESC
    `, [user_id]);

    const user = userRows[0];
    user.libraryReviews = libraryReviews;

    res.render('mypage', { user }); 
  } catch (err) {
    console.error(err);
    res.status(500).send('DB 에러');
  }
});

// 리뷰 상세보기
router.get('/libraryReview/post/:review_id', async (req, res) => {
  const review_id = req.params.review_id;

  try {
    const [rows] = await db.query(`
      SELECT lr.*, l.library_name, u.nickname AS user_nickname
      FROM library_review lr
      JOIN library l ON lr.library_id = l.library_id
      JOIN user u ON lr.user_id = u.user_id
      WHERE lr.review_id = ?
    `, [review_id]);

    if (rows.length === 0) return res.status(404).send('리뷰 없음');

    res.render('libraryReviewDetail', { review: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('DB 에러');
  }
});

// 리뷰 삭제 (마이페이지에서)
router.post('/userLibraryReview/:review_id/delete', async (req, res) => {
  const review_id = req.params.review_id;

  try {
    await db.query('DELETE FROM library_review WHERE review_id = ?', [review_id]);
    res.redirect('back');
  } catch (err) {
    console.error(err);
    res.status(500).send('삭제 실패');
  }
});

module.exports = router;
