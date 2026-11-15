import express from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth.js';
import {
  MAX_SOURCE, MAX_LONG_TEXT, MAX_UPLOAD, MAX_FILES, MAX_CONCURRENT_UPLOADS,
  UPLOADS_DIR, DEFAULT_DAILY_LIMIT, LLM_MOCK,
} from '../config.js';
import {
  sqlite, quotaUsed, uniqueSlug, siteRow, siteJsonPath, publicSite, now, slugify, ensureProfile,
} from '../db/index.js';
import { kick, llmConfig, useMock } from '../services/generation.js';
import { extractUpload } from '../services/uploads.js';
import { encrypt } from '../crypto.js';
import { requireAuthApi, requireAdminApi, tokenFrom, clearSessionCache } from '../middleware/session.js';
import { rateLimit } from '../middleware/rate-limit.js';

const router = express.Router();
router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

function fail(res, status, code, message) {
  return res.status(status).json({ error: code, message: message || code });
}
function badRequest(res, err) {
  const detail = err?.issues?.slice(0, 4).map(i => i.path.join('.') + ': ' + i.message).join('; ');
  return fail(res, 400, 'invalid_input', detail || 'Invalid input.');
}
function parseId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 0;
}
function escapeLike(value) {
  return String(value || '').replace(/[\\%_]/g, '');
}
function settingsOf(profile) {
  return {
    apiBase: profile.api_base || '',
    apiModel: profile.api_model || '',
    hasKey: !!profile.api_key,
  };
}
function userJson(row, profile) {
  const p = profile || ensureProfile(row.id);
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.createdAt,
    dailyLimit: p.daily_limit,
    disabled: !!p.disabled,
    usedToday: quotaUsed(row.id),
  };
}

/* ------------------------------------------------------------------ session */

router.get('/me', requireAuthApi, (req, res) => {
  const usedToday = quotaUsed(req.user.id);
  res.json({
    user: { id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role },
    admin: req.user.role === 'admin',
    mock: LLM_MOCK,
    profile: {
      dailyLimit: req.profile.daily_limit,
      usedToday,
      remaining: Math.max(0, req.profile.daily_limit - usedToday),
      ...settingsOf(req.profile),
    },
  });
});

