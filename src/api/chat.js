import { API_URL } from '../config';
import { getToken } from '../auth/session';

const TIMEOUT_MS = 30000;

// Error with extra flags the screen uses to decide what to show.
export class ChatError extends Error {
  constructor(message, { auth = false, handoff = false } = {}) {
    super(message);
    this.auth = auth;       // session expired -> sign in again
    this.handoff = handoff; // offer "Talk to a person"
  }
}

// history = the WHOLE conversation so far: [{ role: 'user' | 'assistant', text }]
// Sending all of it every time is what lets the assistant answer follow-up questions.
export async function askAssistant(history) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messages: history.map((m) => ({ role: m.role, content: m.text })) }),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) throw new ChatError('Your session has expired. Please sign in again.', { auth: true });
    if (!res.ok) throw new ChatError(data.error || 'Something went wrong. Please try again.', { handoff: !!data.handoff });
    if (!data.reply) throw new ChatError('The assistant sent an empty answer. Please try again.', { handoff: true });
    return { reply: data.reply, handoff: !!data.handoff };
  } catch (e) {
    if (e instanceof ChatError) throw e;
    if (e.name === 'AbortError') throw new ChatError('The assistant took too long to answer. Please try again.', { handoff: true });
    throw new ChatError('No connection to the server. Check your internet and try again.');
  } finally {
    clearTimeout(timer);
  }
}
