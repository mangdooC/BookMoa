const sections = document.querySelectorAll('.section');
const buttons = document.querySelectorAll('.menu button');

function showSection(sectionId) {
  sections.forEach(sec => sec.classList.remove('active'));
  buttons.forEach(btn => btn.classList.remove('active'));

  const targetSection = document.getElementById(sectionId);
  if (targetSection) targetSection.classList.add('active');

  buttons.forEach(btn => {
    if (btn.getAttribute('onclick')?.includes(`showSection('${sectionId}')`)) {
      btn.classList.add('active');
    }
  });
}

buttons.forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const onclickAttr = btn.getAttribute('onclick');
    if (onclickAttr) {
      const match = onclickAttr.match(/showSection\('(.+?)'\)/);
      if (match) {
        showSection(match[1]);
      }
    }
  });
});

// 초기 활성화 설정 (예: 첫 섹션)
if (sections.length > 0) {
  showSection(sections[0].id);
}
