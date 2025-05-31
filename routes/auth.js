const express = require('express');
const router = express.Router();
const pool = require('../db');
const authController = require('../controllers/authController');
require('dotenv').config();


router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/checkId', async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ message: 'user_id required' });

        // DB에서 중복 체크 로직
        try {
            const [rows] = await pool.query('SELECT COUNT(*) AS count FROM `user` WHERE user_id = ?', [user_id]);
            const exists = rows[0].count > 0;
            res.json({ exists });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'DB error' });
        }
    });

module.exports = router;