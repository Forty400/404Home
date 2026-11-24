const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(dataDir, '404home.db')

const dbParent = path.dirname(dbPath)
if (!fs.existsSync(dbParent)) {
  fs.mkdirSync(dbParent, { recursive: true })
}

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
      pricing TEXT NOT NULL DEFAULT '',
      region_avail TEXT NOT NULL DEFAULT '',
      scenario TEXT NOT NULL DEFAULT '',
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
      topic TEXT NOT NULL DEFAULT 'news',
      source_name TEXT NOT NULL DEFAULT '',
      source_url TEXT NOT NULL DEFAULT '',
      is_hot INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      email_verified_at TEXT,
      password_hash TEXT,
      wx_unionid TEXT UNIQUE,
      wx_web_openid TEXT UNIQUE,
      vip_level INTEGER NOT NULL DEFAULT 0,
      balance_cents INTEGER NOT NULL DEFAULT 0,
      balance_cap_cents INTEGER NOT NULL DEFAULT 300,
      cumulative_recharge_cents INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS wallet_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      delta_cents INTEGER NOT NULL,
      reason TEXT NOT NULL,
      ref_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_wallet_ledger_user ON wallet_ledger(user_id);

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL DEFAULT '新对话',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL DEFAULT '',
      prompt_tokens INTEGER NOT NULL DEFAULT 0,
      completion_tokens INTEGER NOT NULL DEFAULT 0,
      cost_cents INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

    CREATE TABLE IF NOT EXISTS cs_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'bot' CHECK(status IN ('bot', 'queued', 'human', 'closed')),
      assignee_admin_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (assignee_admin_id) REFERENCES admins(id)
    );

    CREATE TABLE IF NOT EXISTS cs_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'bot', 'agent', 'system')),
      admin_id INTEGER,
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES cs_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (admin_id) REFERENCES admins(id)
    );

    CREATE TABLE IF NOT EXISTS cs_scripts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      faq_label TEXT,
      keywords TEXT NOT NULL DEFAULT '[]',
      body TEXT NOT NULL DEFAULT '',
      sort INTEGER NOT NULL DEFAULT 100,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cs_agent_presence (
      admin_id INTEGER PRIMARY KEY,
      online INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (admin_id) REFERENCES admins(id)
    );

    CREATE TABLE IF NOT EXISTS cs_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );

    CREATE INDEX IF NOT EXISTS idx_cs_sessions_user ON cs_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_cs_sessions_status ON cs_sessions(status);
    CREATE INDEX IF NOT EXISTS idx_cs_messages_session ON cs_messages(session_id);

    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);
    CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
    CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id);

    CREATE TABLE IF NOT EXISTS tool_chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tool_id INTEGER NOT NULL,
      field TEXT NOT NULL,
      text TEXT NOT NULL DEFAULT '',
      embedding_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tool_chunks_tool ON tool_chunks(tool_id);
    CREATE INDEX IF NOT EXISTS idx_tool_chunks_field ON tool_chunks(field);
  `)
  migratePostsSchema()
  migrateToolsSchema()
  seedCsDefaults()
}

function seedCsDefaults() {
  const row = db.prepare('SELECT value FROM cs_settings WHERE key = ?').get('mode')
  if (!row) {
    const ins = db.prepare('INSERT INTO cs_settings (key, value) VALUES (?, ?)')
    ins.run('mode', 'scripts')
    ins.run('queue_message', '当前询问人数过多，正在排队')
    ins.run('fallback_message', '暂未匹配到问题，请换个说法或转人工')
  }
}

function migratePostsSchema() {
  const cols = new Set(db.prepare('PRAGMA table_info(posts)').all().map((c) => c.name))
  const add = (name, ddl) => {
    if (!cols.has(name)) db.exec(`ALTER TABLE posts ADD COLUMN ${ddl}`)
  }
  add('topic', "topic TEXT NOT NULL DEFAULT 'news'")
  add('source_name', "source_name TEXT NOT NULL DEFAULT ''")
  add('source_url', "source_url TEXT NOT NULL DEFAULT ''")
  add('is_hot', 'is_hot INTEGER NOT NULL DEFAULT 0')
  add('lifecycle', "lifecycle TEXT NOT NULL DEFAULT 'draft'")
  add('ingest_bot', "ingest_bot TEXT NOT NULL DEFAULT ''")
  // backfill once: published=1 → published lifecycle
  db.prepare(
    `UPDATE posts SET lifecycle = 'published' WHERE published = 1 AND (lifecycle = 'draft' OR lifecycle = '')`
  ).run()
  db.prepare(
    `UPDATE posts SET lifecycle = 'draft' WHERE published = 0 AND lifecycle = 'published'`
  ).run()
}

function migrateToolsSchema() {
  const cols = new Set(db.prepare('PRAGMA table_info(tools)').all().map((c) => c.name))
  const add = (name, ddl) => {
    if (!cols.has(name)) db.exec(`ALTER TABLE tools ADD COLUMN ${ddl}`)
  }
  add('pricing', "pricing TEXT NOT NULL DEFAULT ''")
  add('region_avail', "region_avail TEXT NOT NULL DEFAULT ''")
  add('scenario', "scenario TEXT NOT NULL DEFAULT ''")
}

function parseTool(row) {
  if (!row) return null
  return {
    ...row,
    tags: safeJsonParse(row.tags, []),
    pricing: row.pricing || '',
    region_avail: row.region_avail || '',
    scenario: row.scenario || '',
    is_hot: !!row.is_hot,
    is_new: !!row.is_new,
    enabled: !!row.enabled
  }
}

function parsePost(row) {
  if (!row) return null
  const lifecycle = row.lifecycle || (row.published ? 'published' : 'draft')
  return {
    ...row,
    published: lifecycle === 'published',
    is_hot: !!row.is_hot,
    topic: row.topic || 'news',
    source_name: row.source_name || '',
    source_url: row.source_url || '',
    lifecycle,
    ingest_bot: row.ingest_bot || ''
  }
}

const POST_LIFECYCLES = new Set(['pending_review', 'draft', 'published', 'archived'])

function pendingReviewLimit() {
  const n = Number(process.env.PENDING_REVIEW_LIMIT)
  return Number.isFinite(n) && n > 0 ? n : 20
}

function countPendingReview() {
  return db.prepare(`SELECT COUNT(*) AS n FROM posts WHERE lifecycle = 'pending_review'`).get().n
}

function setPostLifecycle(id, lifecycle) {
  if (!POST_LIFECYCLES.has(lifecycle)) return null
  const published = lifecycle === 'published' ? 1 : 0
  db.prepare('UPDATE posts SET lifecycle = ?, published = ? WHERE id = ?').run(lifecycle, published, id)
  return parsePost(db.prepare('SELECT * FROM posts WHERE id = ?').get(id))
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
  parsePost,
  POST_LIFECYCLES,
  pendingReviewLimit,
  countPendingReview,
  setPostLifecycle
}
