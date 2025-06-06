async function savePreferredAddresses() {
  let region_level1 = document.getElementById('preferredAddress1').value.trim();
  let region_level2 = document.getElementById('preferredAddress2').value.trim();
  let region_level3 = document.getElementById('preferredAddress3').value.trim();

  if (!region_level1 && !region_level2 && !region_level3) {
    alert('최소 한 개 이상의 선호지역 주소를 입력해주세요.');
    return;
  }

  try {
    const res = await fetch('/preferred/update', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ region_level1, region_level2, region_level3 }),
    });

    if (!res.ok) {
      const html = await res.text();
      document.open();
      document.write(html);
      document.close();
    } else {
      const html = await res.text();
      document.open();
      document.write(html);
      document.close();
    }
  } catch (e) {
    alert('저장 실패: ' + e.message);
    console.error(e);
  }
}

async function loadPreferredAddresses() {
  try {
    const res = await fetch('/preferred', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return;

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const inputs = ['preferredAddress1', 'preferredAddress2', 'preferredAddress3'];
    inputs.forEach((id, idx) => {
      const element = doc.getElementById(id);
      if (element) {
        document.getElementById(id).value = element.value || '';
      }
    });
  } catch (e) {
    console.error('선호지역 불러오기 실패:', e);
  }
}

window.addEventListener('DOMContentLoaded', loadPreferredAddresses);
