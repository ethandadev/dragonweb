const state = {
  posts: [],
  user: null,
  category: 'All',
  search: '',
  sort: 'newest',
};

const elements = {
  container: document.getElementById('forum-posts-container'),
  form: document.getElementById('new-post-form'),
  showFormButton: document.getElementById('show-post-form-btn'),
  titleInput: document.getElementById('post-title'),
  contentInput: document.getElementById('post-content'),
  categoryInput: document.getElementById('post-category'),
  mediaInput: document.getElementById('post-media'),
  mediaPreview: document.getElementById('media-preview'),
  searchInput: document.getElementById('forum-search'),
  sortInput: document.getElementById('forum-sort'),
  categoryButtons: Array.from(document.querySelectorAll('[data-category]')),
  authNotice: document.getElementById('auth-notice'),
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function getVisiblePosts() {
  const query = state.search.trim().toLowerCase();
  const posts = state.posts.filter((post) => {
    const matchesCategory = state.category === 'All' || post.category === state.category;
    const matchesSearch = !query || `${post.title} ${post.content} ${post.author.name}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return [...posts].sort((a, b) => {
    if (state.sort === 'popular') return b.replies.length - a.replies.length || new Date(b.createdAt) - new Date(a.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function renderReply(reply, postId) {
  const canDelete = state.user?.id === reply.author.id || state.isAdmin;
  return `
    <article class="reply">
      <div class="reply-avatar">${escapeHtml(reply.author.name.charAt(0).toUpperCase())}</div>
      <div class="reply-body">
        <div class="reply-meta">
          <strong>${escapeHtml(reply.author.name)}</strong>
          <time datetime="${escapeHtml(reply.createdAt)}">${formatDate(reply.createdAt)}</time>
          ${canDelete ? `<button class="reply-delete" type="button" data-delete-reply="${escapeHtml(reply.id)}" data-post-id="${escapeHtml(postId)}">Delete</button>` : ''}
        </div>
        <p>${escapeHtml(reply.content)}</p>
      </div>
    </article>`;
}

function renderPost(post) {
  const replies = post.replies.length
    ? post.replies.map((reply) => renderReply(reply, post.id)).join('')
    : '<p class="empty-replies">No replies yet. Be the first to join in.</p>';
  const canDeletePost = state.user?.id === post.author.id || state.isAdmin;
  const media = post.mediaType?.startsWith('video/')
    ? `<video class="post-media" controls preload="metadata" src="${escapeHtml(post.media)}"></video>`
    : post.media
      ? `<img class="post-media" src="${escapeHtml(post.media)}" alt="Attached media for ${escapeHtml(post.title)}">`
      : '';

  return `
    <article class="forum-card" data-post-id="${escapeHtml(post.id)}">
      <div class="post-header">
        <div class="post-author">
          <div class="post-avatar">${escapeHtml(post.author.name.charAt(0).toUpperCase())}</div>
          <div>
            <strong>${escapeHtml(post.author.name)}</strong>
            <time datetime="${escapeHtml(post.createdAt)}">${formatDate(post.createdAt)}</time>
          </div>
        </div>
        <span class="category-pill">${escapeHtml(post.category)}</span>
      </div>
      <h2>${escapeHtml(post.title)}</h2>
      <p class="post-content">${escapeHtml(post.content)}</p>
      ${media}
      <div class="post-footer">
        <span>${post.replies.length} ${post.replies.length === 1 ? 'reply' : 'replies'}</span>
        <div class="post-actions">
          ${canDeletePost ? `<button class="delete-button" type="button" data-delete-post="${escapeHtml(post.id)}">Delete post</button>` : ''}
          <button class="text-button reply-toggle" type="button" aria-expanded="false">View replies</button>
        </div>
      </div>
      <div class="replies hidden">
        <div class="replies-list">${replies}</div>
        ${state.user ? `
          <form class="reply-form" data-reply-form="${escapeHtml(post.id)}">
            <label for="reply-${escapeHtml(post.id)}">Add a reply</label>
            <textarea id="reply-${escapeHtml(post.id)}" name="content" rows="3" maxlength="1000" required placeholder="Write a thoughtful reply..."></textarea>
            <button class="nav-btn" type="submit">Reply</button>
          </form>` : '<p class="login-prompt">Log in to add a reply.</p>'}
      </div>
    </article>`;
}

function renderPosts() {
  const visiblePosts = getVisiblePosts();

  if (!visiblePosts.length) {
    elements.container.innerHTML = `
      <div class="empty-state">
        <span>💬</span>
        <h2>No discussions found</h2>
        <p>Try another search or category, or create the first post.</p>
      </div>`;
    return;
  }

  elements.container.innerHTML = visiblePosts.map(renderPost).join('');
}

async function loadPosts() {
  try {
    const response = await fetch('/api/forum/posts');
    if (!response.ok) throw new Error('Unable to load discussions.');
    state.posts = await response.json();
    renderPosts();
  } catch (error) {
    elements.container.innerHTML = `<div class="error-state">${escapeHtml(error.message)}</div>`;
  }
}

function setFormVisibility(isVisible) {
  elements.form.classList.toggle('hidden', !isVisible);
  elements.showFormButton.textContent = isVisible ? 'Cancel' : 'Create New Post';
  if (isVisible) elements.titleInput.focus();
}

function showAuthNotice(message) {
  elements.authNotice.textContent = message;
  elements.authNotice.classList.remove('hidden');
}

function readMediaFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('The selected file could not be read.'));
    reader.readAsDataURL(file);
  });
}

async function updateMediaPreview() {
  const file = elements.mediaInput.files[0];
  elements.mediaPreview.classList.add('hidden');
  if (!file) return;

  const maxSize = file.type.startsWith('video/') ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    showAuthNotice('Choose an image or video file.');
    elements.mediaInput.value = '';
    return;
  }
  if (file.size > maxSize) {
    showAuthNotice('The selected media file is too large.');
    elements.mediaInput.value = '';
    return;
  }

  try {
    const media = await readMediaFile(file);
    elements.mediaPreview.innerHTML = file.type.startsWith('video/')
      ? `<video controls preload="metadata" src="${media}"></video><span>${escapeHtml(file.name)} · ${Math.max(1, Math.round(file.size / 1024))} KB</span>`
      : `<img src="${media}" alt="Selected media preview"><span>${escapeHtml(file.name)} · ${Math.max(1, Math.round(file.size / 1024))} KB</span>`;
    elements.mediaPreview.classList.remove('hidden');
  } catch (error) {
    showAuthNotice(error.message);
  }
}

async function submitPost(event) {
  event.preventDefault();
  if (!state.user) {
    showAuthNotice('Log in before creating a post.');
    window.location.assign('/login.html');
    return;
  }

  const title = elements.titleInput.value.trim();
  const content = elements.contentInput.value.trim();
  const category = elements.categoryInput.value;
  const media = elements.mediaInput.files[0] ? await readMediaFile(elements.mediaInput.files[0]) : null;

  if (title.length < 3 || content.length < 3) {
    showAuthNotice('Add a title and a message with at least 3 characters.');
    return;
  }

  try {
    const response = await fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category, media }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to create post.');

    state.posts.unshift(result);
    elements.form.reset();
    elements.categoryInput.value = 'General';
    elements.mediaPreview.classList.add('hidden');
    setFormVisibility(false);
    state.category = 'All';
    state.search = '';
    elements.searchInput.value = '';
    updateCategoryButtons();
    renderPosts();
    showAuthNotice('Your post was published.');
  } catch (error) {
    showAuthNotice(error.message);
  }
}

async function deletePost(postId) {
  if (!confirm('Delete this post and all of its replies?')) return;
  try {
    const response = await fetch(`/api/forum/posts/${postId}`, { method: 'DELETE' });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Unable to delete post.');
    }
    state.posts = state.posts.filter((post) => post.id !== postId);
    renderPosts();
    showAuthNotice('Post deleted.');
  } catch (error) {
    showAuthNotice(error.message);
  }
}

async function deleteReply(postId, replyId) {
  if (!confirm('Delete this reply?')) return;
  try {
    const response = await fetch(`/api/forum/posts/${postId}/replies/${replyId}`, { method: 'DELETE' });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Unable to delete reply.');
    }
    const post = state.posts.find((item) => item.id === postId);
    if (post) post.replies = post.replies.filter((reply) => reply.id !== replyId);
    renderPosts();
    showAuthNotice('Reply deleted.');
  } catch (error) {
    showAuthNotice(error.message);
  }
}

async function submitReply(event) {
  event.preventDefault();
  const form = event.target.closest('[data-reply-form]');
  if (!form || !state.user) return;

  const postId = form.dataset.replyForm;
  const textarea = form.elements.content;
  const content = textarea.value.trim();
  if (content.length < 2) {
    textarea.focus();
    return;
  }

  try {
    const response = await fetch(`/api/forum/posts/${postId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to add reply.');

    const post = state.posts.find((item) => item.id === postId);
    if (post) post.replies.push(result);
    renderPosts();
  } catch (error) {
    showAuthNotice(error.message);
  }
}

function updateCategoryButtons() {
  elements.categoryButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.category === state.category);
  });
}

