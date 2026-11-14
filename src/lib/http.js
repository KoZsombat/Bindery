export function safeNext(value) {
  return typeof value === 'string' && value.startsWith('/') ? value : '/app';
}

export function copyAuthCookies(res, response) {
  const cookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
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
