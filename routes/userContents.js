const express = require('express');
const router = express.Router();
const userContentsController = require('../controllers/userContentsController');
const authenticateJWT = require('../middlewares/authMiddleware');

// 도서 리뷰
router.get('/book-reviews', authenticateJWT, userContentsController.getBookReviewsByUser);
router.patch('/book-reviews/:reviewId', authenticateJWT, userContentsController.updateBookReview);
router.delete('/book-reviews/:reviewId', authenticateJWT, userContentsController.deleteBookReview);

// // 도서관 리뷰
// router.get('/library-reviews', authenticateJWT, userContentsController.getLibraryReviewsByUser);
// router.patch('/library-reviews/:reviewId', authenticateJWT, userContentsController.updateLibraryReview);
// router.delete('/library-reviews/:reviewId', authenticateJWT, userContentsController.deleteLibraryReview);

// 커뮤니티 글 조회
router.get('/community-posts', authenticateJWT, userContentsController.getCommunityPostsByUser);
router.patch('/community-posts/:postId', authenticateJWT, userContentsController.updateCommunityPost);
router.delete('/community-posts/:postId', authenticateJWT, userContentsController.deleteCommunityPost);

// 커뮤니티 댓글
router.get('/community-comments', authenticateJWT, userContentsController.getCommunityCommentsByUser);
router.patch('/community-comments/:commentId', authenticateJWT, userContentsController.updateComment);
router.delete('/community-comments/:commentId', authenticateJWT, userContentsController.deleteComment);

module.exports = router;