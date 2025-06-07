document.getElementById('saveInfoBtn').addEventListener('click', async () => {
  const password = document.getElementById('password').value;
  const nickname = document.getElementById('nickname').value;
  const address = document.getElementById('address').value;

  const res = await fetch('/mypage/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, nickname, address }),
  });

  if (res.ok) {
    alert('정보 수정 완료');
    window.location.reload();
  } else {
    const text = await res.text();
    alert('에러: ' + text);
  }
});

  const profileImageInput = document.getElementById('profileImage');
  const profilePreview = document.getElementById('profilePreview');
  const profileForm = document.getElementById('profileForm');

  // 이미지 클릭하면 파일 선택 창 띄우기
  profilePreview.addEventListener('click', () => {
    profileImageInput.click();
  });

  // 파일 선택하면 미리보기 바꾸고 폼 자동 제출
  profileImageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      // 미리보기 바꾸기 (로컬 URL)
      const reader = new FileReader();
      reader.onload = (e) => {
        profilePreview.src = e.target.result;
      };
      reader.readAsDataURL(file);

      // 자동으로 폼 제출
      profileForm.submit();
    }
  });
