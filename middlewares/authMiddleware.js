const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer 토큰

  if (!token) return res.status(401).send('로그인 필요');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).send('토큰 유효하지 않음');
  }
}

module.exports = authMiddleware;