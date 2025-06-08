const pool = require('../../db');

async function getUserProfile(user_id) {
  const [rows] = await pool.query(
    `SELECT image_url AS profileImage
     FROM image 
     WHERE user_id = ? AND image_type = 'profile' 
     ORDER BY image_id DESC 
     LIMIT 1`,
    [user_id]
  );

  if (rows.length === 0) {
    return { profileImage: '/mypage/images/default.jpg' }; // 기본 이미지
  }

  return { profileImage: rows[0].profileImage || '/mypage/images/default.jpg' };
}

module.exports = getUserProfile;
