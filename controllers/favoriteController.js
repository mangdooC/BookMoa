const pool = require('../db');

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [rows] = await pool.query(
      `SELECT l.library_id, l.name, l.address
       FROM favorite_library f
       JOIN library l ON f.library_id = l.library_id
       WHERE f.user_id = ?`, [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '즐겨찾기 목록 조회 실패' });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { library_name } = req.body;

    if (!library_name) return res.status(400).json({ message: '도서관 이름이 필요합니다.' });

    // 도서관 이름으로 ID 찾기
    const [libs] = await pool.query('SELECT library_id FROM library WHERE name = ?', [library_name]);
    if (libs.length === 0) return res.status(404).json({ message: '해당 도서관이 없습니다.' });

    const libraryId = libs[0].library_id;

    // 중복 체크
    const [exists] = await pool.query('SELECT * FROM favorite_library WHERE user_id = ? AND library_id = ?', [userId, libraryId]);
    if (exists.length > 0) return res.status(409).json({ message: '이미 즐겨찾기에 등록되어 있습니다.' });

    await pool.query('INSERT INTO favorite_library (user_id, library_id) VALUES (?, ?)', [userId, libraryId]);
    res.status(201).json({ message: '즐겨찾기 추가 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '즐겨찾기 추가 실패' });
  }
};

exports.deleteFavorite = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { library_id } = req.params;

    await pool.query('DELETE FROM favorite_library WHERE user_id = ? AND library_id = ?', [userId, library_id]);
    res.json({ message: '즐겨찾기 삭제 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '즐겨찾기 삭제 실패' });
  }
};