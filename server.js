const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Route: Root -> Landing Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route: Game page
app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

// API: Validate challenge answer (server-side log only, actual validation is client-side for static challenges)
app.post('/api/log', (req, res) => {
  const { player, role, challenge, result, score } = req.body;
  console.log(`[${new Date().toISOString()}] PLAYER: ${player} | ROLE: ${role} | CHALLENGE: ${challenge} | RESULT: ${result} | SCORE: ${score}`);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n🚀 LKS Cyber Security Simulator`);
  console.log(`📡 Running at: http://localhost:${PORT}`);
  console.log(`⚔️  Attack & Defence Simulation Ready!\n`);
});

