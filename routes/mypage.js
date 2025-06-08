const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const pool = require('../db'); // DB 커넥션 추가

const userRouter = require('./user'); // 유저정보 수정
const preferredAreaRouter = require('./preferredArea'); // 선호지역 추가
const favoritesRouter = require('./favorites'); // 즐겨찾는 도서관 
const mypageGetRouter = require('./mypageGet'); // 내가 쓴 글, 댓글 조회
const mypageDeleteRouter = require('./mypageDelete'); // 내가 쓴 글, 댓글 삭제

// 서브 라우터 등록
router.use('/user', userRouter);
router.use('/preferred-area', preferredAreaRouter);
router.use('/favorites', favoritesRouter);
router.use('/user-content', mypageGetRouter);
router.use('/user-content/delete', mypageDeleteRouter);

// 마이페이지 메인: 유저 정보 DB에서 가져와서 렌더링
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.user_id;
    if (!userId) {
      return res.redirect('/login'); // 세션에 유저 정보 없으면 로그인으로
    }

    const [rows] = await pool.query(
      'SELECT user_id, nickname, address FROM user WHERE user_id = ? AND is_deleted = 0',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).send('유저 정보가 없습니다');
    }

    const user = rows[0];

    // 선호지역 가져오기
    const [prefRows] = await pool.query(
    'SELECT region_level1 FROM preferred_region WHERE user_id = ?',
    [userId]
    );

    let preferred_areas = [];

    if (prefRows.length > 0 && prefRows[0].region_level1) {
    preferred_areas.push({
        region_name: prefRows[0].region_level1,
        region_level: 1
    });
    }

    // 즐겨찾는 도서관 가져오기
    const [favRows] = await pool.query(
    'SELECT f.library_id, l.name, l.address FROM favorites f JOIN library l ON f.library_id = l.library_id WHERE f.user_id = ?',
    [userId]
    );

    res.render('mypage', {
    userId: user.user_id,
    nickname: user.nickname,
    preferred_areas,
    userAddress: user.address || '',
    favoriteLibraries: favRows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류 발생');
  }
});

module.exports = router;
