const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'bookmoa'
});

// 리뷰 작성 폼 렌더링
exports.reviewForm = (req, res) => {
    const isbn13 = req.params.isbn13;
    try {
        res.render('bookReview', { isbn13 });
    } catch (error) {
        console.error('폼 렌더링 오류:', error);
        res.status(500).send('폼을 불러올 수 없습니다.');
    }
};

// 리뷰 생성
exports.createReview = async (req, res) => {
  const isbn13 = req.params.isbn13;
  const { comment } = req.body;
  const user_id = req.user?.user_id;

  if (!user_id) {
    return res.status(401).send('로그인이 필요합니다.');
  }
  
  try {
    // 1. 먼저 book_id 조회
    const [books] = await pool.query('SELECT book_id FROM book WHERE isbn = ?', [isbn13]);
    if (books.length === 0) {
      // 책이 없으면 먼저 book 테이블에 추가
      const [result] = await pool.query(
        'INSERT INTO book (isbn) VALUES (?)',
        [isbn13]
      );
      var book_id = result.insertId;
    } else {
      var book_id = books[0].book_id;
    }

    // 2. 리뷰 저장
    await pool.query(
      'INSERT INTO book_review (user_id, book_id, content) VALUES (?, ?, ?)',
      [user_id, book_id, comment]
    );

    res.redirect(`/book/${isbn13}`);
  } catch (error) {
    console.error('리뷰 저장 실패:', error);
    res.status(500).send('리뷰 저장에 실패했습니다.');
  }
};