// routes/userCommunity.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 마이페이지에서 내가 쓴 커뮤니티 글 목록 조회 + 수정, 삭제 가능하도록 렌더링
router.get('/', async (req, res) => {
  const userId = req.session.user?.user_id;
  if (!userId) return res.status(401).send('로그인이 필요합니다.');

  try {
    const [posts] = await db.query(`
      SELECT post_id, title, content, created_at
      FROM community_post
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);

    res.render('mypage/userCommunity', {
      title: '내 커뮤니티 글',
      user: req.session.user,
      communityPosts: posts
    });
  } catch (err) {
    console.error('내 커뮤니티 글 조회 실패:', err);
    res.status(500).send('내 커뮤니티 글 조회 실패');
  }
});

// 글 수정 처리 (마이페이지 내에서 AJAX 등으로 호출 가능)
router.post('/edit/:postId', async (req, res) => {
  const userId = req.session.user?.user_id;
  const postId = Number(req.params.postId);
  const { title, content } = req.body;
  if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });

  try {
    const [rows] = await db.query('SELECT user_id FROM community_post WHERE post_id = ?', [postId]);
    if (rows.length === 0) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    if (rows[0].user_id !== userId) return res.status(403).json({ error: '수정 권한이 없습니다.' });

    await db.query('UPDATE community_post SET title = ?, content = ? WHERE post_id = ?', [title, content, postId]);
    res.json({ success: true });
  } catch (err) {
    console.error('글 수정 실패:', err);
    res.status(500).json({ error: '글 수정 실패' });
  }
});

// 글 삭제 처리 (마이페이지 내에서 AJAX 등으로 호출 가능)
router.post('/delete/:postId', async (req, res) => {
  const userId = req.session.user?.user_id;
  const postId = Number(req.params.postId);
  if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });

  try {
    const [rows] = await db.query('SELECT user_id FROM community_post WHERE post_id = ?', [postId]);
    if (rows.length === 0) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    if (rows[0].user_id !== userId) return res.status(403).json({ error: '삭제 권한이 없습니다.' });

    await db.query('DELETE FROM community_post WHERE post_id = ?', [postId]);
    res.json({ success: true });
  } catch (err) {
    console.error('글 삭제 실패:', err);
    res.status(500).json({ error: '글 삭제 실패' });
  }
});

module.exports = router;
