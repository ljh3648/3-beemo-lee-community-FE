// DOM 요소
const postsContainer = document.getElementById('postsContainer');
const createPostButton = document.getElementById('createPostButton');
const loading = document.getElementById('loading');
const profileImage = document.getElementById('profileImage');

// 상태
let lastPostId = null;
let isLoading = false;
let hasMore = true;

// 세션 확인 및 초기화
async function checkSession() {
    try {
        const response = await fetch('/api/auth/sessions', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.status !== 200) {
            // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
            window.location.href = '/signin';
            return false;
        }

        return true;
    } catch (error) {
        console.error('세션 확인 오류:', error);
        window.location.href = '/signin';
        return false;
    }
}

// 날짜 포맷팅 (LocalDateTime을 "YYYY-MM-DD HH:MM:SS" 형식으로)
function formatDate(dateTimeStr) {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 숫자 포맷팅 (1k, 10k, 100k)
function formatNumber(num) {
    if (num >= 100000) {
        return Math.floor(num / 1000) + 'k';
    } else if (num >= 10000) {
        return Math.floor(num / 1000) + 'k';
    } else if (num >= 1000) {
        return Math.floor(num / 1000) + 'k';
    }
    return num.toString();
}

// 게시글 카드 생성
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.onclick = () => {
        window.location.href = `/posts/${post.id}`;
    };

    // 제목이 26자를 초과하면 잘라냄 (글자 수 제한)
    const displayTitle = post.title.length > 26 ? post.title.substring(0, 26) : post.title;

    card.innerHTML = `
        <div class="post-header">
            <h3 class="post-title">${displayTitle}</h3>
            <span class="post-date">${formatDate(post.createAt)}</span>
        </div>
        <div class="post-stats">
            <span class="stat-item">좋아요 ${formatNumber(post.likesCnt || 0)}</span>
            <span class="stat-item">댓글 ${formatNumber(post.commentsCnt || 0)}</span>
            <span class="stat-item">조회수 ${formatNumber(post.viewsCnt || 0)}</span>
        </div>
        <div class="post-footer">
            <div class="author-avatar"></div>
            <span class="author-name">${post.author.nickname}</span>
        </div>
    `;

    return card;
}

// 게시글 로드
async function loadPosts() {
    if (isLoading || !hasMore) return;

    isLoading = true;
    loading.style.display = 'block';

    try {
        // API 호출 - offset이 있으면 쿼리에 포함
        const url = lastPostId
            ? `/api/posts?limit=10&offset=${lastPostId}`
            : '/api/posts?limit=10';

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('게시글 로드 실패');
        }

        const data = await response.json();

        // 더 이상 게시글이 없으면 hasMore를 false로 설정
        if (data.postsGetCount === 0 || data.posts.length === 0) {
            hasMore = false;
        } else {
            // 게시글 카드 생성 및 추가
            data.posts.forEach(post => {
                const card = createPostCard(post);
                postsContainer.appendChild(card);
            });

            // lastPostId 업데이트
            lastPostId = data.lastPostId;
        }

    } catch (error) {
        console.error('게시글 로드 오류:', error);
        hasMore = false;
    } finally {
        isLoading = false;
        loading.style.display = 'none';
    }
}

// 인피니티 스크롤
function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 스크롤이 바닥에서 100px 이내에 도달하면 다음 페이지 로드
    if (scrollTop + windowHeight >= documentHeight - 100) {
        loadPosts();
    }
}

// 게시글 작성 버튼
createPostButton.addEventListener('click', () => {
    window.location.href = '/posts/create';
});

// 프로필 드롭다운
const profileDropdown = document.getElementById('profileDropdown');
const logoutButton = document.getElementById('logoutButton');

profileImage.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.style.display = profileDropdown.style.display === 'none' ? 'block' : 'none';
});

// 드롭다운 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
    if (!profileImage.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.style.display = 'none';
    }
});

// 로그아웃
logoutButton.addEventListener('click', async () => {
    try {
        await fetch('/api/auth/sessions', {
            method: 'DELETE',
            credentials: 'include'
        });

        // 성공 여부와 관계없이 로그인 페이지로 이동
        window.location.href = '/signin';
    } catch (error) {
        console.error('로그아웃 오류:', error);
        window.location.href = '/signin';
    }
});

// 초기화
async function init() {
    // 세션 확인
    const isAuthenticated = await checkSession();
    if (!isAuthenticated) return;

    // 프로필 이미지 설정 (기본 회색 원 - CSS로 처리)
    // profileImage.src는 설정하지 않음 (CSS background로 처리)

    // 첫 페이지 로드
    await loadPosts();

    // 스크롤 이벤트 등록
    window.addEventListener('scroll', handleScroll);
}

// 페이지 로드 시 실행
init();
