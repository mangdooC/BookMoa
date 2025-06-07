const express = require('express');
const router = express.Router();
const db = require('../db');

// 마이페이지에서 내 커뮤니티 글 목록 보여주기기
router.get('/mypage/communityList/:user_id', async (req, res) => {
  const user_id = req.params.user_id;

  try {
    // 유저 기본정보 + 커뮤니티 글 목록 같이 가져오기
    const [userRows] = await db.query('SELECT user_id, nickname FROM user WHERE user_id = ?', [user_id]);
    if (userRows.length === 0) return res.status(404).send('유저없음');

    const [communityPosts] = await db.query(`
      SELECT post_id AS id, title, content, created_at
      FROM community_post
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [user_id]);

    const [communityComments] = await db.query(`
      SELECT comment_id AS id, content, created_at
      FROM community_comment
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [user_id]);

    const user = userRows[0];
    user.communityPosts = communityPosts;
    user.communityComments = communityComments;

    res.render('mypage', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('DB 에러');
  }
});

// 커뮤니티 글 상세보기 + 댓글 목록
router.get('/community/communityList/post/:post_id', async (req, res) => {
  const post_id = req.params.post_id;

  try {
    const [posts] = await db.query(`
      SELECT cp.*, u.nickname AS user_nickname
      FROM community_post cp
      JOIN user u ON cp.user_id = u.user_id
      WHERE cp.post_id = ?
    `, [post_id]);

    if (posts.length === 0) return res.status(404).send('글 없음');

    const post = posts[0];

    const [comments] = await db.query(`
      SELECT cc.comment_id, cc.content, cc.created_at, u.nickname AS user_nickname
      FROM community_comment cc
      JOIN user u ON cc.user_id = u.user_id
      WHERE cc.post_id = ?
      ORDER BY cc.created_at ASC
    `, [post_id]);

    res.render('communityDetail', { post, comments });
  } catch (err) {
    console.error(err);
    res.status(500).send('DB 에러');
  }
});

// 커뮤니티 글 삭제 (마이페이지에서)
router.post('/community/communityList/post/:post_id/delete', async (req, res) => {
  const post_id = req.params.post_id;

  try {
    // 댓글 먼저 삭제, 외래키 CASCADE 없으면 필수
    await db.query('DELETE FROM community_comment WHERE post_id = ?', [post_id]);
    await db.query('DELETE FROM community_post WHERE post_id = ?', [post_id]);

    res.redirect('back');
  } catch (err) {
    console.error(err);
    res.status(500).send('삭제 실패');
  }
});

// 댓글 삭제 (마이페이지에서)
router.post('/community/communityList/comment/:comment_id/delete', async (req, res) => {
  const comment_id = req.params.comment_id;

  try {
    await db.query('DELETE FROM community_comment WHERE comment_id = ?', [comment_id]);
    res.redirect('back');
  } catch (err) {
    console.error(err);
    res.status(500).send('댓글 삭제 실패');
  }
});

module.exports = router;