router.post('/logout', async (req, res) => {
  try {
    const response = await auth.api.signOut({ headers: fromNodeHeaders(req.headers), asResponse: true });
    const cookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
    if (cookies.length) res.setHeader('Set-Cookie', cookies);
  } catch (e) {
    console.error('Sign-out error:', e.message);
  }
  clearSessionCache(tokenFrom(req));
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ sites */

const CreateSchema = z.object({
  title: z.string().trim().max(160).default(''),
  topic: z.string().trim().max(300).default(''),
  description: z.string().trim().max(600).default(''),
  audience: z.string().trim().max(160).default(''),
  language: z.enum(['hu', 'en', 'both']).default('both'),
  longText: z.string().max(MAX_LONG_TEXT).default(''),
  published: z.boolean().default(true),
  force: z.boolean().default(false),
  uploadIds: z.array(z.number().int().positive()).max(MAX_FILES).default([]),
});

router.get('/sites', requireAuthApi, (req, res) => {
  const sites = sqlite
    .prepare('SELECT * FROM sites WHERE (owner_id=? OR example=1) AND archived=0 ORDER BY created_at DESC')
    .all(req.user.id)
    .map(publicSite);
  res.json({ sites });
});

router.post('/sites', requireAuthApi, rateLimit({ windowMs: 60 * 1000, max: 8, key: req => req.user.id }), (req, res) => {
  const parsed = CreateSchema.safeParse(req.body || {});
  if (!parsed.success) return badRequest(res, parsed.error);
  const body = parsed.data;
  const used = quotaUsed(req.user.id);
  if (used >= req.profile.daily_limit) {
    return fail(res, 429, 'quota_exceeded', 'Daily limit reached (' + req.profile.daily_limit + ' sites/day).');
  }

  let uploads = [];
  if (body.uploadIds.length) {
    const placeholders = body.uploadIds.map(() => '?').join(',');
    uploads = sqlite
      .prepare(`SELECT id,name,extracted FROM uploads WHERE user_id=? AND id IN (${placeholders})`)
      .all(req.user.id, ...body.uploadIds);
    if (uploads.length !== body.uploadIds.length) {
      return fail(res, 400, 'invalid_upload', 'One or more uploaded files are missing or expired.');
    }
  }

  let source = body.longText;
  for (const up of uploads) source += '\n\n--- ' + up.name + ' ---\n' + up.extracted;
  source = source.slice(0, MAX_SOURCE);

  if (!body.topic && !source.trim()) {
    return fail(res, 400, 'missing_source', 'Add a topic, long text, or at least one file.');
  }

  const cfg = llmConfig(req.profile);
  if (!useMock() && !cfg.key) {
    return fail(res, 400, 'no_api_key', 'No API key. Add one in Settings.');
  }

  if (!body.force) {
    const needle = '%' + escapeLike(body.topic || body.title).slice(0, 60) + '%';
    if (needle.length > 2) {
      const suggestions = sqlite
        .prepare("SELECT * FROM sites WHERE status='ready' AND archived=0 AND published=1 AND (title LIKE ? OR topic LIKE ? OR description LIKE ?) ORDER BY created_at DESC LIMIT 5")
        .all(needle, needle, needle)
        .map(publicSite);
      if (suggestions.length) return res.json({ site: null, suggestions });
    }
  }

  const title = body.title || body.topic || 'Untitled learning book';
  const t = now();
  let id = 0;
  for (let attempt = 0; attempt < 5 && !id; attempt++) {
    const slug = uniqueSlug(title);
    try {
      id = sqlite.transaction(() => {
        const result = sqlite.prepare(
          `INSERT INTO sites (owner_id,slug,title,description,topic,audience,language,status,published,source_text,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
        ).run(req.user.id, slug, title, body.description, body.topic, body.audience, body.language,
          'queued', body.published ? 1 : 0, source, t, t);
        const siteId = Number(result.lastInsertRowid);
        sqlite.prepare('INSERT INTO jobs (site_id,status,log,created_at,updated_at) VALUES (?,?,?,?,?)')
          .run(siteId, 'queued', 'Queued.', t, t);
        if (uploads.length) {
          const del = sqlite.prepare('DELETE FROM uploads WHERE id=? AND user_id=?');
          for (const up of uploads) del.run(up.id, req.user.id);
        }
        return siteId;
      })();
    } catch (e) {
      if (e.code === 'SQLITE_CONSTRAINT_UNIQUE' && attempt < 4) continue;
      console.error('Create site failed:', e);
      return fail(res, 500, 'server_error', 'Could not create the site.');
    }
  }
  kick(0);
  res.status(201).json({ site: publicSite(siteRow(id)), suggestions: [] });
});

function accessibleSite(req) {
  const id = parseId(req.params.id);
  const site = siteRow(id);
  if (!site || site.archived) return null;
  if (site.owner_id !== req.user.id && req.user.role !== 'admin' && !site.published) return null;
  return site;
}

router.get('/sites/:id', requireAuthApi, (req, res) => {
  const site = accessibleSite(req);
  if (!site) return fail(res, 404, 'not_found', 'Site not found.');
  const job = sqlite.prepare('SELECT * FROM jobs WHERE site_id=? ORDER BY id DESC LIMIT 1').get(site.id);
  res.json({
    site: publicSite(site),
    job: job ? {
      status: job.status,
      log: job.log,
      attempts: job.attempts || 0,
      lastError: job.last_error || '',
      updatedAt: job.updated_at,
    } : null,
  });
});

router.post('/sites/:id/clone', requireAuthApi, (req, res) => {
  const source = accessibleSite(req);
  if (!source || source.status !== 'ready') return fail(res, 404, 'not_found', 'Site not found.');
  if (!fs.existsSync(siteJsonPath(source.slug))) {
    return fail(res, 409, 'no_content', 'This site has no generated content.');
  }
  if (quotaUsed(req.user.id) >= req.profile.daily_limit) {
    return fail(res, 429, 'quota_exceeded', 'Daily limit reached.');
  }
  const t = now();
  let id = 0;
  for (let attempt = 0; attempt < 5 && !id; attempt++) {
    const slug = uniqueSlug(source.title + ' copy');
    try {
      id = sqlite.transaction(() => {
        const result = sqlite.prepare(
          `INSERT INTO sites (owner_id,slug,title,description,topic,audience,language,status,published,source_text,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
        ).run(req.user.id, slug, 'Copy of ' + source.title, source.description, source.topic, source.audience,
          source.language, 'ready', source.published, source.source_text, t, t);
        const siteId = Number(result.lastInsertRowid);
        const dir = path.dirname(siteJsonPath(slug));
        fs.mkdirSync(dir, { recursive: true });
        fs.copyFileSync(siteJsonPath(source.slug), siteJsonPath(slug));
        return siteId;
      })();
    } catch (e) {
      if (e.code === 'SQLITE_CONSTRAINT_UNIQUE' && attempt < 4) continue;
      console.error('Clone failed:', e);
      return fail(res, 500, 'server_error', 'Could not reuse this site.');
    }
  }
  res.status(201).json({ site: publicSite(siteRow(id)) });
});

router.post('/sites/:id/cancel', requireAuthApi, (req, res) => {
  const site = siteRow(parseId(req.params.id));
  if (!site || site.owner_id !== req.user.id || site.archived) return fail(res, 404, 'not_found', 'Site not found.');
  const t = now();
  sqlite.prepare("UPDATE jobs SET cancel_requested=1,updated_at=? WHERE site_id=? AND status IN ('queued','running')").run(t, site.id);
  sqlite.prepare("UPDATE jobs SET status='cancelled',locked_at=NULL,updated_at=? WHERE site_id=? AND status='queued'").run(t, site.id);
  sqlite.prepare("UPDATE sites SET status='cancelled',error='Cancelled by user.',updated_at=? WHERE id=? AND status='queued'").run(t, site.id);
  res.json({ site: publicSite(siteRow(site.id)) });
});

router.post('/sites/:id/regenerate', requireAuthApi, (req, res) => {
  const site = siteRow(parseId(req.params.id));
  if (!site || site.owner_id !== req.user.id || site.archived) return fail(res, 404, 'not_found', 'Site not found.');
  const t = now();
  sqlite.transaction(() => {
    sqlite.prepare("UPDATE sites SET status='queued',error='',updated_at=? WHERE id=?").run(t, site.id);
    sqlite.prepare("UPDATE jobs SET cancel_requested=0,locked_at=NULL,next_attempt_at=NULL,last_error='',updated_at=? WHERE site_id=? AND status IN ('queued','running')").run(t, site.id);
    sqlite.prepare('INSERT INTO jobs (site_id,status,log,created_at,updated_at) VALUES (?,?,?,?,?)').run(site.id, 'queued', 'Queued for regeneration.', t, t);
  })();
  kick(0);
  res.json({ site: publicSite(siteRow(site.id)) });
});

router.delete('/sites/:id', requireAuthApi, async (req, res, next) => {
  const site = siteRow(parseId(req.params.id));
  if (!site || (site.owner_id !== req.user.id && req.user.role !== 'admin') || site.archived) {
    return fail(res, 404, 'not_found', 'Site not found.');
  }
  const t = now();
  sqlite.prepare("UPDATE sites SET archived=1,status='deleted',updated_at=? WHERE id=?").run(t, site.id);
  sqlite.prepare("UPDATE jobs SET cancel_requested=1,status=CASE WHEN status IN ('queued','running') THEN 'cancelled' ELSE status END,updated_at=? WHERE site_id=?").run(t, site.id);
  try {
    await fsp.rm(path.dirname(siteJsonPath(site.slug)), { recursive: true, force: true });
  } catch (e) {
    return next(e);
  }
  res.json({ ok: true });
});

router.get('/catalog', requireAuthApi, (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 200);
  const like = '%' + escapeLike(q) + '%';
  const sites = (q
    ? sqlite.prepare("SELECT * FROM sites WHERE status='ready' AND archived=0 AND (published=1 OR owner_id=?) AND (title LIKE ? OR description LIKE ? OR topic LIKE ? OR source_text LIKE ?) ORDER BY created_at DESC LIMIT 30").all(req.user.id, like, like, like, like)
    : sqlite.prepare("SELECT * FROM sites WHERE status='ready' AND archived=0 AND (published=1 OR owner_id=?) ORDER BY created_at DESC LIMIT 30").all(req.user.id)
  ).map(publicSite);
  res.json({ sites, q });
});

/* ------------------------------------------------------------------ uploads */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomBytes(8).toString('hex') + '-' + slugify(path.basename(file.originalname, ext)) + ext);
  },
});
const upload = multer({ storage, limits: { fileSize: MAX_UPLOAD, files: MAX_FILES } });
let activeUploads = 0;
function uploadGate(req, res, next) {
  if (activeUploads >= MAX_CONCURRENT_UPLOADS) {
    return fail(res, 429, 'rate_limited', 'Too many uploads in progress. Try again shortly.');
  }
  activeUploads++;
  let released = false;
  const release = () => { if (!released) { released = true; activeUploads--; } };
  res.on('finish', release);
  res.on('close', release);
  next();
}

