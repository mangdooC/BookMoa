const express = require('express');
const router = express.Router();
const { checkUserId } = require('../controllers/checkIdController');

router.get('/checkId', checkUserId);

module.exports = router;