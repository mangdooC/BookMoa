const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /mypage/favorites/add 즐겨찾기 도서관 추가
router.post('/add', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { libraryName } = req.body;
    if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });
    if (!libraryName) return res.status(400).json({ error: '도서관 이름을 입력하세요.' });

    // 이름으로 도서관 정보 찾기
    const [libs] = await pool.query(
      `SELECT lib_code, name, address FROM library WHERE name = ? LIMIT 1`,
      [libraryName]
    );
    if (libs.length === 0) return res.status(404).json({ error: '해당 도서관을 찾을 수 없습니다.' });

    const library = libs[0];

    // 중복 체크
    const [exists] = await pool.query(
      `SELECT * FROM favorite_library WHERE user_id = ? AND lib_code = ?`,
      [userId, library.lib_code]
    );
    if (exists.length > 0) return res.status(400).json({ error: '이미 즐겨찾기에 등록된 도서관입니다.' });

    // 즐겨찾기 추가
    await pool.query(
      `INSERT INTO favorite_library(user_id, lib_code) VALUES (?, ?)`,
      [userId, library.lib_code]
    );

    res.json({ success: true, library });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러' });
  }
});

// DELETE /mypage/favorites/remove 즐겨찾기 도서관 삭제
router.delete('/remove', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { libCode } = req.body; // 변수명도 맞춰서 바꿈
    if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });
    if (!libCode) return res.status(400).json({ error: '도서관 ID를 입력하세요.' });

    await pool.query(
      `DELETE FROM favorite_library WHERE user_id = ? AND lib_code = ?`,
      [userId, libCode]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러' });
  }
});

module.exports = router;
