import crypto from 'node:crypto';
import { BETTER_AUTH_URL, BETTER_AUTH_SECRET, COOKIE_DOMAIN, COOKIE_SECURE } from '../config.js';
import { sqlite, now } from '../db/index.js';

/** A login link is a one-time bearer token, valid for 10 minutes. */
export const LOGIN_LINK_TTL_MS = 10 * 60 * 1000;
const SESSION_DAYS = 7;

const hashToken = token => crypto.createHash('sha256').update(String(token)).digest('hex');

export function createLoginLink(userId, createdBy = null) {
  const token = crypto.randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + LOGIN_LINK_TTL_MS).toISOString();
  sqlite.prepare(`INSERT INTO login_links (id,user_id,token_hash,created_by,created_at,expires_at)
      VALUES (?,?,?,?,?,?)`)
    .run(crypto.randomUUID(), userId, hashToken(token), createdBy, now(), expiresAt);
  return { token, url: `${BETTER_AUTH_URL}/claim/${token}`, expiresAt };
}

/** Claim the token exactly once. Never returns the token again. */
export function consumeLoginLink(token) {
  const row = sqlite.prepare('SELECT * FROM login_links WHERE token_hash=?').get(hashToken(token));
  if (!row) return { error: 'invalid' };
  if (row.used_at) return { error: 'used' };
  if (Date.parse(row.expires_at) < Date.now()) return { error: 'expired' };
  const changed = sqlite.prepare('UPDATE login_links SET used_at=? WHERE id=? AND used_at IS NULL').run(now(), row.id);
  if (!changed.changes) return { error: 'used' };
  return { userId: row.user_id };
}

/** Better Auth-compatible session row; returns the raw session token. */
export function createUserSession(userId, req) {
  const user = sqlite.prepare('SELECT id FROM user WHERE id=?').get(userId);
  if (!user) return null;
  const t = now();
  const token = crypto.randomBytes(24).toString('base64url');
  sqlite.prepare(`INSERT INTO session
      (id,expiresAt,token,createdAt,updatedAt,ipAddress,userAgent,userId,impersonatedBy)
      VALUES (?,?,?,?,?,?,?,?,NULL)`)
    .run(
      crypto.randomUUID(),
      new Date(Date.now() + SESSION_DAYS * 86400000).toISOString(),
      token, t, t,
      String(req.ip || ''),
      String(req.headers['user-agent'] || '').slice(0, 255),
      user.id
    );
  return token;
}

/** Same HMAC scheme Better Auth uses for its signed session cookie. */
export function sessionCookie(token) {
  const secure = COOKIE_SECURE || BETTER_AUTH_URL.startsWith('https://');
  const name = secure ? '__Secure-better-auth.session_token' : 'better-auth.session_token';
  const signature = crypto.createHmac('sha256', BETTER_AUTH_SECRET).update(token).digest('base64');
  let cookie = `${name}=${encodeURIComponent(`${token}.${signature}`)}; Max-Age=${SESSION_DAYS * 86400}; Path=/; HttpOnly; SameSite=Lax`;
  if (COOKIE_DOMAIN) cookie += `; Domain=${COOKIE_DOMAIN}`;
  if (secure) cookie += '; Secure';
  return cookie;
}
