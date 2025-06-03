const express = require('express');
const router = express.Router();
const { checkUserId } = require('../controllers/checkIdController');

router.get('/', checkUserId);

module.exports = router;