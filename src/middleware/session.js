import { fromNodeHeaders } from 'better-auth/node';
import { ensureProfile } from '../db/index.js';

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
    try {
      const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
      req.user = session?.user || null;
      req.session = session?.session || null;
      if (req.user) req.profile = ensureProfile(req.user.id);
    } catch (e) {
      console.error('Session error:', e.message);
    }
    next();
  };
}
