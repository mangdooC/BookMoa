// 사용자의 선호 지역을 기반으로 도서관 조회 컨트롤러
const pool = require('../db');

// 주소에서 시/구만 추출
function extractCityDistrict(address) {
  console.log('[extractCityDistrict] 원본 주소:', address);
  const match = address.match(/(서울특별시|서울시|서울|부산광역시|부산|대구광역시|대구|인천광역시|인천|광주광역시|광주|대전광역시|대전|울산광역시|울산|세종특별자치시|세종|경기도|경기|강원도|강원|충청북도|충북|충청남도|충남|전라북도|전북|전라남도|전남|경상북도|경북|경상남도|경남|제주특별자치도|제주)\s*(\S+?)(구|시)/);
  if (match) {
    const normalizedCity = match[1]
      .replace(/(특별시|광역시|특별자치시|자치시|도|시)$/g, '')
      .trim(); // 서울특별시 → 서울
    const district = match[2] + match[3]; // 마포 + 구
    const result = `${normalizedCity} ${district}`;
    console.log('[extractCityDistrict] 추출된 시/구:', result);
    return result;
  }
  console.log('[extractCityDistrict] 정규식 매칭 실패');
  return null;
}


// 선호 지역 가져오기
async function getUserPreferredRegion(user_id) {
  const [[region]] = await pool.query(
    'SELECT region_level1 FROM preferred_region WHERE user_id = ?',
    [user_id]
  );
  if (!region || !region.region_level1) {
    console.log('[getUserPreferredRegion] 선호 지역 없음');
    return null;
  }

  return extractCityDistrict(region.region_level1);
}

// 도서관 조회
async function getLibrariesByRegion(region, limit = 2) {
  const district = region.split(' ')[1]; // "서울 마포구" → "마포구"
  console.log('[getLibrariesByRegion] 검색할 구:', district);
  const [libraries] = await pool.query(
    `SELECT * FROM library 
     WHERE address LIKE CONCAT('%', ?, '%') 
     LIMIT ?`,
    [district, limit]
  );
  console.log('[getLibrariesByRegion] 조회된 도서관 수:', libraries.length);
  return libraries;
}




// 최종 함수
async function getNearbyLibrariesByUser(user_id) {
  console.log('[getNearbyLibrariesByUser] 유저 ID:', user_id);
  const region = await getUserPreferredRegion(user_id);
  if (!region) {
    console.log('[getNearbyLibrariesByUser] 시/구 추출 실패');
    return [];
  }
  return await getLibrariesByRegion(region);
}

module.exports = {
  getNearbyLibrariesByUser,
};
