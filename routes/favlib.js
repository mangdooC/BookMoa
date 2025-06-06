const express = require('express');
const router = express.Router();
const pool = require('../db'); // mysql2 pool 가져왔다고 가정

// 즐겨찾기 도서관 페이지 렌더링
router.get('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    // 즐겨찾기 도서관 목록 가져오기
    const [favorites] = await pool.query(
      `SELECT l.library_id, l.name, l.address, l.website
       FROM favorite_library fl
       JOIN library l ON fl.library_id = l.library_id
       WHERE fl.user_id = ?`,
      [userId]
    );

    res.render('favorites', { favorites });
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 에러');
  }
});

// 즐겨찾기 도서관 추가
router.post('/add', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { libraryId } = req.body;
    if (!userId) return res.status(401).json({ error: '로그인 필요' });

    // 중복 확인
    const [exists] = await pool.query(
      `SELECT * FROM favorite_library WHERE user_id = ? AND library_id = ?`,
      [userId, libraryId]
    );
    if (exists.length > 0) return res.status(400).json({ error: '이미 즐겨찾기에 있음' });

    await pool.query(
      `INSERT INTO favorite_library(user_id, library_id) VALUES (?, ?)`,
      [userId, libraryId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러' });
  }
});

// 즐겨찾기 도서관 삭제
router.delete('/remove', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { libraryId } = req.body;
    if (!userId) return res.status(401).json({ error: '로그인 필요' });

    await pool.query(
      `DELETE FROM favorite_library WHERE user_id = ? AND library_id = ?`,
      [userId, libraryId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러' });
  }
});

module.exports = router;
