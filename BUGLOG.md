# Bug log

| # | File | What was wrong | How I fixed it | Commit |
|---|------|----------------|----------------|--------|
| 1 | package.json, backend/server.js, .gitignore | `npm run backend` could not start: `@anthropic-ai/sdk` and `jsonwebtoken` were missing from the root package.json, `.env` was read from the wrong folder, and `backend/.env` was not ignored by Git | Added the deps, load `backend/.env` by absolute path, ignore `.env` files | fix: backend could not start from project root |
| 2 | src/config.js, src/api/chat.js | Claude key was stored in the app and the app called api.anthropic.com directly (key could be extracted from the app / Git) | Removed the key; app now calls my backend, which holds the key in `backend/.env` | fix(security): remove Claude key and direct Anthropic call |
| 3 | src/auth/AuthContext.js | Sign-in accepted any email and any password and created a fake token | Sign-in now calls `/api/login`; the server checks credentials and returns a signed token | fix(auth): real sign-in via backend |
| 4 | src/auth/session.js | Token kept in AsyncStorage (plain text) and `clearToken()` was an empty TODO | Use `expo-secure-store`; implemented `clearToken()` | fix(auth) |
| 5 | src/auth/AuthContext.js | `signOut()` only cleared React state, so the token stayed on the device and the user was signed in again on restart | `signOut()` now deletes the stored token and email | fix(auth) |
| 6 | App.js | Sign-in screen flashed for signed-in users while the saved session was loading | Added a `loading` state and a spinner | fix(auth) |
| 7 | src/db/database.js | No database: conversations lived in memory and were lost on restart; delete/clear were TODO | Real expo-sqlite database (users, conversations, messages) with ON DELETE CASCADE | feat(db) |
| 8 | src/screens/HistoryScreen.js | Delete did not refresh the list, no confirmation, 10px light-grey text, tiny touch targets | Reload on focus and after delete, confirm dialog, 16px dark text, 48px targets, labels | fix: history delete did not refresh |
| 9 | src/screens/SettingsScreen.js | "Back" navigated to `SignIn` (not a screen while signed in); "Clear history" did nothing and had no confirmation | Removed the broken row; clear now confirms and really deletes | fix: settings Back / clear |
| 10 | src/api/chat.js | Only the latest question was sent (no context); no time-out; `data.content[0].text` crashed on any error | Send the full history; 30 s time-out; friendly errors; handoff flag | fix(ai): full history, time-out, errors |
| 11 | src/screens/ChatScreen.js | `loading` was never set to true, so no loading state | Set/clear `loading` around the request | fix(chat) |
| 12 | src/screens/ChatScreen.js | Empty messages and double-taps were sent | Trim, ignore empty, disable Send while loading | fix(chat) |
| 13 | src/screens/ChatScreen.js | Conversation id was hard-coded `'c1'`, so every chat overwrote the last | New id per conversation, messages saved one by one | fix(chat) |
| 14 | src/screens/ChatScreen.js | `route.params.conversationId` was ignored: past conversations could not be reopened | Load messages for the id; New button starts a fresh chat | fix(chat) |
| 15 | src/screens/ChatScreen.js | Keyboard covered the input; list did not scroll to new messages; input font 10px | `KeyboardAvoidingView`, `scrollToEnd`, 16px, multiline | fix(chat) |
| 16 | src/components/MessageBubble.js | `isUser` unused: both sides looked the same; 11px #aaa text on #eee (contrast about 2:1) | Left/right bubbles, colours, 16px, contrast over 4.5:1 | fix(ui): message bubbles |
| 17 | src/components/SpeakButton.js | `Speech.speak({ text })` wrong call (text must be the first argument); not used anywhere | Fixed the call, added stop, used under each reply | fix(ui) |
| 18 | src/components/TalkToPersonButton.js | Empty TODO, never shown | Contact dialog; shown when the bot sets the handoff flag and on errors/time-outs | fix(ui) |
| 19 | src/screens/SignInScreen.js and others | No `accessibilityLabel`s, low-contrast placeholders and icon-less buttons | Added labels/roles, darker placeholders, 44px+ targets | fix(a11y) |
