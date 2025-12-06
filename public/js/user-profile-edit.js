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
let isNicknameValid = true; // 초기값은 true (기존 닉네임)
let originalNickname = '';
let currentUserId = null;
let selectedProfileFile = null;

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
        await fetch('/api/signout', {
            method: 'PATCH',
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

        selectedProfileFile = file;

        // 파일 읽기 (미리보기)
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target.result;
            profilePreview.style.backgroundImage = `url(${base64String})`;
            profilePreview.style.backgroundSize = 'cover';
            profilePreview.style.backgroundPosition = 'center';
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
        helperText.style.color = 'red';
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

    if (!currentUserId) {
        alert('사용자 정보를 불러오는 중입니다.');
        return;
    }

    // 닉네임 변경 없으면 유효성 검사 패스 (단, 빈값 등은 체크)
    if (nicknameInput.value !== originalNickname) {
        if (!isNicknameValid) {
            const result = validateNickname(nicknameInput.value);
            showError(result.message);
            return;
        }
    }

    try {
        const formData = new FormData();

        // 닉네임이 변경된 경우에만 전송 (혹은 항상 전송해도 됨)
        const updateRequest = {
            nickname: nicknameInput.value
        };

        formData.append('user', new Blob(
            [JSON.stringify(updateRequest)],
            {type: 'application/json'}
        ));

        if (selectedProfileFile) {
            formData.append('profileImage', selectedProfileFile);
        }

        const response = await fetch(`/api/users/${currentUserId}`, {
            method: 'PATCH',
            body: formData // Content-Type 자동 설정
        });

        if (response.ok) {
            // 성공 시
            const result = await response.json();
            const data = result.data;
            
            // UI 업데이트
            originalNickname = data.nickname;
            if (data.profileUrl) {
                headerProfileImage.style.backgroundImage = `url(${data.profileUrl})`;
                headerProfileImage.style.backgroundSize = 'cover';
                headerProfileImage.style.backgroundPosition = 'center';
            }

            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
                window.location.reload();
            }, 1500);
        } else {
            const error = await response.json();
            alert(error.message || '프로필 수정에 실패했습니다.');
        }

    } catch (error) {
        console.error('프로필 수정 오류:', error);
        alert('프로필 수정 중 오류가 발생했습니다.');
    }
});

// 회원 탈퇴
deleteButton.addEventListener('click', async () => {
    if (!currentUserId) return;

    if (!confirm('정말 탈퇴하시겠습니까?')) {
        return;
    }

    try {
        const response = await fetch(`/api/users/${currentUserId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('회원 탈퇴가 완료되었습니다.');
            window.location.href = '/signin';
        } else {
            alert('회원 탈퇴 처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('회원 탈퇴 오류:', error);
        alert('회원 탈퇴 중 오류가 발생했습니다.');
    }
});

// 초기화
async function init() {
    try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
            const result = await response.json();
            const user = result.data;
            currentUserId = user.userId;
            emailInput.value = user.email;
            nicknameInput.value = user.nickname;
            originalNickname = user.nickname;

            if (user.profileUrl) {
                profilePreview.style.backgroundImage = `url(${user.profileUrl})`;
                profilePreview.style.backgroundSize = 'cover';
                profilePreview.style.backgroundPosition = 'center';
                
                headerProfileImage.style.backgroundImage = `url(${user.profileUrl})`;
                headerProfileImage.style.backgroundSize = 'cover';
                headerProfileImage.style.backgroundPosition = 'center';
            } else {
                profilePreview.style.backgroundImage = "url('/assets/icon/profile_default.png')"; 
                headerProfileImage.style.backgroundImage = "url('/assets/icon/profile_default.png')";
            }
        } else {
            alert('로그인이 필요합니다.');
            window.location.href = '/signin';
        }
    } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
    }
}

init();