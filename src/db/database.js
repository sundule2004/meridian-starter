// On-device SQLite database (expo-sqlite). Works with no internet connection.
import * as SQLite from 'expo-sqlite';

let dbPromise = null;

// Opens the database once and creates the tables (same design as /db/schema.sql).
export function initDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('meridian.db');
      await db.execAsync(`
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS users (
          email TEXT PRIMARY KEY, created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
          title TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('user','assistant')),
          text TEXT NOT NULL, handoff INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
        );`);
      return db;
    })().catch((e) => { dbPromise = null; throw e; });
  }
  return dbPromise;
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const now = () => new Date().toISOString();

export async function createConversation(id, userEmail, title) {
  const db = await initDb();
  await db.runAsync('INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)', [userEmail, now()]);
  await db.runAsync(
    'INSERT INTO conversations (id, user_email, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [id, userEmail, title, now(), now()]
  );
}

export async function addMessage(conversationId, msg) {
  const db = await initDb();
  await db.runAsync(
    'INSERT INTO messages (id, conversation_id, role, text, handoff, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [msg.id, conversationId, msg.role, msg.text, msg.handoff ? 1 : 0, now()]
  );
  await db.runAsync('UPDATE conversations SET updated_at = ? WHERE id = ?', [now(), conversationId]);
}

export async function listConversations(userEmail) {
  const db = await initDb();
  return db.getAllAsync(
    'SELECT * FROM conversations WHERE user_email = ? ORDER BY updated_at DESC',
    [userEmail]
  );
}

export async function getMessages(conversationId) {
  const db = await initDb();
  return db.getAllAsync(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC, rowid ASC',
    [conversationId]
  );
}

export async function conversationExists(id) {
  const db = await initDb();
  const row = await db.getFirstAsync('SELECT id FROM conversations WHERE id = ?', [id]);
  return !!row;
}

// Really deletes the conversation AND its messages (ON DELETE CASCADE).
export async function deleteConversation(id) {
  const db = await initDb();
  await db.runAsync('DELETE FROM conversations WHERE id = ?', [id]);
}

// Really deletes every conversation (and message) of this user.
export async function clearAll(userEmail) {
  const db = await initDb();
  await db.runAsync('DELETE FROM conversations WHERE user_email = ?', [userEmail]);
}
