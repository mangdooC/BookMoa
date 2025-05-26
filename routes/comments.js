const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');

router.get('/:postId', commentsController.getComments);
router.post('/:postId', commentsController.addComment);

module.exports = router;