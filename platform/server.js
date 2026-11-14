'use strict';
/*
 * Learning Book Builder — a small, dependency-free platform that turns
 * uploaded notes and long text into routed learning-book sites.
 *
 * Runtime: Node 24 (built-in node:sqlite, fetch, crypto).
 */
const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { DatabaseSync } = require('node:sqlite');

const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'builder.db');
const SITES_DIR = path.join(DATA_DIR, 'sites');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const TEMPLATE_DIR = path.join(ROOT, 'template');
const PUBLIC_DIR = path.join(ROOT, 'public');
const EXAMPLE_DIR = process.env.EXAMPLE_DIR || path.join(ROOT, '..', 'examples', 'matekbazis');
const SKILL_PATH = process.env.SKILL_PATH || path.join(ROOT, '..', 'skills', 'learning-book-site', 'SKILL.md');
const PORT = Number(process.env.PORT || 8080);
const BASE_DOMAIN = process.env.BASE_DOMAIN || 'example.com';
const SITE_DOMAIN = process.env.SITE_DOMAIN || ('sites.' + BASE_DOMAIN);
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '';
const COOKIE_SECURE = process.env.COOKIE_SECURE === '1';
const DEFAULT_DAILY_LIMIT = Number(process.env.DEFAULT_DAILY_LIMIT || 3);
const ADMIN_DAILY_LIMIT = Number(process.env.ADMIN_DAILY_LIMIT || 100);
const MAX_UPLOAD = 8 * 1024 * 1024;
const MAX_FILES = 6;
const MAX_SOURCE = 80000;
const SESSION_MS = 7 * 24 * 3600 * 1000;
const LLM_MOCK = process.env.LLM_MOCK === '1';
const LLM_BASE_URL = (process.env.LLM_BASE_URL || process.env.COMMAND_CODE_BASE_URL || 'https://api.commandcode.ai/v1').replace(/\/+$/, '');
const LLM_API_KEY = process.env.LLM_API_KEY || process.env.COMMAND_CODE_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || process.env.COMMAND_CODE_MODEL || 'deepseek-v4.1';

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(SITES_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  pass TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0,
  daily_limit INTEGER NOT NULL DEFAULT 3,
  disabled INTEGER NOT NULL DEFAULT 0,
  api_base TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL DEFAULT '',
  api_model TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  chars INTEGER NOT NULL DEFAULT 0,
  extracted TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued',
  log TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`);

const now = () => new Date().toISOString();
const publicUser = u => ({
  id: u.id, email: u.email, name: u.name, isAdmin: !!u.is_admin,
  dailyLimit: u.daily_limit, apiBase: u.api_base, apiModel: u.api_model,
  hasKey: !!u.api_key
});
const json = (res, status, data, headers = {}) => {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  res.end(body);
};
const html = (res, status, body, headers = {}) => {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    ...headers
  });
  res.end(body);
};
const redirect = (res, location, headers = {}) => {
  res.writeHead(302, { Location: location, 'Cache-Control': 'no-store', ...headers });
  res.end();
};
const notFound = (res, msg = 'Not found') => html(res, 404, page('Not found', `<p>${esc(msg)}</p>`));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slugify = s => String(s || 'site').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'site';
const night = s => String(s || '').slice(0, 24);

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(String(pw), salt, 64).toString('hex');
}
function verifyPassword(pw, stored) {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const got = crypto.scryptSync(String(pw), salt, 64);
  const want = Buffer.from(hash, 'hex');
  return want.length === got.length && crypto.timingSafeEqual(want, got);
}
const encKey = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET || 'change-me-builder').digest();
function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', encKey, iv);
  const body = Buffer.concat([c.update(String(text), 'utf8'), c.final()]);
  return [iv.toString('base64'), c.getAuthTag().toString('base64'), body.toString('base64')].join('.');
}
function decrypt(text) {
  if (!text) return '';
  const [iv, tag, body] = String(text).split('.');
  if (!iv || !tag || !body) return '';
  try {
    const d = crypto.createDecipheriv('aes-256-gcm', encKey, Buffer.from(iv, 'base64'));
    d.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([d.update(Buffer.from(body, 'base64')), d.final()]).toString('utf8');
  } catch { return ''; }
}

/* ------------------------------------------------------------------ auth */
function cookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function userFrom(req) {
  const sid = cookies(req).sid;
  if (!sid) return null;
  const row = db.prepare(`SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token=? AND s.expires>? AND u.disabled=0`).get(sid, now());
  return row || null;
}
function makeSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_MS).toISOString();
  db.prepare('INSERT INTO sessions (token,user_id,expires) VALUES (?,?,?)').run(token, userId, expires);
  return { token, expires };
}
function cookieHeader(token, maxAge) {
  const bits = [`sid=${encodeURIComponent(token)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`];
  if (COOKIE_DOMAIN) bits.push(`Domain=${COOKIE_DOMAIN}`);
  if (COOKIE_SECURE) bits.push('Secure');
  return bits.join('; ');
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}
function requirePage(req, res) {
  const u = userFrom(req);
  if (!u) { redirect(res, '/login?next=' + encodeURIComponent(req.url || '/app')); return null; }
  return u;
}
function requireApi(req, res) {
  if (!sameOrigin(req)) { json(res, 403, { error: 'Cross-origin request rejected.' }); return null; }
  const u = userFrom(req);
  if (!u) { json(res, 401, { error: 'Sign in required.' }); return null; }
  return u;
}

/* ------------------------------------------------------------------ helpers */
function readBody(req, limit = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', c => { size += c.length; if (size > limit) { reject(new Error('Body too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
function parseForm(buf) {
  const out = {};
  new URLSearchParams(buf.toString('utf8')).forEach((v, k) => { out[k] = v; });
  return out;
}
function splitBuffer(buf, delim) {
  const out = []; let start = 0;
  while (true) {
    const i = buf.indexOf(delim, start);
    if (i < 0) break;
    out.push(buf.slice(start, i));
    start = i + delim.length;
  }
  out.push(buf.slice(start));
  return out;
}
function parseMultipart(buf, contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
  if (!m) throw new Error('Not multipart/form-data.');
  const boundary = '--' + (m[1] || m[2]).trim();
  const parts = splitBuffer(buf, boundary);
  const files = [];
  for (const part of parts) {
    const sep = part.indexOf('\r\n\r\n');
    if (sep < 0) continue;
    const head = part.slice(0, sep).toString('latin1');
    if (!/filename=/i.test(head)) continue;
    const fm = /filename="([^"]*)"/i.exec(head);
    const name = path.basename(fm ? fm[1] : 'upload.txt');
    let data = part.slice(sep + 4);
    if (data.slice(-2).toString() === '\r\n') data = data.slice(0, -2);
    files.push({ name, data });
  }
  return files;
}
function pdfText(buf, name) {
  const tmp = path.join(UPLOADS_DIR, 'tmp-' + crypto.randomBytes(8).toString('hex') + '.pdf');
  fs.writeFileSync(tmp, buf);
  try {
    return execFileSync('pdftotext', ['-layout', tmp, '-'], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  } catch {
    throw new Error(`Could not extract text from ${name}. Install poppler-utils or upload a text file.`);
  } finally { try { fs.unlinkSync(tmp); } catch {} }
}
function quotaUsed(userId) {
  const day = new Date().toISOString().slice(0, 10);
  return db.prepare("SELECT COUNT(*) AS n FROM sites WHERE owner_id=? AND substr(created_at,1,10)=? AND example=0").get(userId, day).n;
}
function uniqueSlug(base) {
  let s = slugify(base), i = 1;
  while (db.prepare('SELECT 1 FROM sites WHERE slug=?').get(s)) s = slugify(base) + '-' + (++i);
  return s;
}
function siteRow(id) { return db.prepare('SELECT * FROM sites WHERE id=?').get(id); }
function siteJsonPath(slug) { return path.join(SITES_DIR, slug, 'site.json'); }
function siteUrl(slug) { return '/s/' + encodeURIComponent(slug) + '/'; }
function siteAbsolute(req, slug) {
  const proto = (req.headers['x-forwarded-proto'] || 'http').split(',')[0];
  return proto + '://' + req.headers.host + siteUrl(slug);
}
function jobFor(siteId) { return db.prepare('SELECT * FROM jobs WHERE site_id=? ORDER BY id DESC LIMIT 1').get(siteId); }
function publicSite(s, req) {
  return {
    id: s.id, slug: s.slug, title: s.title, description: s.description,
    status: s.status, published: !!s.published, example: !!s.example,
    createdAt: s.created_at, updatedAt: s.updated_at, error: s.error,
    url: siteUrl(s.slug), absoluteUrl: siteAbsolute(req, s.slug),
    reusable: s.example ? false : fs.existsSync(siteJsonPath(s.slug)),
    owner: s.owner_id
  };
}

/* ------------------------------------------------------------------ seed */
function seed() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (!count) {
    const email = process.env.ADMIN_EMAIL;
    const pass = process.env.ADMIN_PASSWORD;
    if (!email || !pass) {
      console.error('No users yet. Set ADMIN_EMAIL and ADMIN_PASSWORD to create the admin.');
      process.exit(1);
    }
    db.prepare(`INSERT INTO users (email,name,pass,is_admin,daily_limit,created_at)
      VALUES (?,?,?,?,?,?)`).run(email.toLowerCase(), 'Administrator', hashPassword(pass), 1, ADMIN_DAILY_LIMIT, now());
    console.log('Created admin:', email);
  }
  const admin = db.prepare('SELECT * FROM users WHERE is_admin=1 ORDER BY id LIMIT 1').get()
    || db.prepare('SELECT * FROM users ORDER BY id LIMIT 1').get();
  if (admin && !db.prepare("SELECT 1 FROM sites WHERE slug='matekbazis-example'").get()) {
    db.prepare(`INSERT INTO sites (owner_id,slug,title,description,topic,audience,language,status,published,example,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(admin.id, 'matekbazis-example',
      'MatekBázis — BME VIK first-semester mathematics',
      'A complete, fully bilingual example built with the learning-book-site skill: 34 chapters, 266 exercises, generated banks, daily quests and an error notebook.',
      'BME VIK mathematics', 'first-year BSc', 'both', 'ready', 1, 1, now(), now());
    console.log('Seeded example site.');
  }
}
seed();

/* ------------------------------------------------------------------ LLM */
function llmConfig(user) {
  const base = (user.api_base || LLM_BASE_URL).replace(/\/+$/, '');
  const key = decrypt(user.api_key) || LLM_API_KEY;
  const model = user.api_model || LLM_MODEL;
  return { base, key, model };
}
function skillText() {
  try { return fs.readFileSync(SKILL_PATH, 'utf8'); } catch { return ''; }
}
function biv(v) {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const hu = String(v.hu == null ? '' : v.hu).trim();
    const en = String(v.en == null ? '' : v.en).trim();
    return { hu: hu || en, en: en || hu };
  }
  const s = String(v == null ? '' : v).trim();
  return { hu: s, en: s };
}
function bivArr(v) {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const hu = (Array.isArray(v.hu) ? v.hu : [v.hu]).filter(Boolean).map(String);
    const en = (Array.isArray(v.en) ? v.en : [v.en]).filter(Boolean).map(String);
    return { hu: hu.length ? hu : en, en: en.length ? en : hu };
  }
  const a = (Array.isArray(v) ? v : [v]).filter(Boolean).map(String);
  return { hu: a, en: a };
}
function normalizeSite(raw, req) {
  if (!raw || typeof raw !== 'object') throw new Error('The model did not return a JSON object.');
  const title = String(raw.title || req.title || req.topic || 'Learning site').slice(0, 160);
  const sections = Array.isArray(raw.sections) ? raw.sections.slice(0, 12) : [];
  if (!sections.length) throw new Error('The generated site has no sections.');
  const out = { version: 1, title, subtitle: biv(raw.subtitle || req.description || ''), summary: biv(raw.summary || req.description || ''), sections: [] };
  let chapters = 0;
  for (const s of sections) {
    const sec = {
      id: slugify(s.id || s.title || 'section'), num: String(s.num || out.sections.length + 1).padStart(2, '0'),
      title: biv(s.title || 'Section'), subtitle: biv(s.subtitle || ''), intro: biv(s.intro || ''),
      chapters: []
    };
    for (const c of (Array.isArray(s.chapters) ? s.chapters : []).slice(0, 10)) {
      if (chapters >= 40) break;
      chapters++;
      const ch = {
        id: slugify(c.id || c.title || 'chapter'), num: String(c.num || (out.sections.length + 1) + '.' + (sec.chapters.length + 1)),
        title: biv(c.title || 'Chapter'), lead: biv(c.lead || ''), why: bivArr(c.why), when: biv(c.when || ''),
        minutes: Math.max(5, Math.min(90, Number(c.minutes) || 25)),
        theory: [], examples: [], mistakes: bivArr(c.mistakes), exercises: []
      };
      for (const t of (Array.isArray(c.theory) ? c.theory : []).slice(0, 12)) {
        const type = ['def', 'thm', 'note', 'warn', 'formula', 'p', 'list'].includes(t.type) ? t.type : 'p';
        const block = { type };
        if (type === 'formula') { block.title = biv(t.title || 'Formula'); block.latex = String(t.latex || ''); block.note = biv(t.note || ''); }
        else if (type === 'list') { block.title = biv(t.title || ''); block.items = bivArr(t.items); }
        else if (type === 'p') { block.body = biv(t.body || ''); }
        else { block.title = biv(t.title || ''); block.body = biv(t.body || ''); }
        ch.theory.push(block);
      }
      for (const e of (Array.isArray(c.examples) ? c.examples : []).slice(0, 4)) {
        ch.examples.push({ title: biv(e.title || 'Example'), problem: biv(e.problem || ''), steps: bivArr(e.steps), answer: biv(e.answer || '') });
      }
      for (const q of (Array.isArray(c.exercises) ? c.exercises : []).slice(0, 8)) {
        const type = ['number', 'expr', 'text', 'choice', 'proof'].includes(q.type) ? q.type : 'expr';
        const item = { q: biv(q.q || ''), a: String(q.a == null ? '' : q.a), type, hint: biv(q.hint || ''), sol: biv(q.sol || '') };
        if (type === 'choice') {
          const choices = bivArr(q.choices);
          item.choices = choices;
          if (!Array.isArray(item.choices.hu) || item.choices.hu.length < 2) throw new Error('A choice exercise needs at least two choices.');
          if (item.a === '' && q.a == null) item.a = '0';
        }
        ch.exercises.push(item);
      }
      sec.chapters.push(ch);
    }
    if (sec.chapters.length) out.sections.push(sec);
  }
  if (!out.sections.length) throw new Error('The generated site has no chapters.');
  return out;
}
function mockSite(req) {
  const q = { hu: 'What is $2+2$?', en: 'What is $2+2$?' };
  return {
    title: req.title || 'Sample learning book', subtitle: { hu: 'A generated example', en: 'A generated example' },
    summary: { hu: req.description || 'Built from the request.', en: req.description || 'Built from the request.' },
    sections: [{
      id: 'basics', num: '01', title: { hu: 'Alapok', en: 'Foundations' },
      subtitle: { hu: 'Kezdet', en: 'Getting started' }, intro: { hu: req.topic || 'Bevezetés', en: req.topic || 'Introduction' },
      chapters: [{
        id: 'first', num: '1.1', title: { hu: 'Első fejezet', en: 'First chapter' },
        lead: { hu: req.long_text || 'Rövid bevezetés.', en: req.long_text || 'A short introduction.' },
        why: { hu: ['Mert minden erre épül.'], en: ['Because everything builds on it.'] },
        when: { hu: 'Az elején.', en: 'At the beginning.' }, minutes: 20,
        theory: [{ type: 'def', title: { hu: 'Definíció', en: 'Definition' }, body: { hu: 'Egy egyszerű példa.', en: 'A simple example.' } }],
        examples: [{ title: { hu: 'Példa', en: 'Example' }, problem: { hu: '$2+2=?$', en: '$2+2=?$' }, steps: { hu: ['Összeadunk.'], en: ['Add them.'] }, answer: { hu: '$4$', en: '$4$' } }],
        mistakes: { hu: ['Nem kell tippelni.'], en: ['Do not guess.'] },
        exercises: [{ q, a: '4', type: 'number', hint: { hu: 'Két pár.', en: 'Two pairs.' }, sol: { hu: '$4$', en: '$4$' } }]
      }]
    }]
  };
}
async function callLLM(cfg, messages) {
  if (LLM_MOCK) return JSON.stringify(mockSite(messages.request || {}));
  const payload = { model: cfg.model, messages, temperature: 0.35, max_tokens: 12000 };
  if (process.env.LLM_JSON_MODE !== '0') payload.response_format = { type: 'json_object' };
  const doFetch = async body => {
    const r = await fetch(cfg.base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(300000)
    });
    const text = await r.text();
    if (!r.ok) {
      const e = new Error('LLM API ' + r.status + ': ' + text.slice(0, 500));
      e.status = r.status; throw e;
    }
    const j = JSON.parse(text);
    return j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content || '';
  };
  try { return await doFetch(payload); }
  catch (e) { if (payload.response_format && (e.status === 400 || e.status === 422)) { delete payload.response_format; return doFetch(payload); } throw e; }
}
function extractJSON(text) {
  let s = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  return JSON.parse(s);
}

