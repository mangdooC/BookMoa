document.addEventListener('DOMContentLoaded', () => {
  // 삭제 버튼들만 선택 (data-delete-btn 붙은 것만)
  const deleteButtons = document.querySelectorAll('button[data-delete-btn]');

  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      if (!confirm('정말 삭제할까요?')) return;

      const form = button.closest('form');
      const action = form.action;
      const method = form.method.toUpperCase();

      const fetchOptions = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        fetchOptions.body = JSON.stringify({});
      }

      try {
        const res = await fetch(action, fetchOptions);

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(`삭제 실패: ${data.error || res.statusText}`);
          return;
        }

        // 성공 시 해당 li 삭제
        const li = form.closest('li');
        if (li) li.remove();

      } catch (err) {
        alert('삭제 요청 중 오류 발생');
        console.error(err);
      }
    });
  });
});
