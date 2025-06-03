const fs = require('fs');
const db = require('../db');
const path = require('path');
// posts.json 파일의 경로를 설정합니다.
const postsFile = path.join(__dirname, '../data/posts.json');

/**
 * 게시글 전체 목록을 가져오는 함수 (GET /posts)
 * 파일에서 게시글 목록을 읽어와 클라이언트에게 반환합니다.
 */
exports.getAllPosts = async (req, res) => {
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
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('게시글 전체 조회 실패:', err);
    res.status(500).json({ error: 'DB 오류' });
  }
};

/**
 * 새 게시글을 생성하는 함수 (POST /posts)
 * 요청의 본문에서 제목과 내용을 받아 새 게시글을 생성하고 저장합니다.
 */
exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  const user_id = req.user?.user_id;

  if (!user_id) {
    return res.status(401).json({ error: '로그인이 필요합니다' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO community_post (title, content, user_id, created_at) VALUES (?, ?, ?, NOW())',
      [title, content, user_id]
    );
    const newPost = {
      id: result.insertId,
      title,
      content,
      user_id,
      createdAt: new Date()
    };
    res.status(201).json(newPost);
  } catch (err) {
    console.error('게시글 작성 실패:', err);
    res.status(500).json({ error: 'DB 오류' });
  }
};

/**
 * 특정 ID의 게시글을 조회하는 함수 (GET /posts/:id)
 * 요청 파라미터의 id에 해당하는 게시글을 찾아 반환합니다.
 */
exports.getPostById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM community_post WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: '게시글 없음' });
    res.json(rows[0]);
  } catch (err) {
    console.error('게시글 조회 실패:', err);
    res.status(500).json({ error: 'DB 오류' });
  }
};

/**
 * 게시글을 수정하는 함수 (PUT /posts/:id)
 * 해당 ID의 게시글을 찾아 요청 본문의 내용으로 수정합니다.
 */
exports.updatePost = async (req, res) => {
  const { title, content } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE community_post SET title = ?, content = ?, updated_at = NOW() WHERE id = ?',
      [title, content, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: '게시글 없음' });
    res.json({ id: req.params.id, title, content });
  } catch (err) {
    console.error('게시글 수정 실패:', err);
    res.status(500).json({ error: 'DB 오류' });
  }
};

/**
 * 게시글을 삭제하는 함수 (DELETE /posts/:id)
 * 해당 ID의 게시글을 목록에서 삭제하고 저장합니다.
 */
exports.deletePost = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM community_post WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: '게시글 없음' });
    res.status(204).send(); // No Content
  } catch (err) {
    console.error('게시글 삭제 실패:', err);
    res.status(500).json({ error: 'DB 오류' });
  }
};