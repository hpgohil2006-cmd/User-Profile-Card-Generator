const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;
const dbDir = path.join(__dirname, 'data');
const dbPath = path.join(dbDir, 'profiles.db');

fs.mkdirSync(dbDir, { recursive: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database(dbPath);

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function titleCase(value) {
  return cleanText(value)
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeUrl(value, fallback = '') {
  const input = cleanText(value);
  if (!input) return fallback;
  if (/^https?:\/\//i.test(input)) return input;
  if (/^www\./i.test(input)) return `https://${input}`;
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(input)) return `https://${input}`;
  return fallback;
}

function parseSkills(rawSkills) {
  return cleanText(rawSkills)
    .split(/[\n,]+/)
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function buildInitials(name) {
  const words = cleanText(name).split(' ').filter(Boolean);
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function createRecord(form) {
  const name = titleCase(form.name || '');
  const title = titleCase(form.title || '');
  const bio = cleanText(form.bio || '');
  const skills = parseSkills(form.skills || '');
  const github = normalizeUrl(form.github, '');
  const linkedin = normalizeUrl(form.linkedin, '');
  const twitter = normalizeUrl(form.twitter, '');
  const accent = form.accent || '#8b5cf6';

  return {
    name,
    title: title || 'Creative Professional',
    bio: bio || 'A passionate individual building beautiful digital experiences.',
    skills: JSON.stringify(skills.length ? skills : ['Design', 'Development', 'Strategy']),
    github,
    linkedin,
    twitter,
    accent,
    avatar: buildInitials(name),
  };
}

function formatProfileRows(rows) {
  return rows.map((row) => ({
    ...row,
    skillsList: JSON.parse(row.skills || '[]'),
    avatar: row.avatar || buildInitials(row.name),
  }));
}

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      title TEXT,
      bio TEXT,
      skills TEXT,
      github TEXT,
      linkedin TEXT,
      twitter TEXT,
      accent TEXT,
      avatar TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

app.get('/', (req, res) => {
  db.all('SELECT * FROM profiles ORDER BY id DESC', (err, rows) => {
    if (err) {
      console.error('Database read error:', err);
      return res.status(500).send('Unable to load profiles.');
    }

    res.render('index', {
      cards: formatProfileRows(rows),
    });
  });
});

app.post('/profiles', (req, res) => {
  const profile = createRecord(req.body);

  const sql = `
    INSERT INTO profiles (name, title, bio, skills, github, linkedin, twitter, accent, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    profile.name,
    profile.title,
    profile.bio,
    profile.skills,
    profile.github,
    profile.linkedin,
    profile.twitter,
    profile.accent,
    profile.avatar,
  ];

  db.run(sql, params, (err) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).send('Could not save profile.');
    }

    res.redirect('/');
  });
});

app.post('/profiles/:id/delete', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM profiles WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).send('Could not remove profile.');
    }

    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`User Profile Card Generator running at http://localhost:${port}`);
});
