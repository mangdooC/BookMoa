const express = require('express');
const router = express.Router();
const { getTop4Books } = require('../controllers/popularController');

router.get('/', async (req, res) => {
  try {
    const popularBooks = await getTop4Books();
    console.log('[popularBooks]', popularBooks); // ← 확인용 로그
    res.render('index', { popularBooks });
  } catch (err) {
    console.error('[메인페이지 인기 도서 에러]', err);
    res.render('index', { popularBooks: [] });
  }
});
 
module.exports = router;

