# Meridian Assistant

## Setup
1. `cd backend && cp .env.example .env` then put YOUR Claude key in `.env` (never commit it). `npm install && npm start`.
2. `cd app && npm install && npx expo install expo-secure-store expo-sqlite expo-speech`.
3. Set `EXPO_PUBLIC_API_URL` (Android emulator `http://10.0.2.2:3000`, phone: your PC's LAN IP). `npx expo start`.
4. Sign in with the demo account from `.env`.

## AI tools used (required)
- Claude (claude.ai chat): used for ... (list what, honestly: explaining the task, drafting backend/system prompt/SQLite code, which I then read, tested and changed).
- Claude API: the chatbot itself (backend only).
- (Add any other tool: Copilot, ChatGPT, etc.)

## Reflection (~300 words)
Write in your own words. Two risks to cover: (1) hallucinated/incorrect policy answers -> grounding in the policy extract, refusal of out-of-scope questions, human handover; (2) leaking secrets or personal data -> API key only on the server, SecureStore token, no passwords in prompts, local history deletable.
