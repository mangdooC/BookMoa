const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// 선호지역 조회
router.get('/', async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [prefRows] = await pool.query(
      'SELECT region_level1, region_level2, region_level3 FROM preferred_region WHERE user_id = ?',
      [userId]
    );

    let region_level1 = null;
    let region_level2 = null;
    let region_level3 = null;

    if (prefRows.length > 0) {
      region_level1 = prefRows[0].region_level1;
      region_level2 = prefRows[0].region_level2;
      region_level3 = prefRows[0].region_level3;
    }

    // fallback: user 주소에서 1레벨만 추출
    if (!region_level1) {
      const [userRows] = await pool.query('SELECT address FROM user WHERE user_id = ?', [userId]);
      if (userRows.length > 0) {
        const address = userRows[0].address || '';
        region_level1 = address.trim().substring(0, 20) || null;
      }
    }

    const preferred_areas = [];
    if (region_level1) preferred_areas.push({ region_name: region_level1, region_level: 1 });
    if (region_level2) preferred_areas.push({ region_name: region_level2, region_level: 2 });
    if (region_level3) preferred_areas.push({ region_name: region_level3, region_level: 3 });

    return res.render('mypage', {
      preferred_areas,
      message: null,
      error: null
    });
  } catch (error) {
    console.error('getPreferredAreas 에러:', error);
    return res.status(500).render('mypage', {
      preferred_areas: [],
      message: null,
      error: '서버 오류 발생'
    });
  }
});

// 선호지역 수정
router.post('/update', async (req, res) => {
  try {
    const userId = req.user.user_id;
    let { region_level1, region_level2, region_level3 } = req.body;

    region_level1 = region_level1?.trim().substring(0, 20) || null;
    region_level2 = region_level2?.trim().substring(0, 20) || null;
    region_level3 = region_level3?.trim().substring(0, 20) || null;

    if (![region_level1, region_level2, region_level3].some(Boolean)) {
      return res.status(400).render('mypage', {
        preferred_areas: [],
        message: null,
        error: '최소 한 개 이상의 선호지역을 입력하세요.'
      });
    }

    const [rows] = await pool.query(
      'SELECT region_id FROM preferred_region WHERE user_id = ?',
      [userId]
    );

    if (rows.length > 0) {
      await pool.query(
        'UPDATE preferred_region SET region_level1 = ?, region_level2 = ?, region_level3 = ? WHERE user_id = ?',
        [region_level1, region_level2, region_level3, userId]
      );
    } else {
      await pool.query(
        'INSERT INTO preferred_region (user_id, region_level1, region_level2, region_level3) VALUES (?, ?, ?, ?)',
        [userId, region_level1, region_level2, region_level3]
      );
    }

    const preferred_areas = [];
    if (region_level1) preferred_areas.push({ region_name: region_level1, region_level: 1 });
    if (region_level2) preferred_areas.push({ region_name: region_level2, region_level: 2 });
    if (region_level3) preferred_areas.push({ region_name: region_level3, region_level: 3 });

    return res.render('mypage', {
      preferred_areas,
      message: '선호지역이 성공적으로 업데이트 되었습니다.',
      error: null
    });
  } catch (error) {
    console.error('updatePreferredArea 에러:', error);
    return res.status(500).render('mypage', {
      preferred_areas: [],
      message: null,
      error: '서버 오류 발생'
    });
  }
});

module.exports = router;
