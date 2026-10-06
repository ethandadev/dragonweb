const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Hardcoded admin login for the hidden /dashboard.html page
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (err) {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) {
    return res.status(401).json({ error: 'Admin login required.' });
  }
  next();
}

app.use(express.json());
app.use(session({
  secret: 'dragonweb-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

// --- Auth API ---

app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const users = readUsers();

  if (users.some((u) => u.email === normalizedEmail)) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const user = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    name: String(name).trim(),
    email: normalizedEmail,
    password: password,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  writeUsers(users);

  req.session.userId = user.id;
  res.json({ id: user.id, name: user.name, email: user.email });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const users = readUsers();
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  req.session.userId = user.id;
  res.json({ id: user.id, name: user.name, email: user.email });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

app.get('/api/me', (req, res) => {
  const users = readUsers();
  const user = users.find((u) => u.id === req.session.userId);

  if (!user) {
    return res.status(401).json({ error: 'Not logged in.' });
  }

  res.json({ id: user.id, name: user.name, email: user.email });
});

// --- Announcements API ---

app.get('/api/announcements', (req, res) => {
  const stats = readJson(STATS_FILE, { announcementViews: 0 });
  stats.announcementViews = (stats.announcementViews || 0) + 1;
  writeJson(STATS_FILE, stats);

  const list = readJson(ANNOUNCEMENTS_FILE, []);
  res.json(list.slice().reverse());
});

// --- Admin API (used by dashboard.html) ---

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }
  req.session.isAdmin = true;
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.isAdmin = false;
  res.json({ ok: true });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ ok: true });
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const users = readUsers();
  const announcements = readJson(ANNOUNCEMENTS_FILE, []);
  const stats = readJson(STATS_FILE, { announcementViews: 0 });
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  res.json({
    totalUsers: users.length,
    newUsersThisWeek: users.filter((u) => new Date(u.createdAt).getTime() > weekAgo).length,
    totalAnnouncements: announcements.length,
    announcementViews: stats.announcementViews || 0,
    recentUsers: users
      .slice(-5)
      .reverse()
      .map((u) => ({ name: u.name, email: u.email, createdAt: u.createdAt })),
  });
});

app.post('/api/admin/announcements', requireAdmin, (req, res) => {
  const title = String((req.body || {}).title || '').trim();
  const content = String((req.body || {}).content || '').trim();
  const author = String((req.body || {}).author || '').trim() || 'Admin';

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and message are required.' });
  }

  const list = readJson(ANNOUNCEMENTS_FILE, []);
  const announcement = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    title: title.slice(0, 120),
    content: content.slice(0, 2000),
    author: author.slice(0, 60),
    createdAt: new Date().toISOString(),
  };
  list.push(announcement);
  writeJson(ANNOUNCEMENTS_FILE, list);
  res.json(announcement);
});

app.delete('/api/admin/announcements/:id', requireAdmin, (req, res) => {
  const list = readJson(ANNOUNCEMENTS_FILE, []);
  writeJson(ANNOUNCEMENTS_FILE, list.filter((a) => a.id !== req.params.id));
  res.json({ ok: true });
});

// Serve static files from the project root (so index.html works at /)
app.use(express.static(path.join(__dirname)));

// Also explicitly serve assets (optional but clear)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Optional: handle unknown routes
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
