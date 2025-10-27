// DOM 요소
const profileImageInput = document.getElementById('profileImage');
const profilePreview = document.getElementById('profilePreview');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('passwordConfirm');
const nicknameInput = document.getElementById('nickname');
const signupButton = document.getElementById('signupButton');
const loginButton = document.getElementById('loginButton');
const backButton = document.getElementById('backButton');
const signupForm = document.getElementById('signupForm');

// 유효성 검사 상태
let isProfileValid = true; // 프로필은 선택사항이므로 기본값 true
let isEmailValid = false;
let isPasswordValid = false;
let isPasswordConfirmValid = false;
let isNicknameValid = false;

let selectedProfileFile = null;

// 프로필 이미지 업로드
profileImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (file) {
        // 파일 타입 체크 (jpg, png만 허용)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            showProfileError('*JPG, PNG 파일만 업로드 가능합니다.');
            isProfileValid = true; // 프로필은 선택사항이므로 true 유지
            updateSignupButton();
            return;
        }

        // 파일 크기 체크 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            showProfileError('*파일 크기는 5MB 이하여야 합니다.');
            isProfileValid = true; // 프로필은 선택사항이므로 true 유지
            updateSignupButton();
            return;
        }

        // File 객체 저장 (서버 전송용)
        selectedProfileFile = file;

        // 미리보기용으로만 base64 사용
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target.result;

            // 미리보기 표시
            profilePreview.src = base64String;
            profilePreview.style.display = 'block';
            document.querySelector('.plus-icon').style.display = 'none';

            isProfileValid = true;
            showProfileError('');
            updateSignupButton();
        };
        reader.readAsDataURL(file);
    }
});

// 프로필 에러 표시
function showProfileError(message) {
    const profileHelper = document.querySelector('.profile-helper');
    profileHelper.textContent = message || '';
}

