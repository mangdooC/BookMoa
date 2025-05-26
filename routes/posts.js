const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');

// 게시글 목록 보기
router.get('/', postsController.getAllPosts);

// 게시글 작성
router.post('/', postsController.createPost);

// 게시글 상세 보기
router.get('/:id', postsController.getPostById);

// 게시글 수정
router.put('/:id', postsController.updatePost);

// 게시글 삭제
router.delete('/:id', postsController.deletePost);

module.exports = router;