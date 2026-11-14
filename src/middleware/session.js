import { fromNodeHeaders } from 'better-auth/node';
import { ensureProfile } from '../db/index.js';
import { SESSION_CACHE_MS } from '../config.js';

const cache = new Map();
function tokenFrom(req) {
  const m = /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=([^;]+)/.exec(req.headers.cookie || '');
  return m ? decodeURIComponent(m[1]) : '';
}

export function requireUser(req, res, next) {
  if (!req.user) return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl || '/app'));
  if (req.profile && req.profile.disabled) return res.status(403).send('This account is disabled.');
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).send('Admin only.');
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
