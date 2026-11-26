// Task 6: on-device SQLite (works offline). Needs: npx expo install expo-sqlite
import * as SQLite from 'expo-sqlite';

let dbPromise;
function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('meridian.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL DEFAULT 'New conversation',
          status TEXT NOT NULL DEFAULT 'active',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('user','assistant')),
          content TEXT NOT NULL,
          handoff INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`);
      return db;
    })();
  }
  return dbPromise;
}

export async function createConversation(userId, title) {
  const db = await getDb();
  const r = await db.runAsync('INSERT INTO conversations (user_id, title) VALUES (?, ?)', [userId, title.slice(0, 60)]);
  return r.lastInsertRowId;
}
export async function addMessage(conversationId, role, content, handoff = false) {
  const db = await getDb();
  await db.runAsync('INSERT INTO messages (conversation_id, role, content, handoff) VALUES (?,?,?,?)',
    [conversationId, role, content, handoff ? 1 : 0]);
  await db.runAsync("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?", [conversationId]);
}
export async function listConversations(userId) {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC, id DESC', [userId]);
}
export async function getMessages(conversationId) {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM messages WHERE conversation_id = ? ORDER BY id ASC', [conversationId]);
}
export async function deleteConversation(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM conversations WHERE id = ?', [id]); // messages go too (CASCADE)
}
export async function clearHistory(userId) {
  const db = await getDb();
  await db.runAsync('DELETE FROM conversations WHERE user_id = ?', [userId]);
}
