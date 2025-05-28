const axios = require('axios');

exports.searchBooks = async (req, res) => {
  //전달받은 검색어에서 공백 제거
  const rawKeyword = req.query.keyword || '';
  const keyword = rawKeyword.replace(/\s+/g, '');

  // 검색 대상 (title, author, publisher, isbn13)
  let searchTarget = req.query.searchTarget || 'title';

  // 정렬 기준 (loan, title, pubYear 등)
  const sort = req.query.sort || 'loan';

  // 정렬 방향 (asc, desc)
  let order = req.query.order;

   // 정렬 기준에 따른 정렬 방향 기본값 설정
  if (!order) {
    if (sort === 'title') order = 'asc';  // 제목 정렬은 오름차순 기본
    else order = 'desc';                   // 그 외는 내림차순 기본
  }
  
  // 페이지 번호 (기본 1)
  const pageNo = parseInt(req.query.pageNo) || 1;

  // API 키 불러오기
  const API_KEY = process.env.DATA4LIBRARY_API_KEY;
  if (!API_KEY) return res.send('API 키가 설정되어 있지 않습니다.');

  // 'bookname' 'title'로 치환
  if (searchTarget === 'bookname') searchTarget = 'title';

  try {
    // API 호출에 필요한 파라미터 세팅
    const params = {
      authKey: API_KEY,
      pageNo,
      pageSize: 10,
      format: 'json',
      sort,
      order,
    };

    // 검색어를 해당 검색 대상 파라미터에 할당
    if (keyword) {
      if (searchTarget === 'title') params.title = keyword;
      else if (searchTarget === 'author') params.author = keyword;
      else if (searchTarget === 'publisher') params.publisher = keyword;
      else if (searchTarget === 'isbn13') params.isbn13 = keyword;
      else params.keyword = keyword;
    }

    // API 주소
    const url = 'http://data4library.kr/api/srchBooks';

    // 디버깅용 요청 정보 출력
    console.log('최종 요청 URL:', url, params);
    const response = await axios.get(url, { params });
    console.log('API 요청 파라미터:', params);
    console.log('API 응답:', response.data);

    // API 응답에서 도서 리스트와 전체 개수 추출
    const books = (response.data?.response?.docs || []).map(item => item.doc);
    const totalCount = response.data?.response?.numFound || 0;
    const totalPages = Math.ceil(totalCount / 10);

    // 결과를 뷰에 렌더링하면서 파라미터 전달
    res.render('searchResult', {
      keyword,
      searchTarget,
      sort,
      order,
      books,
      pageNo,
      totalPages,
    });
  } catch (error) {
    // 에러 발생시 로그 출력 및 에러 메시지
    console.error(error);
    res.send(`<p>오류가 발생했습니다: ${error.message}</p>`);
  }
};

exports.searchForm = (req, res) => {
  res.render('search', { keyword: '', searchTarget: 'title', sort: 'loan' });
};
