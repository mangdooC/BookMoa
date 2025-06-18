// 외부 API를 통해 대출 급상승 도서를 가져오고 날짜 및 순위 기준으로 정렬하는 컨트롤러
const axios = require('axios');
const xml2js = require('xml2js');
require('dotenv').config();

async function getTrendingBooks() {
  const apiKey = process.env.DATA4LIBRARY_API_KEY;
  // trendingController.js 내부
const today = new Date();
const searchDate = new Date(today);
searchDate.setDate(searchDate.getDate() - 1); // 어제 날짜 기준

const searchDt = searchDate.toISOString().slice(0, 10); // YYYY-MM-DD

const url = `http://data4library.kr/api/hotTrend?authKey=${apiKey}&searchDt=${searchDt}&format=xml`;


  try {
    const response = await axios.get(url);
    const xml = response.data;

    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xml);

    const results = result.response?.results?.result || [];

    // 단일 객체 → 배열로 변환
    const resultList = Array.isArray(results) ? results : [results];

    // 모든 날짜의 doc을 통합해서 도서 목록 구성
    const books = [];
    resultList.forEach(dayResult => {
      const docs = dayResult.docs?.doc || [];
      const docList = Array.isArray(docs) ? docs : [docs];

      docList.forEach(book => {
        books.push({
          title: book.bookname,
          author: book.authors,
          publisher: book.publisher,
          publicationYear: book.publication_year,
          isbn13: book.isbn13,
          imageUrl: book.bookImageURL,
          detailUrl: book.bookDtlUrl,
          rankDiff: book.difference,
          baseWeekRank: book.baseWeekRank,
          pastWeekRank: book.pastWeekRank,
          date: dayResult.date
        });
      });
    });
console.log('[TRENDING XML]', xml); // XML 응답 원본
console.log('[TRENDING 결과]', books.length); // 최종 반환되는 도서 개수
   
 // 날짜 내림차순 → 순위 오름차순 정렬
    books.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date); // 최신 날짜 먼저
      return a.baseWeekRank - b.baseWeekRank; // 날짜 같으면 순위 낮은 것 먼저
    });
    return books;
  } catch (error) {
    console.error('[getTrendingBooks Error]', error.message);
    return [];
  }
}

module.exports = { getTrendingBooks };
