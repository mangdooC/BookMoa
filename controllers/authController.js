const pool = require('./db'); // MySQL 연결 풀을 가져옵니다.
const bcrypt = require('bcrypt'); // 비밀번호 암호화를 위한 bcrypt 모듈을 가져옵니다.
const jwt = require('jsonwebtoken'); // JWT 토큰 생성을 위한 jsonwebtoken 모듈을 가져옵니다.
require('dotenv').config(); // .env 파일에 저장된 환경변수를 불러옵니다.

const JWT_SECRET = process.env.JWT_SECRET; // 환경변수에서 JWT 비밀 키를 가져옵니다.

// 회원가입 기능을 처리하는 함수입니다.

const register = async (req, res) => {
  // 요청으로부터 사용자 정보를 구조 분해 할당으로 받습니다.
  const { name, email, password, nickname, phoneNumber, city, district, town, detail, imageUrl } = req.body;

  try {
    // 이메일 중복 여부를 확인합니다.
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ error: '이미 가입된 이메일입니다.' });
    }

    // 비밀번호를 bcrypt를 이용해 해싱합니다.
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 정보를 데이터베이스에 저장합니다.
    await pool.query(
      `INSERT INTO users (name, email, password, nickname, phoneNumber, city, district, town, detail, imageUrl) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, nickname, phoneNumber, city, district, town, detail, imageUrl]
    );

    // 성공 응답을 보냅니다.
    res.json({ message: '회원가입에 성공하셨습니다.' });
  } catch (error) {
    console.error(error); // 에러를 콘솔에 출력합니다.
    res.status(500).json({ error: '서버 에러가 발생했습니다.' }); // 서버 에러 응답을 보냅니다.
  }
};

/**
 * 로그인 기능을 처리하는 함수입니다.
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 이메일로 사용자 정보를 조회합니다.
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ error: '등록된 이메일이 없습니다.' });
    }

    const user = rows[0];

    // 입력된 비밀번호와 DB에 저장된 해시된 비밀번호를 비교합니다.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    // JWT 토큰을 생성합니다. (유효기간: 1일)
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    // 로그인 성공 응답을 보냅니다.
    res.json({ message: '로그인에 성공하셨습니다.', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 에러가 발생했습니다.' });
  }
};

// register 함수와 login 함수를 외부에서 사용할 수 있도록 내보냅니다.
module.exports = { register, login };
