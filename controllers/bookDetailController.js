//도서관 검색할 때 지역코드 사용하므로 지역 경계에 위치할 때 처리 방법 구현해야함
const axios = require('axios');

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

  // 후기 목록, 총 개수, 정렬, 페이지네이션 (임시 데이터)
  const sort = req.query.sort || 'recent';
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5;

  // 후기 목록 불러오기
  const allReviews = reviewStore[isbn13] || [];
  const reviewsTotal = allReviews.length;
  const totalPages = Math.max(1, Math.ceil(reviewsTotal / pageSize));

  let reviews = [...allReviews];
  if (sort === 'popular') {
    reviews.sort((a, b) => b.likes - a.likes);
  } else {
    reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  reviews = reviews.slice((page - 1) * pageSize, page * pageSize);

  res.render('bookDetail', {
    book, libraries,
    reviews, reviewsTotal, sort, page, totalPages,
      NAVER_MAP_API_KEY: process.env.NAVER_MAP_API_KEY

  });
};

exports.reviewForm = (req, res) => {
  const isbn13 = req.params.isbn13;
  res.render('bookReview', { isbn13 });
};

exports.createReview = (req, res) => {
  const isbn13 = req.params.isbn13;
  const { nickname, comment } = req.body;
  const date = new Date().toISOString().slice(0, 10);
  const review = { nickname, comment, date, likes: 0 };

  if (!reviewStore[isbn13]) reviewStore[isbn13] = [];
  reviewStore[isbn13].push(review);

  res.redirect(`/book/${isbn13}`);
};