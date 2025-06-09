const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // 세션 유저 있으면 바로 통과
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  // 세션 없으면 토큰 검사
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: '토큰 없음' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET 설정 안됨');
    return res.status(500).json({ error: '서버 설정 오류' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT 검증 실패:', err.message);
    return res.status(401).json({ error: '유효하지 않은 토큰' });
  }
}

module.exports = authMiddleware;