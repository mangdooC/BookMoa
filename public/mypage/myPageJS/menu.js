// 메뉴, 섹션 전환 함수
function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => {
    sec.style.display = 'none';
    sec.classList.remove('active');
  });
  const target = document.getElementById(id);
  if (target) {
    target.style.display = 'block';
    target.classList.add('active');
  }

  if (id === 'favorites') loadFavoritesList();
  else if (id === 'posts') loadPostsList();
}