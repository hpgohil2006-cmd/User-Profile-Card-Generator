const STORAGE_KEY = 'user-profile-cards';
const form = document.getElementById('profileForm');
const cardList = document.getElementById('cardList');
const recordCount = document.getElementById('recordCount');

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

function normalizeUrl(value) {
  const input = cleanText(value);
  if (!input) return '';
  if (/^https?:\/\//i.test(input)) return input;
  if (/^www\./i.test(input)) return `https://${input}`;
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(input)) return `https://${input}`;
  return '';
}

function parseSkills(raw) {
  return cleanText(raw)
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

function getCards() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveCards(cards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function renderCards() {
  const cards = getCards();
  recordCount.textContent = String(cards.length);

  if (!cards.length) {
    cardList.innerHTML = `
      <div class="empty-state">
        <div>
          <div class="empty-icon">✨</div>
          <p>No profile cards yet. Create one to see the preview.</p>
        </div>
      </div>
    `;
    return;
  }

  cardList.innerHTML = cards
    .map(
      (card) => `
        <article class="profile-card" style="--accent: ${card.accent};">
          <div class="card-header">
            <div class="avatar">${card.avatar}</div>
            <div class="card-meta">
              <h3>${card.name}</h3>
              <p>${card.title}</p>
            </div>
          </div>

          <p class="bio">${card.bio}</p>

          <ul class="skill-list">
            ${card.skills.map((skill) => `<li>${skill}</li>`).join('')}
          </ul>

          <div class="social-row">
            ${card.github ? `<a href="${card.github}" target="_blank" rel="noreferrer">GitHub</a>` : ''}
            ${card.linkedin ? `<a href="${card.linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>` : ''}
            ${card.twitter ? `<a href="${card.twitter}" target="_blank" rel="noreferrer">X</a>` : ''}
          </div>

          <button type="button" class="delete-btn" data-id="${card.id}">Delete</button>
        </article>
      `
    )
    .join('');

  document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      const id = Number(event.currentTarget.dataset.id);
      const cards = getCards().filter((card) => card.id !== id);
      saveCards(cards);
      renderCards();
    });
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = titleCase(document.getElementById('name').value);
  const title = titleCase(document.getElementById('title').value);
  const bio = cleanText(document.getElementById('bio').value);
  const skills = parseSkills(document.getElementById('skills').value);
  const github = normalizeUrl(document.getElementById('github').value);
  const linkedin = normalizeUrl(document.getElementById('linkedin').value);
  const twitter = normalizeUrl(document.getElementById('twitter').value);
  const accent = document.getElementById('accent').value || '#8b5cf6';

  const cards = getCards();
  const newCard = {
    id: Date.now(),
    name: name || 'User',
    title: title || 'Creative Professional',
    bio: bio || 'A passionate individual building beautiful digital experiences.',
    skills: skills.length ? skills : ['Design', 'Development', 'Strategy'],
    github,
    linkedin,
    twitter,
    accent,
    avatar: buildInitials(name || 'User')
  };

  saveCards([newCard, ...cards]);
  form.reset();
  renderCards();
});

renderCards();
