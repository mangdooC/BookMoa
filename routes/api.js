const express = require('express');
const axios = require('axios');
const router = express.Router();

const regionCodeMap = {
  "서울특별시": 11, "부산광역시": 21, "대구광역시": 22, "인천광역시": 23,
  "광주광역시": 24, "대전광역시": 25, "울산광역시": 26, "세종특별자치시": 29,
  "경기도": 31, "강원특별자치도": 32, "충청북도": 33, "충청남도": 34,
  "전라북도": 35, "전라남도": 36, "경상북도": 37, "경상남도": 38, "제주특별자치도": 39
};
/*
const neighbors = {
  '11': ['31', '23'],      // 서울: 경기, 인천
  '21': ['26', '38'],      // 부산: 울산, 경남
  '22': ['37', '38'],      // 대구: 경북, 경남
  '23': ['11', '31'],      // 인천: 서울, 경기
  '24': ['36'],            // 광주: 전남
  '25': ['33', '34', '29'],      // 대전: 충북, 충남, 세종
  '26': ['21', '38', '37'],// 울산: 부산, 경남, 경북
  '29': ['34', '25', '33'],      // 세종: 충남, 대전, 충북
  '31': ['11', '23', '32', '34', '33'], // 경기: 서울, 인천, 강원, 충남, 충북
  '32': ['37', '31', '33'],      // 강원: 경북, 경기, 충북
  '33': ['31', '32', '34', '35', '37', '29', '25'],// 충북: 경기, 강원, 충남, 전북, 경북, 세종, 대전
  '34': ['25', '33', '29', '35'],// 충남: 대전, 충북, 세종, 전북, 경기기
  '35': ['29', '33', '34', '24', '36', '31'], // 전북: 세종, 충북, 충남, 광주, 전남
  '36': ['24', '35', '37', '38'],// 전남: 광주, 전북, 경남
  '37': ['37', '38','26', '22', '32', '33'],            // 경북: 전북, 경남, 울산, 대구, 강원, 충북
  '38': ['21', '22', '26', '36', '37', '35'], // 경남: 부산, 대구, 울산, 전남, 경북, 전북
  '39': []                      // 제주: 인접 지역 없음 (섬)
};*/
const neighbors = {
  '11': [],      // 서울: 경기, 인천
  '21': [],      // 부산: 울산, 경남
  '22': [],      // 대구: 경북, 경남
  '23': [],      // 인천: 서울, 경기
  '24': [],            // 광주: 전남
  '25': [],      // 대전: 충북, 충남, 세종
  '26': [],// 울산: 부산, 경남, 경북
  '29': [],      // 세종: 충남, 대전, 충북
  '31': [], // 경기: 서울, 인천, 강원, 충남, 충북
  '32': [],      // 강원: 경북, 경기, 충북
  '33': [],// 충북: 경기, 강원, 충남, 전북, 경북, 세종, 대전
  '34': [],// 충남: 대전, 충북, 세종, 전북, 경기기
  '35': [], // 전북: 세종, 충북, 충남, 광주, 전남
  '36': [],// 전남: 광주, 전북, 경남
  '37': [],            // 경북: 전북, 경남, 울산, 대구, 강원, 충북
  '38': [], // 경남: 부산, 대구, 울산, 전남, 경북, 전북
  '39': []                      // 제주: 인접 지역 없음 (섬)
};
router.get('/geocode', async (req, res) => {
  const { coords } = req.query;
  
  try {
    console.log('요청할 좌표:', coords);
    const response = await axios.get('https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc', {
      params: {
        coords,
        output: 'json',
        orders: 'admcode'
      },
      headers: {
        'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': process.env.NAVER_CLIENT_SECRET
      }
    });
    
    // 응답에서 region 정보 추출
    const result = response.data.results[0];
    if (result && result.region) {
      const area1 = result.region.area1;
      const regionCode = regionCodeMap[area1.name] || 11;
      const regionCodeStr = regionCode.toString();
      const nearRegions = neighbors[regionCodeStr] || [];
      
      console.log('찾은 지역:', area1.name, '지역코드:', regionCode);
      console.log('인접 지역 코드들:', nearRegions);
      
      res.json({
        status: 'OK',
        area1: area1.name,
        regionCode: regionCode,
        nearRegions: nearRegions,
        coords: coords
      });
    } else {
      res.status(400).json({ error: '지역 정보를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('역지오코딩 실패:', error.response?.data || error.message);
    res.status(500).json({ error: '역지오코딩 실패', details: error.response?.data });
  }
});

router.get('/library/status', async (req, res) => {
  const { isbn, libCode } = req.query;
  console.log('도서관 상태 조회 요청:', { isbn, libCode });

  try {
    const response = await axios.get('http://data4library.kr/api/bookExist', {
      params: {
        authKey: process.env.DATA4LIBRARY_API_KEY,
        libCode: libCode,
        isbn13: isbn,
        format: 'json'
      }
    });

    console.log('도서관 API 응답:', response.data);
    
    const result = response.data?.response?.result || {};
    res.json(result);
  } catch (error) {
    console.error('도서관 API 오류:', error.response?.data || error.message);
    res.status(500).json({ error: '도서관 정보 조회 실패' });
  }
});

module.exports = router;
