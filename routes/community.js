const express = require('express');
const router = express.Router();
const db = require('../db');

// 커뮤니티 리스트 페이지
router.get('/communityList', (req, res) => {
  res.render('community/communityList', {
    title: '커뮤니티',
    user: req.session.user  // req.user → req.session.user 로 수정
  });
});

// 글쓰기 페이지
router.get('/write', (req, res) => {
  res.render('community/write', {
    title: '게시글 작성',
    user: req.session.user
  });
});

// 게시글 상세보기 라우터
router.get('/post/:postId', async (req, res) => {
  const postId = Number(req.params.postId);
  console.log("postId:", postId); 

  try {
    const [rows] = await db.query(`
      SELECT 
        p.post_id, 
        p.title, 
        p.content, 
        p.created_at, 
        u.nickname AS author_nickname 
      FROM community_post p
      JOIN user u ON p.user_id = u.user_id
      WHERE p.post_id = ?
    `, [postId]);

    if (rows.length === 0) {
      console.log("게시글 없음, 요청 postId:", postId);
      return res.status(404).send('잘못된 게시글 접근입니다');
    }

    res.render('community/post', { post: rows[0] });
  } catch (error) {
    console.error('게시글 조회 중 에러:', error);
    res.status(500).send('서버 에러');
  }
});

module.exports = router;