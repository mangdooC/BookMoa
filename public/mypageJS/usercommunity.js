document.addEventListener('DOMContentLoaded', () => {
  // 게시글 삭제
  document.querySelectorAll('.delete-post-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      const postId = btn.dataset.postId;
      if (confirm('정말 이 글을 삭제할까요?')) {
        try {
          const res = await fetch(`/community/communityList/post/${postId}/delete`, {
            method: 'POST',
          });
          if (res.ok) location.reload();
          else alert('삭제 실패');
        } catch (err) {
          console.error(err);
          alert('에러 발생');
        }
      }
    });
  });

  // 댓글 삭제
  document.querySelectorAll('.delete-comment-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      const commentId = btn.dataset.commentId;
      if (confirm('정말 이 댓글을 삭제할까요?')) {
        try {
          const res = await fetch(`/community/communityList/comment/${commentId}/delete`, {
            method: 'POST',
          });
          if (res.ok) location.reload();
          else alert('댓글 삭제 실패');
        } catch (err) {
          console.error(err);
          alert('에러 발생');
        }
      }
    });
  });
});
