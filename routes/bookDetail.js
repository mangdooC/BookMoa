const express = require('express');
const router = express.Router();
const bookDetailController = require('../controllers/bookDetailController');

router.get('/book/detail', bookDetailController.bookDetail);

router.get('/book/:isbn13', bookDetailController.bookDetail);
router.post('/book/:isbn13', (req, res) => {
  const { lat, lng } = req.body;
  const { isbn13 } = req.params;

  // 좌표 저장
  req.session.lat = lat;
  req.session.lng = lng;

  res.json({ redirect: `/book/${isbn13}` });
});

router.get('/book/:isbn13/review/new', bookDetailController.reviewForm);
router.post('/book/:isbn13/review', bookDetailController.createReview);

module.exports = router;