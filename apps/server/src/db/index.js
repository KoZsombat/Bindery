import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { DATA_DIR, DB_PATH, SITES_DIR, UPLOADS_DIR, DEFAULT_DAILY_LIMIT } from '../config.js';

for (const dir of [DATA_DIR, SITES_DIR, UPLOADS_DIR]) fs.mkdirSync(dir, { recursive: true });

export const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('busy_timeout = 5000');
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('synchronous = NORMAL');
sqlite.exec(`
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  daily_limit INTEGER NOT NULL DEFAULT 3,
  disabled INTEGER NOT NULL DEFAULT 0,
  api_base TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL DEFAULT '',
  api_model TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  topic TEXT NOT NULL DEFAULT '',
  audience TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'both',
  status TEXT NOT NULL DEFAULT 'queued',
  published INTEGER NOT NULL DEFAULT 1,
  example INTEGER NOT NULL DEFAULT 0,
  source_text TEXT NOT NULL DEFAULT '',
  error TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  chars INTEGER NOT NULL DEFAULT 0,
  extracted TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  log TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS key_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id TEXT NOT NULL,
  grantee_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(owner_id, grantee_id)
);
CREATE INDEX IF NOT EXISTS idx_sites_owner ON sites(owner_id);
CREATE INDEX IF NOT EXISTS idx_sites_status_published ON sites(status, published);
CREATE INDEX IF NOT EXISTS idx_sites_created ON sites(created_at);
CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_key_shares_grantee ON key_shares(grantee_id);
`);

function hasColumn(table, column) {
  return sqlite.prepare(`PRAGMA table_info(${table})`).all().some(row => row.name === column);
}
function addColumn(table, column, definition) {
  if (!hasColumn(table, column)) sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}
addColumn('sites', 'archived', 'INTEGER NOT NULL DEFAULT 0');
addColumn('jobs', 'attempts', 'INTEGER NOT NULL DEFAULT 0');
addColumn('jobs', 'locked_at', 'TEXT');
addColumn('jobs', 'next_attempt_at', 'TEXT');
addColumn('jobs', 'last_error', 'TEXT');
addColumn('jobs', 'cancel_requested', 'INTEGER NOT NULL DEFAULT 0');

// Legacy installs created sites.owner_id with a FK to users(id), but the auth
// table is user(id). SQLite cannot alter a constraint, so rebuild once.
const siteFks = sqlite.prepare('PRAGMA foreign_key_list(sites)').all();
if (siteFks.some(fk => fk.table === 'users')) {
  const old = sqlite.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='sites'").get().sql;
  const ddl = old
    .replace(/REFERENCES\s+users\s*\([^)]*\)(?:\s+ON\s+DELETE\s+\w+)?/gi, '')
    .replace(/^CREATE TABLE\s+sites/i, 'CREATE TABLE sites_new');
  const cols = sqlite.prepare('PRAGMA table_info(sites)').all().map(c => '"' + c.name + '"').join(',');
  sqlite.pragma('foreign_keys = OFF');
  sqlite.exec(ddl + ';');
  sqlite.exec(`INSERT INTO sites_new (${cols}) SELECT ${cols} FROM sites; DROP TABLE sites; ALTER TABLE sites_new RENAME TO sites;`);
  sqlite.exec(`
CREATE INDEX IF NOT EXISTS idx_sites_owner ON sites(owner_id);
CREATE INDEX IF NOT EXISTS idx_sites_status_published ON sites(status, published);
CREATE INDEX IF NOT EXISTS idx_sites_created ON sites(created_at);
  `);
  sqlite.pragma('foreign_keys = ON');
}

