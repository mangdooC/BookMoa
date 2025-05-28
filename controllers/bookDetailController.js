const axios = require('axios');

// isbn13별 후기 저장용 객체
const reviewStore = {};

exports.bookDetail = async (req, res) => {
  const isbn13 = req.params.isbn13;
  const API_KEY = process.env.DATA4LIBRARY_API_KEY;

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
      address: lib.lib.address,
      lat: lib.lib.latitude,
      lng: lib.lib.longitude
    }));
  } catch (e) {
    libraries = [];
  }

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
    reviews, reviewsTotal, sort, page, totalPages
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