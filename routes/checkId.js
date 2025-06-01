const express = require('express');
const router = express.Router();
const { checkUserId } = require('../controllers/checkIdController');

router.post('/check-id', checkUserId);

module.exports = router;