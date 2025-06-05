require('dotenv').config();
const pool = require('../db'); // MySQL 연결 풀
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET 환경변수 설정 안됨');
  process.exit(1);
}

// 정규식
const idRegex = /^[a-zA-Z0-9]{4,12}$/;
const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{4,12}$/;

// 회원가입 컨트롤러
const register = async (req, res) => {
  const { user_id, password, nickname, address } = req.body;

  // 입력값 존재 여부 검사
  if (!user_id || !password || !nickname) {
    return res.status(400).json({ error: '아이디, 비밀번호, 닉네임은 필수입니다.' });
  }

  // 유효성 검사
  if (!idRegex.test(user_id)) {
    return res.status(400).json({ error: '아이디는 영어와 숫자 4~12자만 가능합니다.' });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: '비밀번호는 영어, 숫자, 특수문자 포함 4~12자여야 합니다.' });
  }

  if (nickname.trim() === '') {
    return res.status(400).json({ error: '닉네임을 입력하세요.' });
  }

  try {
    // 아이디 중복 체크 (삭제된 계정 제외)
    const [userIdRows] = await pool.query(
      'SELECT user_id FROM user WHERE user_id = ? AND is_deleted = 0',
      [user_id]
    );
    if (userIdRows.length > 0) {
      return res.status(400).json({ error: '이미 존재하는 아이디입니다.' });
    }

    // 닉네임 중복 체크 (삭제된 계정 제외)
    const [nicknameRows] = await pool.query(
      'SELECT nickname FROM user WHERE nickname = ? AND is_deleted = 0',
      [nickname]
    );
    if (nicknameRows.length > 0) {
      return res.status(400).json({ error: '이미 존재하는 닉네임입니다.' });
    }

    // 비번 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // DB에 저장
    await pool.query(
      'INSERT INTO user (user_id, password, nickname, address) VALUES (?, ?, ?, ?)',
      [user_id, hashedPassword, nickname, address || null]
    );

    // 토큰 생성
    const token = jwt.sign({ user_id, nickname }, JWT_SECRET, {
      expiresIn: '2h', // 유효시간 필요에 따라 조절
    });

    // 응답
    res.json({ message: '회원가입에 성공하셨습니다.', token });
  } catch (error) {
    console.error('회원가입 에러:', error);
    res.status(500).json({ error: '서버 에러가 발생했습니다.' });
  }
};

// 로그인
const login = async (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: '아이디를 입력하세요.' });
  }

  if (!password) {
    return res.status(400).json({ error: '비밀번호를 입력하세요.' });
  }

  try {
    // 삭제된 계정 로그인 방지
    const [rows] = await pool.query('SELECT * FROM user WHERE user_id = ? AND is_deleted = 0', [user_id]);

    if (rows.length === 0) {
      return res.status(400).json({ error: '등록된 아이디가 없습니다.' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign({ user_id: user.user_id, nickname: user.nickname  }, JWT_SECRET, { expiresIn: '1d' });
	
	//JWT를 쿠키로 클라이언트에 저장
	res.cookie('token', token, {
	  httpOnly: true,
 	 secure: process.env.NODE_ENV === 'production', // HTTPS 환경에서만
 	 maxAge: 86400000 // 1일
	});

    res.json({ message: '로그인에 성공하셨습니다.', token, user_id: user.user_id });
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ error: '서버 에러가 발생했습니다.' });
  }
};

// 토큰으로 유저 정보 가져오기
const getUserInfo = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: '인증 토큰이 없습니다.' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: '토큰 형식이 올바르지 않습니다.' });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const user_id = decoded.user_id;

    // 유저 기본 정보 가져오기
    const [userRows] = await pool.query(
      'SELECT user_id, nickname, address FROM user WHERE user_id = ? AND is_deleted = 0',
      [user_id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 프로필 이미지 가져오기 (가장 최신 프로필 이미지)
    const [imgRows] = await pool.query(
      "SELECT image_url FROM image WHERE user_id = ? AND image_type = 'profile' ORDER BY image_id DESC LIMIT 1",
      [user_id]
    );

    const profile_image = imgRows[0]?.image_url || null;

    res.json({
      user_id: userRows[0].user_id,
      nickname: userRows[0].nickname,
      address: userRows[0].address,
      profile_image,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 에러가 발생했습니다.' });
  }
};

module.exports = { register, login, getUserInfo };