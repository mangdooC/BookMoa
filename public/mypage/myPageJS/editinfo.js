document.addEventListener('DOMContentLoaded', () => {
  // 아이디 입력창, 에러 메시지, 성공 메시지, 저장 버튼, 로그아웃 버튼 요소 가져오기
  const userIdInput = document.getElementById('user_id');
  const userIdError = document.getElementById('user_id_error');
  const userIdSuccess = document.getElementById('user_id_success');
  const saveInfoBtn = document.getElementById('saveInfoBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  let checkIdTimeout; // 아이디 중복 검사 시 딜레이 타임아웃 저장용 변수
  let isComposing = false; // 한글 입력기(IME) 조합 중인지 확인하는 변수
  const idRegex = /^[a-zA-Z0-9]*$/; // 허용할 아이디 문자 패턴 (영어 대소문자 및 숫자)

  if (userIdInput) {
    // 한글 입력 시작 시 조합 중 상태로 변경합니다.
    userIdInput.addEventListener('compositionstart', () => {
      isComposing = true;
    });

    // 한글 조합 종료 시 조합 상태 해제하고 아이디 중복 검사 실행합니다.
    userIdInput.addEventListener('compositionend', (e) => {
      isComposing = false;
      handleUserIdInput(e.target.value.trim());
    });

    // 일반 입력 이벤트 처리 (조합 중이면 무시)
    userIdInput.addEventListener('input', (e) => {
      if (isComposing) return;

      clearTimeout(checkIdTimeout); // 이전 검사 딜레이 타임아웃 취소
      handleUserIdInput(e.target.value.trim()); // 새 입력값으로 검사 함수 실행
    });
  }

  /**
   * 아이디 입력값 유효성 검사 및 서버 중복 검사 함수입니다.
   * @param {string} value - 현재 입력된 아이디 값
   */
  function handleUserIdInput(value) {
    if (!userIdError || !userIdSuccess) return; // 메시지 요소 없으면 종료

    // 입력값이 비었을 경우 메시지를 모두 숨깁니다.
    if (value === '') {
      userIdError.style.display = 'none';
      userIdSuccess.style.display = 'none';
      return;
    }

    // 아이디 형식이 맞지 않으면 에러 메시지 표시 후 함수 종료합니다.
    if (!idRegex.test(value)) {
      userIdError.style.display = 'block';
      userIdError.textContent = '아이디는 영어와 숫자만 가능합니다.';
      userIdSuccess.style.display = 'none';
      return;
    }

    // 500ms 딜레이 후 서버에 중복 여부를 요청합니다. (디바운스 처리)
    checkIdTimeout = setTimeout(() => {
      fetch(`/checkId?user_id=${encodeURIComponent(value)}`)
        .then(res => {
          if (!res.ok) throw new Error('서버 오류'); // 서버 상태가 정상이 아니면 예외 발생
          return res.json();
        })
        .then(data => {
          // 서버 응답에 따라 중복 여부 처리
          if (!data.available) {
            // 중복된 아이디면 에러 메시지 표시
            userIdError.style.display = 'block';
            userIdError.textContent = '이미 존재하는 아이디입니다.';
            userIdSuccess.style.display = 'none';
          } else {
            // 사용 가능한 아이디면 성공 메시지 표시
            userIdError.style.display = 'none';
            userIdSuccess.style.display = 'block';
            userIdSuccess.textContent = '사용 가능한 아이디입니다.';
          }
        })
        .catch(() => {
          // 서버 오류 발생 시 에러 메시지 표시
          userIdError.style.display = 'block';
          userIdError.textContent = '서버 오류 발생';
          userIdSuccess.style.display = 'none';
        });
    }, 500);
  }

  // 저장 버튼 클릭 시 사용자 정보 수정 요청 처리
  if (saveInfoBtn) {
    saveInfoBtn.addEventListener('click', async () => {
      const userId = userIdInput ? userIdInput.value.trim() : '';
      const password = document.getElementById('password')?.value.trim() || '';
      const nickname = document.getElementById('nickname')?.value.trim() || '';
      const address = document.getElementById('address')?.value.trim() || '';

      // 아이디 형식 다시 한번 확인
      if (userId !== '' && !idRegex.test(userId)) {
        alert('아이디는 영어와 숫자만 가능합니다.');
        userIdInput.focus();
        return;
      }

      // 비밀번호 형식 확인 (4~12자 영어, 숫자)
      if (password !== '') {
        const passwordRegex = /^[a-zA-Z0-9]{4,12}$/;
        if (!passwordRegex.test(password)) {
          alert('비밀번호는 영어와 숫자 4~12자만 가능합니다.');
          return;
        }
      }

      // 서버에 보낼 데이터 구성 (빈 값은 제외)
      const updateData = {};
      if (userId !== '') updateData.user_id = userId;
      if (password !== '') updateData.password = password;
      if (nickname !== '') updateData.nickname = nickname;
      if (address !== '') updateData.address = address;

      try {
        const res = await fetch('/updateUserInfo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || '수정 실패');
          return;
        }

        alert(data.message || '수정 성공');
      } catch (err) {
        alert('서버 오류 발생');
      }
    });
  }

  // 로그아웃 버튼 클릭 시 처리
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/logout', {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) {
          alert('로그아웃 실패');
          return;
        }

        // 로그아웃 성공하면 로그인 페이지로 이동합니다.
        window.location.href = '/login';
      } catch (err) {
        alert('서버 오류');
      }
    });
  }
});