router.post('/uploads', requireAuthApi, rateLimit({ windowMs: 60 * 1000, max: 12, key: req => req.user.id }), uploadGate, (req, res, next) => {
  upload.array('files', MAX_FILES)(req, res, async err => {
    if (err) return next(err);
    const files = req.files || [];
    if (!files.length) return fail(res, 400, 'invalid_upload', 'Select at least one file.');
    const out = [];
    try {
      for (const file of files) out.push(await extractUpload(file, req.user.id));
    } catch (e) {
      for (const file of files) fsp.unlink(file.path).catch(() => {});
      return fail(res, 400, 'invalid_upload', String(e.message || e));
    }
    res.json({ files: out.map(({ id, name, chars }) => ({ id, name, chars })) });
  });
});

/* ------------------------------------------------------------------ settings */

const SettingsSchema = z.object({
  apiBase: z.string().trim().max(300).refine(v => !v || /^https?:\/\//i.test(v), 'API base must start with http:// or https://').default(''),
  apiModel: z.string().trim().max(120).default(''),
  apiKey: z.string().max(500).default(''),
  clearKey: z.boolean().default(false),
});

router.get('/settings', requireAuthApi, (req, res) => {
  res.json({ settings: settingsOf(req.profile) });
});

router.put('/settings', requireAuthApi, (req, res) => {
  const parsed = SettingsSchema.safeParse(req.body || {});
  if (!parsed.success) return badRequest(res, parsed.error);
  const body = parsed.data;
  let apiKey = req.profile.api_key;
  if (body.clearKey) apiKey = '';
  else if (body.apiKey.trim()) apiKey = encrypt(body.apiKey.trim());
  sqlite.prepare('UPDATE profiles SET api_base=?,api_model=?,api_key=? WHERE user_id=?')
    .run(body.apiBase, body.apiModel, apiKey, req.user.id);
  clearSessionCache();
  res.json({ settings: settingsOf({ ...req.profile, api_base: body.apiBase, api_model: body.apiModel, api_key: apiKey }) });
});

/* ------------------------------------------------------------------ admin */

router.get('/admin/users', requireAdminApi, (req, res) => {
  const users = sqlite.prepare('SELECT id,email,name,role,createdAt,emailVerified FROM user ORDER BY createdAt').all()
    .map(row => userJson(row));
  res.json({ users });
});

const NewUserSchema = z.object({
  email: z.string().trim().toLowerCase().max(200).refine(value => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value), 'Invalid email address'),
  name: z.string().trim().max(80).default(''),
  password: z.string().min(10).max(200),
  dailyLimit: z.coerce.number().int().min(0).max(1000).default(DEFAULT_DAILY_LIMIT),
});

