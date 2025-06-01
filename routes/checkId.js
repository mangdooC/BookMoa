const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  try {
    const [results] = await pool.query('SELECT * FROM user WHERE user_id = ?', [user_id]);

    if (results.length > 0) {
      return res.json({ exists: true }); // 이미 있음
    } else {
      return res.json({ exists: false }); // 사용 가능
    }
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;