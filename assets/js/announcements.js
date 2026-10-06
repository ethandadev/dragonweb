function renderAnnouncement(a) {
  const card = document.createElement('div');
  card.className = 'announcement-card';

  const profile = document.createElement('div');
  profile.className = 'profile-container';
  const avatar = document.createElement('span');
  avatar.className = 'avatar';
  avatar.textContent = a.author.trim().charAt(0).toUpperCase();
  const author = document.createElement('a');
  author.textContent = a.author;
  const date = document.createElement('span');
  date.className = 'announcement-date';
  date.textContent = new Date(a.createdAt).toLocaleDateString();
  profile.append(avatar, author, date);

  const title = document.createElement('p');
  title.className = 'announcement-message-title';
  title.textContent = a.title;
  const content = document.createElement('p');
  content.className = 'announcement-message-content';
  content.textContent = a.content;

  card.append(profile, title, content);
  return card;
}

async function loadAnnouncements() {
  const container = document.getElementById('announcementscards');
  const empty = document.getElementById('announcements-empty');
  try {
    const res = await fetch('/api/announcements');
    const list = await res.json();
    if (!list.length) {
      empty.textContent = 'No announcements yet.';
      return;
    }
    empty.remove();
    list.forEach((a) => container.appendChild(renderAnnouncement(a)));
  } catch (err) {
    empty.textContent = 'Could not load announcements.';
  }
}

document.addEventListener('DOMContentLoaded', loadAnnouncements);
