// 다음 우편번호 검색 API 호출 함수
function searchPreferredAddress(inputId) {
  new daum.Postcode({
    oncomplete: function(data) {
      let fullAddr = data.address;
      document.getElementById(inputId).value = fullAddr;
    },
  }).open();
}

async function savePreferredAddresses() {
  const region_level1 = document.getElementById('region_level1').value.trim();
  const region_level2 = document.getElementById('region_level2').value.trim();
  const region_level3 = document.getElementById('region_level3').value.trim();

  if (![region_level1, region_level2, region_level3].some(v => v !== '')) {
    alert('최소 한 개 이상의 선호지역을 입력하세요.');
    return;
  }

  const data = {
    region_level1: region_level1 || null,
    region_level2: region_level2 || null,
    region_level3: region_level3 || null
  };

  try {
    const res = await fetch('/preferred-area/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const text = await res.text();
      alert('저장 실패: ' + text);
      return;
    }

    alert('선호지역이 성공적으로 저장되었습니다.');
    location.reload();

  } catch (err) {
    alert('서버 오류 발생: ' + err.message);
  }
}
