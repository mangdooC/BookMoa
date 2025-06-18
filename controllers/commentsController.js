// 커뮤니티 게시글에 대한 댓글 조회 및 작성 기능을 처리하는 컨트롤러
const db = require('../db');

// GET /comments/:postId
// 특정 게시글(postId)에 대한 모든 댓글을 조회
exports.getComments = async (req, res) => {
  const postId = parseInt(req.params.postId);

  try {
    const [comments] = await db.query(`
      SELECT c.comment_id AS id, c.post_id, u.nickname AS author, c.content, c.created_at
      FROM community_comment c
      JOIN user u ON c.user_id = u.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [postId]);

    res.json(comments);
  } catch (err) {
    console.error('댓글 조회 실패:', err);
    res.status(500).json({ error: '댓글 조회 중 오류 발생' });
  }
};

// POST /comments/:postId
// 특정 게시글에 댓글을 추가 (로그인된 사용자 기준)
exports.addComment = async (req, res) => {
  const postId = parseInt(req.params.postId);
  const userId = req.user?.user_id;
  const { content } = req.body;

  console.log("댓글 작성 요청:", {
    postId,
    user: req.user,
    content
  });

  if (!userId) {
    return res.status(401).json({ error: '로그인 필요' });
  }

  try {
    await db.query(`
      INSERT INTO community_comment (post_id, user_id, content, created_at)
      VALUES (?, ?, ?, NOW())
    `, [postId, userId, content]);

    const [newComment] = await db.query(`
      SELECT c.comment_id AS id, c.post_id, u.nickname AS author, c.content, c.created_at
      FROM community_comment c
      JOIN user u ON c.user_id = u.user_id
      WHERE c.post_id = ? AND c.user_id = ?
      ORDER BY c.created_at DESC
      LIMIT 1
    `, [postId, userId]);

    res.status(201).json(newComment[0]);
  } catch (err) {
    console.error('댓글 작성 실패:', err.message, err.code);
    res.status(500).json({ error: '댓글 저장 중 오류 발생' });
  }
};