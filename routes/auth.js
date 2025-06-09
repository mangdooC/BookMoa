//회원가입, 로그인 처리
require('dotenv').config();
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// 아이디: 소문자+숫자 4~12자
const idRegex = /^[a-z0-9]{4,12}$/;
// 비번: 영문, 숫자, 특수문자 4~12자
const passwordRegex = /^[a-zA-Z0-9!@#$%^&*]{4,12}$/;

// 회원가입 처리 (POST /register)
router.post('/register', async (req, res) => {
  let { user_id, password, nickname, address } = req.body;
  const trimmedAddress = (address || '').trim();

  if (!user_id || !password || !nickname || !trimmedAddress) {
    return res.render('register', { error: '아이디, 비번, 닉네임, 주소 필수' });
  }

  if (!idRegex.test(user_id)) return res.render('register', { error: '아이디는 소문자+숫자 4~12자' });
  if (!passwordRegex.test(password)) return res.render('register', { error: '비밀번호 형식 오류' });

  try {
    nickname = nickname.toLowerCase();

    const [idExistRows] = await pool.query(
      'SELECT user_id FROM user WHERE user_id = ? AND is_deleted = 0',
      [user_id]
    );
    if (idExistRows.length > 0) return res.render('register', { error: '이미 존재하는 아이디' });

    const [nickExistRows] = await pool.query(
      'SELECT nickname FROM user WHERE nickname = ? AND is_deleted = 0',
      [nickname]
    );
    if (nickExistRows.length > 0) return res.render('register', { error: '이미 존재하는 닉네임' });

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO user (user_id, password, nickname, address) VALUES (?, ?, ?, ?)',
      [user_id, hashed, nickname, trimmedAddress]
    );

    // preferred_region에 region_level1만 저장
    await pool.query(
      'INSERT INTO preferred_region (user_id, region_level1) VALUES (?, ?)',
      [user_id, trimmedAddress]
    );

    return res.redirect('/');
  } catch (err) {
    console.error(err);
    return res.render('register', { error: '서버 에러' });
  }
});

// 로그인 처리 (POST /login)
router.post('/login', async (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    if (req.headers['content-type'] === 'application/json') {
      return res.status(400).json({ error: '아이디/비번 누락' });
    }
    return res.render('login', { error: '아이디/비번 누락', user_id });
  }

  try {
    const [users] = await pool.query('SELECT * FROM user WHERE user_id = ? AND is_deleted = 0', [user_id]);
    const user = users[0];

    if (!user) {
      if (req.headers['content-type'] === 'application/json') {
        return res.status(401).json({ error: '존재하지 않는 아이디' });
      }
      return res.render('login', { error: '존재하지 않는 아이디', user_id });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      if (req.headers['content-type'] === 'application/json') {
        return res.status(401).json({ error: '비밀번호 불일치' });
      }
      return res.render('login', { error: '비밀번호 불일치', user_id });
    }

    const token = jwt.sign({ user_id: user.user_id, nickname: user.nickname }, JWT_SECRET);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    if (req.headers['content-type'] === 'application/json') {
      return res.json({ success: true, redirectUrl: '/' });
    }

    return res.redirect('/');
  } catch (err) {
    console.error(err);
    if (req.headers['content-type'] === 'application/json') {
      return res.status(500).json({ error: '서버 에러' });
    }
    return res.render('login', { error: '서버 에러', user_id });
  }
});

module.exports = router;