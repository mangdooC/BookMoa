const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'dbuser',
  password: 'dbpass',
  database: 'your_db_name',
});

exports.savePreferredRegion = async (req, res) => {
  const user_id = req.user_id;
  const { region_level1, region_level2, region_level3 } = req.body;

  if (!region_level1) {
    return res.status(400).json({ message: 'region_level1은 필수입니다.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT region_id FROM preferred_region WHERE user_id = ?',
      [user_id]
    );

    if (rows.length > 0) {
      // 있으면 UPDATE
      await pool.query(
        `UPDATE preferred_region SET
          region_level1 = ?,
          region_level2 = ?,
          region_level3 = ?
        WHERE user_id = ?`,
        [region_level1, region_level2 || null, region_level3 || null, user_id]
      );
    } else {
      // 없으면 INSERT
      await pool.query(
        `INSERT INTO preferred_region
          (user_id, region_level1, region_level2, region_level3)
         VALUES (?, ?, ?, ?)`,
        [user_id, region_level1, region_level2 || null, region_level3 || null]
      );
    }

    res.json({ message: '선호 지역 저장 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 에러' });
  }
};
