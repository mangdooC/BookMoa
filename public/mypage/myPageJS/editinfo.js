document.addEventListener('DOMContentLoaded', () => {
  // 아이디 입력창, 에러 메시지, 성공 메시지, 저장 버튼, 로그아웃 버튼 요소를 가져옵니다.
  const userIdInput = document.getElementById('user_id');
  const userIdError = document.getElementById('user_id_error');
  const userIdSuccess = document.getElementById('user_id_success');
  const saveInfoBtn = document.getElementById('saveInfoBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  let checkIdTimeout; // 아이디 중복 검사 시 지연 시간을 위한 타임아웃 변수입니다.
  let isComposing = false; // 한글 입력 중인지 확인하는 변수입니다.
  const idRegex = /^[a-zA-Z0-9]*$/; // 아이디로 허용할 문자 (영어 대소문자 및 숫자)입니다.

  if (userIdInput) {
    // 한글 입력이 시작되면 조합 중임을 표시합니다.
    userIdInput.addEventListener('compositionstart', () => {
      isComposing = true;
    });

    // 한글 입력이 끝나면 조합 중 상태를 해제하고 아이디 중복 검사를 진행합니다.
    userIdInput.addEventListener('compositionend', (e) => {
      isComposing = false;
      handleUserIdInput(e.target.value.trim());
    });

    // 일반 입력 이벤트 처리입니다. (조합 중이면 무시합니다.)
    userIdInput.addEventListener('input', (e) => {
      if (isComposing) return;

      clearTimeout(checkIdTimeout); // 이전 타임아웃을 취소합니다.
      handleUserIdInput(e.target.value.trim()); // 새로운 입력 값으로 검사합니다.
    });
  }

  /**
   * 아이디 유효성 및 중복 여부를 검사하는 함수입니다.
   * @param {string} value - 입력된 아이디 값입니다.
   */

  function handleUserIdInput(value) {
    if (!userIdError || !userIdSuccess) return;

    // 입력값이 없을 경우, 메시지를 모두 숨깁니다.
    if (value === '') {
      userIdError.style.display = 'none';
      userIdSuccess.style.display = 'none';
      return;
    }

    // 아이디 형식이 올바르지 않으면 에러 메시지를 표시합니다.
    if (!idRegex.test(value)) {
      userIdError.style.display = 'block';
      userIdError.textContent = '아이디는 영어와 숫자만 가능합니다.';
      userIdSuccess.style.display = 'none';
      return;
    }

    // 입력 후 500ms 후에 서버에 중복 여부를 요청합니다.
    checkIdTimeout = setTimeout(() => {
      fetch(`/api/checkId?user_id=${encodeURIComponent(value)}`)
        .then(res => {
          if (!res.ok) throw new Error('서버 오류가 발생했습니다.');
          return res.json();
        })
        .then(data => {
          if (!data.available) {
            userIdError.style.display = 'block';
            userIdError.textContent = '이미 존재하는 아이디입니다.';
            userIdSuccess.style.display = 'none';
          } else {
            userIdError.style.display = 'none';
            userIdSuccess.style.display = 'block';
            userIdSuccess.textContent = '사용 가능한 아이디입니다.';
          }
        })
        .catch(() => {
          userIdError.style.display = 'block';
          userIdError.textContent = '서버 오류가 발생했습니다.';
          userIdSuccess.style.display = 'none';
        });
    }, 500);
  }

  // 저장 버튼 클릭 시 사용자 정보를 서버에 전송합니다.
    if (saveInfoBtn) {
      saveInfoBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        const userId = userIdInput.value.trim();
        const password = document.getElementById('password')?.value.trim() || '';
        const nickname = document.getElementById('nickname')?.value.trim() || '';
        const address = document.getElementById('address')?.value.trim() || '';

        // 아이디 형식 검사
        if (userId !== '' && !idRegex.test(userId)) {
          alert('아이디는 영어와 숫자만 가능합니다.');
          userIdInput.focus();
          return;
        }

        // 비밀번호 형식 검사
        if (password !== '') {
          const passwordRegex = /^[a-zA-Z0-9]{4,12}$/;
          if (!passwordRegex.test(password)) {
            alert('비밀번호는 영어와 숫자 4~12자만 가능합니다.');
            return;
          }
        }

        // 서버에 보낼 데이터 구성
        const updateData = {};
        if (userId !== '') updateData.user_id = userId;
        if (password !== '') updateData.password = password;
        if (nickname !== '') updateData.nickname = nickname;
        if (address !== '') updateData.address = address;

        try {
          const res = await fetch('/api/user/edit', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updateData),
          });

          const data = await res.json();

          if (!res.ok) {
            alert(data.error || '정보 수정에 실패했습니다.');
            return;
          }

          alert(data.message || '정보가 성공적으로 수정되었습니다.');
        } catch (err) {
          alert('서버 오류가 발생했습니다.');
        }
      });
    }

      // 로그아웃 버튼 클릭 시
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        alert('로그아웃 되었습니다');
        location.reload(); // 새로고침해서 상태 반영
        window.location.href = '/';
      });
  });