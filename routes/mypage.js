const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const pool = require('../db');

// 마이페이지 라우트
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.user_id;
    if (!userId) return res.redirect('/login');

    // 유저 기본 정보 + 프로필 이미지
    const [userRows] = await pool.query(
      `SELECT u.user_id, u.nickname, u.address, 
              COALESCE(i.image_url, '/mypage/images/default.jpg') AS profile_image
         FROM user u
    LEFT JOIN image i ON u.user_id = i.user_id AND i.image_type = 'profile'
        WHERE u.user_id = ? AND u.is_deleted = 0
        LIMIT 1`,
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: '유저 정보 없음' });
    }

    const user = userRows[0];

    // 선호 지역
    const [regionRows] = await pool.query(
      `SELECT region_level1, region_level2, region_level3 
         FROM preferred_region 
        WHERE user_id = ?
        ORDER BY region_id DESC
        LIMIT 1`,
      [userId]
    );

    const preferred_areas = [];
    if (regionRows.length > 0) {
      const { region_level1, region_level2, region_level3 } = regionRows[0];
      if (region_level1) preferred_areas.push({ region_name: region_level1, region_level: 1 });
      if (region_level2) preferred_areas.push({ region_name: region_level2, region_level: 2 });
      if (region_level3) preferred_areas.push({ region_name: region_level3, region_level: 3 });
    } else if (user.address) {
      const firstRegion = user.address.trim().split(' ')[0];
      if (firstRegion) preferred_areas.push({ region_name: firstRegion, region_level: 1 });
    }

    // 즐겨찾는 도서관
    const [favLibs] = await pool.query(
      `SELECT l.lib_code, l.name, l.address, l.homepage 
         FROM favorite_library f
         JOIN library l ON f.lib_code = l.lib_code
        WHERE f.user_id = ?`,
      [userId]
    );

    // 내가 남긴 도서 리뷰
    const [bookReviews] = await pool.query(
      `SELECT r.review_id, r.content, r.rating, r.created_at, b.title AS book_title
         FROM book_review r
         JOIN book b ON r.book_id = b.book_id
        WHERE r.user_id = ?
     ORDER BY r.created_at DESC`,
      [userId]
    );

    // 내가 남긴 도서관 리뷰
    const [libraryReviews] = await pool.query(
      `SELECT r.review_id, r.content, r.rating, r.created_at, l.name AS library_name
         FROM library_review r
         JOIN library l ON r.library_id = l.lib_code
        WHERE r.user_id = ?
     ORDER BY r.created_at DESC`,
      [userId]
    );

    // 내가 쓴 커뮤니티 글
    const [posts] = await pool.query(
      `SELECT post_id, title, created_at, view_count 
         FROM community_post 
        WHERE user_id = ?
     ORDER BY created_at DESC`,
      [userId]
    );

    // 내가 쓴 커뮤니티 댓글
    const [comments] = await pool.query(
      `SELECT c.comment_id, c.content, c.created_at, p.title AS post_title
         FROM community_comment c
         JOIN community_post p ON c.post_id = p.post_id
        WHERE c.user_id = ?
     ORDER BY c.created_at DESC`,
      [userId]
    );

    // 렌더링에 넘기기
    res.render('mypage', {
      user,
      preferred_areas,
      favorite_libraries: favLibs,
      posts,
      comments,
      book_reviews: bookReviews,
      library_reviews: libraryReviews
    });

  } catch (err) {
    console.error('마이페이지 오류:', err);
    res.status(500).json({ error: '서버 에러' });
  }
});

module.exports = router;
