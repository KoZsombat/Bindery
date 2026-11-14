import express from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import multer from 'multer';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { auth } from '../auth.js';
import { MAX_SOURCE, MAX_UPLOAD, MAX_FILES, MAX_CONCURRENT_UPLOADS, UPLOADS_DIR } from '../config.js';
import { sqlite, quotaUsed, uniqueSlug, siteRow, siteJsonPath, publicSite, now, slugify } from '../db/index.js';
import { kick, llmConfig, useMock } from '../services/generation.js';
import { extractUpload } from '../services/uploads.js';
import { encrypt } from '../crypto.js';
import { safeNext, copyAuthCookies, renderPage } from '../lib/http.js';
import { requireUser } from '../middleware/session.js';
import { rateLimit } from '../middleware/rate-limit.js';

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UPLOADS_DIR); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomBytes(8).toString('hex') + '-' + slugify(path.basename(file.originalname, ext)) + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: MAX_UPLOAD, files: MAX_FILES } });
let activeUploads = 0;
function uploadGate(req, res, next) {
  if (activeUploads >= MAX_CONCURRENT_UPLOADS) return res.status(429).send('Too many uploads in progress. Try again shortly.');
  activeUploads++;
  let released = false;
  const release = function () { if (!released) { released = true; activeUploads--; } };
  res.on('finish', release);
  res.on('close', release);
  next();
}

router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/app');
  res.render('login', { error: '', email: '', next: safeNext(req.query.next), dev: !process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== 'production' });
});
router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 15 }), async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const next = safeNext(req.body.next);
  const dev = !process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== 'production';
  try {
    const response = await auth.api.signInEmail({ body: { email, password }, asResponse: true });
    if (!response.ok) return res.status(401).render('login', { error: 'Wrong email or password.', email, next, dev });
    copyAuthCookies(res, response);
    return res.redirect(next);
  } catch {
    return res.status(401).render('login', { error: 'Wrong email or password.', email, next, dev });
  }
});
router.post('/logout', async (req, res) => {
  try {
    copyAuthCookies(res, await auth.api.signOut({ headers: fromNodeHeaders(req.headers), asResponse: true }));
  } catch (e) {
    console.error('Sign-out error:', e.message);
  }
  const cookie = { path: '/', httpOnly: true, sameSite: 'lax', secure: req.secure };
  res.clearCookie('better-auth.session_token', cookie);
  res.clearCookie('__Secure-better-auth.session_token', cookie);
  res.redirect('/login');
});
router.get('/', (req, res) => res.redirect(req.user ? '/app' : '/login'));