router.post('/admin/users', requireAdminApi, async (req, res) => {
  const parsed = NewUserSchema.safeParse(req.body || {});
  if (!parsed.success) return badRequest(res, parsed.error);
  const body = parsed.data;
  const name = body.name || body.email.split('@')[0];
  try {
    const created = await auth.api.signUpEmail({ body: { email: body.email, password: body.password, name } });
    sqlite.prepare("UPDATE user SET role='user' WHERE id=?").run(created.user.id);
    ensureProfile(created.user.id, body.dailyLimit);
    const row = sqlite.prepare('SELECT id,email,name,role,createdAt,emailVerified FROM user WHERE id=?').get(created.user.id);
    res.status(201).json({ user: userJson(row) });
  } catch (e) {
    const message = String(e?.body?.message || e?.message || 'Could not create user.');
    return fail(res, 400, 'create_user_failed', message);
  }
});

const UpdateUserSchema = z.object({
  dailyLimit: z.coerce.number().int().min(0).max(1000).optional(),
  disabled: z.boolean().optional(),
  password: z.string().min(10).max(200).optional(),
});

router.patch('/admin/users/:id', requireAdminApi, async (req, res) => {
  const target = sqlite.prepare('SELECT id,email,name,role,createdAt,emailVerified FROM user WHERE id=?').get(String(req.params.id));
  if (!target) return fail(res, 404, 'not_found', 'User not found.');
  const parsed = UpdateUserSchema.safeParse(req.body || {});
  if (!parsed.success) return badRequest(res, parsed.error);
  const body = parsed.data;

  if (body.disabled === true && target.role === 'admin') {
    return fail(res, 400, 'invalid_input', 'The administrator account cannot be disabled.');
  }
  if (body.disabled === true && target.id === req.user.id) {
    return fail(res, 400, 'invalid_input', 'You cannot disable your own account.');
  }
  if (body.dailyLimit !== undefined) {
    ensureProfile(target.id);
    sqlite.prepare('UPDATE profiles SET daily_limit=? WHERE user_id=?').run(body.dailyLimit, target.id);
  }
  if (body.disabled !== undefined) {
    ensureProfile(target.id);
    sqlite.prepare('UPDATE profiles SET disabled=? WHERE user_id=?').run(body.disabled ? 1 : 0, target.id);
    if (body.disabled) clearSessionCache();
  }
  if (body.password) {
    try {
      await auth.api.setUserPassword({ body: { userId: target.id, newPassword: body.password }, headers: fromNodeHeaders(req.headers) });
      if (target.id !== req.user.id) {
        await auth.api.revokeUserSessions({ body: { userId: target.id }, headers: fromNodeHeaders(req.headers) });
      }
      clearSessionCache();
    } catch (e) {
      return fail(res, 400, 'password_change_failed', String(e?.body?.message || e?.message || 'Could not change password.'));
    }
  }
  res.json({ user: userJson(target) });
});

/* Unknown API routes stay JSON instead of falling through to the SPA. */
router.use((req, res) => fail(res, 404, 'not_found', 'Not found.'));

/* Multer and body errors stay JSON for the SPA. */
router.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'A file is larger than 8 MB.'
      : err.code === 'LIMIT_FILE_COUNT' ? 'Too many files.' : 'Upload failed.';
    return fail(res, 400, 'invalid_upload', message);
  }
  if (err?.type === 'entity.too.large') return fail(res, 413, 'too_large', 'Request body too large.');
  console.error('API error:', err);
  return fail(res, 500, 'server_error', 'Server error.');
});

export default router;
