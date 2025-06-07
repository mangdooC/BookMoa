// routes/preferred.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // DB 커넥션 풀
const authMiddleware = require('../middlewares/authMiddleware');

// 선호지역 수정 (업데이트 or 인서트)
const updatePreferredArea = async (req, res) => {
  try {
    const userId = req.user.user_id;
    let { region_level1, region_level2, region_level3 } = req.body;

    // null 처리 + trim
    region_level1 = region_level1?.trim() || null;
    region_level2 = region_level2?.trim() || null;
    region_level3 = region_level3?.trim() || null;

    if (![region_level1, region_level2, region_level3].some(Boolean)) {
      // 하나도 없으면 400 에러
      return res.status(400).json({ error: '최소 한 개 이상의 선호지역을 입력하세요.' });
    }

    // 기존 데이터 있나 체크
    const [rows] = await pool.query(
      'SELECT region_id FROM preferred_region WHERE user_id = ?',
      [userId]
    );

    if (rows.length > 0) {
      // 있으면 업데이트
      await pool.query(
        'UPDATE preferred_region SET region_level1 = ?, region_level2 = ?, region_level3 = ? WHERE user_id = ?',
        [region_level1, region_level2, region_level3, userId]
      );
    } else {
      // 없으면 인서트
      await pool.query(
        'INSERT INTO preferred_region (user_id, region_level1, region_level2, region_level3) VALUES (?, ?, ?, ?)',
        [userId, region_level1, region_level2, region_level3]
      );
    }

    // 성공시 메시지 JSON 반환
    return res.json({ message: '선호지역이 성공적으로 업데이트 되었습니다.' });
  } catch (error) {
    console.error('updatePreferredArea 에러:', error);
    return res.status(500).json({ error: '서버 오류 발생' });
  }
};

// 선호지역 조회
const getPreferredAreas = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await pool.query(
      'SELECT region_level1, region_level2, region_level3 FROM preferred_region WHERE user_id = ?',
      [userId]
    );

    let preferred_areas = [];

    if (rows.length > 0) {
      const row = rows[0];
      if (row.region_level1) preferred_areas.push({ region_name: row.region_level1, region_level: 1 });
      if (row.region_level2) preferred_areas.push({ region_name: row.region_level2, region_level: 2 });
      if (row.region_level3) preferred_areas.push({ region_name: row.region_level3, region_level: 3 });
    }

    // 렌더링할 때 preferred_areas 넘겨줌
    return res.render('preferred', {
      preferred_areas,
      message: null,
      error: null,
    });
  } catch (error) {
    console.error('getPreferredAreas 에러:', error);
    return res.status(500).render('preferred', {
      preferred_areas: [],
      error: '서버 오류 발생',
    });
  }
};

// --- preferred 라우터 ---
router.get('/', authMiddleware, getPreferredAreas);
router.post('/update', authMiddleware, updatePreferredArea);

module.exports = router;
