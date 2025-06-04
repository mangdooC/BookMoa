const db = require('../db');

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
  const { comment, rating } = req.body;
  const user_id = req.user?.user_id;

  if (!user_id) {
    return res.status(401).send('로그인이 필요합니다.');
  }

  console.log('요청 데이터:', { isbn13, comment, rating, user_id });

  try {
    const [books] = await db.query('SELECT book_id FROM book WHERE isbn = ?', [isbn13]);

    let book_id;
    if (books.length === 0) {
      // 임시 title을 설정하거나 title 없이 저장 가능한 테이블 구조인지 확인해야 함
      const [result] = await db.query('INSERT INTO book (isbn, title) VALUES (?, ?)', [isbn13, '제목 없음']);
      book_id = result.insertId;
    } else {
      book_id = books[0].book_id;
    }

    await db.query(
      'INSERT INTO book_review (user_id, book_id, content, rating) VALUES (?, ?, ?, ?)',
      [user_id, book_id, comment, rating]
    );

    res.redirect(`/book/${isbn13}`);
  } catch (error) {
    console.error('리뷰 저장 실패:', error); // 상세 로그 확인
    res.status(500).send('리뷰 등록에 실패했습니다.');
  }
};