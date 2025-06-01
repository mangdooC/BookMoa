const express = require('express');
const router = express.Router();
const authMiddleware = require('./authMiddleware');
const preferredRegionController = require('./preferredRegionController');

router.post('/preferredRegion', authMiddleware, preferredRegionController.savePreferredRegion);

module.exports = router;