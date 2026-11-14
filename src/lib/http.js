export function safeNext(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/app';
}

export function copyAuthCookies(res, response) {
  let cookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
  if (process.env.NODE_ENV !== 'production') cookies = cookies.map(c => c.replace(/^__Secure-/, '').replace(/;\s*Secure/gi, ''));
  if (cookies.length) res.setHeader('Set-Cookie', cookies);
}

export function renderPage(req, res, view, data = {}, status = 200) {
  res.status(status).render(view, {
    user: req.user || null,
    profile: req.profile || null,
    admin: !!(req.user && req.user.role === 'admin'),
    ...data
  });
}
