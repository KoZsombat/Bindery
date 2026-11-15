import express from 'express';
import helmet from 'helmet';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import {
  STATIC_DIR, SHARED_DIR, EXAMPLE_DIR, VIEWS_DIR, SITE_DOMAIN, IS_PROD, TRUST_PROXY,
} from './config.js';
import { sessionMiddleware, requireUser } from './middleware/session.js';
import { dbReady, sqlite } from './db/index.js';
import { workerHeartbeat, workerSnapshot } from './services/generation.js';
import apiRouter from './routes/api.js';
import generatedRouter, { subdomainHandler } from './routes/generated.js';

export const app = express();
app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', VIEWS_DIR);
app.set('trust proxy', TRUST_PROXY);

/* ---------------------------------------------------------------- headers */
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
      // Inline style attributes are used for progress bars and generated content.
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      ...(IS_PROD ? { upgradeInsecureRequests: [] } : {}),
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-origin' },
  referrerPolicy: { policy: 'no-referrer' },
  hsts: IS_PROD ? { maxAge: 15552000, includeSubDomains: true } : false,
}));
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

/* ---------------------------------------------------------------- auth */
app.all('/api/auth/sign-up', (req, res) => res.status(403).json({ error: 'signup_disabled', message: 'Sign-up is disabled. Ask the administrator for an account.' }));
app.all('/api/auth/sign-up/*splat', (req, res) => res.status(403).json({ error: 'signup_disabled', message: 'Sign-up is disabled. Ask the administrator for an account.' }));
app.all('/api/auth/*splat', toNodeHandler(auth));

/* ---------------------------------------------------------------- parsers */
app.use(express.json({ limit: '1mb', strict: true }));

/* ---------------------------------------------------------------- session */
app.use(sessionMiddleware(auth));

/* ---------------------------------------------------------------- CSRF */
app.use((req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  if (req.path.startsWith('/api/auth/')) return next(); // Better Auth checks origins itself.
  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) {
        return res.status(403).json({ error: 'cross_origin', message: 'Cross-origin request rejected.' });
      }
    } catch {
      return res.status(403).json({ error: 'cross_origin', message: 'Cross-origin request rejected.' });
    }
  }
  const fetchSite = req.headers['sec-fetch-site'];
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    return res.status(403).json({ error: 'cross_origin', message: 'Cross-origin request rejected.' });
  }
  next();
});

/* ---------------------------------------------------------------- routing */
app.use((req, res, next) => {
  const host = String(req.hostname || '').toLowerCase();
  if (host.endsWith('.' + SITE_DOMAIN) && host !== SITE_DOMAIN) {
    req.siteSlug = host.slice(0, -(SITE_DOMAIN.length + 1));
  }
  next();
});

app.use(subdomainHandler);

app.get('/healthz', (req, res) => {
  res.json({ ok: true, uptime: Math.round(process.uptime()) });
});

app.get('/readyz', (req, res) => {
  try {
    const db = dbReady();
    const heartbeat = workerHeartbeat();
    const workerOk = heartbeat > 0 && Date.now() - heartbeat < 60000;
    const queue = sqlite.prepare("SELECT status, COUNT(*) AS n FROM jobs WHERE status IN ('queued','running') GROUP BY status").all();
    const ok = db && workerOk;
    res.status(ok ? 200 : 503).json({ ok, db, worker: { ...workerSnapshot(), ok: workerOk }, queue });
  } catch (e) {
    res.status(503).json({ ok: false, error: e.message });
  }
});

app.use('/api', apiRouter);

app.use(generatedRouter);

app.use('/shared', requireUser, express.static(SHARED_DIR, {
  maxAge: '30d',
  immutable: true,
  setHeaders(res) { res.setHeader('Cache-Control', 'private, max-age=2592000, immutable'); },
}));

const EXAMPLE_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');
app.use('/example/matekbazis', (req, res, next) => {
  if (!req.user) return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl || '/app'));
  res.setHeader('Content-Security-Policy', EXAMPLE_CSP);
  res.setHeader('X-Robots-Tag', 'noindex');
  next();
}, express.static(EXAMPLE_DIR, {
  index: 'index.html',
  setHeaders(res) { res.setHeader('Cache-Control', 'private, no-cache'); },
}));

/* ---------------------------------------------------------------- SPA */
const indexFile = path.join(STATIC_DIR, 'index.html');
app.use(express.static(STATIC_DIR, {
  index: false,
  setHeaders(res, filePath) {
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  },
}));

app.get('*splat', (req, res) => {
  if (req.siteSlug) return res.status(404).send('Not found.');
  if (!fs.existsSync(indexFile)) {
    return res.status(503).send('The client build is missing. Run `npm run build` (or `npm run dev:client` for the Vite dev server).');
  }
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(indexFile);
});

app.use((req, res) => res.status(404).send('Not found.'));

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  if (req.path.startsWith('/api/')) {
    const status = err?.type === 'entity.parse.failed' || err?.status === 400 ? 400 : 500;
    return res.status(status).json({ error: 'server_error', message: status === 400 ? 'Invalid JSON body.' : 'Server error.' });
  }
  res.status(500).send('Server error.');
});
