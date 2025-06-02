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
  const region_level1 = document.getElementById('preferredAddress1').value.trim();
  const region_level2 = document.getElementById('preferredAddress2').value.trim();
  const region_level3 = document.getElementById('preferredAddress3').value.trim();

  if (!region_level1 || !region_level2 || !region_level3) {
    alert('모든 선호지역 주소를 입력해주세요.');
    return;
  }

  const token = localStorage.getItem('token'); 

  try {
    const res = await fetch('/api/user/preferred-area', {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
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
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('/api/user/preferred-area', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return;

    const data = await res.json();
    const { region_level1, region_level2, region_level3 } = data.preferredArea;
    document.getElementById('preferredAddress1').value = region_level1 || '';
    document.getElementById('preferredAddress2').value = region_level2 || '';
    document.getElementById('preferredAddress3').value = region_level3 || '';
    } catch (e) {
      console.error('선호지역 불러오기 실패:', e);
    }
  }
  window.addEventListener('DOMContentLoaded', loadPreferredAddresses);
