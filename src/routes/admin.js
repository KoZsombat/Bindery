import express from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth.js';
import { DEFAULT_DAILY_LIMIT } from '../config.js';
import { sqlite, ensureProfile, quotaUsed } from '../db/index.js';
import { renderPage } from '../lib/http.js';
import { requireAdmin } from '../middleware/session.js';

const router = express.Router();

router.get('/admin', requireAdmin, (req, res) => {
  const users = sqlite.prepare('SELECT * FROM user ORDER BY createdAt').all().map(u => {
    const p = ensureProfile(u.id);
    return { ...u, daily_limit: p.daily_limit, disabled: !!p.disabled, usedToday: quotaUsed(u.id) };
  });
  renderPage(req, res, 'admin', { users, error: req.query.error || '', ok: req.query.ok || '' });
});

router.post('/admin/users', requireAdmin, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const name = String(req.body.name || '').trim().slice(0, 80) || email.split('@')[0];
  const password = String(req.body.password || '');
  const limit = Math.max(0, Math.min(1000, Number(req.body.dailyLimit) || DEFAULT_DAILY_LIMIT));
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 8) {
    return res.redirect('/admin?error=' + encodeURIComponent('Valid email and password (8+) required.'));
  }
  try {
    const created = await auth.api.signUpEmail({ body: { email, password, name } });
    sqlite.prepare("UPDATE user SET role='user' WHERE id=?").run(created.user.id);
    ensureProfile(created.user.id, limit);
    res.redirect('/admin?ok=User+created');
  } catch (e) {
    res.redirect('/admin?error=' + encodeURIComponent(e.message || 'Could not create user.'));
  }
});

router.post('/admin/users/:id/limit', requireAdmin, (req, res) => {
  const limit = Math.max(0, Math.min(1000, Number(req.body.dailyLimit) || 0));
  ensureProfile(req.params.id);
  sqlite.prepare('UPDATE profiles SET daily_limit=? WHERE user_id=?').run(limit, req.params.id);
  res.redirect('/admin?ok=Limit+saved');
});

router.post('/admin/users/:id/password', requireAdmin, async (req, res) => {
  const password = String(req.body.password || '');
  if (password.length < 8) return res.redirect('/admin?error=' + encodeURIComponent('Password must be at least 8 characters.'));
  try {
    await auth.api.setUserPassword({ body: { userId: req.params.id, newPassword: password }, headers: fromNodeHeaders(req.headers) });
    res.redirect('/admin?ok=Password+changed');
  } catch (e) {
    res.redirect('/admin?error=' + encodeURIComponent(e.message || 'Could not change password.'));
  }
});

router.post('/admin/users/:id/toggle', requireAdmin, (req, res) => {
  const p = ensureProfile(req.params.id);
  sqlite.prepare('UPDATE profiles SET disabled=? WHERE user_id=?').run(p.disabled ? 0 : 1, req.params.id);
  res.redirect('/admin?ok=User+updated');
});

export default router;
