const express = require('express');
const router = express.Router();

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

module.exports = router;