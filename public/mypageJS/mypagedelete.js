document.addEventListener('DOMContentLoaded', () => {
  // 삭제 버튼들 선택 (form 내 button)
  const deleteButtons = document.querySelectorAll('form button[type="submit"]');

  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      if (!confirm('정말 삭제할까요?')) return;

      const form = button.closest('form');
      const action = form.action;
      const method = form.method.toUpperCase();

      try {
        const res = await fetch(action, {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          // POST 폼 데이터 있을 수도 있으니 빈 바디 처리
          body: JSON.stringify({})
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(`삭제 실패: ${data.error || res.statusText}`);
          return;
        }

        // 삭제 성공하면 해당 li 태그 삭제
        const li = form.closest('li');
        if (li) li.remove();

      } catch (err) {
        alert('삭제 요청 중 오류 발생');
        console.error(err);
      }
    });
  });
});
