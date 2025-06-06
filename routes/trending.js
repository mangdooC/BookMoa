// routes/trending.js
const express = require('express');
const router = express.Router();
const { getTrendingBooks } = require('../controllers/trendingController');

router.get('/trending', async (req, res) => {
  const allBooks = await getTrendingBooks();

  res.render('trending', {
    books: allBooks
  });
});

module.exports = router;
