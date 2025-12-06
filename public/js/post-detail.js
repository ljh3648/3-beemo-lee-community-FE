// DOM Elements
const elements = {
    backBtn: document.getElementById('backButton'),
    headerProfileImg: document.getElementById('headerProfileImage'),
    headerDropdown: document.getElementById('headerProfileDropdown'),
    logoutBtn: document.getElementById('headerLogoutButton'),
    
    postTitle: document.getElementById('postTitle'),
    postAuthorAvatar: document.getElementById('postAuthorAvatar'),
    postAuthorName: document.getElementById('postAuthorName'),
    postDate: document.getElementById('postDate'),
    postActions: document.getElementById('postActions'),
    
    postImageContainer: document.getElementById('postImageContainer'),
    postImage: document.getElementById('postImage'),
    postContent: document.getElementById('postContent'),
    
    postViews: document.getElementById('postViews'),
    postCommentsCount: document.getElementById('postCommentsCount'),
    
    // 좋아요
    likeBtn: document.getElementById('likeButton'),
    likeIcon: document.getElementById('likeIcon'),
    postLikes: document.getElementById('postLikes'),
    
    commentInput: document.getElementById('commentInput'),
    commentInputLength: document.getElementById('commentInputLength'),
    submitCommentBtn: document.getElementById('submitCommentButton'),
    commentsList: document.getElementById('commentsList'),

    toast: document.getElementById('toast')
};

// State
let state = {
    postId: null,
    currentUserId: null,
    isLiked: false
};

// Utils
const getPostId = () => window.location.pathname.split('/').pop();

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const showToast = (msg) => {
    elements.toast.textContent = msg;
    elements.toast.style.display = 'block';
    elements.toast.style.opacity = 1;
    setTimeout(() => {
        elements.toast.style.opacity = 0;
        setTimeout(() => { elements.toast.style.display = 'none'; }, 300);
    }, 3000);
};

// Event Listeners
elements.backBtn.addEventListener('click', () => window.location.href = '/home');

elements.headerProfileImg.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.headerDropdown.style.display = 
        elements.headerDropdown.style.display === 'none' ? 'block' : 'none';
});

document.addEventListener('click', (e) => {
    if (!elements.headerProfileImg.contains(e.target)) {
        elements.headerDropdown.style.display = 'none';
    }
});

elements.logoutBtn.addEventListener('click', async () => {
    try {
        await fetch('/api/signout', { method: 'PATCH' });
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        window.location.href = '/signin';
    } catch (e) {
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        window.location.href = '/signin';
    }
});

elements.likeBtn.addEventListener('click', toggleLike);

elements.commentInput.addEventListener('input', (e) => {
    const length = e.target.value.length;
    elements.commentInputLength.textContent = length;
    elements.submitCommentBtn.disabled = e.target.value.trim().length === 0;
});

