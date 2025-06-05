// 주소 검색 함수
function searchMainAddress() {
  new daum.Postcode({
    oncomplete: function(data) {
      const addr = data.address;
      document.getElementById('address').value = addr;
    }
  }).open();
}

function searchPreferredAddress(inputId) {
  new daum.Postcode({
    oncomplete: function(data) {
      const addr = data.address;
      document.getElementById(inputId).value = addr;
      const display = document.getElementById(`selectedAddress_${inputId}`);
      if (display) display.textContent = '선택한 주소: ' + addr;
    }
  }).open();
}

async function savePreferredAddresses() {
  // 기존 저장된 선호지역 받아오기
  let existing = { region_level1: '', region_level2: '', region_level3: '' };
  try {
    const res = await fetch('/api/user/preferred-area', {
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      existing = data.preferredArea || {};
    }
  } catch (e) {
    console.error('기존 선호지역 불러오기 실패:', e);
  }

  // 입력값 가져오기
  let region_level1 = document.getElementById('preferredAddress1').value.trim();
  let region_level2 = document.getElementById('preferredAddress2').value.trim();
  let region_level3 = document.getElementById('preferredAddress3').value.trim();

  // 비어있으면 기존 값으로 대체
  region_level1 = region_level1 || existing.region_level1 || '';
  region_level2 = region_level2 || existing.region_level2 || '';
  region_level3 = region_level3 || existing.region_level3 || '';

  // 3개 다 비었으면 저장 안 함
  if (!region_level1 && !region_level2 && !region_level3) {
    alert('최소 한 개 이상의 선호지역 주소를 입력해주세요.');
    return;
  }

  try {
    const res = await fetch('/api/user/preferred-area', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ region_level1, region_level2, region_level3 }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || '저장 실패');
    }

    alert('선호지역이 저장되었습니다.');
  } catch (e) {
    alert('저장 실패: ' + e.message);
    console.error(e);
  }
}

async function loadPreferredAddresses() {
  try {
    const res = await fetch('/api/user/preferred-area', {
      credentials: 'include',
    });
    if (!res.ok) return;

    const data = await res.json();
    const { region_level1, region_level2, region_level3 } = data.preferredArea || {};
    document.getElementById('preferredAddress1').value = region_level1 || '';
    document.getElementById('preferredAddress2').value = region_level2 || '';
    document.getElementById('preferredAddress3').value = region_level3 || '';
  } catch (e) {
    console.error('선호지역 불러오기 실패:', e);
  }
}

window.addEventListener('DOMContentLoaded', loadPreferredAddresses);
