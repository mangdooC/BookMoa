const express = require('express');
const router = express.Router();
const userContentsController = require('../controllers/userContentsController');

// 유저가 작성한 도서 리뷰, 도서관 리뷰, 커뮤니티 게시글, 커뮤니티 댓글 조회
router.get('/user/:user_id/book-reviews', userContentsController.getBookReviewsByUser);
router.get('/user/:user_id/library-reviews', userContentsController.getLibraryReviewsByUser);
router.get('/user/:user_id/community-posts', userContentsController.getCommunityPostsByUser);
router.get('/user/:user_id/community-comments', userContentsController.getCommunityCommentsByUser);

module.exports = router;