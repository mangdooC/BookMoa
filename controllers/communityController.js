const pool = require('../db');

async function getLatestPosts() {
  try {
    const [rows] = await pool.query(
      `SELECT post_id, title, created_at FROM community_post ORDER BY created_at DESC LIMIT 5`
    );
    return rows;
  } catch (err) {
    console.error('최신 게시글 조회 실패:', err);
    return [];
  }
}

module.exports = {
  getLatestPosts,
};
