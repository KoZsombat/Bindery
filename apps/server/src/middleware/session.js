import { fromNodeHeaders } from 'better-auth/node';
import { ensureProfile } from '../db/index.js';
import { SESSION_CACHE_MS, BETTER_AUTH_URL } from '../config.js';

const cache = new Map();

export function tokenFrom(req) {
  const m = /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=([^;]+)/.exec(req.headers.cookie || '');
  return m ? decodeURIComponent(m[1]) : '';
}

export function clearSessionCache(token) {
  if (token) cache.delete(token);
  else cache.clear();
}

export function requireUser(req, res, next) {
  if (!req.user) return res.redirect(BETTER_AUTH_URL + '/login?next=' + encodeURIComponent(req.originalUrl || '/app'));
  if (req.profile && req.profile.disabled) return res.status(403).send('This account is disabled.');
  next();
}

export function requireAuthApi(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized', message: 'Sign in required.' });
  if (req.profile && req.profile.disabled) return res.status(403).json({ error: 'account_disabled', message: 'This account is disabled.' });
  next();
}

export function requireAdminApi(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden', message: 'Admin access required.' });
  }
  next();
}

export function sessionMiddleware(auth) {
  return async function (req, res, next) {
    const token = tokenFrom(req);
    if (token && SESSION_CACHE_MS) {
      const hit = cache.get(token);
      if (hit && hit.until > Date.now()) {
        req.user = hit.user;
        req.session = hit.session;
        req.profile = hit.profile;
        return next();
      }
      if (hit) cache.delete(token);
    }
    try {
      const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
      req.user = session?.user || null;
      req.session = session?.session || null;
      if (req.user) req.profile = ensureProfile(req.user.id);
      if (token && SESSION_CACHE_MS) {
        cache.set(token, { user: req.user, session: req.session, profile: req.profile, until: Date.now() + SESSION_CACHE_MS });
        if (cache.size > 1000) cache.delete(cache.keys().next().value);
      }
    } catch (e) {
      console.error('Session error:', e.message);
    }
    next();
  };
}
