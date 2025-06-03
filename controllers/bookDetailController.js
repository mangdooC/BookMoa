//도서관 검색할 때 지역코드 사용하므로 지역 경계에 위치할 때 처리 방법 구현해야함
const axios = require('axios');
const pool = require('../db');

// isbn13별 후기 저장용 객체
const reviewStore = {};

exports.bookDetail = async (req, res) => {
  const isbn13 = req.params.isbn13;
  const API_KEY = process.env.DATA4LIBRARY_API_KEY;

  const userPreferredRegions = [
      { name: '서울특별시', code: 11 },
      { name: '경기도', code: 41 }
    ];
  // 책 정보 API 호출
  let book = {};
  try {
    const url = 'http://data4library.kr/api/srchBooks';
    const params = {
      authKey: API_KEY,
      isbn13,
      format: 'json'
    };
    const response = await axios.get(url, { params });
    book = response.data?.response?.docs?.[0]?.doc || {};
  } catch (e) {
    book = {};
  }

  // 대출 가능한 도서관 정보 API 호출
  let libraries = [];
  try {
    const libUrl = 'http://data4library.kr/api/libSrchByBook';
const libParams = {
  authKey: API_KEY,
  isbn: isbn13,      
  region: 11,         //지역코드(11:서울)
  format: 'json'
};

    const libResponse = await axios.get(libUrl, { params: libParams });
    console.log(JSON.stringify(libResponse.data, null, 2));
    libraries = (libResponse.data?.response?.libs || []).map(lib => ({
  name: lib.lib.libName,
  tel: lib.lib.tel,
  address: lib.lib.address,
  url: lib.lib.homepage,
  lat: lib.lib.latitude,
  lng: lib.lib.longitude
}));
  } catch (e) {
    libraries = [];
  }

  // 기준 좌표(예: 서울시청)
const myLat = 37.5665;
const myLng = 126.9780;

// 거리 계산 함수
function getDistance(lat1, lng1, lat2, lng2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// 도서관에 거리 추가 및 거리순 정렬, 20개만 추출
libraries = libraries
  .map(lib => ({
    ...lib,
    distance: (lib.lat && lib.lng) ? getDistance(myLat, myLng, Number(lib.lat), Number(lib.lng)) : Infinity
  }))
  .sort((a, b) => a.distance - b.distance)
  .slice(0, 20);

  // 후기 목록, 총 개수, 정렬, 페이지네이션
  const sort = req.query.sort || 'recent';
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5;

  try {
    // 1. book_id 조회 또는 생성
    const [books] = await pool.query('SELECT book_id FROM book WHERE isbn = ?', [isbn13]);
    let book_id;
    
    if (books.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO book (isbn, title) VALUES (?, ?)',
        [isbn13, book.title || '제목 없음']
      );
      book_id = result.insertId;
    } else {
      book_id = books[0].book_id;
    }

    // 2. 리뷰 총 개수 조회
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM book_review WHERE book_id = ?',
      [book_id]
    );
    const reviewsTotal = countResult[0].total;
    const totalPages = Math.max(1, Math.ceil(reviewsTotal / pageSize));

    // 3. 리뷰 목록 조회
    let query = `
      SELECT br.*, u.nickname 
      FROM book_review br 
      JOIN user u ON br.user_id = u.user_id 
      WHERE br.book_id = ? 
      ORDER BY ${sort === 'popular' ? 'br.rating' : 'br.created_at'} DESC 
      LIMIT ? OFFSET ?
    `;

    const [reviews] = await pool.query(query, [
      book_id,
      pageSize,
      (page - 1) * pageSize
    ]);

    res.render('bookDetail', {
      book, 
      libraries,
      reviews,
      reviewsTotal,
      sort,
      page,
      totalPages,
      NAVER_MAP_API_KEY: process.env.NAVER_MAP_API_KEY
    });

  } catch (error) {
    console.error('리뷰 조회 실패:', error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
};