/* ------------------------------------------------------------------ worker */
let working = false;
async function processJobs() {
  if (working) return;
  working = true;
  try {
    const job = db.prepare("SELECT * FROM jobs WHERE status='queued' ORDER BY id LIMIT 1").get();
    if (!job) return;
    const site = siteRow(job.site_id);
    if (!site || site.status === 'ready') {
      db.prepare("UPDATE jobs SET status='failed',log='Site missing or already ready',updated_at=? WHERE id=?").run(now(), job.id);
      return;
    }
    db.prepare("UPDATE jobs SET status='running',log='Contacting the model…',updated_at=? WHERE id=?").run(now(), job.id);
    db.prepare("UPDATE sites SET status='running',updated_at=? WHERE id=?").run(now(), site.id);
    const user = db.prepare('SELECT * FROM users WHERE id=?').get(site.owner_id);
    const cfg = llmConfig(user);
    if (!LLM_MOCK && !cfg.key) throw new Error('No API key. Add one in Settings or ask the admin to configure the server.');
    const req = { title: site.title, description: site.description, topic: site.topic, audience: site.audience, language: site.language, long_text: site.source_text };
    const skill = skillText().slice(0, 60000);
    const schema = `Return ONE JSON object, no markdown, with this exact shape:
{"title":"...","subtitle":{"hu":"...","en":"..."},"summary":{"hu":"...","en":"..."},"sections":[{"id":"slug","num":"01","title":{"hu":"...","en":"..."},"subtitle":{"hu":"...","en":"..."},"intro":{"hu":"...","en":"..."},"chapters":[{"id":"slug","num":"1.1","title":{"hu":"...","en":"..."},"lead":{"hu":"...","en":"..."},"why":{"hu":["..."],"en":["..."]},"when":{"hu":"...","en":"..."},"minutes":25,"theory":[{"type":"def|thm|note|warn|formula|p|list","title":{"hu":"...","en":"..."},"body":{"hu":"...","en":"..."},"latex":"...","note":{"hu":"...","en":"..."},"items":{"hu":["..."],"en":["..."]}}],"examples":[{"title":{"hu":"...","en":"..."},"problem":{"hu":"...","en":"..."},"steps":{"hu":["..."],"en":["..."]},"answer":{"hu":"...","en":"..."}}],"mistakes":{"hu":["..."],"en":["..."]},"exercises":[{"q":{"hu":"...","en":"..."},"a":"answer","type":"number|expr|text|choice|proof","hint":{"hu":"...","en":"..."},"sol":{"hu":"...","en":"..."},"choices":{"hu":["..."],"en":["..."]}}]}]}]}
Rules: every prose field is a {hu,en} object; math stays inside $...$; 1-8 sections; 1-30 chapters total; 3-6 exercises and 1-3 examples per chapter; exercises must be checkable or proof; no links, no HTML, no download buttons.`;
    const messages = [
      { role: 'system', content: 'You are a careful curriculum writer and the site generator for a learning-book platform. Follow the supplied skill, teach from the supplied sources, and return only valid JSON.' },
      { role: 'user', content: `SKILL:\n${skill}\n\nREQUEST:\nTitle: ${req.title}\nDescription: ${req.description}\nTopic: ${req.topic}\nAudience: ${req.audience}\nLanguage preference: ${req.language}\n\nSOURCE MATERIAL:\n${req.long_text || '(none)'}\n\n${schema}` }
    ];
    messages.request = req;
    const raw = await callLLM(cfg, messages);
    const parsed = normalizeSite(extractJSON(raw), req);
    await fsp.mkdir(path.dirname(siteJsonPath(site.slug)), { recursive: true });
    await fsp.writeFile(siteJsonPath(site.slug), JSON.stringify(parsed, null, 2));
    db.prepare("UPDATE sites SET status='ready',error='',updated_at=? WHERE id=?").run(now(), site.id);
    db.prepare("UPDATE jobs SET status='done',log=?,updated_at=? WHERE id=?").run('Generated and routed at ' + siteUrl(site.slug), now(), job.id);
  } catch (e) {
    try {
      const job = db.prepare("SELECT * FROM jobs WHERE status='running' ORDER BY id DESC LIMIT 1").get();
      if (job) {
        db.prepare("UPDATE sites SET status='failed',error=?,updated_at=? WHERE id=?").run(String(e.message || e).slice(0, 2000), now(), job.site_id);
        db.prepare("UPDATE jobs SET status='failed',log=?,updated_at=? WHERE id=?").run(String(e.stack || e).slice(0, 4000), now(), job.id);
      }
    } catch {}
    console.error('Job failed:', e);
  } finally { working = false; }
}
setInterval(processJobs, 2500);

