// 사용자가 도서에 대한 후기를 작성하고 등록하는 기능을 처리하는 컨트롤러
const db = require('../db');

// 리뷰 작성 폼 렌더링
exports.reviewForm = (req, res) => {
    const isbn13 = req.params.isbn13;
    if (!/^\d{13}$/.test(isbn13)) {
        return res.status(400).send('유효하지 않은 ISBN입니다.');
    }
    try {
        res.render('bookReview/write', { isbn13 });
    } catch (error) {
        console.error('폼 렌더링 오류:', error);
        res.status(500).send('폼을 불러올 수 없습니다.');
    }
};

// 리뷰 생성
exports.createReview = async (req, res) => {
  let isbn13 = req.params.isbn13 || '1111111111111';
  const { comment, rating } = req.body;
  const user_id = req.user?.user_id;

  if (!user_id) {
    return res.status(401).send('로그인이 필요합니다.');
  }

  if (!/^\d{13}$/.test(isbn13)) {
    console.warn('잘못된 ISBN 감지됨. 기본값으로 대체합니다.');
    isbn13 = '1111111111111';
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).send('평점은 1부터 5 사이여야 합니다.');
  }

  console.log('요청 데이터:', { isbn13, comment, rating, user_id });

  try {
    const [books] = await db.query('SELECT book_id FROM book WHERE isbn = ?', [isbn13]);

    let book_id;
    if (books.length === 0) {
      const fallbackIsbn = '1111111111111';
      const [result] = await db.query('INSERT INTO book (isbn, title) VALUES (?, ?)', [fallbackIsbn, '제목 없음']);
      book_id = result.insertId;
    } else {
      book_id = books[0].book_id;
    }

    await db.query(
      'INSERT INTO book_review (user_id, book_id, content, rating) VALUES (?, ?, ?, ?)',
      [user_id, book_id, comment, rating]
    );

    res.redirect('/bookReview');
  } catch (error) {
    console.error('리뷰 저장 실패:', { error, isbn13, user_id, comment, rating });
    res.status(500).send('리뷰 등록에 실패했습니다.');
  }
};