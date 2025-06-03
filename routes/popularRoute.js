// routes/popularRoute.js
const express = require('express');
const router = express.Router();
const { renderPopularPage } = require('../controllers/popularController');

router.get('/popular', renderPopularPage);

module.exports = router;
