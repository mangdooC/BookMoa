const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middlewares/authMiddleware');

const updatePreferredArea = async (req, res) => {
  try {
    const userId = req.user.user_id;
    let { region_level1, region_level2, region_level3 } = req.body;
    region_level1 = region_level1?.trim() || null;
    region_level2 = region_level2?.trim() || null;
    region_level3 = region_level3?.trim() || null;

    if (![region_level1, region_level2, region_level3].some(Boolean)) {
      return res.status(400).render('preferred', {
        preferred_areas: [],
        error: '최소 한 개 이상의 선호지역을 입력하세요.',
      });
    }

    const [rows] = await pool.query(
      'SELECT * FROM preferred_region WHERE user_id = ?',
      [userId]
    );

    if (rows.length > 0) {
      await pool.query(
        `UPDATE preferred_region SET region_level1 = ?, region_level2 = ?, region_level3 = ? WHERE user_id = ?`,
        [region_level1, region_level2, region_level3, userId]
      );
    } else {
      await pool.query(
        `INSERT INTO preferred_region (user_id, region_level1, region_level2, region_level3) VALUES (?, ?, ?, ?)`,
        [userId, region_level1, region_level2, region_level3]
      );
    }

    const updatedPreferredAreas = [];
    if (region_level1) updatedPreferredAreas.push({ region_name: region_level1, region_level: 1 });
    if (region_level2) updatedPreferredAreas.push({ region_name: region_level2, region_level: 2 });
    if (region_level3) updatedPreferredAreas.push({ region_name: region_level3, region_level: 3 });

    return res.render('preferred', {
      preferred_areas: updatedPreferredAreas,
      message: '선호지역이 성공적으로 업데이트 되었습니다.',
    });
  } catch (error) {
    console.error('updatePreferredArea 에러:', error);
    return res.status(500).render('preferred', {
      preferred_areas: [],
      error: '서버 오류 발생',
    });
  }
};

const getPreferredAreas = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [rows] = await pool.query(
      `SELECT region_level1, region_level2, region_level3 FROM preferred_region WHERE user_id = ?`,
      [userId]
    );

    const preferred_areas = [];
    if (rows.length > 0) {
      const row = rows[0];
      if (row.region_level1) preferred_areas.push({ region_name: row.region_level1, region_level: 1 });
      if (row.region_level2) preferred_areas.push({ region_name: row.region_level2, region_level: 2 });
      if (row.region_level3) preferred_areas.push({ region_name: row.region_level3, region_level: 3 });
    }

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
