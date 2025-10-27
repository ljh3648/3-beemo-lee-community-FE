// DOM 요소
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signinButton = document.getElementById('signinButton');
const signupButton = document.getElementById('signupButton');
const signinForm = document.getElementById('signinForm');

// 유효성 검사 상태
let isEmailValid = false;
let isPasswordValid = false;

// 이메일 유효성 검사
function validateEmail(email) {
    // 빈 값 체크
    if (!email || email.trim() === '') {
        return {
            valid: false,
            message: '올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)'
        };
    }

    // 이메일 형식 검사 (정규식)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return {
            valid: false,
            message: '올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)'
        };
    }

    // 너무 짧은 경우 체크
    if (email.length < 5) {
        return {
            valid: false,
            message: '올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)'
        };
    }

    return { valid: true, message: '' };
}

// 비밀번호 유효성 검사
function validatePassword(password) {
    // 빈 값 체크
    if (!password || password.trim() === '') {
        return {
            valid: false,
            message: '*비밀번호를 입력해주세요'
        };
    }

    // 길이 체크 (8자 이상, 20자 이하)
    if (password.length < 8 || password.length > 20) {
        return {
            valid: false,
            message: '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
        };
    }

    // 대문자 포함 여부
    const hasUpperCase = /[A-Z]/.test(password);
    // 소문자 포함 여부
    const hasLowerCase = /[a-z]/.test(password);
    // 숫자 포함 여부
    const hasNumber = /[0-9]/.test(password);
    // 특수문자 포함 여부
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        return {
            valid: false,
            message: '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
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

// 로그인 버튼 활성화/비활성화
function updateSigninButton() {
    if (isEmailValid && isPasswordValid) {
        signinButton.disabled = false;
    } else {
        signinButton.disabled = true;
    }
}

// 이메일 입력 이벤트
emailInput.addEventListener('input', () => {
    const result = validateEmail(emailInput.value);
    isEmailValid = result.valid;
    showError(emailInput, result.message);
    updateSigninButton();
});

// 포커스 잃었을 때도 검사
emailInput.addEventListener('blur', () => {
    const result = validateEmail(emailInput.value);
    isEmailValid = result.valid;
    showError(emailInput, result.message);
    updateSigninButton();
});

// 비밀번호 입력 이벤트
passwordInput.addEventListener('input', () => {
    const result = validatePassword(passwordInput.value);
    isPasswordValid = result.valid;
    showError(passwordInput, result.message);
    updateSigninButton();
});

// 포커스 잃었을 때도 검사
passwordInput.addEventListener('blur', () => {
    const result = validatePassword(passwordInput.value);
    isPasswordValid = result.valid;
    showError(passwordInput, result.message);
    updateSigninButton();
});

// 로그인 폼 제출
signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 다시 한번 유효성 검사
    const emailResult = validateEmail(emailInput.value);
    const passwordResult = validatePassword(passwordInput.value);

    if (!emailResult.valid || !passwordResult.valid) {
        showError(emailInput, emailResult.message);
        showError(passwordInput, passwordResult.message);
        return;
    }

    try {
        const response = await fetch('/api/auth/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                email: emailInput.value,
                password: passwordInput.value
            })
        });

        if (response.status === 201) {
            // 로그인 성공 (201 Created) - 게시글 목록 페이지로 이동
            window.location.href = '/home';
        } else {
            // 로그인 실패 (400 Bad Request)
            showError(passwordInput, '*아이디 또는 비밀번호를 확인해주세요');
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        showError(passwordInput, '*아이디 또는 비밀번호를 확인해주세요');
    }
});

// 회원가입 버튼 클릭
signupButton.addEventListener('click', () => {
    window.location.href = '/signup';
});
