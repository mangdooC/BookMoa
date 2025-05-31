const express = require('express');
const router = express.Router();
const db = require('../db'); // DB 연결 파일

router.get('/', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const query = 'SELECT * FROM user WHERE user_id = ?';
  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      res.json({ available: false }); // 이미 있음
    } else {
      res.json({ available: true }); // 사용 가능
    }
  });
});

module.exports = router;