// Legacy installs also pointed uploads.user_id at the old users(id) table.
// Auth user ids are strings now; rebuild the table without the stale FK.
const uploadFks = sqlite.prepare('PRAGMA foreign_key_list(uploads)').all();
if (uploadFks.length) {
  const cols = sqlite.prepare('PRAGMA table_info(uploads)').all().map(c => '"' + c.name + '"').join(',');
  sqlite.pragma('foreign_keys = OFF');
  sqlite.exec(`
CREATE TABLE uploads_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  chars INTEGER NOT NULL DEFAULT 0,
  extracted TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
INSERT INTO uploads_new (${cols}) SELECT ${cols} FROM uploads;
DROP TABLE uploads;
ALTER TABLE uploads_new RENAME TO uploads;
CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_created ON uploads(created_at);
  `);
  sqlite.pragma('foreign_keys = ON');
}
sqlite.exec(`
CREATE INDEX IF NOT EXISTS idx_jobs_queue ON jobs(status, next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_jobs_site ON jobs(site_id);
CREATE INDEX IF NOT EXISTS idx_uploads_created ON uploads(created_at);
`);

export const now = () => new Date().toISOString();

export const slugify = s => String(s || 'site')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')
  .slice(0, 60) || 'site';

export function ensureProfile(userId, limit = DEFAULT_DAILY_LIMIT) {
  let p = sqlite.prepare('SELECT * FROM profiles WHERE user_id=?').get(userId);
  if (!p) {
    sqlite.prepare('INSERT INTO profiles (user_id,daily_limit,created_at) VALUES (?,?,?)').run(userId, limit, now());
    p = sqlite.prepare('SELECT * FROM profiles WHERE user_id=?').get(userId);
  }
  return p;
}

export function quotaUsed(userId) {
  const day = new Date().toISOString().slice(0, 10);
  return sqlite.prepare(
    `SELECT COUNT(*) AS n FROM jobs j
     JOIN sites s ON s.id = j.site_id
     WHERE s.owner_id=? AND substr(j.created_at,1,10)=? AND s.example=0`
  ).get(userId, day).n;
}

/**
 * First active key shared with `userId`, as the owner's profile plus owner
 * email/name. Never returns anyone's key to callers that render JSON; only
 * llmConfig() decrypts it server-side. Disabled owners and owners without a
 * key do not count as a source.
 */
export function sharedKeySource(userId) {
  return sqlite.prepare(`
    SELECT p.*, u.email AS owner_email, u.name AS owner_name
    FROM key_shares s
    JOIN profiles p ON p.user_id = s.owner_id
    JOIN user u ON u.id = s.owner_id
    WHERE s.grantee_id = ? AND p.api_key <> '' AND p.disabled = 0
    ORDER BY s.created_at, s.id
    LIMIT 1
  `).get(userId);
}

export function uniqueSlug(base) {
  const root = slugify(base);
  let s = root, i = 1;
  while (sqlite.prepare('SELECT 1 FROM sites WHERE slug=?').get(s)) s = root + '-' + (++i);
  return s;
}

export function siteRow(id) {
  if (!Number.isInteger(id) || id <= 0) return undefined;
  return sqlite.prepare('SELECT * FROM sites WHERE id=?').get(id);
}

export function siteJsonPath(slug) {
  return path.resolve(SITES_DIR, String(slug), 'site.json');
}

export function siteUrl(slug) {
  return '/s/' + encodeURIComponent(slug) + '/';
}

export function publicSite(s) {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    description: s.description,
    topic: s.topic,
    audience: s.audience,
    language: s.language,
    status: s.status,
    published: !!s.published,
    example: !!s.example,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    error: s.error,
    url: s.example ? '/example/matekbazis/' : siteUrl(s.slug),
    archived: !!s.archived,
    reusable: !s.example && fs.existsSync(siteJsonPath(s.slug)),
  };
}

/** Removes extraction rows (and any leftover raw files) older than `days`. */
export function cleanupUploads(days = 7) {
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const rows = sqlite.prepare('SELECT id,path FROM uploads WHERE created_at < ?').all(cutoff);
  const del = sqlite.prepare('DELETE FROM uploads WHERE id=?');
  sqlite.transaction(() => rows.forEach(row => del.run(row.id)))();
  for (const row of rows) {
    try { fs.rmSync(path.join(UPLOADS_DIR, row.path), { force: true }); } catch {}
  }
  return rows.length;
}

export function dbReady() {
  return sqlite.prepare('SELECT 1 AS ok').get()?.ok === 1;
}

export function closeDb() {
  try { sqlite.close(); } catch {}
}
