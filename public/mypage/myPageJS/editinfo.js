// 아이디 중복 체크, 입력검증
  const userIdInput = document.getElementById('user_id');
  const userIdError = document.getElementById('user_id_error');
  const userIdSuccess = document.getElementById('user_id_success');
  const saveInfoBtn = document.getElementById('saveInfoBtn');

  let checkIdTimeout;
  let isComposing = false;

  const idRegex = /^[a-zA-Z0-9]*$/;

// 입력 중 조합 상태 체크 (한글 입력 처리용)
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

// 아이디 입력 핸들러
  function handleUserIdInput(value) {
    if (value === '') {
      userIdError.style.display = 'none';
      userIdSuccess.style.display = 'none';
      return;
    }

    if (!idRegex.test(value)) {
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

// 저장 버튼 클릭 이벤트 (중복 등록 X)
  if (saveInfoBtn) {
    saveInfoBtn.addEventListener('click', () => {
      const userId = userIdInput.value.trim();

      if (!idRegex.test(userId)) {
        alert('아이디는 영어와 숫자만 가능합니다.');
        userIdInput.focus();
        return;
      }

      // 여기서 저장 처리 로직 추가하면 됨
      console.log('저장 요청 보낼 아이디:', userId);
    });
  }

  // 로그아웃 처리
  document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        alert('로그아웃 되었습니다.');
        location.href = '/';
      });
    }
  });
