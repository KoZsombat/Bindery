import express from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { consumeLoginLink, createUserSession, inspectLoginLink, sessionCookie } from '../services/login-links.js';

const router = express.Router();

const TITLES = {
  invalid: 'This login link is not valid.',
  used: 'This login link has already been used.',
  expired: 'This login link has expired.',
  missing: 'This account no longer exists.'
};

const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[ch]);

function page(title, options = {}) {
  const lead = options.lead ? `<p>${options.lead}</p>` : '<p>Ask your administrator for a new link.</p>';
  const action = options.action
    ? `<form method="post" action="${escapeHtml(options.action)}"><button type="submit">${options.submit || 'Continue'}</button></form>`
    : '';
  const link = options.href ? `<p><a href="${escapeHtml(options.href)}">${escapeHtml(options.label || 'Continue')}</a></p>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${title}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#071a2d;color:#e8eef6;font:16px/1.6 system-ui,sans-serif}
main{max-width:34rem;padding:2rem;border:1px solid #1d3c59;border-radius:10px;background:#0b253f}h1{font-size:1.25rem;margin:0 0 .75rem}a{color:#d8b45a}p{margin:.5rem 0}
form{margin:1.25rem 0 .25rem}button{height:40px;padding:0 20px;border:1px solid #d8b45a;border-radius:6px;background:#d8b45a;color:#241b05;font:600 15px system-ui,sans-serif;cursor:pointer}
button:hover{opacity:.9}</style>
</head><body><main><h1>${title}</h1>${lead}${action}${link}</main></body></html>`;
}

function sendPage(res, status, title, options) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  return res.status(status).type('html').send(page(title, options));
}

// GET only inspects: link previews, mail scanners and prefetchers must not burn the token.
router.get('/claim/:token', rateLimit({ windowMs: 60_000, max: 30 }), (req, res) => {
  const state = inspectLoginLink(req.params.token);
  if (state.error) {
    return sendPage(res, state.error === 'invalid' ? 404 : 410, TITLES[state.error] || TITLES.invalid);
  }
  const who = state.email ? ` as <b>${escapeHtml(state.email)}</b>` : '';
  return sendPage(res, 200, 'Sign in to Bindery', {
    lead: `This one-time link signs you in${who}. It works once, for 10 minutes.`,
    action: `/claim/${encodeURIComponent(req.params.token)}`,
    submit: 'Sign in'
  });
});

router.post('/claim/:token', rateLimit({ windowMs: 60_000, max: 30 }), async (req, res) => {
  // Every actual claim burns the link, even when the visitor is already signed in.
  const consumed = consumeLoginLink(req.params.token);
  if (consumed.error) {
    return sendPage(res, consumed.error === 'invalid' ? 404 : 410, TITLES[consumed.error] || TITLES.invalid);
  }
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) }).catch(() => null);
  if (session) {
    return sendPage(res, 409, 'Login via link failed due to being already signed in.', { href: '/app', label: 'Open the app' });
  }
  const token = createUserSession(consumed.userId, req);
  if (!token) return sendPage(res, 404, TITLES.missing);
  res.setHeader('Set-Cookie', sessionCookie(token));
  res.redirect('/app');
});

export default router;
