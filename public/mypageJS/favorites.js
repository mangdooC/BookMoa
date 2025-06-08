const input = document.getElementById('newFavoriteInput');
const resultsDiv = document.createElement('div');
const baseUrl = '/mypage/favorites';

resultsDiv.id = 'searchResults';
resultsDiv.style.cssText = `
  border:1px solid #ccc;
  border-radius: 5px;
  max-height:150px;
  overflow-y:auto;
  display:none;
  position:absolute;
  background:#fff;
  width:800px;
  z-index:100;
  top:100%;
  left:0;
  margin-left:10px;
`;

input.parentNode.style.position = 'relative';
input.parentNode.appendChild(resultsDiv);

// 입력 감지 + 자동완성 검색
input.addEventListener('input', async () => {
  const query = input.value.trim();
  if (query.length === 0) {
    resultsDiv.style.display = 'none';
    resultsDiv.innerHTML = '';
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('검색 실패');

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = '<div style="padding:5px;">검색 결과가 없습니다.</div>';
      resultsDiv.style.display = 'block';
      return;
    }

    resultsDiv.innerHTML = data.results.map(lib => `
      <div class="search-item" style="padding:5px; cursor:pointer;" 
           data-libcode="${lib.lib_code}" 
           data-libname="${lib.name}">
        ${lib.name} (${lib.address})
      </div>
    `).join('');

    resultsDiv.style.display = 'block';
  } catch (err) {
    console.error('검색 오류:', err);
    resultsDiv.style.display = 'none';
    resultsDiv.innerHTML = '';
  }
});

// 검색 결과 클릭
resultsDiv.addEventListener('click', (e) => {
  const target = e.target.closest('.search-item');
  if (!target) return;

  input.value = target.getAttribute('data-libname');
  resultsDiv.style.display = 'none';
});

// 즐겨찾기 추가
document.getElementById('addFavoriteBtn').addEventListener('click', async () => {
  const libraryName = input.value.trim();
  if (!libraryName) return alert('도서관 이름을 입력하세요.');

  try {
    const res = await fetch(`${baseUrl}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ libraryName }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || '오류 발생');

    location.reload();
  } catch (err) {
    console.error('추가 오류:', err);
    alert('서버 에러');
  }
});

// 즐겨찾기 삭제
document.getElementById('favoritesList').addEventListener('click', async (e) => {
  if (!e.target.classList.contains('removeFavoriteBtn')) return;

  const libCode = e.target.getAttribute('data-library-id');
  if (!libCode) return;

  if (!confirm('정말 삭제하시겠습니까?')) return;

  try {
    const res = await fetch(`${baseUrl}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ libCode }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || '오류 발생');

    location.reload();
  } catch (err) {
    console.error('삭제 오류:', err);
    alert('서버 에러');
  }
});
