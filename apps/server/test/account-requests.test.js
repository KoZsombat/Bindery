import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';

process.env.NODE_ENV = 'production';
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'book-builder-requests-test-'));
process.env.BETTER_AUTH_SECRET = 'test-secret-0123456789-abcdefghijkl';
process.env.ENCRYPTION_KEY = 'test-encryption-key-0123456789-abcdef';
process.env.ADMIN_EMAIL = 'admin@test.local';
process.env.ADMIN_PASSWORD = 'test-password-12345';
process.env.BETTER_AUTH_URL = 'http://127.0.0.1:18093';
process.env.COOKIE_SECURE = '0';
process.env.LLM_MOCK = '0';

const { migrateAuth, seedAdmin } = await import('../src/auth.js');
const { app } = await import('../src/app.js');
const { closeDb } = await import('../src/db/index.js');

await migrateAuth();
await seedAdmin();
const server = app.listen(18093, '127.0.0.1');
await once(server, 'listening');
const base = 'http://127.0.0.1:18093';

test.after(() => {
  server.close();
  closeDb();
});

async function login(email, password) {
  const res = await fetch(base + '/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(res.status, 200);
  return (res.headers.getSetCookie ? res.headers.getSetCookie() : []).map(c => c.split(';')[0]).join('; ');
}

function headers(cookie) {
  return { 'content-type': 'application/json', origin: base, cookie };
}

test('anyone can request an account without signing in', async () => {
  const body = {
    name: 'Bence',
    about: 'BME calculus study group, we met at the library.',
    contact: 'discord: bence_42',
  };
  const created = await fetch(base + '/api/account-requests', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify(body),
  });
  assert.equal(created.status, 201);
  assert.deepEqual(await created.json(), { ok: true });

  // Same person asking twice stays a single pending request.
  const duplicate = await fetch(base + '/api/account-requests', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify(body),
  });
  assert.equal(duplicate.status, 201);

  const invalid = await fetch(base + '/api/account-requests', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({ name: 'Bence', about: '', contact: '' }),
  });
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).error, 'invalid_input');
});

test('only the admin sees and handles account requests', async () => {
  const anonymous = await fetch(base + '/api/admin/account-requests');
  assert.equal(anonymous.status, 403);

  const admin = await login('admin@test.local', 'test-password-12345');
  const listed = await fetch(base + '/api/admin/account-requests', { headers: { cookie: admin } });
  assert.equal(listed.status, 200);
  const { requests, pendingCount } = await listed.json();
  assert.equal(pendingCount, 1);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].name, 'Bence');
  assert.equal(requests[0].about, 'BME calculus study group, we met at the library.');
  assert.equal(requests[0].contact, 'discord: bence_42');
  assert.equal(requests[0].status, 'pending');

  const handled = await fetch(base + `/api/admin/account-requests/${requests[0].id}`, {
    method: 'PATCH',
    headers: headers(admin),
    body: JSON.stringify({ status: 'handled' }),
  });
  assert.equal(handled.status, 200);
  const afterHandle = await (await fetch(base + '/api/admin/account-requests', { headers: { cookie: admin } })).json();
  assert.equal(afterHandle.pendingCount, 0);
  assert.equal(afterHandle.requests[0].status, 'handled');

  const removed = await fetch(base + `/api/admin/account-requests/${requests[0].id}`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json', origin: base, cookie: admin },
  });
  assert.equal(removed.status, 200);
  const empty = await (await fetch(base + '/api/admin/account-requests', { headers: { cookie: admin } })).json();
  assert.deepEqual(empty, { requests: [], pendingCount: 0 });
});
