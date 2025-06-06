async function loadPostsList() {
  const base = '/api/user-contents';

  const bookReviewList = document.getElementById('bookReviewList');
  const libraryReviewList = document.getElementById('libraryReviewList');
  const communityPostList = document.getElementById('communityPostList');
  const communityCommentList = document.getElementById('communityCommentList');

  // 초기화
  bookReviewList.innerHTML = '';
  libraryReviewList.innerHTML = '';
  communityPostList.innerHTML = '';
  communityCommentList.innerHTML = '';

  try {
    // 도서 리뷰 조회
    const bookReviewsRes = await fetch(`${base}/book-reviews`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!bookReviewsRes.ok) throw new Error('도서 리뷰 조회 실패');
    const bookReviews = await bookReviewsRes.json();
    bookReviews.forEach(review => {
      const li = document.createElement('li');

      const strong = document.createElement('strong');
      strong.textContent = review.book_title;
      li.appendChild(strong);

      li.appendChild(document.createTextNode(` (${review.rating}점)\n${review.content}\n`));

      const editBtn = document.createElement('button');
      editBtn.textContent = '수정';
      editBtn.onclick = () => editBookReview(review.review_id, review.content, review.rating);
      li.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '삭제';
      deleteBtn.onclick = () => deleteBookReview(review.review_id);
      li.appendChild(deleteBtn);

      bookReviewList.appendChild(li);
    });

    // 도서관 리뷰 조회
    const libraryReviewsRes = await fetch(`${base}/library-reviews`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!libraryReviewsRes.ok) throw new Error('도서관 리뷰 조회 실패');
    const libraryReviews = await libraryReviewsRes.json();
    libraryReviews.forEach(review => {
      const li = document.createElement('li');

      const strong = document.createElement('strong');
      strong.textContent = review.library_name;
      li.appendChild(strong);

      li.appendChild(document.createTextNode(` (${review.rating}점)\n${review.content}\n`));

      const editBtn = document.createElement('button');
      editBtn.textContent = '수정';
      editBtn.onclick = () => editLibraryReview(review.review_id, review.content, review.rating);
      li.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '삭제';
      deleteBtn.onclick = () => deleteLibraryReview(review.review_id);
      li.appendChild(deleteBtn);

      libraryReviewList.appendChild(li);
    });

    // 커뮤니티 글 조회
    const communityPostsRes = await fetch(`${base}/community-posts`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!communityPostsRes.ok) throw new Error('커뮤니티 글 조회 실패');
    const communityPosts = await communityPostsRes.json();
    communityPosts.forEach(post => {
      const li = document.createElement('li');

      const strong = document.createElement('strong');
      strong.textContent = post.title;
      li.appendChild(strong);

      li.appendChild(document.createTextNode(`\n${post.content}\n`));

      const editBtn = document.createElement('button');
      editBtn.textContent = '수정';
      editBtn.onclick = () => editCommunityPost(post.post_id, post.title, post.content);
      li.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '삭제';
      deleteBtn.onclick = () => deleteCommunityPost(post.post_id);
      li.appendChild(deleteBtn);

      communityPostList.appendChild(li);
    });

    // 커뮤니티 댓글 조회
    const communityCommentsRes = await fetch(`${base}/community-comments`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!communityCommentsRes.ok) throw new Error('커뮤니티 댓글 조회 실패');
    const communityComments = await communityCommentsRes.json();
    communityComments.forEach(comment => {
      const li = document.createElement('li');

      const strong = document.createElement('strong');
      strong.textContent = `${comment.post_title} 댓글`;
      li.appendChild(strong);

      li.appendChild(document.createTextNode(`\n${comment.content}\n`));

      const editBtn = document.createElement('button');
      editBtn.textContent = '수정';
      editBtn.onclick = () => editCommunityComment(comment.comment_id, comment.content);
      li.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '삭제';
      deleteBtn.onclick = () => deleteCommunityComment(comment.comment_id);
      li.appendChild(deleteBtn);

      communityCommentList.appendChild(li);
    });

  } catch (err) {
    console.error('데이터 불러오기 실패:', err);
    alert('데이터 불러오는 중 에러 발생');
  }
}

// 수정/삭제 함수들

