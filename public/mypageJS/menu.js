function showSection(sectionId) {
  // 모든 섹션 숨기기
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.remove('active');
  });
  // 선택한 섹션만 보이게
  document.getElementById(sectionId).classList.add('active');

  // 메뉴 버튼 active 상태 바꾸기
  document.querySelectorAll('.menu button').forEach(btn => {
    btn.classList.remove('active');
  });
  // 눌린 버튼 찾아서 active 넣기
  const buttons = document.querySelectorAll('.menu button');
  buttons.forEach(btn => {
    if (btn.getAttribute('onclick').includes(sectionId)) {
      btn.classList.add('active');
    }
  });
}
