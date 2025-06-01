const pool = require('../db'); // MySQL 연결 풀을 가져옵니다.
const bcrypt = require('bcrypt'); // 비밀번호 암호화를 위한 bcrypt 모듈을 가져옵니다.
const jwt = require('jsonwebtoken'); // JWT 토큰 생성을 위한 jsonwebtoken 모듈을 가져옵니다.
require('dotenv').config(); // .env 파일에 저장된 환경변수를 불러옵니다.

const JWT_SECRET = process.env.JWT_SECRET; // 환경변수에서 JWT 비밀 키를 가져옵니다.

// 회원가입

const idRegex = /^[a-zA-Z0-9]{4,12}$/;
const passwordRegex = /^[a-zA-Z0-9]{4,12}$/;

const register = async (req, res) => {
  const { user_id, password, nickname, address } = req.body;

      if (!idRegex.test(user_id)) {
        return res.status(400).json({ error: '아이디는 영어와 숫자 4~12자만 가능합니다.' });
      }

      if (!idRegex.test(password)) {
        return res.status(400).json({ error: '비밀번호는 영어와 숫자 4~12자만 가능합니다.' });
      }

      if (!nickname || nickname.trim() === '') {
        return res.status(400).json({ error: '닉네임을 입력하세요.' });
      }

      try {
        // user_id 중복 체크
        const [userIdRows] = await pool.query('SELECT user_id FROM user WHERE user_id = ? AND is_deleted = 0', [user_id]);
        if (userIdRows.length > 0) {
          return res.status(400).json({ error: '이미 존재하는 아이디입니다.' });
        }

        // nickname 중복 체크
        const [nicknameRows] = await pool.query('SELECT nickname FROM user WHERE nickname = ?', [nickname]);
        if (nicknameRows.length > 0) {
          return res.status(400).json({ error: '이미 존재하는 닉네임입니다.' });
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // DB에 저장
        await pool.query(
          'INSERT INTO user (user_id, password, nickname, address) VALUES (?, ?, ?, ?)',
          [user_id, hashedPassword, nickname, address]
        );

        res.json({ message: '회원가입에 성공하셨습니다.' });

      } catch (error) {
        console.error('회원가입 에러:', error);
        res.status(500).json({ error: error.message || '서버 에러가 발생했습니다.' });
      }
    };

//로그인

const login = async (req, res) => {
const { user_id, password } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: '아이디를 입력하세요.' });
  }

  if (!password) {
    return res.status(400).json({ error: '비밀번호를 입력하세요.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM user WHERE user_id = ?', [user_id]);


    if (rows.length === 0) {
      return res.status(400).json({ error: '등록된 아이디가 없습니다.' });
    }

    const user = rows[0];


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: '로그인에 성공하셨습니다.', token });
    } catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({ error: '서버 에러가 발생했습니다.' });
      }
};

// register 함수와 login 함수를 외부에서 사용할 수 있도록 내보냅니다.
module.exports = { register, login };