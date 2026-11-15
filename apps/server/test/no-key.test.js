import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';

process.env.NODE_ENV = 'production';
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'book-builder-nokey-test-'));
process.env.BETTER_AUTH_SECRET = 'test-secret-0123456789-abcdefghijkl';
process.env.ENCRYPTION_KEY = 'test-encryption-key-0123456789-abcdef';
process.env.ADMIN_EMAIL = 'admin@test.local';
process.env.ADMIN_PASSWORD = 'test-password-12345';
process.env.BETTER_AUTH_URL = 'http://127.0.0.1:18090';
process.env.COOKIE_SECURE = '0';
process.env.LLM_MOCK = '0';

const { migrateAuth, seedAdmin } = await import('../src/auth.js');
const { app } = await import('../src/app.js');
const { closeDb } = await import('../src/db/index.js');

await migrateAuth();
await seedAdmin();
const server = app.listen(18090, '127.0.0.1');
await once(server, 'listening');
const base = 'http://127.0.0.1:18090';

test.after(() => {
  server.close();
  closeDb();
});

test('production requires each user to bring a key', async () => {
  const login = await fetch(base + '/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({ email: 'admin@test.local', password: 'test-password-12345' }),
  });
  assert.equal(login.status, 200);
  const cookie = (login.headers.getSetCookie ? login.headers.getSetCookie() : []).map(c => c.split(';')[0]).join('; ');

  const me = await fetch(base + '/api/me', { headers: { cookie } });
  assert.equal(me.status, 200);
  const body = await me.json();
  assert.equal(body.profile.hasKey, false);
  assert.equal(body.mock, false);

  const create = await fetch(base + '/api/sites', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base, cookie },
    body: JSON.stringify({ title: 'Needs a key', topic: 'Needs a key', force: true }),
  });
  assert.equal(create.status, 400);
  assert.equal((await create.json()).error, 'no_api_key');
});
