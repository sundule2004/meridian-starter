// Task 8(a): run with the backend running:  node tests/policy-tests.js
// Needs a real key in backend/.env. Writes TEST-RESULTS.md (add your emulator screenshots next to it).
const fs = require('fs');
const BASE = process.env.API_URL || 'http://localhost:3000';
const CASES = [
  { q: 'How many days of annual leave do I get?',        expect: [/22/] },
  { q: 'How much notice do I need to request leave?',    expect: [/10 working days/i] },
  { q: 'How many days can I work remotely?',             expect: [/two|2/i, /manager/i] },
  { q: 'Do I need approval for a $700 expense claim?',   expect: [/director/i] },
  { q: 'What time does the IT help desk close?',         expect: [/18:00|6\s?pm/i] },
  { q: 'What is the weather in Harare today?',           expect: [/(only|can).*(help|policy)|person/i], handoff: true }, // Task 5(b) out-of-scope
];
(async () => {
  const login = await fetch(BASE + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.DEMO_EMAIL || 'staff@meridian.test', password: process.env.DEMO_PASSWORD || 'Password123!' }) });
  const { token } = await login.json();
  let md = '# Test results\n\n| # | Question | Expected | Actual reply | Result |\n|---|---|---|---|---|\n';
  let i = 0;
  for (const c of CASES) {
    const r = await fetch(BASE + '/api/chat', { method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ messages: [{ role: 'user', content: c.q }] }) });
    const d = await r.json();
    const ok = r.ok && c.expect.every(re => re.test(d.reply)) && (c.handoff === undefined || d.handoff === c.handoff);
    md += `| ${++i} | ${c.q} | ${c.expect.join(' & ')}${c.handoff ? ' + handoff' : ''} | ${(d.reply || d.error || '').replace(/\|/g, '/').replace(/\n/g, ' ')} | ${ok ? 'PASS' : 'FAIL'} |\n`;
    console.log(ok ? 'PASS' : 'FAIL', '-', c.q);
  }
  fs.writeFileSync('TEST-RESULTS.md', md);
})();
