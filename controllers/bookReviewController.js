const axios = require('axios');
const pool = require('../db');

exports.reviewForm = async (req, res) => {
    const isbn13 = req.params.isbn13;
    const API_KEY = process.env.DATA4LIBRARY_API_KEY;

    try {
        // 먼저 book 테이블에서 book_id 조회
        const [books] = await pool.query('SELECT book_id FROM book WHERE isbn = ?', [isbn13]);
        let book_id;
        
        if (books.length === 0) {
            // 책이 없으면 API로 책 정보 조회
            const response = await axios.get('http://data4library.kr/api/srchBooks', {
                params: {
                    authKey: API_KEY,
                    isbn13: isbn13,
                    format: 'json'
                }
            });
            
            const bookInfo = response.data?.response?.docs?.[0]?.doc || {};
            
            // book 테이블에 추가 (title 포함)
            const [result] = await pool.query(
                'INSERT INTO book (isbn, title) VALUES (?, ?)',
                [isbn13, bookInfo.title || '제목 없음']
            );
            book_id = result.insertId;
        } else {
            book_id = books[0].book_id;
        }

        res.render('bookReview', { 
            isbn13,
            book_id
        });
    } catch (error) {
        console.error('폼 렌더링 오류:', error);
        res.status(500).send('폼을 불러올 수 없습니다: ' + error.message);
    }
};
exports.createReview = async (req, res) => {
    const isbn13 = req.params.isbn13;
    const { content, rating } = req.body;
    const user_id = req.user.user_id; // 로그인 정보에서 추출

    try {
        // 1. book_id 조회
        const [books] = await pool.query('SELECT book_id FROM book WHERE isbn = ?', [isbn13]);
        if (books.length === 0) {
            return res.status(400).send('해당 도서를 찾을 수 없습니다.');
        }
        const book_id = books[0].book_id;

        // 2. 리뷰 저장
        await pool.query(
            'INSERT INTO book_review (user_id, book_id, content, rating) VALUES (?, ?, ?, ?)',
            [user_id, book_id, content, rating]
        );

        res.redirect(`/book/${isbn13}`);
    } catch (error) {
        console.error('리뷰 저장 실패:', error);
        res.status(500).send('리뷰 저장에 실패했습니다: ' + error.message);
    }
};