document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error-message');
  errorEl.classList.add('hidden');
  errorEl.textContent = '';

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Something went wrong.';
      errorEl.classList.remove('hidden');
      return;
    }

    window.location.href = 'index.html';
  } catch (err) {
    errorEl.textContent = 'Could not reach the server. Try again.';
    errorEl.classList.remove('hidden');
  }
});
