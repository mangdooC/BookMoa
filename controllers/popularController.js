const axios = require('axios');
require('dotenv').config();

// 필터 조건을 인자로 받도록 수정
const getPopularBooks = async ({ gender, age, kdc, pageNo = 1, pageSize = 200 }) => {
  const queryParams = new URLSearchParams({
    authKey: process.env.DATA4LIBRARY_API_KEY,
    startDt: '2025-05-01',
    endDt: '2025-05-31',
    format: 'json',
    pageNo,
    pageSize,
  });

  if (gender) queryParams.append('gender', gender);
  if (age) queryParams.append('age', age);
  if (kdc) queryParams.append('kdc', kdc);

  const url = `http://data4library.kr/api/loanItemSrch?${queryParams.toString()}`;

  console.log('[요청 URL]', url);

  try {
    const response = await axios.get(url);
    const docs = response.data?.response?.docs;

    if (!docs || docs.length === 0) {
      console.warn('[경고] 인기 도서 결과 없음 또는 docs 미존재');
      return [];
    }

    return docs.map(item => item.doc).map(book => ({
      title: book.bookname,
      imageUrl: book.bookImageURL,
      isbn13: book.isbn13,
      author: book.authors,
      publisher: book.publisher,
      loanCount: book.loan_count,
    }));
  } catch (err) {
    console.error('[API 호출 또는 파싱 실패]', err);
    return [];
  }
};

// 메인 페이지용 (상위 4권)
exports.getTop4Books = async () => {
  const books = await getPopularBooks({}); // 필터 없이
  return books.slice(0, 4);
};

// 전체 목록 반환
exports.getTopBooks = async () => {
  return await getPopularBooks({});
};

// /popular 페이지 렌더링
exports.renderPopularPage = async (req, res) => {
  try {
    const { gender, age, kdc } = req.query;
    const pageNo = parseInt(req.query.pageNo, 10) || 1;
    const pageSize = 10;

    // 필터 조건 반영
    const allBooks = await getPopularBooks({ gender, age, kdc, pageNo: 1, pageSize: 200 });
    const totalPages = Math.ceil(allBooks.length / pageSize);
    const paginatedBooks = allBooks.slice((pageNo - 1) * pageSize, pageNo * pageSize);

    res.render('popular', {
      books: paginatedBooks,
      pageNo,
      totalPages,
      gender,
      age,
      kdc,
    });
  } catch (err) {
    console.error('인기도서 페이지 오류:', err);
    res.status(500).send('인기도서를 불러오는 중 오류 발생');
  }
};
