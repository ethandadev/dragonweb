const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

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