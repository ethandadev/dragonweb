const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);
const MAX_MEDIA_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 15 * 1024 * 1024;

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

function readPosts() {
  try {
    return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

function writePosts(posts) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

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

function getUser(req) {
  const users = readUsers();
  const user = users.find((candidate) => candidate.id === req.session.userId) || null;
  if (user) user.role = ADMIN_EMAILS.has(user.email) || req.session.isAdmin ? 'admin' : 'member';
  return user;
}

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function validateMedia(media) {
  if (!media) return null;
  if (typeof media !== 'string' || !media.startsWith('data:')) {
    return { error: 'Media must be uploaded as an image or video file.' };
  }

  const match = media.match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) return { error: 'Media is not a valid file upload.' };

  const mimeType = match[1].toLowerCase();
  const size = Buffer.byteLength(match[2], 'base64');
  const allowedTypes = mimeType.startsWith('image/') || mimeType.startsWith('video/');
  const maxSize = mimeType.startsWith('video/') ? MAX_VIDEO_SIZE : MAX_MEDIA_SIZE;

  if (!allowedTypes) return { error: 'Only image and video files are supported.' };
  if (size > maxSize) return { error: 'The selected media file is too large.' };
  return { mediaType: mimeType, mediaUrl: media };
}

function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) {
    return res.status(401).json({ error: 'Admin login required.' });
  }
  next();
}

const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

app.use(express.json({ limit: '100mb' }));
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
  const user = getUser(req);

  if (!user) {
    return res.status(401).json({ error: 'Not logged in.' });
  }

  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// --- Forum API ---

app.get('/api/forum/posts', (req, res) => {
  const posts = readPosts();
  res.json(posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.post('/api/forum/posts', (req, res) => {
  const user = getUser(req);
  const { title, content, category = 'General', media } = req.body || {};
  const normalizedTitle = String(title || '').trim();
  const normalizedContent = String(content || '').trim();
  const normalizedCategory = String(category || 'General').trim().slice(0, 40);
  const mediaResult = validateMedia(media);

  if (!user) return res.status(401).json({ error: 'Log in to create a post.' });
  if (normalizedTitle.length < 3 || normalizedTitle.length > 120) {
    return res.status(400).json({ error: 'A title between 3 and 120 characters is required.' });
  }
  if (normalizedContent.length < 3 || normalizedContent.length > 2000) {
    return res.status(400).json({ error: 'A message between 3 and 2000 characters is required.' });
  }
  if (media && mediaResult.error) return res.status(400).json({ error: mediaResult.error });

  const post = {
    id: createId('post'),
    title: normalizedTitle,
    content: normalizedContent,
    category: normalizedCategory,
    media: mediaResult?.mediaUrl || null,
    mediaType: mediaResult?.mediaType || null,
    author: { id: user.id, name: user.name },
    createdAt: new Date().toISOString(),
    replies: [],
  };

  const posts = readPosts();
  posts.push(post);
  writePosts(posts);
  res.status(201).json(post);
});

app.delete('/api/forum/posts/:postId', (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Log in to delete a post.' });

  const posts = readPosts();
  const post = posts.find((item) => item.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  if (post.author.id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'You can only delete your own posts.' });
  }

  writePosts(posts.filter((item) => item.id !== post.id));
  res.status(204).send();
});

app.post('/api/forum/posts/:postId/replies', (req, res) => {
  const user = getUser(req);
  const content = String(req.body?.content || '').trim();

  if (!user) return res.status(401).json({ error: 'Log in to add a reply.' });
  if (content.length < 2 || content.length > 1000) {
    return res.status(400).json({ error: 'A reply between 2 and 1000 characters is required.' });
  }

  const posts = readPosts();
  const post = posts.find((item) => item.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  const reply = {
    id: createId('reply'),
    content,
    author: { id: user.id, name: user.name },
    createdAt: new Date().toISOString(),
  };

  post.replies.push(reply);
  writePosts(posts);
  res.status(201).json(reply);
});

app.delete('/api/forum/posts/:postId/replies/:replyId', (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Log in to delete a reply.' });

  const posts = readPosts();
  const post = posts.find((item) => item.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  const reply = post.replies.find((item) => item.id === req.params.replyId);
  if (!reply) return res.status(404).json({ error: 'Reply not found.' });
  if (reply.author.id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'You can only delete your own replies.' });
  }

  post.replies = post.replies.filter((item) => item.id !== reply.id);
  writePosts(posts);
  res.status(204).send();
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

  const posts = readPosts();
  res.json({
    totalUsers: users.length,
    newUsersThisWeek: users.filter((u) => new Date(u.createdAt).getTime() > weekAgo).length,
    totalAnnouncements: announcements.length,
    announcementViews: stats.announcementViews || 0,
    totalPosts: posts.length,
    recentUsers: users
      .slice(-5)
      .reverse()
      .map((u) => ({ name: u.name, email: u.email, createdAt: u.createdAt })),
  });
});

app.get('/api/admin/posts', requireAdmin, (req, res) => {
  res.json(readPosts().slice().reverse());
});

app.delete('/api/admin/posts/:postId', requireAdmin, (req, res) => {
  const posts = readPosts();
  const post = posts.find((item) => item.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  writePosts(posts.filter((item) => item.id !== post.id));
  res.status(204).send();
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
