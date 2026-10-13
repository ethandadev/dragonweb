document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const grade = document.querySelector('input[name="grade"]:checked')?.value;
  const errorEl = document.getElementById('error-message');
  errorEl.classList.add('hidden');
  errorEl.textContent = '';

  if (!grade) {
    errorEl.textContent = 'Choose your grade.';
    errorEl.classList.remove('hidden');
    return;
  }

  if (password !== confirmPassword) {
    errorEl.textContent = 'Passwords do not match.';
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, grade }),
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Something went wrong.';
      errorEl.classList.remove('hidden');
      return;
    }

    window.location.href = 'studentstuff.html';
  } catch (err) {
    errorEl.textContent = 'Could not reach the server. Try again.';
    errorEl.classList.remove('hidden');
  }
});