// 이메일 유효성 검사
function validateEmail(email) {
    if (!email || email.trim() === '') {
        return {
            valid: false,
            message: '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)'
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return {
            valid: false,
            message: '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)'
        };
    }

    if (email.length < 5) {
        return {
            valid: false,
            message: '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)'
        };
    }

    return { valid: true, message: '' };
}

// 비밀번호 유효성 검사
function validatePassword(password) {
    if (!password || password.trim() === '') {
        return {
            valid: false,
            message: '*비밀번호를 입력해주세요'
        };
    }

    if (password.length < 8 || password.length > 20) {
        return {
            valid: false,
            message: '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
        };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        return {
            valid: false,
            message: '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
        };
    }

    return { valid: true, message: '' };
}

// 비밀번호 확인 유효성 검사
function validatePasswordConfirm(password, passwordConfirm) {
    if (!passwordConfirm || passwordConfirm.trim() === '') {
        return {
            valid: false,
            message: '*비밀번호를 한번 더 입력해주세요'
        };
    }

    if (password !== passwordConfirm) {
        return {
            valid: false,
            message: '*비밀번호가 일치하지 않습니다'
        };
    }

    return { valid: true, message: '' };
}

// 닉네임 유효성 검사
function validateNickname(nickname) {
    if (!nickname || nickname.trim() === '') {
        return {
            valid: false,
            message: '*닉네임을 입력해주세요'
        };
    }

    // 닉네임 길이 체크 (2-10자)
    if (nickname.length < 2 || nickname.length > 10) {
        return {
            valid: false,
            message: '*닉네임은 최소 2자 이상, 최대 10자 이하이어야 합니다'
        };
    }

    // 공백 체크
    if (/\s/.test(nickname)) {
        return {
            valid: false,
            message: '*띄어쓰기를 없애주세요'
        };
    }

    return { valid: true, message: '' };
}

// 에러 메시지 표시
function showError(inputElement, message) {
    const formGroup = inputElement.closest('.form-group');
    const helperText = formGroup.querySelector('.helper-text');

    if (message) {
        inputElement.classList.add('error');
        helperText.textContent = message;
    } else {
        inputElement.classList.remove('error');
        helperText.textContent = '';
    }
}

// 회원가입 버튼 활성화/비활성화
function updateSignupButton() {
    if (isProfileValid && isEmailValid && isPasswordValid && isPasswordConfirmValid && isNicknameValid) {
        signupButton.disabled = false;
    } else {
        signupButton.disabled = true;
    }
}

// 이메일 입력 이벤트
emailInput.addEventListener('input', () => {
    const result = validateEmail(emailInput.value);
    isEmailValid = result.valid;
    showError(emailInput, result.message);
    updateSignupButton();
});

emailInput.addEventListener('blur', () => {
    const result = validateEmail(emailInput.value);
    isEmailValid = result.valid;
    showError(emailInput, result.message);
    updateSignupButton();
});

// 비밀번호 입력 이벤트
passwordInput.addEventListener('input', () => {
    const result = validatePassword(passwordInput.value);
    isPasswordValid = result.valid;
    showError(passwordInput, result.message);

    // 비밀번호 확인도 다시 검사
    if (passwordConfirmInput.value) {
        const confirmResult = validatePasswordConfirm(passwordInput.value, passwordConfirmInput.value);
        isPasswordConfirmValid = confirmResult.valid;
        showError(passwordConfirmInput, confirmResult.message);
    }

    updateSignupButton();
});

passwordInput.addEventListener('blur', () => {
    const result = validatePassword(passwordInput.value);
    isPasswordValid = result.valid;
    showError(passwordInput, result.message);
    updateSignupButton();
});

// 비밀번호 확인 입력 이벤트
passwordConfirmInput.addEventListener('input', () => {
    const result = validatePasswordConfirm(passwordInput.value, passwordConfirmInput.value);
    isPasswordConfirmValid = result.valid;
    showError(passwordConfirmInput, result.message);
    updateSignupButton();
});

passwordConfirmInput.addEventListener('blur', () => {
    const result = validatePasswordConfirm(passwordInput.value, passwordConfirmInput.value);
    isPasswordConfirmValid = result.valid;
    showError(passwordConfirmInput, result.message);
    updateSignupButton();
});

// 닉네임 입력 이벤트
nicknameInput.addEventListener('input', () => {
    const result = validateNickname(nicknameInput.value);
    isNicknameValid = result.valid;
    showError(nicknameInput, result.message);
    updateSignupButton();
});

nicknameInput.addEventListener('blur', () => {
    const result = validateNickname(nicknameInput.value);
    isNicknameValid = result.valid;
    showError(nicknameInput, result.message);
    updateSignupButton();
});

// 회원가입 폼 제출
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 다시 한번 유효성 검사
    if (!isProfileValid || !isEmailValid || !isPasswordValid || !isPasswordConfirmValid || !isNicknameValid) {
        return;
    }

    try {
        // FormData 생성
        const formData = new FormData();

        // JSON 데이터를 Blob으로 추가
        const userDto = {
            email: emailInput.value,
            password: passwordInput.value,
            nickname: nicknameInput.value
        };

        formData.append('user', new Blob(
            [JSON.stringify(userDto)],
            {type: 'application/json'}
        ));

        // 프로필 이미지 파일 추가 (있는 경우)
        if (selectedProfileFile) {
            formData.append('profileImage', selectedProfileFile);
        }

        // fetch 요청 (Content-Type 헤더는 자동 설정됨)
        const response = await fetch('/api/users', {
            method: 'POST',
            body: formData
        });

        if (response.status === 201) {
            // 회원가입 성공 (201 Created) - 로그인 페이지로 이동
            alert('회원가입이 완료되었습니다!');
            window.location.href = '/signin';
        } else if (response.status === 400) {
            // 회원가입 실패 (400 Bad Request) - 에러 메시지 표시
            const errorData = await response.json();
            alert(errorData.message || '회원가입에 실패했습니다.');
        } else {
            // 기타 오류
            alert('회원가입 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        alert('회원가입 중 오류가 발생했습니다.');
    }
});

// 로그인하러 가기 버튼
loginButton.addEventListener('click', () => {
    window.location.href = '/signin';
});

// 뒤로가기 버튼
backButton.addEventListener('click', () => {
    window.history.back();
});
