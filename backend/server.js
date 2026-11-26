// Meridian backend: forwards chat requests to Claude.
// Run with:  npm run backend   (needs backend/.env, see .env.example)
require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const policy = require('./policy.json');
const { SYSTEM_PROMPT } = require('./prompt');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/chat', async (req, res) => {
  const { messages } = req.body;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set on the server' });
  }

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || 'claude-haiku-5-5',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    return res.status(r.status).json({ error: (data.error && data.error.message) || 'AI service error' });
  }
  res.json({ reply: data.content[0].text });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Backend listening on port ' + port));
