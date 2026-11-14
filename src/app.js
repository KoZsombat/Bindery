import express from 'express';
import path from 'node:path';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { VIEWS_DIR, PUBLIC_DIR, SHARED_DIR, EXAMPLE_DIR, SITE_DOMAIN, DEV } from './config.js';
import { requireUser, sessionMiddleware } from './middleware/session.js';
import { renderPage, safeNext } from './lib/http.js';
import { sqlite } from './db/index.js';
import { getLang, translate } from './i18n.js';
import pagesRouter from './routes/pages.js';
import adminRouter from './routes/admin.js';
import generatedRouter, { subdomainHandler } from './routes/generated.js';

export const app = express();
app.set('view engine', 'ejs');
app.set('views', VIEWS_DIR);
app.set('trust proxy', 1);
app.locals.fmt = iso => { try { return new Date(iso).toLocaleString(); } catch { return iso; } };
app.locals.siteUrl = slug => '/s/' + encodeURIComponent(slug) + '/';

app.use('/app.css', express.static(path.join(PUBLIC_DIR, 'app.css'), DEV ? {} : { maxAge: '1d', immutable: true }));
app.all('/api/auth/sign-up/*splat', (req, res) => res.status(403).json({ error: 'Sign-up is disabled.' }));
app.all('/api/auth/*splat', toNodeHandler(auth));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '1mb' }));
app.use(sessionMiddleware(auth));
app.use((req, res, next) => {
  const lang = getLang(req);
  res.locals.lang = lang;
  res.locals.currentPath = req.originalUrl;
  res.locals.t = key => translate(lang, key);
  next();
});
app.get('/lang/:lang', (req, res) => {
  const lang = req.params.lang === 'hu' ? 'hu' : req.params.lang === 'en' ? 'en' : '';
  if (!lang) return res.status(404).send('Unknown language.');
  res.cookie('lang', lang, { maxAge: 365 * 24 * 60 * 60 * 1000, sameSite: 'lax', httpOnly: false });
  res.redirect(safeNext(req.query.next) || '/app');
});
app.use((req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (!origin) return next();
  try { if (new URL(origin).host !== req.headers.host) return res.status(403).send('Cross-origin request rejected.'); } catch { return res.status(403).send('Cross-origin request rejected.'); }
  next();
});

app.use((req, res, next) => {
  const host = String(req.hostname || '').toLowerCase();
  if (host.endsWith('.' + SITE_DOMAIN) && host !== SITE_DOMAIN) req.siteSlug = host.slice(0, -(SITE_DOMAIN.length + 1));
  next();
});

app.use(subdomainHandler);
app.get('/healthz', (req, res) => res.json({ ok: true }));
app.get('/readyz', (req, res) => {
  try {
    sqlite.prepare('SELECT 1').get();
    const queue = sqlite.prepare("SELECT status, COUNT(*) AS n FROM jobs WHERE status IN ('queued','running') GROUP BY status").all();
    res.json({ ok: true, queue });
  } catch (e) {
    res.status(503).json({ ok: false, error: e.message });
  }
});
app.use(pagesRouter);
app.use(adminRouter);
app.use(generatedRouter);

app.use('/shared', requireUser, express.static(SHARED_DIR, { maxAge: '30d', immutable: true, setHeaders: function (res) { res.setHeader('Cache-Control', 'private, max-age=2592000, immutable'); } }));
app.use('/example/matekbazis', requireUser, express.static(EXAMPLE_DIR, { index: 'index.html', setHeaders: function (res) { res.setHeader('Cache-Control', 'private, no-cache'); } }));

app.use((req, res) => renderPage(req, res, 'error', { message: 'Page not found.' }, 404));
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  renderPage(req, res, 'error', { message: process.env.NODE_ENV === 'production' ? 'Server error.' : err.message }, 500);
});
