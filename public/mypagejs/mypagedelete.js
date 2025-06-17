document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('button[data-delete-btn]');

  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      if (!confirm('삭제 하시겠습니까?')) return;

      const action = button.getAttribute('data-action');
      if (!action) {
        alert('삭제 경로가 없습니다.');
        return;
      }

      try {
        const res = await fetch(action, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(`삭제 실패: ${data.error || res.statusText}`);
          return;
        }

        // 삭제 성공하면 해당 li 요소 제거
        const li = button.closest('li');
        if (li) li.remove();

      } catch (err) {
        alert('삭제 요청 중 오류 발생');
        console.error(err);
      }
    });
  });
});
