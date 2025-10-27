// DOM 요소
const headerProfileImage = document.getElementById('headerProfileImage');
const headerProfileDropdown = document.getElementById('headerProfileDropdown');
const headerLogoutButton = document.getElementById('headerLogoutButton');
const profileImageInput = document.getElementById('profileImageInput');
const profileCircle = document.getElementById('profileCircle');
const profilePreview = document.getElementById('profilePreview');
const emailInput = document.getElementById('email');
const nicknameInput = document.getElementById('nickname');
const profileForm = document.getElementById('profileForm');
const submitButton = document.getElementById('submitButton');
const deleteButton = document.getElementById('deleteButton');
const toast = document.getElementById('toast');

// 상태
let selectedProfileImageBase64 = null;
let isNicknameValid = false;
let originalNickname = '';

// 헤더 프로필 드롭다운
headerProfileImage.addEventListener('click', (e) => {
    e.stopPropagation();
    headerProfileDropdown.style.display = headerProfileDropdown.style.display === 'none' ? 'block' : 'none';
});

document.addEventListener('click', (e) => {
    if (!headerProfileImage.contains(e.target) && !headerProfileDropdown.contains(e.target)) {
        headerProfileDropdown.style.display = 'none';
    }
});

// 헤더 로그아웃
headerLogoutButton.addEventListener('click', async () => {
    try {
        await fetch('/api/auth/sessions', {
            method: 'DELETE',
            credentials: 'include'
        });
        window.location.href = '/signin';
    } catch (error) {
        console.error('로그아웃 오류:', error);
        window.location.href = '/signin';
    }
});

// 프로필 이미지 클릭
profileCircle.addEventListener('click', () => {
    profileImageInput.click();
});

// 프로필 이미지 변경
profileImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (file) {
        // 파일 타입 체크
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            alert('JPG, PNG 파일만 업로드 가능합니다.');
            return;
        }

        // 파일 크기 체크 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('파일 크기는 5MB 이하여야 합니다.');
            return;
        }

        // 파일 읽기
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target.result;
            selectedProfileImageBase64 = base64String;
            profilePreview.style.backgroundImage = `url(${base64String})`;
        };
        reader.readAsDataURL(file);
    }
});

// 닉네임 유효성 검사
function validateNickname(nickname) {
    if (!nickname || nickname.trim() === '') {
        return {
            valid: false,
            message: '*닉네임을 입력해주세요'
        };
    }

    if (nickname.length < 2 || nickname.length > 10) {
        return {
            valid: false,
            message: '*닉네임은 최소 2자 이상, 최대 10자 이하이어야 합니다'
        };
    }

    if (/\s/.test(nickname)) {
        return {
            valid: false,
            message: '*띄어쓰기를 없애주세요'
        };
    }

    return { valid: true, message: '' };
}

// 에러 메시지 표시
function showError(message) {
    const helperText = document.querySelector('.helper-text');
    if (message) {
        helperText.textContent = message;
        nicknameInput.classList.add('error');
    } else {
        helperText.textContent = '';
        nicknameInput.classList.remove('error');
    }
}

// 닉네임 입력 이벤트
nicknameInput.addEventListener('input', () => {
    const result = validateNickname(nicknameInput.value);
    isNicknameValid = result.valid;
    showError(result.message);
});

nicknameInput.addEventListener('blur', () => {
    const result = validateNickname(nicknameInput.value);
    isNicknameValid = result.valid;
    showError(result.message);
});

// 폼 제출
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 닉네임 유효성 검사
    if (!isNicknameValid) {
        const result = validateNickname(nicknameInput.value);
        showError(result.message);
        return;
    }

    try {
        // TODO: 실제 API 연동
        // const requestData = {
        //     nickname: nicknameInput.value
        // };
        // if (selectedProfileImageBase64) {
        //     requestData.profileImage = selectedProfileImageBase64;
        // }

        // 임시: 토스트 메시지 표시
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);

    } catch (error) {
        console.error('프로필 수정 오류:', error);
        alert('프로필 수정 중 오류가 발생했습니다.');
    }
});

// 회원 탈퇴
deleteButton.addEventListener('click', async () => {
    if (!confirm('정말 탈퇴하시겠습니까?')) {
        return;
    }

    try {
        // TODO: 실제 API 연동
        // const response = await fetch('/api/users', {
        //     method: 'DELETE',
        //     credentials: 'include'
        // });

        alert('회원 탈퇴가 완료되었습니다.');
        window.location.href = '/signin';
    } catch (error) {
        console.error('회원 탈퇴 오류:', error);
        alert('회원 탈퇴 중 오류가 발생했습니다.');
    }
});

// 초기화
async function init() {
    // TODO: 사용자 정보 가져오기
    // 임시 데이터
    emailInput.value = 'example@example.com';
    nicknameInput.value = '닉네임';
    originalNickname = '닉네임';
    isNicknameValid = true;
}

init();
