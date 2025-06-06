// public/js/userCommunity.js
document.addEventListener('DOMContentLoaded', () => {
  const communityPostList = document.getElementById('communityPostList');

  if (!communityPostList) return;

  // 클릭 이벤트 위임: 게시글 제목 클릭 시 상세 페이지 이동
  communityPostList.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      const href = e.target.getAttribute('href');
      window.location.href = href;
    }
  });

  // 각 li에 수정, 삭제 버튼 생성 및 이벤트 바인딩
  const posts = communityPostList.querySelectorAll('li');
  posts.forEach(li => {
    if (li.querySelector('a')) {
      const postId = li.querySelector('a').getAttribute('href').split('/').pop();

      // 수정 버튼
      const editBtn = document.createElement('button');
      editBtn.textContent = '수정';
      editBtn.style.marginLeft = '10px';
      editBtn.addEventListener('click', () => openEditForm(li, postId));
      li.appendChild(editBtn);

      // 삭제 버튼
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '삭제';
      deleteBtn.style.marginLeft = '5px';
      deleteBtn.addEventListener('click', () => deletePost(postId, li));
      li.appendChild(deleteBtn);
    }
  });

  function openEditForm(li, postId) {
    // 기존 내용 추출
    const titleAnchor = li.querySelector('a');
    const oldTitle = titleAnchor.textContent;

    // textarea로 교체 (내용 수정용)
    li.innerHTML = `
      <input type="text" id="editTitle" value="${oldTitle}" style="width: 60%;"/>
      <textarea id="editContent" placeholder="내용 입력" style="width: 60%; height: 60px; margin-top:5px;"></textarea>
      <br/>
      <button id="saveEditBtn">저장</button>
      <button id="cancelEditBtn">취소</button>
    `;

    // 저장 버튼 클릭 이벤트
    li.querySelector('#saveEditBtn').addEventListener('click', async () => {
      const newTitle = li.querySelector('#editTitle').value.trim();
      const newContent = li.querySelector('#editContent').value.trim();

      if (!newTitle) {
        alert('제목을 입력하세요.');
        return;
      }
      if (!newContent) {
        alert('내용을 입력하세요.');
        return;
      }

      try {
        const res = await fetch(`/mypage/userCommunity/edit/${postId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: newTitle, content: newContent }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // 수정 성공 시 기존 UI로 복구 및 텍스트 변경
          li.innerHTML = `<a href="/community/post/${postId}">${newTitle}</a>`;
          // 수정, 삭제 버튼 다시 추가
          const editBtn = document.createElement('button');
          editBtn.textContent = '수정';
          editBtn.style.marginLeft = '10px';
          editBtn.addEventListener('click', () => openEditForm(li, postId));
          li.appendChild(editBtn);

          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = '삭제';
          deleteBtn.style.marginLeft = '5px';
          deleteBtn.addEventListener('click', () => deletePost(postId, li));
          li.appendChild(deleteBtn);
        } else {
          alert(data.error || '수정 실패');
        }
      } catch (error) {
        alert('서버 오류 발생');
        console.error(error);
      }
    });

    // 취소 버튼 클릭 이벤트
    li.querySelector('#cancelEditBtn').addEventListener('click', () => {
      li.innerHTML = `<a href="/community/post/${postId}">${oldTitle}</a>`;
      const editBtn = document.createElement('button');
      editBtn.textContent = '수정';
      editBtn.style.marginLeft = '10px';
      editBtn.addEventListener('click', () => openEditForm(li, postId));
      li.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '삭제';
      deleteBtn.style.marginLeft = '5px';
      deleteBtn.addEventListener('click', () => deletePost(postId, li));
      li.appendChild(deleteBtn);
    });
  }

  async function deletePost(postId, li) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/mypage/userCommunity/delete/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        li.remove();
        if (communityPostList.children.length === 0) {
          communityPostList.innerHTML = '<li>작성한 커뮤니티 게시글이 없습니다.</li>';
        }
      } else {
        alert(data.error || '삭제 실패');
      }
    } catch (error) {
      alert('서버 오류 발생');
      console.error(error);
    }
  }
});
