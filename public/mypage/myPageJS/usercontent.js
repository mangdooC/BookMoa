async function loadPostsList(userId) {
  const base = '/api/user-contents';
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('로그인 필요');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`
  };

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
    const bookRes = await fetch(`${base}/user/${userId}/book-reviews`, { headers });
    if (!bookRes.ok) throw new Error('도서 리뷰 불러오기 실패');
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
    const libRes = await fetch(`${base}/user/${userId}/library-reviews`, { headers });
    if (!libRes.ok) throw new Error('도서관 리뷰 불러오기 실패');
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
    const postRes = await fetch(`${base}/user/${userId}/community-posts`, { headers });
    if (!postRes.ok) throw new Error('커뮤니티 게시글 불러오기 실패');
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

    // 4. 커뮤니티 댓글
    const commentRes = await fetch(`${base}/user/${userId}/community-comments`, { headers });
    if (!commentRes.ok) throw new Error('커뮤니티 댓글 불러오기 실패');
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
  const userId = localStorage.getItem('userId');
  if (userId) {
    loadPostsList(userId);
  } else {
    console.error('userId 없음');
  }
});