document.addEventListener('DOMContentLoaded', async () => {
  const nicknameDisplay = document.getElementById('nicknameDisplay');
  const profilePreview = document.getElementById('profilePreview');
  const profileImageInput = document.getElementById('profileImage');
  const saveInfoBtn = document.getElementById('saveInfoBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  const nicknameInput = document.getElementById('nickname');
  const passwordInput = document.getElementById('password');
  const addressInput = document.getElementById('address');

  profilePreview.onerror = () => {
    profilePreview.onerror = null;
    profilePreview.src = '/mypage/images/default.jpg';
  };

  // 유저 정보 불러오기
  try {
    const res = await fetch('/api/userinfo', { credentials: 'include' });
    if (res.status === 401) {
      alert('로그인 세션이 만료되었습니다.');
      location.href = '/login';
      return;
    }
    if (!res.ok) throw new Error('정보 로딩 실패');

    const data = await res.json();

    if (data.nickname) {
      nicknameDisplay.textContent = data.nickname;
      nicknameInput.value = data.nickname;
    }
    if (data.address) {
      addressInput.value = data.address;
    }
    profilePreview.src = data.profile_image ? data.profile_image : '/mypage/images/default.jpg';
  } catch (e) {
    console.error('초기 유저 정보 로딩 실패:', e);
    alert('유저 정보를 불러오는 중 오류가 발생했습니다.');
    profilePreview.src = '/mypage/images/default.jpg';
  }

  // 정보 수정 저장
  if (saveInfoBtn) {
    saveInfoBtn.addEventListener('click', async () => {
      const password = passwordInput?.value.trim() || '';
      const nickname = nicknameInput?.value.trim() || '';
      const address = addressInput?.value.trim() || '';

      try {
        const res = await fetch('/mypage/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          credentials: 'include',
          body: new URLSearchParams({ password, nickname, address }),
        });

        if (res.redirected) {
          // 서버가 redirect 하면 새로고침
          location.href = res.url;
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          alert('정보 저장 실패: ' + text);
          return;
        }

        alert('정보가 성공적으로 저장되었습니다.');
        location.reload();
      } catch (err) {
        console.error('정보 저장 중 오류:', err);
        alert('정보 저장 중 오류가 발생했습니다.');
      }
    });
  }

  // 프로필 이미지 미리보기
  if (profileImageInput) {
    profileImageInput.addEventListener('change', () => {
      const file = profileImageInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          profilePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 프로필 이미지 업로드
  const uploadForm = document.getElementById('profileImageForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(uploadForm);
      try {
        const res = await fetch('/mypage/upload-image', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (res.redirected) {
          location.href = res.url;
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          alert('이미지 업로드 실패: ' + text);
          return;
        }

        alert('프로필 이미지가 업데이트 되었습니다.');
        location.reload();
      } catch (err) {
        console.error('이미지 업로드 중 오류:', err);
        alert('이미지 업로드 중 오류가 발생했습니다.');
      }
    });
  }

  // 로그아웃 버튼 이벤트 (있으면)
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/logout', { method: 'POST', credentials: 'include' });
        if (res.ok) location.href = '/login';
        else alert('로그아웃 실패');
      } catch {
        alert('로그아웃 중 오류 발생');
      }
    });
  }
});
