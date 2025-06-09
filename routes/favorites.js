const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middlewares/authMiddleware');

// 즐겨찾기 목록 조회
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [favorite_libraries] = await pool.query(
      `SELECT l.lib_code, l.name, l.address
       FROM favorite_library f
       JOIN library l ON f.lib_code = l.lib_code
       WHERE f.user_id = ?
       ORDER BY l.name`,
      [userId]
    );

    res.json({ favorite_libraries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러' });
  }
});

// 즐겨찾기 추가
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { libCode, libraryName } = req.body;

    let library;

    if (libCode) {
      const [libs] = await pool.query(
        `SELECT lib_code, name, address FROM library WHERE lib_code = ? LIMIT 1`,
        [libCode]
      );
      if (libs.length === 0) return res.status(404).json({ error: '해당 도서관을 찾을 수 없습니다.' });
      library = libs[0];
    } else if (libraryName) {
      const [libs] = await pool.query(
        `SELECT lib_code, name, address FROM library WHERE name LIKE ? LIMIT 1`,
        [`%${libraryName}%`]
      );
      if (libs.length === 0) return res.status(404).json({ error: '해당 도서관을 찾을 수 없습니다.' });
      library = libs[0];
    } else {
      return res.status(400).json({ error: '도서관 정보를 입력하세요.' });
    }

    const [exists] = await pool.query(
      `SELECT * FROM favorite_library WHERE user_id = ? AND lib_code = ?`,
      [userId, library.lib_code]
    );
    if (exists.length > 0) return res.status(400).json({ error: '이미 즐겨찾기에 등록된 도서관입니다.' });

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

// 즐겨찾기 삭제
router.post('/remove', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { libCode } = req.body;

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

// 도서관 이름 검색 (연관검색용)
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json({ results: [] });

    const [results] = await pool.query(
      `SELECT lib_code, name, address FROM library WHERE name LIKE ? ORDER BY name LIMIT 20`,
      [`%${query}%`]
    );

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ results: [], error: '서버 에러' });
  }
});

module.exports = router;