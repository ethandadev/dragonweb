# dragonweb

A place for all HKIS students to connect online.

## Getting started

1. Install Node from https://nodejs.org
2. Install git from https://git-scm.com/install/mac
3. Clone the repo: `git clone https://github.com/ethandadev/dragonweb`
4. Open a terminal in the `dragonweb` folder
5. `npm install` (installs express, express-session, and everything else in package.json)
6. `npm start`

Now open http://localhost:3000 in your browser and you shall see the website.

## Pages

| Page | What it is |
| --- | --- |
| `index.html` | Home page |
| `announcements.html` | Announcements posted from the dashboard |
| `forums.html` | Student forum (log in to post and reply) |
| `studentstuff.html` | Grade 6 and Grade 7/8 bell schedules. Works out the cycle day automatically and shows each student their own grade. Holidays live in `NO_SCHOOL` in `assets/js/schedule.js` |
| `login.html` / `signup.html` | Student accounts |
| `dashboard.html` | Admin dashboard (post announcements, moderate the forum) |

Data (users, posts, announcements) is saved as JSON in the `data/` folder, which is not committed to git.

## Settings

These can be set as environment variables when starting the server:

- `PORT`: port to run on (default `3000`)
- `ADMIN_USER` / `ADMIN_PASS`: dashboard login (default `admin` / `admin123`, **change this on the live site**)
- `SESSION_SECRET`: secret used to sign login cookies
- `ADMIN_EMAILS`: comma-separated student emails that get admin powers in the forum

## Pushing your changes

Before you start working, sync everyone else's changes:

```
git pull origin main
```

Then, to upload your work:

```
git add .
git commit -m "describe what you changed"
git push origin main
```

At any moment git might ask you to sign in, so just sign into your GitHub account (it should open a browser).

Message ethandadev when you want the changes uploaded to https://dragonweb.ethandadev.com