function bindEvents() {
  elements.showFormButton.addEventListener('click', () => {
    setFormVisibility(elements.form.classList.contains('hidden'));
  });
  elements.form.addEventListener('submit', submitPost);
  elements.container.addEventListener('click', (event) => {
    const toggle = event.target.closest('.reply-toggle');
    if (toggle) {
      const replies = toggle.closest('.forum-card').querySelector('.replies');
      const isOpen = !replies.classList.contains('hidden');
      replies.classList.toggle('hidden', isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.textContent = isOpen ? 'View replies' : 'Hide replies';
      return;
    }

    const postButton = event.target.closest('[data-delete-post]');
    if (postButton) return deletePost(postButton.dataset.deletePost);

    const replyButton = event.target.closest('[data-delete-reply]');
    if (replyButton) return deleteReply(replyButton.dataset.postId, replyButton.dataset.deleteReply);
  });
  elements.container.addEventListener('submit', submitReply);
  elements.mediaInput.addEventListener('change', updateMediaPreview);
  elements.searchInput.addEventListener('input', (event) => {
    state.search = event.target.value;
    renderPosts();
  });
  elements.sortInput.addEventListener('change', (event) => {
    state.sort = event.target.value;
    renderPosts();
  });
  elements.categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      updateCategoryButtons();
      renderPosts();
    });
  });
}

async function initialize() {
  bindEvents();
  try {
    const response = await fetch('/api/me');
    state.user = response.ok ? await response.json() : null;
    const adminResponse = await fetch('/api/admin/me');
    state.isAdmin = adminResponse.ok;
    document.getElementById('create-post-prompt').textContent = state.user
      ? `Welcome, ${state.user.name}. Share your thoughts below.`
      : 'Log in to create a post and join the conversation.';
    document.getElementById('post-form-guard').classList.toggle('hidden', !state.user);
    await loadPosts();
  } catch (error) {
    state.user = null;
    state.isAdmin = false;
    await loadPosts();
  }
}

initialize();
