require('dotenv').config({ path: require('path').join(__dirname, '.env') }); // always backend/.env, whatever folder you start from
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Anthropic = require('@anthropic-ai/sdk');
const SYSTEM_PROMPT = require('./systemPrompt');

const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';
const JWT_SECRET = process.env.JWT_SECRET;
if (!process.env.ANTHROPIC_API_KEY || !JWT_SECRET) {
  console.error('Missing ANTHROPIC_API_KEY or JWT_SECRET in .env');
  process.exit(1);
}

// The key lives ONLY here, on the server.
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 25000, maxRetries: 0 });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50kb' }));

// ---- Task 3: sign-in (replace with the starter's own user check if it has one) ----
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (email === process.env.DEMO_EMAIL && password === process.env.DEMO_PASSWORD) {
    const token = jwt.sign({ sub: email }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Wrong email or password.' });
});

function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  try {
    req.user = jwt.verify(h.replace(/^Bearer /, ''), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Please sign in again.' });
  }
}

// ---- Task 4/5: chat ----
const HUMAN_REQUEST = /\b(human|person|agent|real person|someone|representative|speak to|talk to)\b/i;

function cleanMessages(raw) {
  if (!Array.isArray(raw)) return null;
  const msgs = raw
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-20); // keep the last 20 turns: context without unbounded cost
  while (msgs.length && msgs[0].role !== 'user') msgs.shift(); // API needs first = user
  return msgs.length && msgs[msgs.length - 1].role === 'user' ? msgs : null;
}

app.post('/api/chat', requireAuth, async (req, res) => {
  const messages = cleanMessages(req.body && req.body.messages);
  if (!messages) return res.status(400).json({ error: 'Please send a question.' });
  try {
    const out = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages,
    });
    let reply = out.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
    let handoff = reply.includes('[HANDOFF]');
    reply = reply.replace('[HANDOFF]', '').trim();
    const last = messages[messages.length - 1].content;
    if (HUMAN_REQUEST.test(last) && /\b(talk|speak|human|person|agent)\b/i.test(last)) handoff = true;
    res.json({ reply: reply || 'Sorry, I could not produce an answer.', handoff });
  } catch (err) {
    console.error('Claude error:', err.status || '', err.message);
    const timedOut = err.name === 'APIConnectionTimeoutError' || /timed out/i.test(err.message);
    if (timedOut) return res.status(504).json({ error: 'The assistant took too long. Please try again.', handoff: true });
    if (err.status === 429) return res.status(429).json({ error: 'The assistant is busy. Please wait a moment and retry.' });
    res.status(502).json({ error: 'The assistant is unavailable right now. You can talk to a person instead.', handoff: true });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));
module.exports = app;
if (require.main === module) app.listen(PORT, '0.0.0.0', () => console.log('Backend on port ' + PORT));
