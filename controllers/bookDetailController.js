// 도서 상세 페이지에서 책 정보, 도서관 위치, 후기 목록을 조회하고 렌더링하는 컨트롤러
const axios = require('axios');
const pool = require('../db');


exports.bookDetail = async (req, res) => {
  const isbn13 = req.params.isbn13;
  const DATA4LIB_KEY = process.env.DATA4LIBRARY_API_KEY;

  // 책 정보 API 호출을 먼저 수행
  let book = {};
  try {
    const response = await axios.get('http://data4library.kr/api/srchBooks', {
      params: {
        authKey: DATA4LIB_KEY,
        isbn13,
        format: 'json'
      }
    });
    book = response.data?.response?.docs?.[0]?.doc || {};
  } catch (e) {
    console.error('책 정보 조회 실패:', e);
    book = {};
  }

  // 쿼리 파라미터 확인
  const { region, lat, lng } = req.query;
  
  // URL에 파라미터가 없으면 기본 페이지로
  if (!region || !lat || !lng) {
    return res.render('bookDetail', {
      book,
      libraries: [],
      reviews: [],
      reviewsTotal: 0,
      sort: 'recent',
      page: 1,
      totalPages: 1,
      lat: 37.5665,  // 서울시청 기본값
      lng: 126.9780, // 서울시청 기본값
      NAVER_MAP_API_KEY: process.env.NAVER_CLIENT_ID
    });
  }

  const nearRegions = req.query.nearRegions ? JSON.parse(req.query.nearRegions) : [];

  console.log('받은 파라미터:', {
    region,
    lat,
    lng,
    nearRegions
  });

  // 위치 정보나 지역코드가 없으면 위치 정보 요청
  if (!lat || !lng || !region) {
    console.log('위치 정보 누락');
    return res.status(400).send('위치 정보가 필요합니다. 위치 정보 제공을 허용해주세요.');
  }

  console.log('요청 받은 위치 정보:', { lat, lng, region });

  // 기준 좌표 설정
  const myLat = parseFloat(lat);
  const myLng = parseFloat(lng);

  // 대출 가능한 도서관 정보 API 호출
  let libraries = [];
  try {
    // 현재 지역 코드와 인접 지역들을 합침
    const mainRegion = region.toString();
    
    // 현재 지역과 인접 지역들을 모두 포함
    const allRegions = Array.from(new Set([mainRegion, ...nearRegions]));
    
    console.log('현재 지역:', mainRegion);
    console.log('인접 지역들:', nearRegions);
    console.log('검색할 모든 지역들:', allRegions);

    // 모든 지역의 도서관 정보를 병렬로 가져오기
    const requests = allRegions.map(regionCode => 
      axios.get('http://data4library.kr/api/libSrchByBook', {
        params: {
          authKey: DATA4LIB_KEY,
          isbn: isbn13,      
          region: regionCode,
          format: 'json',
          pageSize: 500
        }
      })
    );

    const responses = await Promise.all(requests);
    
    // 모든 응답의 도서관 정보 합치기
    libraries = responses.flatMap(response => {
      const libs = response.data?.response?.libs || [];
      return libs.map(lib => ({
        name: lib.lib.libName,
        tel: lib.lib.tel,
        address: lib.lib.address,
        url: lib.lib.homepage,
        lat: lib.lib.latitude,
        lng: lib.lib.longitude,
        libCode: lib.lib.libCode 
      }));
    });

    // 사용자 위치 기준으로 거리 계산 및 정렬
    libraries = libraries
      .map(lib => ({
        ...lib,
        distance: getDistance(myLat, myLng, Number(lib.lat), Number(lib.lng))
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);

  } catch (e) {
    console.error('도서관 정보 조회 실패:', e);
    libraries = [];
  }

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
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      NAVER_MAP_API_KEY: process.env.NAVER_CLIENT_ID
    });

  } catch (error) {
    console.error('리뷰 조회 실패:', error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
};

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
            book_id,
            user: req.session.user
        });
    } catch (error) {
        console.error('폼 렌더링 오류:', error);
        res.status(500).send('폼을 불러올 수 없습니다: ' + error.message);
    }
};
exports.createReview = async (req, res) => {
    const isbn13 = req.params.isbn13;
    const { content, rating } = req.body;
    const user_id = req.session?.user?.user_id;

    if (!user_id) {
        return res.status(401).send('로그인이 필요합니다.');
    }

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