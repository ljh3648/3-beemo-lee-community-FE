// DOM 요소
const backButton = document.getElementById('backButton');
const headerProfileImage = document.getElementById('headerProfileImage');
const headerProfileDropdown = document.getElementById('headerProfileDropdown');
const headerLogoutButton = document.getElementById('headerLogoutButton');
const titleInput = document.getElementById('title');
const contentTextarea = document.getElementById('content');
const imageInput = document.getElementById('imageInput');
const imageUploadButton = document.getElementById('imageUploadButton');
const imageFileName = document.getElementById('imageFileName');
const postForm = document.getElementById('postForm');
const submitButton = document.getElementById('submitButton');

// 상태
let selectedImageBase64 = null;
let selectedImageFileName = '';

// 뒤로가기 버튼
backButton.addEventListener('click', () => {
    window.history.back();
});

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

// 이미지 업로드 버튼 클릭
imageUploadButton.addEventListener('click', () => {
    imageInput.click();
});

// 이미지 파일 선택
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (file) {
        // 파일 타입 체크
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            alert('JPG, PNG 파일만 업로드 가능합니다.');
            imageInput.value = '';
            return;
        }

        // 파일 크기 체크 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('파일 크기는 5MB 이하여야 합니다.');
            imageInput.value = '';
            return;
        }

        // 파일명 표시
        selectedImageFileName = file.name;
        imageFileName.textContent = file.name;

        // 파일 읽기
        const reader = new FileReader();
        reader.onload = (event) => {
            selectedImageBase64 = event.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        selectedImageFileName = '';
        selectedImageBase64 = null;
        imageFileName.textContent = '파일을 선택해주세요.';
    }
});

// 폼 유효성 검사
function validateForm() {
    const title = titleInput.value.trim();
    const content = contentTextarea.value.trim();

    if (!title) {
        alert('제목을 입력해주세요.');
        return false;
    }

    if (title.length > 26) {
        alert('제목은 최대 26자까지 입력 가능합니다.');
        return false;
    }

    if (!content) {
        alert('내용을 입력해주세요.');
        return false;
    }

    return true;
}

// 폼 제출
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!validateForm()) {
        return;
    }

    try {
        // API 요청 데이터 준비
        const requestData = {
            title: titleInput.value.trim(),
            body: contentTextarea.value.trim()
        };

        if (selectedImageBase64) {
            requestData.imageUrl = selectedImageBase64;
        }

        // TODO: 실제 API 연동
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('게시글 작성 실패');
        }

        // 성공 시 홈으로 이동
        alert('게시글이 작성되었습니다.');
        window.location.href = '/home';

    } catch (error) {
        console.error('게시글 작성 오류:', error);
        alert('게시글 작성 중 오류가 발생했습니다.');
    }
});

// 초기화
async function init() {
    // TODO: 사용자 프로필 이미지 가져오기
    // 임시: 프로필 이미지 설정
}

init();
