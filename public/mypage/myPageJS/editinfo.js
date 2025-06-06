document.addEventListener('DOMContentLoaded', async () => {
  const nicknameDisplay = document.getElementById('nicknameDisplay');
  const profilePreview = document.getElementById('profilePreview');
  const profileImageInput = document.getElementById('profileImage');
  const saveInfoBtn = document.getElementById('saveInfoBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  const nicknameInput = document.getElementById('nickname');
  const passwordInput = document.getElementById('password');
  const addressInput = document.getElementById('address');

  // 에러 시 디폴트 사진으로 뜨게
  profilePreview.onerror = () => {
    profilePreview.onerror = null; 
    profilePreview.src = '/mypage/images/default.jpg';
  };

  // 초기 정보 로딩
  try {
    const res = await fetch('/api/user/info', {  
      credentials: 'include',
    });

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

    profilePreview.src = data.profile_image || '/mypage/images/default.jpg';
  } catch (e) {
    console.error('초기 유저 정보 로딩 실패:', e);
    alert('유저 정보를 불러오는 중 오류가 발생했습니다.');
  }

  // 정보 수정 이벤트
  if (saveInfoBtn) {
    saveInfoBtn.addEventListener('click', async () => {
      const password = passwordInput?.value.trim() || '';
      const nickname = nicknameInput?.value.trim() || '';
      const address = addressInput?.value.trim() || '';

      if (nickname === '') {
        alert('닉네임은 공백일 수 없습니다.');
        return;
      }

      if (password !== '') {
        const pwRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{4,12}$/;
        if (!pwRegex.test(password)) {
          alert('비밀번호는 영어, 숫자, 특수문자 포함 4~12자만 가능합니다.');
          return;
        }
      }

      const updateData = {};
      if (password) updateData.password = password;
      if (nickname) updateData.nickname = nickname;
      if (address) updateData.address = address;

      try {
        const res = await fetch('/api/user/edit', {  
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updateData),
        });

        if (res.status === 401) {
          alert('로그인 세션이 만료되었습니다.');
          location.href = '/login';
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          alert(data.error || '정보 수정 실패');
          return;
        }

        alert(data.message || '정보 수정 완료');

        if (nickname) {
          nicknameDisplay.textContent = nickname;
          nicknameInput.value = nickname;
        }

        passwordInput.value = '';
        if (data.address) addressInput.value = data.address;
      } catch (err) {
        console.error('정보 수정 중 에러:', err);
        alert('서버 오류 발생');
      }
    });
  }

  // 프로필 이미지 업로드 & 미리보기
  if (profilePreview && profileImageInput) {
    profilePreview.style.cursor = 'pointer';

    profilePreview.addEventListener('click', () => {
      profileImageInput.click();
    });

    profileImageInput.addEventListener('change', async () => {
      const file = profileImageInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
        profilePreview.src = e.target.result;
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('profileImage', file);

      try {
        const res = await fetch('/api/user/upload-profile', {  
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (res.status === 401) {
          alert('로그인 세션이 만료되었습니다.');
          location.href = '/login';
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          alert(data.error || '업로드 실패');
          return;
        }

        alert('프로필 이미지 업로드 완료');
        profilePreview.src = data.imageUrl;
      } catch (err) {
        console.error('프로필 업로드 오류:', err);
        alert('서버 오류 발생');
      }
    });
  }
});
