// controllers/popularController.js
const axios = require('axios');
const xml2js = require('xml2js');
require('dotenv').config();

// XML → JSON 파싱
const parseXml = async (xml) => {
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xml);
  return result;
};

// 도서관 정보나루 API 호출
const getPopularBooks = async () => {
  console.log('[함수 호출됨] getPopularBooks');

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);

  const startDt = start.toISOString().slice(0, 10).replace(/-/g, '');
  const endDt = today.toISOString().slice(0, 10).replace(/-/g, '');

  const url = `http://data4library.kr/api/loanItemSrch` +
              `?authKey=${process.env.DATA4LIBRARY_API_KEY}` +
              `&startDt=${startDt}` +
              `&endDt=${endDt}` +
              `&gender=0&from_age=0&to_age=99&region=11&addCode=0&kdc=0`;

  console.log('[API 키]', process.env.DATA4LIBRARY_API_KEY);
  console.log('[요청 URL]', url); 

  try {
    const response = await axios.get(url, { responseType: 'text' });
    console.log('[API 응답 XML]', response.data); 

    const parsed = await parseXml(response.data);
    console.log('[파싱된 전체 객체]', JSON.stringify(parsed, null, 2));

    const docs = parsed?.response?.docs?.doc;

    if (!docs) {
      console.warn('[경고] 인기 도서 결과 없음 또는 docs 미존재');
      return [];
    }

    const books = Array.isArray(docs) ? docs : [docs]; // 단일 도서 대응
    return books.map(book => ({
      title: book.bookname,
      author: book.authors,
      publisher: book.publisher,
      year: book.publication_year,
      isbn: book.isbn13,
      loanCount: book.loan_count
    }));
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

// /popular 페이지 렌더링
exports.renderPopularPage = async (req, res) => {
  try {
    const books = await getPopularBooks();
    res.render('popular', { books });
  } catch (err) {
    console.error('인기도서 페이지 오류:', err);
    res.status(500).send('인기도서를 불러오는 중 오류 발생');
  }
};
