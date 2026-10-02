const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, '404home.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      parent_id INTEGER,
      sort INTEGER NOT NULL DEFAULT 0,
      icon TEXT DEFAULT '',
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS tools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL DEFAULT '',
      icon TEXT DEFAULT '',
      category_id INTEGER,
      tags TEXT NOT NULL DEFAULT '[]',
      is_hot INTEGER NOT NULL DEFAULT 0,
      is_new INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1,
      sort INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('news', 'tutorial')),
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      cover TEXT DEFAULT '',
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
}

function parseTool(row) {
  if (!row) return null
  return {
    ...row,
    tags: safeJsonParse(row.tags, []),
    is_hot: !!row.is_hot,
    is_new: !!row.is_new,
    enabled: !!row.enabled
  }
}

function parsePost(row) {
  if (!row) return null
  return {
    ...row,
    published: !!row.published
  }
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value || '[]')
  } catch {
    return fallback
  }
}

initSchema()

module.exports = {
  db,
  parseTool,
  parsePost
}
