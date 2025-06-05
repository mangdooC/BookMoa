document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  const nicknameDisplay = document.getElementById('nicknameDisplay');
  const profilePreview = document.getElementById('profilePreview');
  const profileImageInput = document.getElementById('profileImage');
  const saveInfoBtn = document.getElementById('saveInfoBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  let currentProfileImage = profilePreview.src;

  // 초기 사용자 정보 로딩
  if (token) {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('정보 로딩 실패');

      const data = await res.json();

      if (data.nickname) {
        nicknameDisplay.textContent = data.nickname;
        const nicknameInput = document.getElementById('nickname');
        if (nicknameInput) {
          nicknameInput.value = data.nickname;
        }
      }

      // 프로필 이미지가 없으면 기본 이미지 경로로 대체
      const profileImageUrl = data.profile_image || '/mypage/images/default.jpg';
      profilePreview.src = profileImageUrl;
      currentProfileImage = profileImageUrl; // 여기 최신화

      // 주소도 서버에서 온 값으로 초기화
      if (data.address) {
        const addressInput = document.getElementById('address');
        if (addressInput) addressInput.value = data.address;
      }
    } catch (e) {
      console.error('초기 유저 정보 로딩 실패:', e);
    }
  }

  // 정보 수정 (닉네임, 비번, 주소)
  if (saveInfoBtn) {
    saveInfoBtn.addEventListener('click', async () => {
      const password = document.getElementById('password')?.value.trim() || '';
      const nickname = document.getElementById('nickname')?.value.trim() || '';
      const address = document.getElementById('address')?.value.trim() || '';

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
      if (password !== '') updateData.password = password;
      if (nickname !== '') updateData.nickname = nickname;
      if (address !== '') updateData.address = address;

      try {
        const res = await fetch('/api/user/edit', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.error || '정보 수정 실패');
          return;
        }

        alert(data.message || '정보 수정 완료');

        if (nickname !== '') {
          nicknameDisplay.textContent = nickname;
          document.getElementById('nickname').value = nickname;
        }

        if (data.profile_image && data.profile_image.trim() !== '') {
          profilePreview.src = data.profile_image;
          currentProfileImage = data.profile_image; // 최신화
        } else {
          profilePreview.src = currentProfileImage || '/mypage/images/default.jpg';
        }

        document.getElementById('password').value = '';
        if (data.address) document.getElementById('address').value = data.address;
      } catch (err) {
        alert('서버 오류 발생');
      }
    });
  }

  // 프로필 이미지 클릭 → 선택 → 미리보기 + 업로드
  if (profilePreview && profileImageInput) {
    profilePreview.style.cursor = 'pointer';

    profilePreview.addEventListener('click', () => {
      profileImageInput.click();
    });

    profileImageInput.addEventListener('change', async () => {
      const file = profileImageInput.files[0];
      if (!file) return;

      if (!token) {
        alert('로그인 상태가 아닙니다.');
        profileImageInput.value = ''; // 선택 초기화
        return;
      }

      // 미리보기는 토큰 체크 후에
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.error || '업로드 실패');
          profilePreview.src = currentProfileImage || '/mypage/images/default.jpg'; // 원복
          profileImageInput.value = ''; // 선택 초기화
          return;
        }

        alert('프로필 이미지 업로드 완료');
        profilePreview.src = data.imageUrl;
        currentProfileImage = data.imageUrl; // 최신화
        profileImageInput.value = ''; // 선택 초기화
      } catch (err) {
        console.error(err);
        alert('서버 오류 발생');
        profilePreview.src = currentProfileImage || '/mypage/images/default.jpg'; // 원복
        profileImageInput.value = ''; // 선택 초기화
      }
    });
  }

  // 로그아웃 처리
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      alert('로그아웃 되었습니다.');
      location.href = '/';
    });
  }
});
