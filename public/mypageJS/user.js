// 페이지 열릴 때 최신 유저 정보 받아서 화면에 세팅
async function loadUserProfile() {
  try {
    const res = await fetch('/user/profile');
    if (!res.ok) throw new Error('프로필 불러오기 실패');
    const data = await res.json();

    document.getElementById('nickname').value = data.nickname;
    document.getElementById('address').value = data.address;
    document.getElementById('nicknameDisplay').textContent = data.nickname;
    document.getElementById('profilePreview').src = data.profileImage || '/mypage/images/default.jpg';
  } catch (err) {
    console.error(err);
    alert('프로필 정보를 불러오는 중 오류가 발생했습니다.');
  }
}

// 저장 버튼 눌렀을 때 처리
document.getElementById('saveInfoBtn').addEventListener('click', async (e) => {
  e.preventDefault();

  const password = document.getElementById('password').value;
  const nickname = document.getElementById('nickname').value;
  const address = document.getElementById('address').value;

  try {
    const res = await fetch('/user/update-info', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, nickname, address }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || '정보 수정 완료');
      // 새로고침 말고 바로 닉네임 UI 업데이트
      document.getElementById('nicknameDisplay').textContent = nickname;
    } else {
      alert('에러: ' + (data.error || '알 수 없는 오류'));
    }
  } catch (err) {
    alert('네트워크 에러 발생');
  }
});

// 프로필 이미지 업로드 처리
const profileImageInput = document.getElementById('profileImage');
const profilePreview = document.getElementById('profilePreview');

profilePreview.addEventListener('click', () => {
  profileImageInput.click();
});

profileImageInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 미리보기 바로 띄우기
  const reader = new FileReader();
  reader.onload = (e) => {
    profilePreview.src = e.target.result;
  };
  reader.readAsDataURL(file);

  const formData = new FormData();
  formData.append('profileImage', file);

  try {
    const res = await fetch('/user/upload-profile-image', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || '프로필 이미지가 변경되었습니다.');
      // 서버에서 받은 이미지 경로로 교체 (캐시 방지용 timestamp 포함)
      profilePreview.src = data.profileImage + '?t=' + Date.now();
    } else {
      alert('에러: ' + (data.error || '알 수 없는 오류'));
    }
  } catch (err) {
    alert('네트워크 에러 발생');
  }
});

// 페이지 열릴 때 프로필 정보 불러오기
window.addEventListener('DOMContentLoaded', loadUserProfile);
