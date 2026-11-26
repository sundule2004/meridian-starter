// ---------------------------------------------------------------
// The database has NOT been set up yet.
// Right now conversations only live in memory, so they are lost
// when the app restarts. See /db/schema.sql for the intended tables
// and connect a real local database (expo-sqlite is installed).
// ---------------------------------------------------------------

let memory = {};

export async function initDb() {
  // TODO: open the database and create the tables
}

export async function saveConversation(id, title, messages) {
  memory['current'] = { id, title, messages };
}

export async function listConversations() {
  return Object.values(memory);
}

export async function getConversation(id) {
  return memory[id];
}

export async function deleteConversation(id) {
  // TODO
}

export async function clearAll() {
  // TODO
}
