// 즐겨찾기 목록 불러오기 함수
async function loadFavoritesList() {
  const token = localStorage.getItem('token');  // 토큰 가져오기
  if (!token) return console.log('로그인 필요');

  try {
    // 서버에서 즐겨찾기 목록 요청
    const res = await fetch('/api/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('즐겨찾기 목록 불러오기 실패');

    const favorites = await res.json();

    const section = document.getElementById('favorites');
    const list = document.getElementById('favoritesList');
    list.innerHTML = ''; // 기존 목록 비우기

    if (favorites.length === 0) {
      list.textContent = '즐겨찾는 도서관이 없습니다.';
    } else {
      favorites.forEach(lib => {
        const li = document.createElement('li');
        li.textContent = `${lib.name} (${lib.address})`;

        // 삭제 버튼 생성
        const delBtn = document.createElement('button');
        delBtn.textContent = '삭제';
        delBtn.style.marginLeft = '10px';
        delBtn.onclick = () => deleteFavorite(lib.library_id);

        li.appendChild(delBtn);
        list.appendChild(li);
      });
    }
    section.style.display = 'block';  // 즐겨찾기 섹션 보이기

  } catch (err) {
    console.error(err);
  }
}

// 즐겨찾기 추가 함수
async function addFavorite() {
  const token = localStorage.getItem('token');
  if (!token) return alert('로그인 필요');

  const name = document.getElementById('newFavoriteInput').value.trim();
  if (!name) return alert('도서관 이름 입력');

  try {
    // 도서관 이름을 서버에 POST, 서버에서 library_id 변환한다고 가정
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ library_name: name })
    });
    if (!res.ok) throw new Error('즐겨찾기 추가 실패');

    // 입력 필드 초기화 및 목록 새로고침
    document.getElementById('newFavoriteInput').value = '';
    loadFavoritesList();
  } catch (err) {
    alert(err.message);
  }
}

// 즐겨찾기 삭제 함수
async function deleteFavorite(libraryId) {
  const token = localStorage.getItem('token');
  if (!token) return alert('로그인 필요');

  try {
    const res = await fetch(`/api/favorites/${libraryId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('즐겨찾기 삭제 실패');

    loadFavoritesList();
  } catch (err) {
    alert(err.message);
  }
}

// DOMContentLoaded 이벤트에서 이벤트 리스너 등록 & 초기 목록 로드
window.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('addFavoriteBtn');
  if (addBtn) {
    addBtn.addEventListener('click', addFavorite);
  }
});
