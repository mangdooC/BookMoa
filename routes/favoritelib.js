const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middlewares/authMiddleware'); // JWT 인증 미들웨어

router.post('/', authMiddleware, favoriteController.addFavorite);
router.get('/', authMiddleware, favoriteController.getFavorites);
router.delete('/:library_id', authMiddleware, favoriteController.deleteFavorite);

module.exports = router;
