const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.post('/register', (req, res) => {
  console.log(req.body);
  res.send('register route hit');
});

module.exports = router;