router.get('/app', requireUser, (req, res) => {
  const usedToday = quotaUsed(req.user.id);
  const sites = sqlite.prepare('SELECT * FROM sites WHERE (owner_id=? OR example=1) AND archived=0 ORDER BY created_at DESC').all(req.user.id).map(publicSite);
  renderPage(req, res, 'dashboard', { sites, usedToday, remaining: Math.max(0, req.profile.daily_limit - usedToday) });
});
router.get('/new', requireUser, (req, res) => {
  const usedToday = quotaUsed(req.user.id);
  renderPage(req, res, 'new', { form: {}, suggestions: [], error: '', remaining: Math.max(0, req.profile.daily_limit - usedToday) });
});
router.post('/new', requireUser, rateLimit({ windowMs: 60 * 1000, max: 8, key: req => req.user?.id }), uploadGate, upload.array('files', MAX_FILES), async (req, res) => {
  const form = {
    title: String(req.body.title || '').trim().slice(0, 160),
    topic: String(req.body.topic || '').trim().slice(0, 300),
    description: String(req.body.description || '').trim().slice(0, 600),
    audience: String(req.body.audience || '').trim().slice(0, 160),
    language: ['hu', 'en', 'both'].includes(req.body.language) ? req.body.language : 'both',
    longText: String(req.body.longText || '').trim().slice(0, MAX_SOURCE),
    published: req.body.published === 'on'
  };
  const used = quotaUsed(req.user.id);
  const remaining = Math.max(0, req.profile.daily_limit - used);
  if (used >= req.profile.daily_limit) return renderPage(req, res, 'new', { form, suggestions: [], error: 'Daily limit reached (' + req.profile.daily_limit + ' sites/day).', remaining }, 429);
  try {
    let source = form.longText;
    for (const file of req.files || []) {
      const up = await extractUpload(file, req.user.id);
      source += '\n\n--- ' + up.name + ' ---\n' + up.extracted;
    }
    if (!form.topic && !source.trim()) return renderPage(req, res, 'new', { form, suggestions: [], error: 'Add a topic, long text, or at least one file.', remaining }, 400);
    const cfg = llmConfig(req.profile);
    if (!useMock(cfg) && !cfg.key) return renderPage(req, res, 'new', { form, suggestions: [], error: 'No API key. Add one in Settings, or ask the admin to configure LLM_API_KEY.', remaining }, 400);
    if (req.body.force !== '1') {
      const needle = '%' + (form.topic || form.title || '').slice(0, 60).replace(/[%_]/g, '') + '%';
      const suggestions = sqlite.prepare("SELECT * FROM sites WHERE status='ready' AND published=1 AND (title LIKE ? OR topic LIKE ? OR description LIKE ?) ORDER BY created_at DESC LIMIT 5").all(needle, needle, needle).map(publicSite);
      if (suggestions.length) return renderPage(req, res, 'new', { form, suggestions, error: '', remaining });
    }
    const title = form.title || form.topic || 'Untitled learning book';
    const slug = uniqueSlug(title);
    const t = now();
    const result = sqlite.prepare(`INSERT INTO sites (owner_id,slug,title,description,topic,audience,language,status,published,source_text,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(req.user.id, slug, title, form.description, form.topic, form.audience, form.language, 'queued', form.published ? 1 : 0, source.slice(0, MAX_SOURCE), t, t);
    const id = Number(result.lastInsertRowid);
    sqlite.prepare('INSERT INTO jobs (site_id,status,log,created_at,updated_at) VALUES (?,?,?,?,?)').run(id, 'queued', 'Queued.', t, t);
    kick(0);
    res.redirect('/site/' + id);
  } catch (e) {
    renderPage(req, res, 'new', { form, suggestions: [], error: e.message, remaining }, 400);
  }
});
router.get('/site/:id', requireUser, (req, res) => {
  const site = siteRow(Number(req.params.id));
  if (!site || site.archived || (site.owner_id !== req.user.id && req.user.role !== 'admin' && !site.published)) return renderPage(req, res, 'error', { message: 'Site not found.' }, 404);
  const job = sqlite.prepare('SELECT * FROM jobs WHERE site_id=? ORDER BY id DESC LIMIT 1').get(site.id);
  renderPage(req, res, 'site', { site: publicSite(site), job });
});
router.post('/site/:id/clone', requireUser, (req, res) => {
  const source = siteRow(Number(req.params.id));
  if (!source || source.status !== 'ready') return res.status(404).send('Site not found.');
  if (!fs.existsSync(siteJsonPath(source.slug))) return res.status(409).send('This site has no generated content.');
  if (quotaUsed(req.user.id) >= req.profile.daily_limit) return res.status(429).send('Daily limit reached.');
  const slug = uniqueSlug(source.title + ' copy');
  const t = now();
  const result = sqlite.prepare(`INSERT INTO sites (owner_id,slug,title,description,topic,audience,language,status,published,source_text,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(req.user.id, slug, 'Copy of ' + source.title, source.description, source.topic, source.audience, source.language, 'ready', source.published, source.source_text, t, t);
  const dir = path.dirname(siteJsonPath(slug));
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(siteJsonPath(source.slug), siteJsonPath(slug));
  const sourceIndex = path.join(path.dirname(siteJsonPath(source.slug)), 'index.html');
  if (fs.existsSync(sourceIndex)) fs.copyFileSync(sourceIndex, path.join(dir, 'index.html'));
  res.redirect('/site/' + result.lastInsertRowid);
});
router.post('/site/:id/cancel', requireUser, (req, res) => {
  const site = siteRow(Number(req.params.id));
  if (!site || site.owner_id !== req.user.id || site.archived) return res.status(404).send('Site not found.');
  const t = now();
  sqlite.prepare("UPDATE jobs SET cancel_requested=1,updated_at=? WHERE site_id=? AND status IN ('queued','running')").run(t, site.id);
  sqlite.prepare("UPDATE jobs SET status='cancelled',locked_at=NULL,updated_at=? WHERE site_id=? AND status='queued'").run(t, site.id);
  sqlite.prepare("UPDATE sites SET status='cancelled',error='Cancelled by user.',updated_at=? WHERE id=? AND status='queued'").run(t, site.id);
  res.redirect('/site/' + site.id);
});
router.post('/site/:id/regenerate', requireUser, (req, res) => {
  const site = siteRow(Number(req.params.id));
  if (!site || site.owner_id !== req.user.id || site.archived) return res.status(404).send('Site not found.');
  const t = now();
  sqlite.prepare("UPDATE sites SET status='queued',error='',updated_at=? WHERE id=?").run(t, site.id);
  sqlite.prepare("UPDATE jobs SET cancel_requested=0,locked_at=NULL,next_attempt_at=NULL,last_error='',updated_at=? WHERE site_id=? AND status IN ('queued','running')").run(t, site.id);
  sqlite.prepare('INSERT INTO jobs (site_id,status,log,created_at,updated_at) VALUES (?,?,?,?,?)').run(site.id, 'queued', 'Queued for regeneration.', t, t);
  kick(0);
  res.redirect('/site/' + site.id);
});
router.post('/site/:id/delete', requireUser, async (req, res) => {
  const site = siteRow(Number(req.params.id));
  if (!site || (site.owner_id !== req.user.id && req.user.role !== 'admin') || site.archived) return res.status(404).send('Site not found.');
  const t = now();
  sqlite.prepare("UPDATE sites SET archived=1,status='deleted',updated_at=? WHERE id=?").run(t, site.id);
  sqlite.prepare("UPDATE jobs SET cancel_requested=1,status=CASE WHEN status IN ('queued','running') THEN 'cancelled' ELSE status END,updated_at=? WHERE site_id=?").run(t, site.id);
  await fsp.rm(path.dirname(siteJsonPath(site.slug)), { recursive: true, force: true });
  res.redirect('/app');
});
router.get('/catalog', requireUser, (req, res) => {
  const q = String(req.query.q || '').trim();
  const like = '%' + q.replace(/[%_]/g, '') + '%';
  const sites = (q
    ? sqlite.prepare("SELECT * FROM sites WHERE status='ready' AND archived=0 AND (published=1 OR owner_id=?) AND (title LIKE ? OR description LIKE ? OR topic LIKE ? OR source_text LIKE ?) ORDER BY created_at DESC LIMIT 30").all(req.user.id, like, like, like, like)
    : sqlite.prepare("SELECT * FROM sites WHERE status='ready' AND archived=0 AND (published=1 OR owner_id=?) ORDER BY created_at DESC LIMIT 30").all(req.user.id)).map(publicSite);
  renderPage(req, res, 'catalog', { sites, q });
});
router.get('/settings', requireUser, (req, res) => renderPage(req, res, 'settings', { saved: req.query.saved === '1' }));
router.post('/settings', requireUser, (req, res) => {
  const apiBase = String(req.body.apiBase || '').trim().slice(0, 300);
  const apiModel = String(req.body.apiModel || '').trim().slice(0, 120);
  let apiKey = req.profile.api_key;
  if (req.body.clearKey === 'on') apiKey = '';
  else if (typeof req.body.apiKey === 'string' && req.body.apiKey.trim()) apiKey = encrypt(req.body.apiKey.trim());
  sqlite.prepare('UPDATE profiles SET api_base=?,api_model=?,api_key=? WHERE user_id=?').run(apiBase, apiModel, apiKey, req.user.id);
  res.redirect('/settings?saved=1');
});

export default router;
