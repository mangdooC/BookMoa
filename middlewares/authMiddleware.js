const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.cookies?.token;  // 쿠키로부터 토큰 읽기

  if (!token) {
    return res.status(401).send('로그인 필요');
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET 설정 안됨');
    return res.status(500).send('서버 설정 오류');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT 검증 실패:', err.message);
    return res.status(401).send('토큰 유효하지 않음');
  }
}

module.exports = authMiddleware;