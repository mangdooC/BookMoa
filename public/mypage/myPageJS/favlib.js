// 즐겨찾기 목록 불러오기
// 로그인 후 JWT 토큰 저장했다고 가정 (예: localStorage.getItem('token'))
async function loadFavoritesList() {
  const token = localStorage.getItem('token');
  if (!token) return console.log('로그인 필요');

  try {
    const res = await fetch('/api/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('즐겨찾기 목록 불러오기 실패');

    const favorites = await res.json();
    const section = document.getElementById('favorites');
    const list = document.getElementById('favoritesList');
    list.innerHTML = '';

    if (favorites.length === 0) {
      list.textContent = '즐겨찾는 도서관이 없습니다.';
    } else {
      favorites.forEach(lib => {
        const li = document.createElement('li');
        li.textContent = `${lib.name} (${lib.address})`;

        const delBtn = document.createElement('button');
        delBtn.textContent = '삭제';
        delBtn.style.marginLeft = '10px';
        delBtn.onclick = () => deleteFavorite(lib.library_id);

        li.appendChild(delBtn);
        list.appendChild(li);
      });
    }
    section.style.display = 'block';

  } catch (err) {
    console.error(err);
  }
}

async function addFavorite() {
  const token = localStorage.getItem('token');
  if (!token) return alert('로그인 필요');

  const name = document.getElementById('newFavoriteInput').value.trim();
  if (!name) return alert('도서관 이름 입력해라');

  try {
    // 도서관 이름 -> library_id 변환은 서버에 맡긴다 가정
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ library_name: name })
    });
    if (!res.ok) throw new Error('즐겨찾기 추가 실패');

    document.getElementById('newFavoriteInput').value = '';
    loadFavoritesList();
  } catch (err) {
    alert(err.message);
  }
}

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

document.getElementById('addFavoriteBtn').addEventListener('click', addFavorite);
window.addEventListener('load', loadFavoritesList);