async function editBookReview(reviewId, oldContent, oldRating) {
  const content = prompt('리뷰 내용을 수정하세요', oldContent);
  const rating = prompt('평점을 수정하세요 (1~5)', oldRating);
  if (content !== null && rating !== null) {
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      alert('평점은 1~5 사이 숫자여야 합니다');
      return;
    }
    try {
      const res = await fetch(`/api/user-contents/book-reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content, rating: ratingNum })
      });
      if (res.ok) {
        alert('도서 리뷰 수정 완료');
        loadPostsList();
      } else {
        const data = await res.json();
        alert(`수정 실패: ${data.message}`);
      }
    } catch (e) {
      alert('수정 중 오류 발생');
    }
  }
}

async function deleteBookReview(reviewId) {
  if (!confirm('도서 리뷰를 삭제하시겠습니까?')) return;
  try {
    const res = await fetch(`/api/user-contents/book-reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      alert('도서 리뷰 삭제 완료');
      loadPostsList();
    } else {
      const data = await res.json();
      alert(`삭제 실패: ${data.message}`);
    }
  } catch (e) {
    alert('삭제 중 오류 발생');
  }
}

async function editLibraryReview(reviewId, oldContent, oldRating) {
  const content = prompt('리뷰 내용을 수정하세요', oldContent);
  const rating = prompt('평점을 수정하세요 (1~5)', oldRating);
  if (content !== null && rating !== null) {
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      alert('평점은 1~5 사이 숫자여야 합니다');
      return;
    }
    try {
      const res = await fetch(`/api/user-contents/library-reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content, rating: ratingNum })
      });
      if (res.ok) {
        alert('도서관 리뷰 수정 완료');
        loadPostsList();
      } else {
        const data = await res.json();
        alert(`수정 실패: ${data.message}`);
      }
    } catch (e) {
      alert('수정 중 오류 발생');
    }
  }
}

async function deleteLibraryReview(reviewId) {
  if (!confirm('도서관 리뷰를 삭제하시겠습니까?')) return;
  try {
    const res = await fetch(`/api/user-contents/library-reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      alert('도서관 리뷰 삭제 완료');
      loadPostsList();
    } else {
      const data = await res.json();
      alert(`삭제 실패: ${data.message}`);
    }
  } catch (e) {
    alert('삭제 중 오류 발생');
  }
}

async function editCommunityPost(postId, oldTitle, oldContent) {
  const title = prompt('게시글 제목을 수정하세요', oldTitle);
  const content = prompt('게시글 내용을 수정하세요', oldContent);
  if (title !== null && content !== null) {
    try {
      const res = await fetch(`/api/user-contents/community-posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, content })
      });
      if (res.ok) {
        alert('게시글 수정 완료');
        loadPostsList();
      } else {
        const data = await res.json();
        alert(`수정 실패: ${data.message}`);
      }
    } catch (e) {
      alert('수정 중 오류 발생');
    }
  }
}

async function deleteCommunityPost(postId) {
  if (!confirm('게시글을 삭제하시겠습니까?')) return;
  try {
    const res = await fetch(`/api/user-contents/community-posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      alert('게시글 삭제 완료');
      loadPostsList();
    } else {
      const data = await res.json();
      alert(`삭제 실패: ${data.message}`);
    }
  } catch (e) {
    alert('삭제 중 오류 발생');
  }
}

async function editCommunityComment(commentId, oldContent) {
  const content = prompt('댓글 내용을 수정하세요', oldContent);
  if (content !== null) {
    try {
      const res = await fetch(`/api/user-contents/community-comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        alert('댓글 수정 완료');
        loadPostsList();
      } else {
        const data = await res.json();
        alert(`수정 실패: ${data.message}`);
      }
    } catch (e) {
      alert('수정 중 오류 발생');
    }
  }
}

async function deleteCommunityComment(commentId) {
  if (!confirm('댓글을 삭제하시겠습니까?')) return;
  try {
    const res = await fetch(`/api/user-contents/community-comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      alert('댓글 삭제 완료');
      loadPostsList();
    } else {
      const data = await res.json();
      alert(`삭제 실패: ${data.message}`);
    }
  } catch (e) {
    alert('삭제 중 오류 발생');
  }
}
