document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('addFavoriteBtn');
  const input = document.getElementById('newFavoriteInput');
  const favoritesList = document.getElementById('favoritesList');

  // 즐겨찾기 추가
  addBtn.addEventListener('click', () => {
    const libraryName = input.value.trim();
    if (!libraryName) {
      alert('도서관 이름을 입력하세요.');
      return;
    }

    fetch('/mypage/favorites/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ libraryName })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // 새 즐겨찾기 항목 추가
        const li = document.createElement('li');
        li.dataset.libraryId = data.library.library_id;
        li.innerHTML = `
          ${data.library.name} - ${data.library.address}
          <button class="removeFavoriteBtn" data-library-id="${data.library.library_id}">삭제</button>
        `;
        // 즐겨찾기 없을 때 '없습니다' 문구 제거
        if (favoritesList.querySelector('li')?.innerText === '즐겨찾는 도서관이 없습니다.') {
          favoritesList.innerHTML = '';
        }
        favoritesList.appendChild(li);
        input.value = '';
      } else {
        alert(data.error || '추가 실패');
      }
    })
    .catch(() => alert('서버 요청 실패'));
  });

  // 즐겨찾기 삭제 이벤트 위임
  favoritesList.addEventListener('click', e => {
    if (e.target.classList.contains('removeFavoriteBtn')) {
      const libraryId = e.target.dataset.libraryId;
      fetch('/mypage/favorites/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libraryId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const li = e.target.closest('li');
          li.remove();
          if (favoritesList.children.length === 0) {
            favoritesList.innerHTML = '<li>즐겨찾는 도서관이 없습니다.</li>';
          }
        } else {
          alert(data.error || '삭제 실패');
        }
      })
      .catch(() => alert('서버 요청 실패'));
    }
  });
});
