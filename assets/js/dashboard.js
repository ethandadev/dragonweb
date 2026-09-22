const $ = (id) => document.getElementById(id);

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

function row(main, sub, extra) {
  const r = document.createElement('div');
  r.className = 'dash-row';
  const text = document.createElement('div');
  text.className = 'dash-row-text';
  const strong = document.createElement('strong');
  strong.textContent = main;
  const small = document.createElement('small');
  small.textContent = sub;
  text.append(strong, small);
  r.append(text);
  if (extra) r.append(extra);
  return r;
}

function empty(msg) {
  const p = document.createElement('p');
  p.className = 'dash-empty';
  p.textContent = msg;
  return p;
}

async function loadStats() {
  const res = await fetch('/api/admin/stats');
  if (!res.ok) return showLogin();
  const s = await res.json();
  $('stat-users').textContent = s.totalUsers;
  $('stat-new').textContent = s.newUsersThisWeek;
  $('stat-ann').textContent = s.totalAnnouncements;
  $('stat-views').textContent = s.announcementViews;

  const users = $('recent-users');
  users.replaceChildren();
  if (!s.recentUsers.length) {
    users.append(empty('No users yet.'));
    return;
  }
  s.recentUsers.forEach((u) =>
    users.append(row(u.name, `${u.email} · ${new Date(u.createdAt).toLocaleDateString()}`))
  );
}

async function loadAnnouncements() {
  const list = await (await fetch('/api/announcements')).json();
  const box = $('announce-list');
  box.replaceChildren();
  if (!list.length) {
    box.append(empty('Nothing posted yet.'));
    return;
  }
  list.forEach((a) => {
    const del = document.createElement('button');
    del.className = 'dash-delete';
    del.textContent = 'Delete';
    del.onclick = async () => {
      if (!confirm(`Delete "${a.title}"?`)) return;
      await fetch(`/api/admin/announcements/${a.id}`, { method: 'DELETE' });
      refresh();
    };
    box.append(row(a.title, `${a.author} · ${new Date(a.createdAt).toLocaleDateString()}`, del));
  });
}

function refresh() {
  loadStats();
  loadAnnouncements();
}

function showDash() {
  $('login-section').classList.add('hidden');
  $('dash-section').classList.remove('hidden');
  refresh();
}

function showLogin() {
  $('dash-section').classList.add('hidden');
  $('login-section').classList.remove('hidden');
}

$('admin-login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('login-error').classList.add('hidden');
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: $('username').value, password: $('password').value }),
  });
  if (res.ok) {
    $('password').value = '';
    showDash();
  } else {
    showError($('login-error'), (await res.json()).error);
  }
});

$('announce-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('announce-error').classList.add('hidden');
  const res = await fetch('/api/admin/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: $('a-title').value,
      author: $('a-author').value,
      content: $('a-content').value,
    }),
  });
  if (res.ok) {
    $('a-title').value = '';
    $('a-content').value = '';
    refresh();
  } else {
    showError($('announce-error'), (await res.json()).error);
  }
});

$('admin-logout').addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  showLogin();
});

fetch('/api/admin/me').then((r) => (r.ok ? showDash() : showLogin()));
