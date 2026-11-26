// Task 4(b)(c): send the whole conversation, show friendly errors, enforce a time-out.
import { API_URL } from './config';
import { getToken } from './auth';

export async function askAssistant(messages /* [{role, content}] */) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { const e = new Error('Your session expired. Please sign in again.'); e.code = 'AUTH'; throw e; }
    if (!res.ok) { const e = new Error(data.error || 'Something went wrong.'); e.handoff = !!data.handoff; throw e; }
    return { reply: data.reply, handoff: !!data.handoff };
  } catch (err) {
    if (err.name === 'AbortError') { const e = new Error('The assistant took too long. Please try again.'); e.handoff = true; throw e; }
    if (err.code || err.message !== 'Network request failed') throw err;
    const e = new Error('No connection. Check your internet and try again.'); throw e;
  } finally {
    clearTimeout(timer);
  }
}
