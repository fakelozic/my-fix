import Database from "better-sqlite3";

const db = new Database("sqlite.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER
  );
`);

console.log("Database initialized!");
