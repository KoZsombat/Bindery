import express from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { consumeLoginLink, createUserSession, sessionCookie } from '../services/login-links.js';

const router = express.Router();

const TITLES = {
  invalid: 'This login link is not valid.',
  used: 'This login link has already been used.',
  expired: 'This login link has expired.',
  missing: 'This account no longer exists.'
};

function page(message, options = {}) {
  const link = options.href ? `<p><a href="${options.href}">${options.label || 'Continue'}</a></p>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${message}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#071a2d;color:#e8eef6;font:16px/1.6 system-ui,sans-serif}
main{max-width:34rem;padding:2rem;border:1px solid #1d3c59;border-radius:10px;background:#0b253f}h1{font-size:1.25rem;margin:0 0 .75rem}a{color:#d8b45a}p{margin:.5rem 0}</style>
</head><body><main><h1>${message}</h1><p>Ask your administrator for a new link.</p>${link}</main></body></html>`;
}

router.get('/claim/:token', rateLimit({ windowMs: 60_000, max: 30 }), async (req, res) => {
  // Every click burns the link, even when the visitor is already signed in.
  const consumed = consumeLoginLink(req.params.token);
  if (consumed.error) {
    const status = consumed.error === 'invalid' ? 404 : 410;
    return res.status(status).type('html').send(page(TITLES[consumed.error] || TITLES.invalid));
  }
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) }).catch(() => null);
  if (session) {
    return res.status(409).type('html').send(page('Login via link failed due to being already signed in.', { href: '/app', label: 'Open the app' }));
  }
  const token = createUserSession(consumed.userId, req);
  if (!token) return res.status(404).type('html').send(page(TITLES.missing));
  res.setHeader('Set-Cookie', sessionCookie(token));
  res.redirect('/app');
});

export default router;
