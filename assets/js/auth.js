async function checkAuth() {
  try {
    const res = await fetch('/api/me');
    if (res.ok) {
      const user = await res.json();
      showLoggedIn(user);
    } else {
      showLoggedOut();
    }
  } catch (err) {
    showLoggedOut();
  }
}

function showLoggedIn(user) {
  const profile = document.getElementById('user-profile');
  const avatar = document.getElementById('avatar-img');
  const greeting = document.getElementById('user-greeting');
  const loginLink = document.getElementById('login-link');
  const logoutBtn = document.getElementById('logout-btn');

  if (greeting) greeting.textContent = `Hi, ${user.name}`;
  if (avatar) avatar.textContent = user.name.trim().charAt(0).toUpperCase();
  if (profile) profile.classList.remove('hidden');
  if (loginLink) loginLink.classList.add('hidden');
  if (logoutBtn) logoutBtn.classList.remove('hidden');
}

function showLoggedOut() {
  const profile = document.getElementById('user-profile');
  const loginLink = document.getElementById('login-link');
  const logoutBtn = document.getElementById('logout-btn');

  if (profile) profile.classList.add('hidden');
  if (loginLink) loginLink.classList.remove('hidden');
  if (logoutBtn) logoutBtn.classList.add('hidden');
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', checkAuth);
