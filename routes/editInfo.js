const express = require('express');
const router = express.Router();
const { editUserInfo } = require('../controllers/editInfoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.put('/me', authMiddleware, editUserInfo);

module.exports = router;