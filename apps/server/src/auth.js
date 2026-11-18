import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';
import { getMigrations } from 'better-auth/db/migration';
import {
  BETTER_AUTH_URL, BETTER_AUTH_SECRET, COOKIE_DOMAIN, COOKIE_SECURE,
  ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_DAILY_LIMIT, DEV_LOGIN_HINT, DEV
} from './config.js';
import { sqlite, ensureProfile, now } from './db/index.js';

export const AUTH_BASE = BETTER_AUTH_URL;

const trustedOrigins = Array.from(new Set([
  AUTH_BASE,
  ...(DEV ? [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
  ] : []),
])).filter(Boolean);

export const auth = betterAuth({
  database: sqlite,
  secret: BETTER_AUTH_SECRET,
  baseURL: AUTH_BASE,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    // Public sign-up is blocked at the HTTP route; the admin creates users server-side.
    disableSignUp: false,
    minPasswordLength: 10,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 120,
    customRules: {
      '/sign-in/email': { window: 900, max: 10 },
      '/sign-up/email': { window: 900, max: 5 },
      '/request-password-reset': { window: 900, max: 5 },
    },
  },
  plugins: [admin()],
  advanced: {
    useSecureCookies: COOKIE_SECURE || AUTH_BASE.startsWith('https://'),
    ipAddress: { ipAddressHeaders: ['x-forwarded-for'] },
    ...(COOKIE_DOMAIN ? { crossSubDomainCookies: { enabled: true, domain: COOKIE_DOMAIN } } : {}),
  },
});

export async function migrateAuth() {
  const plan = await getMigrations(auth.options);
  await plan.runMigrations();
}

export async function seedAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('No admin configured. Set ADMIN_EMAIL and ADMIN_PASSWORD.');
  }
  const email = ADMIN_EMAIL.toLowerCase();
  let row = sqlite.prepare('SELECT * FROM user WHERE email=?').get(email);
  if (!row) {
    const created = await auth.api.signUpEmail({ body: { email, password: ADMIN_PASSWORD, name: 'Administrator' } });
    row = sqlite.prepare('SELECT * FROM user WHERE id=?').get(created.user.id);
    sqlite.prepare("UPDATE user SET role='admin', emailVerified=1 WHERE id=?").run(row.id);
    console.log('Created admin:', email, DEV_LOGIN_HINT ? '(dev password: admin12345)' : '');
  } else if (row.role !== 'admin') {
    sqlite.prepare("UPDATE user SET role='admin' WHERE id=?").run(row.id);
  }
  ensureProfile(row.id, ADMIN_DAILY_LIMIT);
  if (!sqlite.prepare("SELECT 1 FROM sites WHERE slug='matekbazis-example'").get()) {
    sqlite.prepare(`INSERT INTO sites (owner_id,slug,title,description,topic,audience,language,status,published,example,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      row.id, 'matekbazis-example',
      'MatekBázis — BME VIK first-semester mathematics',
      'A complete, fully bilingual example built with the learning-book-site skill: 34 chapters, 266 exercises, generated banks, daily quests and an error notebook.',
      'BME VIK mathematics', 'first-year BSc', 'both', 'ready', 1, 1, now(), now()
    );
  }
  sqlite.prepare(`UPDATE sites SET title_hu=?,title_en=?,summary_hu=?,summary_en=?
      WHERE slug='matekbazis-example' AND title_hu IS NULL`).run(
    'MatekBázis — BME VIK első féléves matematika',
    'MatekBázis — BME VIK first-semester mathematics',
    'Teljesen kétnyelvű példaprojekt a learning-book-site készséggel: 34 fejezet, 266 feladat, generált feladatbankok, napi küldetések és hibafüzet.',
    'A complete, fully bilingual example built with the learning-book-site skill: 34 chapters, 266 exercises, generated banks, daily quests and an error notebook.'
  );
  return row;
}
