const authMiddleware = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');

router.get('/:postId', commentsController.getComments);
router.post('/:postId', authMiddleware, commentsController.addComment);

module.exports = router;