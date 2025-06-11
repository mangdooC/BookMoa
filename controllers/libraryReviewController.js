const fs = require('fs');
const db = require('../db');
const path = require('path');

// libraryController.js
exports.SrchLibrary = async function (req, res) {
  try {
    const keyword = req.query.keyword;

    let query = `SELECT name, phone, address, homepage FROM library`;
    const params = [];

    if (keyword) {
      query += ` WHERE name LIKE ? OR address LIKE ?`;
      const likeKeyword = `%${keyword}%`;
      params.push(likeKeyword, likeKeyword);
    }

    const [libraries] = await db.query(query, params);
    res.json(libraries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '도서관 목록 조회 실패' });
  }
};
exports.getLibReview = async (req, res) => {
    const libname = req.query.name;
  try {
    const [rows] = await db.query(
      `SELECT lr.review_id, lr.content, lr.rating, library.name, u.nickname AS user_nickname
       FROM library_review lr
       JOIN library ON library.lib_code = lr.library_id
       JOIN user u ON lr.user_id = u.user_id
       WHERE library.name = ?
       ORDER BY lr.created_at DESC`,
      [libname]);
    res.json(rows);
  } catch (err) {
    console.error('도서관 리뷰 조회 실패:', err);
    res.status(500).json({ error: 'DB 오류' });
  }
};

exports.LibreviewForm = (req, res) => {
    const libname = req.params.query;
    if (!/^\d{13}$/.test(libname)) {
        return res.status(400).send('유효하지 않은 도서관입니다.');
    }
    const libraryName = req.query.name;
    res.render('library/writeReview', { libraryName });
};

exports.createLibReview = async (req, res) => {
  const libname = req.query.name;
  const { comment, rating } = req.body;
  const user_id = req.user?.user_id;

  if (!user_id) {
    return res.status(401).send('로그인이 필요합니다.');
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).send('평점은 1부터 5 사이여야 합니다.');
  }

  console.log('요청 데이터:', { libname, comment, rating, user_id });

  try {
    const [libcodes] = await db.query(`SELECT lib_code FROM library WHERE name = ?`, [libname]);

    if (libcodes.length === 0) {
      return res.status(400).send('유효하지 않은 도서관 정보입니다.');
    }

    const library_id = libcodes[0].lib_code;

    await db.query(
      'INSERT INTO library_review (user_id, library_id, content, rating) VALUES (?, ?, ?, ?)',
      [user_id, library_id, comment, rating]
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('리뷰 저장 실패:', { error, user_id, libname, comment, rating });
    res.status(500).send('리뷰 등록에 실패했습니다.');
  }
};