elements.submitCommentBtn.addEventListener('click', async () => {
    const body = elements.commentInput.value.trim();
    if (!body) return;

    try {
        const res = await fetch(`/api/posts/${state.postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body })
        });
        
        if (res.ok) {
            elements.commentInput.value = '';
            elements.submitCommentBtn.disabled = true;
            loadComments(); 
            // 댓글 수 갱신을 위해선 포스트 재로드 혹은 수동 증가 필요
            // 여기선 간단히 재로드
            loadPost();
        } else {
            showToast('댓글 등록 실패');
        }
    } catch (e) {
        showToast('오류가 발생했습니다.');
    }
});

// Core Functions
async function loadUser() {
    try {
        const res = await fetch('/api/users/me');
        if (!res.ok) {
            handleAuthError();
            return;
        }
        const { data } = await res.json();
        state.currentUserId = data.userId;

        if (data.profileUrl) {
            elements.headerProfileImg.style.backgroundImage = `url(${data.profileUrl})`;
        } else {
            elements.headerProfileImg.style.backgroundImage = `url('/assets/icon/profile_default.png')`;
        }
    } catch (e) {
        handleAuthError();
    }
}

async function loadPost() {
    try {
        const res = await fetch(`/api/posts/${state.postId}`);
        if (!res.ok) throw new Error('Post not found');
        const { data: post } = await res.json();

        elements.postTitle.textContent = post.title;
        elements.postAuthorName.textContent = post.author.nickname;

        // 수정 여부 표시
        const isEdited = post.updateAt && post.createAt !== post.updateAt;
        elements.postDate.textContent = formatDate(post.createAt) + (isEdited ? ' (수정됨)' : '');
        elements.postContent.textContent = post.body;
        elements.postViews.textContent = post.viewsCnt;
        elements.postLikes.textContent = post.likesCnt || 0;
        elements.postCommentsCount.textContent = post.commentsCnt;

        // 작성자 프로필 (배경이미지로 설정)
        if (post.author.profileUrl) {
            elements.postAuthorAvatar.style.backgroundImage = `url(${post.author.profileUrl})`;
        } else {
            elements.postAuthorAvatar.style.backgroundImage = `url('/assets/icon/profile_default.png')`;
        }

        // 게시글 이미지
        if (post.imageUrl) {
            elements.postImage.src = post.imageUrl;
            elements.postImageContainer.style.display = 'flex';
        } else {
            elements.postImageContainer.style.display = 'none';
        }

        // 본인 글 확인
        if (state.currentUserId && post.author.id === state.currentUserId) {
            elements.postActions.style.display = 'flex';

            // 수정 버튼 이벤트 연결
            const editBtn = elements.postActions.querySelector('.edit-btn');
            editBtn.onclick = () => {
                window.location.href = `/posts/${state.postId}/edit`;
            };
        }

    } catch (e) {
        alert('게시글을 찾을 수 없습니다.');
        window.location.href = '/home';
    }
}

async function loadLikeStatus() {
    try {
        const res = await fetch(`/api/posts/${state.postId}/like/check`);
        if (res.ok) {
            const { data } = await res.json();
            state.isLiked = data.isLiked;
            updateLikeButtonUI(data.likesCnt);
        }
    } catch (e) {
        console.error('좋아요 상태 확인 실패');
    }
}

async function toggleLike() {
    const method = state.isLiked ? 'DELETE' : 'POST';
    try {
        const res = await fetch(`/api/posts/${state.postId}/like`, { method });
        if (res.ok) {
            const { data } = await res.json();
            state.isLiked = !state.isLiked;
            updateLikeButtonUI(data.likesCnt);
        }
    } catch (e) {
        showToast('오류가 발생했습니다.');
    }
}

function updateLikeButtonUI(likesCnt) {
    elements.postLikes.textContent = likesCnt;
    if (state.isLiked) {
        elements.likeBtn.classList.add('active');
        elements.likeIcon.textContent = '❤️';
    } else {
        elements.likeBtn.classList.remove('active');
        elements.likeIcon.textContent = '🤍';
    }
}

async function loadComments() {
    try {
        const res = await fetch(`/api/posts/${state.postId}/comments`);
        if (res.ok) {
            const { data } = await res.json();
            renderComments(data.comments);
        }
    } catch (e) {
        console.error(e);
    }
}

function renderComments(comments) {
    elements.commentsList.innerHTML = '';
    
    if (comments.length === 0) {
        elements.commentsList.innerHTML = '<p style="text-align:center; color:#888; margin: 20px 0;">첫 댓글을 남겨보세요!</p>';
        return;
    }

    comments.forEach(comment => {
        const isOwner = state.currentUserId === comment.author.id;
        const profileUrl = comment.author.profileUrl
            ? comment.author.profileUrl
            : '/assets/icon/profile_default.png';

        // 수정 여부 확인
        const isEdited = comment.updateAt && comment.createAt !== comment.updateAt;
        const dateText = formatDate(comment.createAt) + (isEdited ? ' (수정됨)' : '');

        const div = document.createElement('div');
        div.className = 'comment-item';
        div.id = `comment-${comment.id}`;

        div.innerHTML = `
            <div class="comment-avatar" style="background-image: url('${profileUrl}')"></div>
            <div class="comment-content-area">
                <div class="comment-header">
                    <div class="comment-user">
                        <span class="comment-username">${comment.author.nickname}</span>
                        <span class="comment-date">${dateText}</span>
                    </div>
                    ${isOwner ? `
                    <div class="comment-actions">
                        <button onclick="enableEditComment(${comment.id}, '${escapeHtml(comment.body)}')">수정</button>
                        <button onclick="deleteComment(${comment.id})">삭제</button>
                    </div>` : ''}
                </div>
                <div class="comment-content" id="comment-body-${comment.id}">${escapeHtml(comment.body)}</div>
                <div id="comment-edit-${comment.id}" style="display: none;"></div>
            </div>
        `;

        elements.commentsList.appendChild(div);
    });
}

// Global Helpers
window.deletePost = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    alert('삭제 기능 미구현'); // 백엔드 API 필요
};

window.enableEditComment = (id, body) => {
    document.getElementById(`comment-body-${id}`).style.display = 'none';
    const editArea = document.getElementById(`comment-edit-${id}`);
    editArea.style.display = 'block';
    
    editArea.innerHTML = `
        <div class="comment-edit-wrapper">
            <textarea id="edit-input-${id}">${body}</textarea>
            <div class="edit-buttons">
                <button class="btn-cancel" onclick="cancelEdit(${id})">취소</button>
                <button class="btn-save" onclick="saveComment(${id})">저장</button>
            </div>
        </div>
    `;
};

window.cancelEdit = (id) => {
    document.getElementById(`comment-body-${id}`).style.display = 'block';
    document.getElementById(`comment-edit-${id}`).style.display = 'none';
};

window.saveComment = async (id) => {
    const newBody = document.getElementById(`edit-input-${id}`).value.trim();
    if (!newBody) return;

    try {
        const res = await fetch(`/api/posts/${state.postId}/comments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: newBody })
        });
        if (res.ok) {
            loadComments();
        } else {
            showToast('수정 실패');
        }
    } catch (e) {
        showToast('오류 발생');
    }
};

window.deleteComment = async (id) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
        const res = await fetch(`/api/posts/${state.postId}/comments/${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            loadComments();
            loadPost(); // 댓글수 갱신
        } else {
            showToast('삭제 실패');
        }
    } catch (e) {
        showToast('오류 발생');
    }
};

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Init
(async () => {
    state.postId = getPostId();
    if (!state.postId) return;
    
    await loadUser();
    await loadPost();
    await loadComments();
    await loadLikeStatus();
})();