/* ------------------------------------------------------------------ pages */
function shell(title, body, extra = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>
:root{--ink:#18222e;--muted:#64748b;--line:#dbe2ea;--paper:#fbfaf6;--navy:#052a4b;--gold:#b8912f;--ok:#16794b;--bad:#b42318}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 Georgia,serif}
a{color:var(--navy)}header{background:var(--navy);color:#fff;padding:16px 22px;display:flex;gap:14px;align-items:center;justify-content:space-between}
header b{font:600 18px/1.2 system-ui,sans-serif;letter-spacing:.04em}header nav{display:flex;gap:14px;flex-wrap:wrap;font:13px system-ui,sans-serif}
header nav a{color:#dce8f5;text-decoration:none}header nav a:hover{color:#fff}.wrap{max-width:1120px;margin:0 auto;padding:22px}
.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:18px;margin:0 0 16px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
h1{font:600 28px/1.2 system-ui,sans-serif;color:var(--navy);margin:0 0 8px}h2{font:600 18px/1.2 system-ui,sans-serif;color:var(--navy);margin:0 0 10px}
.muted{color:var(--muted)}.btn{display:inline-block;border:1px solid var(--navy);background:#fff;color:var(--navy);padding:8px 12px;border-radius:8px;font:600 13px system-ui,sans-serif;text-decoration:none;cursor:pointer}
.btn.primary{background:var(--navy);color:#fff}.btn.gold{background:var(--gold);border-color:var(--gold);color:#fff}.btn.sm{padding:5px 8px;font-size:12px}.btn.danger{border-color:var(--bad);color:var(--bad)}
input,textarea,select{width:100%;padding:9px 10px;border:1px solid var(--line);border-radius:8px;font:14px system-ui,sans-serif;background:#fff;color:var(--ink)}
textarea{min-height:120px;resize:vertical}label{display:block;font:600 12px system-ui,sans-serif;color:var(--muted);margin:10px 0 4px;text-transform:uppercase;letter-spacing:.04em}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.pill{display:inline-block;background:#eef3f8;color:var(--navy);border-radius:99px;padding:2px 8px;font:12px system-ui,sans-serif}
table{width:100%;border-collapse:collapse;font:14px system-ui,sans-serif}th,td{text-align:left;padding:8px;border-bottom:1px solid var(--line)}th{color:var(--muted);font-weight:600}
.notice{border-left:3px solid var(--gold);background:#fdf8ec;padding:10px 12px;border-radius:0 8px 8px 0;font-size:14px}.err{border-left-color:var(--bad);background:#fdf1f0}
code{background:#eef3f8;padding:1px 4px;border-radius:4px;font-size:.9em}@media(max-width:640px){.wrap{padding:14px}h1{font-size:23px}}
</style>${extra}</head><body><header><b>Learning Book Builder</b><nav><a href="/app">Sites</a><a href="/app#new">New site</a><a href="/app#catalog">Catalog</a><a href="/app#settings">Settings</a><a href="/logout">Sign out</a></nav></header><main class="wrap">${body}</main></body></html>`;
}
function page(title, body, extra = '') { return shell(title, body, extra); }
function loginPage(next) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in · Learning Book Builder</title><style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#052a4b;font:15px system-ui,sans-serif;color:#18222e}
.box{width:min(420px,92vw);background:#fbfaf6;padding:26px;border-radius:14px;box-shadow:0 18px 60px #0005}
h1{font:600 24px/1.2 Georgia,serif;margin:0 0 6px;color:#052a4b}p{color:#64748b;margin:0 0 16px}
label{display:block;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin:12px 0 4px}
input{width:100%;padding:10px;border:1px solid #dbe2ea;border-radius:8px;font:15px system-ui,sans-serif;box-sizing:border-box}
button{width:100%;margin-top:16px;padding:11px;border:0;border-radius:8px;background:#b8912f;color:#fff;font:600 15px system-ui,sans-serif;cursor:pointer}
.err{background:#fdf1f0;border-left:3px solid #b42318;padding:8px 10px;margin:12px 0;font-size:13px}
small{display:block;margin-top:14px;color:#94a3b8;font-size:12px;line-height:1.4}
</style></head><body><form class="box" method="post" action="/login">
<h1>Learning Book Builder</h1><p>Users only. Sign in with the account the administrator created for you.</p>
${next ? `<input type="hidden" name="next" value="${esc(next)}">` : ''}
<label for="email">Email</label><input id="email" name="email" type="email" required autocomplete="username">
<label for="password">Password</label><input id="password" name="password" type="password" required autocomplete="current-password">
<button type="submit">Sign in</button>
<small>No public sign-up. Ask the administrator for an account.</small>
</form></body></html>`;
}

/* ------------------------------------------------------------------ API */
async function handleApi(req, res, url) {
  const p = url.pathname;
  if (p === '/api/health') return json(res, 200, { ok: true });

  /* login is handled outside; everything here needs a user */
  const user = requireApi(req, res);
  if (!user) return;

  if (p === '/api/me' && req.method === 'GET') {
    const used = quotaUsed(user.id);
    return json(res, 200, { user: publicUser(user), usedToday: used, remaining: Math.max(0, user.daily_limit - used), siteDomain: SITE_DOMAIN });
  }
  if (p === '/api/settings' && req.method === 'GET') {
    return json(res, 200, { apiBase: user.api_base || '', apiModel: user.api_model || '', hasKey: !!user.api_key, serverKey: !!LLM_API_KEY });
  }
  if (p === '/api/settings' && req.method === 'PUT') {
    const b = JSON.parse((await readBody(req)).toString('utf8') || '{}');
    const apiBase = String(b.apiBase || '').trim().slice(0, 300);
    const apiModel = String(b.apiModel || '').trim().slice(0, 120);
    let apiKey = user.api_key;
    if (b.clearKey) apiKey = '';
    else if (typeof b.apiKey === 'string' && b.apiKey.trim()) apiKey = encrypt(b.apiKey.trim());
    db.prepare('UPDATE users SET api_base=?,api_model=?,api_key=? WHERE id=?').run(apiBase, apiModel, apiKey, user.id);
    return json(res, 200, { ok: true, hasKey: !!apiKey });
  }

  if (p === '/api/sites' && req.method === 'GET') {
    const rows = db.prepare('SELECT * FROM sites WHERE owner_id=? OR example=1 ORDER BY created_at DESC').all(user.id);
    return json(res, 200, { sites: rows.map(s => publicSite(s, req)) });
  }
  if (p === '/api/sites' && req.method === 'POST') {
    const b = JSON.parse((await readBody(req, 200 * 1024)).toString('utf8') || '{}');
    const used = quotaUsed(user.id);
    if (used >= user.daily_limit) return json(res, 429, { error: `Daily limit reached (${user.daily_limit} sites/day).` });
    const topic = String(b.topic || '').trim().slice(0, 300);
    const longText = String(b.longText || '').trim().slice(0, MAX_SOURCE);
    const ids = Array.isArray(b.uploadIds) ? b.uploadIds.map(Number).filter(Boolean).slice(0, MAX_FILES) : [];
    let source = longText;
    for (const id of ids) {
      const up = db.prepare('SELECT * FROM uploads WHERE id=? AND user_id=?').get(id, user.id);
      if (up) source += '\n\n--- ' + up.name + ' ---\n' + up.extracted;
    }
    if (!topic && !source.trim()) return json(res, 400, { error: 'Add a topic, long text, or at least one file.' });
    const title = String(b.title || topic || 'Untitled learning book').trim().slice(0, 160);
    const cfg = llmConfig(user);
    if (!LLM_MOCK && !cfg.key) return json(res, 400, { error: 'No API key. Add your key in Settings, or ask the admin to configure LLM_API_KEY.' });
    if (!b.force) {
      const needle = '%' + (topic || title || '').slice(0, 60).replace(/[%_]/g, '') + '%';
      const near = db.prepare(`SELECT * FROM sites WHERE status='ready' AND published=1
        AND (title LIKE ? OR topic LIKE ? OR description LIKE ?) ORDER BY created_at DESC LIMIT 5`).all(needle, needle, needle);
      if (near.length) return json(res, 200, { suggestions: near.map(x => publicSite(x, req)) });
    }
    const slug = uniqueSlug(title);
    const t = now();
    const r = db.prepare(`INSERT INTO sites (owner_id,slug,title,description,topic,audience,language,status,published,source_text,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(user.id, slug, title, String(b.description || '').slice(0, 600), topic,
      String(b.audience || '').slice(0, 160), ['hu', 'en', 'both'].includes(b.language) ? b.language : 'both', 'queued',
      b.published === false ? 0 : 1, source.slice(0, MAX_SOURCE), t, t);
    const id = Number(r.lastInsertRowid);
    db.prepare('INSERT INTO jobs (site_id,status,log,created_at,updated_at) VALUES (?,?,?,?,?)').run(id, 'queued', 'Queued.', t, t);
    setTimeout(processJobs, 50);
    return json(res, 201, { site: publicSite(siteRow(id), req) });
  }
  let m = /^\/api\/sites\/(\d+)$/.exec(p);
  if (m && req.method === 'GET') {
    const s = siteRow(Number(m[1]));
    if (!s || (s.owner_id !== user.id && !user.is_admin && !s.published)) return json(res, 404, { error: 'Not found.' });
    const j = jobFor(s.id);
    return json(res, 200, { site: publicSite(s, req), job: j ? { status: j.status, log: j.log, updatedAt: j.updated_at } : null });
  }
  m = /^\/api\/sites\/(\d+)\/clone$/.exec(p);
  if (m && req.method === 'POST') {
    const s = siteRow(Number(m[1]));
    if (!s || s.status !== 'ready' || (!s.published && s.owner_id !== user.id && !user.is_admin)) return json(res, 404, { error: 'Site not available.' });
    if (!fs.existsSync(siteJsonPath(s.slug))) return json(res, 409, { error: 'This site has no generated content to reuse.' });
    const used = quotaUsed(user.id);
    if (used >= user.daily_limit) return json(res, 429, { error: `Daily limit reached (${user.daily_limit} sites/day).` });
    const slug = uniqueSlug((s.title + ' copy').slice(0, 80));
    const t = now();
    const r = db.prepare(`INSERT INTO sites (owner_id,slug,title,description,topic,audience,language,status,published,source_text,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(user.id, slug, 'Copy of ' + s.title, s.description, s.topic, s.audience, s.language, 'ready',
      s.published, s.source_text, t, t);
    const id = Number(r.lastInsertRowid);
    await fsp.mkdir(path.dirname(siteJsonPath(slug)), { recursive: true });
    await fsp.copyFile(siteJsonPath(s.slug), siteJsonPath(slug));
    db.prepare('INSERT INTO jobs (site_id,status,log,created_at,updated_at) VALUES (?,?,?,?,?)').run(id, 'done', 'Cloned from ' + s.slug, t, t);
    return json(res, 201, { site: publicSite(siteRow(id), req) });
  }
  if (p === '/api/catalog' && req.method === 'GET') {
    const q = String(url.searchParams.get('q') || '').trim().slice(0, 120);
    const like = '%' + q.replace(/[%_]/g, '') + '%';
    const rows = q
      ? db.prepare(`SELECT * FROM sites WHERE status='ready' AND (published=1 OR owner_id=?) AND (title LIKE ? OR description LIKE ? OR topic LIKE ? OR source_text LIKE ?) ORDER BY created_at DESC LIMIT 30`).all(user.id, like, like, like, like)
      : db.prepare(`SELECT * FROM sites WHERE status='ready' AND (published=1 OR owner_id=?) ORDER BY created_at DESC LIMIT 30`).all(user.id);
    return json(res, 200, { sites: rows.map(s => publicSite(s, req)) });
  }

  /* admin */
  if (p.startsWith('/api/admin/') && !user.is_admin) return json(res, 403, { error: 'Admin only.' });
  if (p === '/api/admin/users' && req.method === 'GET') {
    const rows = db.prepare('SELECT * FROM users ORDER BY created_at').all();
    return json(res, 200, { users: rows.map(u => ({ ...publicUser(u), disabled: !!u.disabled, usedToday: quotaUsed(u.id) })) });
  }
  if (p === '/api/admin/users' && req.method === 'POST') {
    const b = JSON.parse((await readBody(req)).toString('utf8') || '{}');
    const email = String(b.email || '').trim().toLowerCase();
    const name = String(b.name || '').trim().slice(0, 80) || email.split('@')[0];
    const pass = String(b.password || '');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(res, 400, { error: 'Valid email required.' });
    if (pass.length < 8) return json(res, 400, { error: 'Password must be at least 8 characters.' });
    if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email)) return json(res, 409, { error: 'Email already exists.' });
    const limit = Math.max(0, Math.min(1000, Number(b.dailyLimit) || DEFAULT_DAILY_LIMIT));
    db.prepare('INSERT INTO users (email,name,pass,daily_limit,created_at) VALUES (?,?,?,?,?)').run(email, name, hashPassword(pass), limit, now());
    return json(res, 201, { ok: true });
  }
  m = /^\/api\/admin\/users\/(\d+)$/.exec(p);
  if (m && req.method === 'PATCH') {
    const id = Number(m[1]);
    const u = db.prepare('SELECT * FROM users WHERE id=?').get(id);
    if (!u) return json(res, 404, { error: 'User not found.' });
    const b = JSON.parse((await readBody(req)).toString('utf8') || '{}');
    if (b.dailyLimit != null) db.prepare('UPDATE users SET daily_limit=? WHERE id=?').run(Math.max(0, Math.min(1000, Number(b.dailyLimit) || 0)), id);
    if (typeof b.password === 'string' && b.password.length >= 8) db.prepare('UPDATE users SET pass=? WHERE id=?').run(hashPassword(b.password), id);
    if (b.disabled != null) db.prepare('UPDATE users SET disabled=? WHERE id=?').run(b.disabled ? 1 : 0, id);
    return json(res, 200, { ok: true });
  }

  /* uploads */
  if (p === '/api/uploads' && req.method === 'POST') {
    const body = await readBody(req, MAX_UPLOAD * MAX_FILES + 1024 * 1024);
    let files;
    try { files = parseMultipart(body, req.headers['content-type']); } catch (e) { return json(res, 400, { error: e.message }); }
    if (!files.length) return json(res, 400, { error: 'No files received.' });
    if (files.length > MAX_FILES) return json(res, 400, { error: `At most ${MAX_FILES} files.` });
    const saved = [];
    for (const f of files) {
      if (f.data.length > MAX_UPLOAD) return json(res, 413, { error: f.name + ' is larger than 8 MB.' });
      const ext = path.extname(f.name).toLowerCase();
      let text = '';
      if (ext === '.pdf') text = pdfText(f.data, f.name);
      else if (['.txt', '.md', '.markdown', '.csv', '.json', '.tex', '.js', '.html', '.css'].includes(ext)) text = f.data.toString('utf8');
      else return json(res, 415, { error: 'Unsupported file type: ' + ext + '. Use PDF, TXT, MD, CSV, JSON, TEX, JS, HTML or CSS.' });
      text = text.slice(0, 150000);
      const safe = slugify(path.basename(f.name, ext)) + ext;
      const stored = crypto.randomBytes(8).toString('hex') + '-' + safe;
      fs.writeFileSync(path.join(UPLOADS_DIR, stored), f.data);
      const r = db.prepare('INSERT INTO uploads (user_id,name,path,chars,extracted,created_at) VALUES (?,?,?,?,?,?)').run(user.id, f.name, stored, text.length, text, now());
      saved.push({ id: Number(r.lastInsertRowid), name: f.name, chars: text.length });
    }
    return json(res, 200, { uploads: saved });
  }

  return json(res, 404, { error: 'Unknown API route.' });
}

/* ------------------------------------------------------------------ site serving */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject', '.pdf': 'application/pdf', '.map': 'application/json'
};
function within(root, target) {
  const r = path.resolve(root), t = path.resolve(target);
  return t === r || t.startsWith(r + path.sep);
}
async function serveFile(res, file, opts = {}) {
  try {
    const st = await fsp.stat(file);
    if (!st.isFile()) return notFound(res);
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': st.size,
      'Cache-Control': opts.cache || 'private, max-age=300',
      'X-Content-Type-Options': 'nosniff',
      ...(opts.headers || {})
    });
    fs.createReadStream(file).pipe(res);
  } catch { notFound(res); }
}
function loginRedirect(req, res) {
  return redirect(res, '/login?next=' + encodeURIComponent(req.url || '/app'));
}
async function serveGeneratedSite(req, res, slug, sub) {
  const user = userFrom(req);
  if (!user) return loginRedirect(req, res);
  const site = db.prepare('SELECT * FROM sites WHERE slug=?').get(slug);
  if (!site || site.status !== 'ready') return notFound(res, 'This site is not ready.');
  if (!site.published && site.owner_id !== user.id && !user.is_admin) return notFound(res, 'This site is private.');
  const clean = (sub || '').replace(/^\/+/, '');
  if (!clean) return serveFile(res, path.join(TEMPLATE_DIR, 'index.html'), { headers: { 'Cache-Control': 'no-store' } });
  if (clean === 'site.json') return serveFile(res, siteJsonPath(slug), { headers: { 'Cache-Control': 'no-store' } });
  if (['app.js', 'styles.css'].includes(clean)) return serveFile(res, path.join(TEMPLATE_DIR, clean));
  return notFound(res);
}
async function serveExample(req, res, sub) {
  const user = userFrom(req);
  if (!user) return loginRedirect(req, res);
  const clean = (sub || '').replace(/^\/+/, '');
  const target = path.join(EXAMPLE_DIR, clean || 'index.html');
  if (!within(EXAMPLE_DIR, target)) return notFound(res);
  return serveFile(res, target, { cache: 'private, max-age=60' });
}
async function serveShared(req, res, sub) {
  if (!userFrom(req)) return json(res, 401, { error: 'Sign in required.' });
  const clean = (sub || '').replace(/^\/+/, '');
  const target = path.join(ROOT, 'shared', clean);
  if (!within(path.join(ROOT, 'shared'), target)) return notFound(res);
  return serveFile(res, target, { cache: 'private, max-age=86400' });
}

/* ------------------------------------------------------------------ routes */
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
    const p = url.pathname;
    const host = String(req.headers.host || '').split(':')[0].toLowerCase();
    const siteDomain = SITE_DOMAIN.toLowerCase();

    /* subdomain routing: <slug>.sites.example.com */
    if (host.endsWith('.' + siteDomain) && host !== siteDomain) {
      const slug = host.slice(0, -(siteDomain.length + 1));
      if (slug) {
        if (p.startsWith('/shared/')) return await serveShared(req, res, p.slice('/shared/'.length));
        return await serveGeneratedSite(req, res, slug, p);
      }
    }

    if (p === '/healthz') return json(res, 200, { ok: true });
    if (p === '/login' && req.method === 'GET') return html(res, 200, loginPage(String(url.searchParams.get('next') || '/app')));
    if (p === '/login' && req.method === 'POST') {
      const body = parseForm(await readBody(req, 64 * 1024));
      const u = db.prepare('SELECT * FROM users WHERE email=? AND disabled=0').get(String(body.email || '').toLowerCase());
      if (!u || !verifyPassword(body.password, u.pass)) return html(res, 401, loginPage(String(body.next || '/app')).replace('</form>', '<div class="err">Wrong email or password.</div></form>'));
      const s = makeSession(u.id);
      const next = String(body.next || '/app');
      return redirect(res, next.startsWith('/') ? next : '/app', { 'Set-Cookie': cookieHeader(s.token, Math.floor(SESSION_MS / 1000)) });
    }
    if (p === '/logout') {
      const sid = cookies(req).sid;
      if (sid) db.prepare('DELETE FROM sessions WHERE token=?').run(sid);
      return redirect(res, '/login', { 'Set-Cookie': cookieHeader('', 0) });
    }
    if (p.startsWith('/api/')) return await handleApi(req, res, url);

    if (p === '/') {
      const u = userFrom(req);
      return redirect(res, u ? '/app' : '/login');
    }
    if (p === '/app' || p === '/app/') {
      const u = requirePage(req, res); if (!u) return;
      const body = await fsp.readFile(path.join(PUBLIC_DIR, 'app.html'), 'utf8');
      const inject = `<script>window.__USER__=${JSON.stringify(publicUser(u)).replace(/</g, '\\u003c')};window.__CONFIG__=${JSON.stringify({ siteDomain: SITE_DOMAIN, baseDomain: BASE_DOMAIN }).replace(/</g, '\\u003c')};</script>`;
      return html(res, 200, body.replace('<!--BOOT-->', inject));
    }
    if (p === '/app.css') return serveFile(res, path.join(PUBLIC_DIR, 'app.css'));
    if (p === '/app.js') return serveFile(res, path.join(PUBLIC_DIR, 'app.js'));
    if (p.startsWith('/shared/')) return await serveShared(req, res, p.slice('/shared/'.length));
    if (p === '/example/matekbazis' || p.startsWith('/example/matekbazis/')) {
      return await serveExample(req, res, p.replace(/^\/example\/matekbazis\/?/, ''));
    }
    let m = /^\/s\/([^/]+)\/?$/.exec(p);
    if (m && !p.endsWith('/')) return redirect(res, '/s/' + encodeURIComponent(m[1]) + '/');
    m = /^\/s\/([^/]+)\/(.*)$/.exec(p);
    if (m) return await serveGeneratedSite(req, res, decodeURIComponent(m[1]), m[2]);

    notFound(res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) json(res, 500, { error: 'Server error.' });
    else res.end();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Learning Book Builder on :${PORT} (base ${BASE_DOMAIN}, sites ${SITE_DOMAIN})`);
  if (!LLM_MOCK && !LLM_API_KEY) console.log('No global LLM_API_KEY; users must add their own key.');
});
