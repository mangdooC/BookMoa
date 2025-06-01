// 작성한 글 목록 불러오기
async function loadPostsList(userId) {
  const base = '/api/user-contents';

  const bookReviewList = document.getElementById('bookReviewList');
  const libraryReviewList = document.getElementById('libraryReviewList');
  const communityPostList = document.getElementById('communityPostList');
  const communityCommentList = document.getElementById('communityCommentList');

  bookReviewList.innerHTML = '';
  libraryReviewList.innerHTML = '';
  communityPostList.innerHTML = '';
  communityCommentList.innerHTML = '';

  try {
    // 1. 도서 리뷰
    const bookRes = await fetch(`${base}/reviews/book/${userId}`);
    const bookData = await bookRes.json();
    bookData.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `/book/review/${item.review_id}`; 
      a.textContent = `[${item.book_id}] ${item.content} (${item.rating}점)`;
      a.style.textDecoration = 'none';
      a.style.color = 'inherit';
      li.appendChild(a);
      bookReviewList.appendChild(li);
    });

    // 2. 도서관 리뷰
    const libRes = await fetch(`${base}/reviews/library/${userId}`);
    const libData = await libRes.json();
    libData.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `/library/review/${item.review_id}`; 
      a.textContent = `[${item.library_id}] ${item.content} (${item.rating}점)`;
      a.style.textDecoration = 'none';
      a.style.color = 'inherit';
      li.appendChild(a);
      libraryReviewList.appendChild(li);
    });

    // 3. 커뮤니티 게시글
    const postRes = await fetch(`${base}/posts/community/${userId}`);
    const postData = await postRes.json();
    postData.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `/community/post/${item.post_id}`; 
      a.textContent = `${item.title} (${item.view_count}조회수)`;
      a.style.textDecoration = 'none';
      a.style.color = 'inherit';
      li.appendChild(a);
      communityPostList.appendChild(li);
    });

    // 4. 커뮤니티 댓글 (링크 X)
    const commentRes = await fetch(`${base}/comments/community/${userId}`);
    const commentData = await commentRes.json();
    commentData.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `게시글 #${item.post_id}에 단 댓글: ${item.content}`;
      communityCommentList.appendChild(li);
    });

  } catch (err) {
    console.error('작성한 글 로딩 실패', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId'); // 예시: 유저 id 어딘가 저장되어 있다는 전제
  if (userId) {
    loadPostsList(userId);
  }
});