// 주소 검색 함수
function searchMainAddress() {
  new daum.Postcode({
    oncomplete: function(data) {
      const addr = data.address;
      document.getElementById('address').value = addr;
    }
  }).open();
}

function searchPreferredAddress(inputId) {
  new daum.Postcode({
    oncomplete: function(data) {
      const addr = data.address;
      document.getElementById(inputId).value = addr;
      const display = document.getElementById(`selectedAddress_${inputId}`);
      if (display) display.textContent = '선택한 주소: ' + addr;
    }
  }).open();
}

// 임시 저장 함수 (임의로 alert 넣음, 서버 연동 시 변경 필요)
function savePreferredAddresses() {
  const addr1 = document.getElementById('preferredAddress1').value.trim();
  const addr2 = document.getElementById('preferredAddress2').value.trim();
  const addr3 = document.getElementById('preferredAddress3').value.trim();
  alert(`선호지역 저장됨:\n1: ${addr1}\n2: ${addr2}\n3: ${addr3}`);
  // 서버 저장 로직 추가 예정
}
