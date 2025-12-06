// DOM 요소
const headerProfileImage = document.getElementById('headerProfileImage');
const headerProfileDropdown = document.getElementById('headerProfileDropdown');
const headerLogoutButton = document.getElementById('headerLogoutButton');
const titleInput = document.getElementById('title');
const contentTextarea = document.getElementById('content');
const contentLength = document.getElementById('contentLength');
const imageInput = document.getElementById('imageInput');
const imageUploadButton = document.getElementById('imageUploadButton');
const imageFileName = document.getElementById('imageFileName');
const postForm = document.getElementById('postForm');
const submitButton = document.getElementById('submitButton');

// 상태
let selectedImageFile = null;
let selectedImageFileName = '';
let isEditMode = false;
let postId = null;

// URL 파싱하여 수정 모드 확인
function checkEditMode() {
    const pathParts = window.location.pathname.split('/');
    // /posts/123/edit -> ["", "posts", "123", "edit"]
    if (pathParts.length >= 4 && pathParts[3] === 'edit') {
        isEditMode = true;
        postId = pathParts[2];
        submitButton.textContent = '수정하기';
        loadPostData(postId);
    }
}

// 게시글 데이터 로드 (수정 모드용)
async function loadPostData(id) {
    try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
            alert('게시글 정보를 불러올 수 없습니다.');
            window.location.href = '/home';
            return;
        }
        const result = await response.json();
        const post = result.data;

        titleInput.value = post.title;
        contentTextarea.value = post.body;

        // 글자 수 업데이트
        contentLength.textContent = post.body.length;

        if (post.imageUrl) {
            imageFileName.textContent = '기존 이미지가 있습니다. (변경하려면 업로드)';
            // 기존 이미지는 유지, 새 이미지 업로드 시에만 변경됨
        }
    } catch (error) {
        console.error('게시글 로드 오류:', error);
    }
}

// 글자 수 카운터
contentTextarea.addEventListener('input', () => {
    contentLength.textContent = contentTextarea.value.length;
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
        await fetch('/api/signout', {
            method: 'PATCH',
            credentials: 'include'
        });
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        window.location.href = '/signin';
    } catch (error) {
        console.error('로그아웃 오류:', error);
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
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
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('JPG, JPEG, PNG, GIF, WebP 파일만 업로드 가능합니다.');
            imageInput.value = '';
            return;
        }

        // 파일 크기 체크 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('파일 크기는 10MB 이하여야 합니다.');
            imageInput.value = '';
            return;
        }

        // 파일명 표시
        selectedImageFileName = file.name;
        imageFileName.textContent = file.name;

        // 파일 저장 (FormData에서 사용)
        selectedImageFile = file;
    } else {
        // 취소 시 기존 상태 유지하거나 초기화 (여기선 유지)
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
        // FormData 생성
        const formData = new FormData();

        // JSON 데이터를 Blob으로 변환하여 추가
        const postData = {
            title: titleInput.value.trim(),
            body: contentTextarea.value.trim()
        };

        formData.append('post', new Blob([JSON.stringify(postData)], {
            type: 'application/json'
        }));

        // 이미지 파일 추가 (있는 경우에만)
        if (selectedImageFile) {
            formData.append('image', selectedImageFile);
        }

        let url = '/api/posts';
        let method = 'POST';

        if (isEditMode) {
            url = `/api/posts/${postId}`;
            method = 'PATCH';
        }

        const response = await fetch(url, {
            method: method,
            credentials: 'include',
            body: formData
            // Content-Type 헤더는 자동으로 설정됨 (multipart/form-data)
        });

        if (!response.ok) {
            throw new Error('게시글 저장 실패');
        }

        // 성공 시 상세 페이지로 이동 (수정) 또는 홈으로 이동 (작성)
        alert(isEditMode ? '게시글이 수정되었습니다.' : '게시글이 작성되었습니다.');

        if (isEditMode) {
            window.location.href = `/posts/${postId}`;
        } else {
            window.location.href = '/home';
        }

    } catch (error) {
        console.error('게시글 저장 오류:', error);
        alert('게시글 저장 중 오류가 발생했습니다.');
    }
});

// 사용자 프로필 로드 (헤더용)
async function loadUserProfile() {
    try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
            const result = await response.json();
            const user = result.data;
            if (user.profileUrl) {
                headerProfileImage.style.backgroundImage = `url(${user.profileUrl})`;
                headerProfileImage.style.backgroundSize = 'cover';
                headerProfileImage.style.backgroundPosition = 'center';
            } else {
                headerProfileImage.style.backgroundImage = "url('/assets/icon/profile_default.png')";
                headerProfileImage.style.backgroundSize = 'cover';
                headerProfileImage.style.backgroundPosition = 'center';
            }
        }
    } catch (error) {
        console.error('프로필 로드 실패:', error);
    }
}

// 초기화
async function init() {
    await loadUserProfile();
    checkEditMode();
}

init();
