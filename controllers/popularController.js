// controllers/popularController.js
const axios = require('axios');
require('dotenv').config();

const parseJson = async (data) => {
  return JSON.parse(data); // 혹은 axios가 .data로 반환한 객체라면 생략 가능
};

// 도서관 정보나루 API 호출
const getPopularBooks = async () => {

  const url =
    `http://data4library.kr/api/loanItemSrch` +
    `?authKey=${process.env.DATA4LIBRARY_API_KEY}` +
    `&startDt=2025-05-01` +
    `&endDt=2025-05-31` +
    `&format=json` +
    `&pageNo=1&pageSize=50`;


  console.log('[API 키]', process.env.DATA4LIBRARY_API_KEY);
  console.log('[요청 URL]', url); 

  try {
	   const response = await axios.get(url);
    console.log('[API 응답 JSON]', response.data); 
    
    const docs = response.data?.response?.docs; // now docs is already an Array

    if (!docs || docs.length === 0) {
      console.warn('[경고] 인기 도서 결과 없음 또는 docs 미존재');
      return [];
    }

    const books = docs.map(item => item.doc).map(book => ({
      title: book.bookname,
      imageUrl: book.bookImageURL,
      isbn13: book.isbn13,
      author: book.authors,
      publisher: book.publisher
    }));

    return books;
  } catch (err) {
    console.error('[API 호출 또는 파싱 실패]', err);
    return [];
  }
};

// 메인 페이지용 상위 4권만
exports.getTop4Books = async () => {
  const books = await getPopularBooks();
  return books.slice(0, 4);
};

exports.getTopBooks = async () => {
  return await getPopularBooks(); // 전체 목록
};

// /popular 페이지 렌더링
exports.renderPopularPage = async (req, res) => {
  try {
    const pageNo = parseInt(req.query.pageNo, 10) || 1;
    const pageSize = 10;

    const allBooks = await getPopularBooks(); // 전체 도서 목록
    const totalPages = Math.ceil(allBooks.length / pageSize);
    const paginatedBooks = allBooks.slice((pageNo - 1) * pageSize, pageNo * pageSize);

    res.render('popular', {
      books: paginatedBooks,
      pageNo,
      totalPages
    });
  } catch (err) {
    console.error('인기도서 페이지 오류:', err);
    res.status(500).send('인기도서를 불러오는 중 오류 발생');
  }
};