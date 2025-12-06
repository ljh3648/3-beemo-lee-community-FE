// 유틸리티 함수

// Debounce: 마지막 호출 후 일정 시간이 지나면 실행
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Throttle: 일정 시간 동안 최대 한 번만 실행
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 쿠키 삭제 함수
function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// 인증 오류 처리 함수
function handleAuthError() {
    // JWT 관련 쿠키 모두 삭제
    deleteCookie('accessToken');
    deleteCookie('refreshToken');

    // 알림 표시
    alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');

    // 로그인 페이지로 리다이렉트
    window.location.href = '/signin';
}
