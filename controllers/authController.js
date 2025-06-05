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
