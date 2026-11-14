import fs from 'node:fs';
import Database from 'better-sqlite3';
import { DATA_DIR, DB_PATH, SITES_DIR, UPLOADS_DIR, DEFAULT_DAILY_LIMIT } from '../config.js';

for (const dir of [DATA_DIR, SITES_DIR, UPLOADS_DIR]) fs.mkdirSync(dir, { recursive: true });

export const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
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
`);

export const now = () => new Date().toISOString();
export const slugify = s => String(s || 'site').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'site';

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
  return sqlite.prepare("SELECT COUNT(*) AS n FROM sites WHERE owner_id=? AND substr(created_at,1,10)=? AND example=0").get(userId, day).n;
}
export function uniqueSlug(base) {
  let s = slugify(base), i = 1;
  while (sqlite.prepare('SELECT 1 FROM sites WHERE slug=?').get(s)) s = slugify(base) + '-' + (++i);
  return s;
}
export function siteRow(id) { return sqlite.prepare('SELECT * FROM sites WHERE id=?').get(id); }
export function siteJsonPath(slug) { return `${SITES_DIR}/${slug}/site.json`; }
export function siteUrl(slug) { return '/s/' + encodeURIComponent(slug) + '/'; }
export function publicSite(s) {
  return {
    id: s.id, slug: s.slug, title: s.title, description: s.description,
    status: s.status, published: !!s.published, example: !!s.example,
    createdAt: s.created_at, updatedAt: s.updated_at, error: s.error,
    url: siteUrl(s.slug), owner: s.owner_id,
    reusable: !s.example && fs.existsSync(siteJsonPath(s.slug))
  };
}
