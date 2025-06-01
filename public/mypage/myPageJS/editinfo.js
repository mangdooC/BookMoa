// 아이디 중복 체크, 입력검증
const userIdInput = document.getElementById('user_id');
const userIdError = document.getElementById('user_id_error');
const userIdSuccess = document.getElementById('user_id_success');
let checkIdTimeout;
let isComposing = false;

if (userIdInput) {
  userIdInput.addEventListener('compositionstart', () => {
    isComposing = true;
  });

  userIdInput.addEventListener('compositionend', (e) => {
    isComposing = false;
    handleUserIdInput(e.target.value.trim());
  });

  userIdInput.addEventListener('input', (e) => {
    if (isComposing) return;
    clearTimeout(checkIdTimeout);
    handleUserIdInput(e.target.value.trim());
  });
}

function handleUserIdInput(value) {
  const regex = /^[a-zA-Z0-9]*$/;

  if (value === '') {
    userIdError.style.display = 'none';
    userIdSuccess.style.display = 'none';
    return;
  }

  if (!regex.test(value)) {
    userIdError.style.display = 'block';
    userIdError.textContent = '아이디는 영어와 숫자만 가능합니다.';
    userIdSuccess.style.display = 'none';
    return;
  }

  checkIdTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`/checkId?user_id=${encodeURIComponent(value)}`);
      if (!res.ok) throw new Error('서버 오류');
      const data = await res.json();

      if (!data.available) {
        userIdError.style.display = 'block';
        userIdError.textContent = '이미 존재하는 아이디입니다.';
        userIdSuccess.style.display = 'none';
      } else {
        userIdError.style.display = 'none';
        userIdSuccess.style.display = 'block';
        userIdSuccess.textContent = '사용 가능한 아이디입니다.';
      }
    } catch (err) {
      userIdError.style.display = 'block';
      userIdError.textContent = '서버 오류 발생';
      userIdSuccess.style.display = 'none';
    }
  }, 500);
}

//로그아웃
const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token'); // 토큰 삭제
        alert('로그아웃 되었습니다.');
        location.href = '/'; 
    });
}