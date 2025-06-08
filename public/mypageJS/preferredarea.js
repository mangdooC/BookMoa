// 다음 우편번호 검색 API 호출 함수
function searchPreferredAddress(inputId) {
  new daum.Postcode({
    oncomplete: function(data) {
      let fullAddr = data.address;
      // 주소 입력란에 값 넣기
      document.getElementById(inputId).value = fullAddr;
    },
  }).open();
}

// 저장 버튼 누르면 호출
async function savePreferredAddresses() {
  const region_level1 = document.getElementById('region_level1').value.trim();
  const region_level2 = document.getElementById('region_level2').value.trim();
  const region_level3 = document.getElementById('region_level3').value.trim();

  if (!region_level1 && !region_level2 && !region_level3) {
    alert('최소 한 개 이상의 선호지역을 입력하세요.');
    return;
  }

  try {
    const res = await fetch('/mypage/preferred-area/update', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ region_level1, region_level2, region_level3 }),
    });

    if (res.ok) {
      alert('선호지역이 성공적으로 업데이트 되었습니다.');
      window.location.reload();
    } else {
      alert('선호지역 저장에 실패했습니다.');
    }
  } catch (err) {
    alert('서버 통신 중 오류가 발생했습니다.');
    console.error(err);
  }
}
