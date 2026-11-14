import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';
import { getMigrations } from 'better-auth/db/migration';
import {
  BETTER_AUTH_URL, BETTER_AUTH_SECRET, COOKIE_DOMAIN,
  ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_DAILY_LIMIT, DEV_LOGIN_HINT, DEV, PORT
} from './config.js';
import { sqlite, ensureProfile, now } from './db/index.js';

const AUTH_BASE = DEV ? `http://localhost:${PORT}` : BETTER_AUTH_URL;
export const auth = betterAuth({
  database: sqlite,
  secret: BETTER_AUTH_SECRET,
  baseURL: AUTH_BASE,
  trustedOrigins: Array.from(new Set([AUTH_BASE, ...(DEV ? [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`] : [])])).filter(Boolean),
  emailAndPassword: { enabled: true, disableSignUp: false },
  plugins: [admin()],
  advanced: {
    useSecureCookies: AUTH_BASE.startsWith('https://'),
    ...(COOKIE_DOMAIN ? { crossSubDomainCookies: { enabled: true, domain: COOKIE_DOMAIN } } : {})
  }
});

export async function migrateAuth() {
  const plan = await getMigrations(auth.options);
  await plan.runMigrations();
}

export async function seedAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('No admin configured. Set ADMIN_EMAIL and ADMIN_PASSWORD.');
    process.exit(1);
  }
  const email = ADMIN_EMAIL.toLowerCase();
  let row = sqlite.prepare('SELECT * FROM user WHERE email=?').get(email);
  if (!row) {
    const created = await auth.api.signUpEmail({ body: { email, password: ADMIN_PASSWORD, name: 'Administrator' } });
    row = sqlite.prepare('SELECT * FROM user WHERE id=?').get(created.user.id);
    sqlite.prepare("UPDATE user SET role='admin', emailVerified=1 WHERE id=?").run(row.id);
    console.log('Created admin:', email, DEV_LOGIN_HINT ? '(dev password: admin1234)' : '');
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
  return row;
}
