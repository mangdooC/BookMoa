document.addEventListener('DOMContentLoaded', () => {
  // data-delete-btn 붙은 삭제 버튼들만 선택
  const deleteButtons = document.querySelectorAll('button[data-delete-btn]');

  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      if (!confirm('삭제 하시겠습니까?')) return;

      const form = button.closest('form');
      const action = form.action;

      try {
        const res = await fetch(action, {
          method: 'DELETE', // 무조건 DELETE로 고정
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(`삭제 실패: ${data.error || res.statusText}`);
          return;
        }

        // 성공하면 해당 li 태그 제거
        const li = form.closest('li');
        if (li) li.remove();

      } catch (err) {
        alert('삭제 요청 중 오류 발생');
        console.error(err);
      }
    });
  });
});
