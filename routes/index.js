const express = require('express');
const router = express.Router();
const { getTop4Books } = require('../controllers/popularController');

router.get('/', async (req, res) => {
  try {
    const popularBooks = await getTop4Books();
    console.log('[popularBooks]', popularBooks);
    res.render('index', {
      title: '책모아 메인 페이지',
      user: req.session.user,  // 세션 유저 정보 넘기기
      popularBooks
    });
  } catch (err) {
    console.error('[메인페이지 인기 도서 에러]', err);
    res.render('index', {
      title: '책모아 메인 페이지',
      user: req.session.user,
      popularBooks: []
    });
  }
});
 


module.exports = router;

