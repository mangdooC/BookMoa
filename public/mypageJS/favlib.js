// 즐겨찾기 목록 불러오기 함수
async function loadFavoritesList() {
  const token = localStorage.getItem('token');
  if (!token) return console.log('로그인 필요');

  try {
    const res = await fetch('/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('즐겨찾기 목록 불러오기 실패');

    const html = await res.text();
    document.getElementById('favoritesSection').innerHTML = html;

    // 삭제 버튼 이벤트 바인딩
    document.querySelectorAll('.del-fav-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const libraryId = btn.dataset.libraryId;
        await deleteFavorite(libraryId);
      });
    });

  } catch (err) {
    console.error(err);
  }
}

// 즐겨찾기 추가 함수
async function addFavorite() {
  const token = localStorage.getItem('token');
  if (!token) return alert('로그인 필요');

  const libraryId = document.getElementById('newFavoriteInput').value.trim();
  if (!libraryId) return alert('도서관 ID 입력');

  try {
    const res = await fetch('/favorites/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ libraryId: Number(libraryId) })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || '즐겨찾기 추가 실패');
    }

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
    const res = await fetch('/favorites/remove', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ libraryId })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || '즐겨찾기 삭제 실패');
    }
    loadFavoritesList();
  } catch (err) {
    alert(err.message);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('addFavoriteBtn');
  if (addBtn) addBtn.addEventListener('click', addFavorite);
  loadFavoritesList();
});
