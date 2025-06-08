// 내 정보 수정 저장 버튼 이벤트
document.getElementById('saveInfoBtn').addEventListener('click', async (e) => {
  e.preventDefault(); // 폼 제출 막기

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
      // 새로고침 전에 성공 알림 띄우고 리로드
      window.location.reload();
    } else {
      alert('에러: ' + (data.error || '알 수 없는 오류'));
    }
  } catch (err) {
    alert('네트워크 에러 발생');
  }
});

// 프로필 이미지 업로드 관련
const profileImageInput = document.getElementById('profileImage');
const profilePreview = document.getElementById('profilePreview');

profilePreview.addEventListener('click', () => {
  profileImageInput.click();
});

profileImageInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 미리보기 변경
  const reader = new FileReader();
  reader.onload = (e) => {
    profilePreview.src = e.target.result;
  };
  reader.readAsDataURL(file);

  // fetch로 파일 업로드 처리
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
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('t', Date.now());
      window.location.href = newUrl.toString();
    } else {
      alert('에러: ' + (data.error || '알 수 없는 오류'));
    }
  } catch (err) {
    alert('네트워크 에러 발생');
  }
});
