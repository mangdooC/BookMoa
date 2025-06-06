// public/js/userCommunity.js

document.addEventListener('DOMContentLoaded', () => {
  const postList = document.getElementById('communityPostList');

  if (!postList) return;

  postList.querySelectorAll('li').forEach(li => {
    const link = li.querySelector('a');
    if (!link) return;

    // 클릭하면 해당 글 페이지로 이동
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const postId = link.getAttribute('href').split('/').pop();

      // 이동 대신 상세 영역 표시
      fetch(`/community/post/${postId}/detail`)
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
      <button id="editBtn">수정</button>
      <button id="deleteBtn">삭제</button>
      <button id="closeBtn">닫기</button>
      <div id="editFormContainer" style="display:none;">
        <textarea id="editContent">${data.content}</textarea>
        <input type="text" id="editTitle" value="${data.title}" />
        <button id="saveEditBtn">저장</button>
        <button id="cancelEditBtn">취소</button>
      </div>
    `;
    document.body.appendChild(detailDiv);

    document.getElementById('closeBtn').addEventListener('click', () => {
      detailDiv.remove();
    });

    document.getElementById('editBtn').addEventListener('click', () => {
      document.getElementById('editFormContainer').style.display = 'block';
    });

    document.getElementById('cancelEditBtn').addEventListener('click', () => {
      document.getElementById('editFormContainer').style.display = 'none';
    });

    document.getElementById('saveEditBtn').addEventListener('click', () => {
      const newTitle = document.getElementById('editTitle').value.trim();
      const newContent = document.getElementById('editContent').value.trim();

      if (!newTitle || !newContent) {
        alert('제목과 내용을 모두 입력하세요.');
        return;
      }

      fetch(`/community/post/edit/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      })
        .then(res => {
          if (!res.ok) throw new Error('수정 실패');
          return res.json();
        })
        .then(updatedPost => {
          alert('수정 완료');
          // 리스트 제목도 변경
          const targetLink = postList.querySelector(`a[href="/community/post/${postId}"]`);
          if (targetLink) targetLink.textContent = updatedPost.title;
          detailDiv.querySelector('h4').textContent = updatedPost.title;
          detailDiv.querySelector('p').textContent = updatedPost.content;
          document.getElementById('editFormContainer').style.display = 'none';
        })
        .catch(() => alert('수정 실패'));
    });

    document.getElementById('deleteBtn').addEventListener('click', () => {
      if (!confirm('정말 삭제하시겠습니까?')) return;

      fetch(`/community/post/delete/${postId}`, {
        method: 'POST',
      })
        .then(res => {
          if (!res.ok) throw new Error('삭제 실패');
          // 삭제 성공 시 목록에서 지우고 상세창 닫기
          const liToRemove = postList.querySelector(`a[href="/community/post/${postId}"]`)?.parentElement;
          if (liToRemove) liToRemove.remove();
          detailDiv.remove();
          alert('삭제 완료');
        })
        .catch(() => alert('삭제 실패'));
    });
  }
});
