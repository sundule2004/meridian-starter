# Meridian Assistant: starter project (MDE-41-02)

A React Native (Expo) chatbot app for Meridian Consulting Group staff, plus a small Node backend that talks to Claude.
**This project is unfinished and contains faults.** Your job in the examination is to get it running, find and fix the faults, and complete the missing parts, as set out in the question paper.

## 1. What you need installed

- **Node.js 18 or newer** (https://nodejs.org)
- **Git**
- A code editor (VS Code recommended)
- **Expo Go** on a phone, **or** an Android emulator (Android Studio) / iOS simulator
- Your own **Claude API key** from https://console.anthropic.com

## 2. Set up

1. `cd backend && cp .env.example .env` then put YOUR Claude key in `.env` (never commit it). `npm install && npm start`.
2. `cd app && npm install && npx expo install expo-secure-store expo-sqlite expo-speech`.
3. Set `EXPO_PUBLIC_API_URL` (Android emulator `http://10.0.2.2:3000`, phone: your PC's LAN IP). `npx expo start`.
4. Sign in with the demo account from `.env`.

### Run the backend

```bash
# create backend/.env from the example, and add your own key
copy .env.example backend\.env      # Windows (then edit backend\.env)
cp .env.example backend/.env        # Mac / Linux

npm run backend                     # starts on http://localhost:3000
```

Open `http://localhost:3000/health`: you should see `{"ok":true}`.

### Connecting the app to the backend

Edit `src/config.js`:

| You are using | Set `API_URL` to |
|---|---|
| Android emulator | `http://10.0.2.2:3000` |
| iOS simulator | `http://localhost:3000` |
| Phone with Expo Go | `http://<your computer's IP address>:3000` (same Wi-Fi) |

## 3. Project map

```
App.js                     navigation
src/config.js              settings
src/auth/                  sign-in and session storage
src/api/chat.js            how the app asks the AI
src/db/database.js         conversation storage
src/screens/               Sign-in, Chat, History, Settings
src/components/            message bubble, typing indicator, speak and hand-over buttons
backend/                   server, system prompt, policy information
db/schema.sql              intended database design
public/docs/               put your diagrams here
tests/                     your test questions and results
```

## 4. Rules

- Work **only** in this project. Do not start a new one.
- Keep a **bug log** (`BUGLOG.md`): file, what was wrong, how you fixed it.
- Commit **regularly** with meaningful messages, at least one for each fault fixed.
- Put your diagrams (wireframes of what you changed, navigation map, data model) in **`public/docs/`**, committed to your **public** repository. Photos or scans of hand-drawn diagrams are accepted. You may draw with any free or open-source tool (draw.io, Penpot, Excalidraw, Mermaid) or on paper.
- **Never commit an API key.** Keys belong only in `backend/.env`, which must be ignored by Git.
- Record the AI tools you used in this README (below) and add your 300-word reflection.

## 5. My notes (candidates write below)

**AI tools I used:**
-  Claude: explaining the task, drafting backend/system prompt/SQLite code, which I then read, tested and changed
- Claude API (claude-haiku-5-5): the chatbot itself, called from the backend only
- codeRabbit - review the code & fixing buges

**Reflection (about 300 words):**

Question

1	How many days of annual leave do full-time employees receive per year? 	Expected answer:	Full-time staff receive 25 days of annual leave per year. Requests must be submitted at least 5 working days in advance.
2	How many days per week can employees work remotely? 	Expected answer:	Staff may work remotely up to 3 days per week, with their manager's approval.
3	What is the deadline for submitting expense claims, and when is director approval required? 	Expected answer:	Claims must be submitted within 60 days, with receipts. Claims above $1,000 require director approval.
4	How many failed sign-in attempts cause an account to lock? 	Expected answer	An account locks after 3 failed sign-in attempts. Passwords can be reset through the self-service portal.
5	What time is the IT help desk available? 	Expected answer:	The IT help desk is available from 08:00 to 18:00 on working days.

​ISSUE
-my expo version is  Expo-Go-58.0.5 required is 58.0.26 plus slow internet so i used to explaining the faults and drafting fixes that I read, tested and changed and  codeRabbit - fixing buges while it's downloading 
-i used GitHub desktop push my code issue with the network 

## Sign-in for testing
Email `staff@meridian.test`, password `Password123!` (set in `backend/.env`: DEMO_EMAIL / DEMO_PASSWORD).

## Run the policy tests
`node tests/policy-tests.js` (backend running). Results go to `TEST-RESULTS.md`; add emulator screenshots.
