require('dotenv').config();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET 환경변수 설정 안됨');
  process.exit(1);
}

const idRegex = /^[a-zA-Z0-9]{4,12}$/;
const passwordRegex = /^[a-zA-Z0-9!@#$%^&*]{4,12}$/;

// 회원가입
const register = async (req, res) => {
  const { user_id, password, nickname, address } = req.body;
  if (!user_id || !password || !nickname || !address?.trim()) {
    return res.status(400).json({ error: '아이디, 비번, 닉네임, 주소 필수' });
  }
  if (!idRegex.test(user_id)) return res.status(400).json({ error: '아이디 형식 오류' });
  if (!passwordRegex.test(password)) return res.status(400).json({ error: '비밀번호 형식 오류' });

  try {
    const [[idExist]] = await pool.query(
      'SELECT user_id FROM user WHERE user_id = ? AND is_deleted = 0',
      [user_id]
    );
    if (idExist) return res.status(400).json({ error: '이미 존재하는 아이디' });

    const [[nickExist]] = await pool.query(
      'SELECT nickname FROM user WHERE nickname = ? AND is_deleted = 0',
      [nickname]
    );
    if (nickExist) return res.status(400).json({ error: '이미 존재하는 닉네임' });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO user (user_id, password, nickname, address) VALUES (?, ?, ?, ?)',
      [user_id, hashed, nickname, address]
    );

    const token = jwt.sign({ user_id, nickname }, JWT_SECRET);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      // 세션 쿠키
    });

    res.json({ message: '회원가입 성공' });
  } catch (err) {
    console.error('회원가입 에러:', err);
    res.status(500).json({ error: '서버 에러' });
  }
};

// 로그인
const login = async (req, res) => {
  const { user_id, password } = req.body;
  if (!user_id || !password) return res.status(400).json({ error: '아이디/비번 누락' });

  try {
    const [users] = await pool.query('SELECT * FROM user WHERE user_id = ? AND is_deleted = 0', [user_id]);
    const user = users[0];
    if (!user) return res.status(400).json({ error: '존재하지 않는 아이디' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: '비밀번호 불일치' });

    const token = jwt.sign({ user_id: user.user_id, nickname: user.nickname }, JWT_SECRET);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      // 세션 쿠키
    });

    res.json({ message: '로그인 성공', user_id: user.user_id });
  } catch (err) {
    console.error('로그인 에러:', err);
    res.status(500).json({ error: '서버 에러' });
  }
};

// 로그아웃
const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: '로그아웃 실패' });
    }
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.json({ message: '로그아웃 완료' });
  });
};


// 마이페이지 유저 정보
const getUserInfo = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: '로그인 안 됨' });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: '토큰 유효하지 않음' });
    }

    const { user_id } = decoded;
    const [users] = await pool.query(
      'SELECT user_id, nickname, address FROM user WHERE user_id = ? AND is_deleted = 0',
      [user_id]
    );
    const user = users[0];
    if (!user) return res.status(404).json({ error: '유저 없음' });

    const [imgRows] = await pool.query(
      "SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile' ORDER BY image_id DESC LIMIT 1",
      [user_id]
    );
    const profile_image = imgRows[0]?.image_url || null;

    res.json({
      user_id: user.user_id,
      nickname: user.nickname,
      address: user.address,
      profile_image,
    });
  } catch (err) {
    console.error('getUserInfo 에러:', err);
    res.status(500).json({ error: '서버 에러' });
  }
};

module.exports = { register, login, logout, getUserInfo };