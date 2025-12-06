// DOM 요소
const headerProfileImage = document.getElementById('headerProfileImage');
const headerProfileDropdown = document.getElementById('headerProfileDropdown');
const headerLogoutButton = document.getElementById('headerLogoutButton');
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const newPasswordConfirmInput = document.getElementById('newPasswordConfirm');
const submitButton = document.getElementById('submitButton');
const passwordForm = document.getElementById('passwordForm');
const toast = document.getElementById('toast');

// 상태
let currentUserId = null;
let isCurrentPasswordValid = false;
let isNewPasswordValid = false;
let isNewPasswordConfirmValid = false;

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

// 비밀번호 유효성 검사
function validatePassword(password) {
    if (!password || password.trim() === '') {
        return { valid: false, message: '*비밀번호를 입력해주세요' };
    }
    if (password.length < 8 || password.length > 20) {
        return { valid: false, message: '*비밀번호는 8자 이상, 20자 이하이어야 합니다.' };
    }
    // 복잡성 검사 등 추가 가능
    return { valid: true, message: '' };
}

// 에러 메시지 표시
function showError(input, message) {
    const parent = input.parentElement;
    const helper = parent.querySelector('.helper-text');
    if (helper) {
        helper.textContent = message;
        helper.style.color = 'red';
    }
    if (message) {
        input.classList.add('error');
    } else {
        input.classList.remove('error');
    }
}

// 입력 이벤트 리스너
currentPasswordInput.addEventListener('input', () => {
    if (currentPasswordInput.value.trim() !== '') {
        isCurrentPasswordValid = true;
        showError(currentPasswordInput, '');
    } else {
        isCurrentPasswordValid = false;
        showError(currentPasswordInput, '*현재 비밀번호를 입력해주세요');
    }
    updateSubmitButton();
});

newPasswordInput.addEventListener('input', () => {
    const result = validatePassword(newPasswordInput.value);
    isNewPasswordValid = result.valid;
    showError(newPasswordInput, result.message);
    
    // 확인 비밀번호 다시 검사
    if (newPasswordConfirmInput.value) {
        checkConfirmPassword();
    }
    updateSubmitButton();
});

newPasswordConfirmInput.addEventListener('input', () => {
    checkConfirmPassword();
    updateSubmitButton();
});

function checkConfirmPassword() {
    if (newPasswordInput.value !== newPasswordConfirmInput.value) {
        isNewPasswordConfirmValid = false;
        showError(newPasswordConfirmInput, '*비밀번호가 일치하지 않습니다');
    } else {
        isNewPasswordConfirmValid = true;
        showError(newPasswordConfirmInput, '');
    }
}

function updateSubmitButton() {
    if (isCurrentPasswordValid && isNewPasswordValid && isNewPasswordConfirmValid) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}

// 폼 제출
passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUserId) return;

    try {
        const response = await fetch(`/api/users/${currentUserId}/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword: currentPasswordInput.value,
                newPassword: newPasswordInput.value
            })
        });

        if (response.ok) {
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
                window.location.href = '/user/profile/edit';
            }, 1500);
            
            // 입력창 초기화
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            newPasswordConfirmInput.value = '';
            submitButton.disabled = true;
        } else {
            const error = await response.json();
            alert(error.message || '비밀번호 변경에 실패했습니다.');
        }
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        alert('오류가 발생했습니다.');
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
            
            if (user.profileUrl) {
                headerProfileImage.style.backgroundImage = `url(${user.profileUrl})`;
                headerProfileImage.style.backgroundSize = 'cover';
                headerProfileImage.style.backgroundPosition = 'center';
            } else {
                headerProfileImage.style.backgroundImage = "url('/assets/icon/profile_default.png')";
                headerProfileImage.style.backgroundSize = 'cover';
                headerProfileImage.style.backgroundPosition = 'center';
            }
        } else {
            window.location.href = '/signin';
        }
    } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
    }
}

init();
