document.addEventListener('DOMContentLoaded', () => {
  const postList = document.getElementById('libraryReviewList');

  if (!postList) return;

  postList.querySelectorAll('li').forEach(li => {
    const link = li.querySelector('a');
    if (!link) return;

    // 클릭하면 해당 글 페이지로 이동
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const postId = link.getAttribute('href').split('/').pop();

      // 이동 대신 상세 영역 표시
      fetch(`/libraryReview/post/${postId}/detail`)
        .then(res => res.json())
        .then(data => {
          showPostDetail(postId, data);
        })
        .catch(err => alert('게시글 조회 실패'));
    });
  });

  function showPostDetail(postId, data) {
    // 기존 상세창 있으면 지우고
    let detailDiv = document.getElementById('postDetail');
    if (detailDiv) detailDiv.remove();

    detailDiv = document.createElement('div');
    detailDiv.id = 'postDetail';
    detailDiv.innerHTML = `
      <h4>${data.title}</h4>
      <p>${data.content}</p>
      <button id="deleteBtn">삭제</button>
      <button id="closeBtn">닫기</button>
    `;
    document.body.appendChild(detailDiv);

    document.getElementById('closeBtn').addEventListener('click', () => {
      detailDiv.remove();
    });

    document.getElementById('deleteBtn').addEventListener('click', () => {
      if (!confirm('정말 삭제하시겠습니까?')) return;

      fetch(`/userLibraryReview/${postId}/delete`, {
        method: 'POST',
      })
        .then(res => {
          if (!res.ok) throw new Error('삭제 실패');
          // 삭제 성공 시 목록에서 지우고 상세창 닫기
          const liToRemove = postList.querySelector(`a[href="/libraryReview/post/${postId}"]`)?.parentElement;
          if (liToRemove) liToRemove.remove();
          detailDiv.remove();
          alert('삭제 완료');
        })
        .catch(() => alert('삭제 실패'));
    });
  }
});
