const balanceEl = document.getElementById('arcade-balance');
const gamesEl = document.getElementById('arcade-games');
const errorEl = document.getElementById('arcade-error');
const games = [
  { id: 'snake', name: 'Snake', description: 'Guide the snake, collect food, and avoid the walls.' },
  { id: 'tetris', name: 'Tetris', description: 'Clear lines and build your high score.' },
];

function showArcadeError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function renderGames(data) {
  gamesEl.replaceChildren();
  games.forEach((game) => {
    const unlocked = data.unlockedGames.includes(game.id);
    const card = document.createElement('section');
    card.className = 'arcade-game';

    const title = document.createElement('h2');
    title.textContent = game.name;
    const description = document.createElement('p');
    description.textContent = game.description;
    const status = document.createElement('p');
    status.className = 'arcade-status';
    const action = document.createElement('button');
    action.className = 'cta-button';

    if (unlocked && data.gamesEnabled) {
      status.textContent = 'Unlocked and available to play.';
      action.textContent = 'Play';
      action.addEventListener('click', () => { window.location.href = `${game.id}.html`; });
    } else if (unlocked) {
      status.textContent = 'Unlocked. Your teacher has paused game access.';
      action.textContent = 'Play unavailable';
      action.disabled = true;
    } else {
      status.textContent = `Unlock permanently for ${data.unlockCost} token.`;
      action.textContent = `Unlock for ${data.unlockCost} token`;
      action.addEventListener('click', async () => {
        action.disabled = true;
        errorEl.classList.add('hidden');
        try {
          const response = await fetch(`/api/games/${game.id}/unlock`, { method: 'POST' });
          const result = await response.json();
          if (!response.ok) {
            showArcadeError(result.error || 'Could not unlock this game.');
            action.disabled = false;
            return;
          }
          await loadArcade();
        } catch (error) {
          showArcadeError('Could not reach the server. Try again.');
          action.disabled = false;
        }
      });
    }

    card.append(title, description, status, action);
    gamesEl.append(card);
  });
}

async function loadArcade() {
  try {
    const response = await fetch('/api/tokens');
    const data = await response.json();
    if (!response.ok) {
      balanceEl.textContent = data.error || 'Log in to use the token arcade.';
      const login = document.createElement('a');
      login.href = 'login.html';
      login.className = 'cta-button';
      login.textContent = 'Log in';
      gamesEl.replaceChildren(login);
      return;
    }

    balanceEl.textContent = `Your balance: ${data.tokens} ${data.tokens === 1 ? 'token' : 'tokens'}`;
    renderGames(data);
    if (!data.gamesEnabled) {
      const notice = document.createElement('p');
      notice.className = 'arcade-status';
      notice.textContent = 'Your teacher has currently disabled game access.';
      gamesEl.prepend(notice);
    }
  } catch (error) {
    balanceEl.textContent = 'Could not load your token balance. Try again.';
  }
}

loadArcade();
