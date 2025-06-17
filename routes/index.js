const express = require('express');
const router = express.Router();
const { getTop4Books } = require('../controllers/popularController');

router.get('/', async (req, res) => {
  try {
    const popularBooks = await getTop4Books();
    console.log('[popularBooks]', popularBooks);

    // user 정보 있을 때만 넘김, 없으면 null 처리해서 로그인 상태 표시 안 하게
    const user = (req.session && req.session.user) ? req.session.user : (req.user || null);

    res.render('index', {
      title: '책모아 메인 페이지',
      user,
      popularBooks
    });
  } catch (err) {
    console.error('[메인페이지 인기 도서 에러]', err);

    // 에러 나도 user 없으면 null로 처리
    const user = (req.session && req.session.user) ? req.session.user : (req.user || null);

    res.render('index', {
      title: '책모아 메인 페이지',
      user,
      popularBooks: []
    });
  }
});

module.exports = router;
