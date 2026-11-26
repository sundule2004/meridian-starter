import { ANTHROPIC_API_KEY } from '../config';

// Sends the user's question to the AI service and returns the reply text.
export async function askAssistant(text) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-5-5',
      max_tokens: 512,
      messages: [{ role: 'user', content: text }],
    }),
  });
  const data = await res.json();
  return data.content[0].text;
}
