import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'book-builder-api-test-'));
const staticDir = fs.mkdtempSync(path.join(os.tmpdir(), 'book-builder-static-test-'));
fs.writeFileSync(path.join(staticDir, 'index.html'), '<!doctype html><html><body><div id="root"></div></body></html>');
process.env.STATIC_DIR = staticDir;
process.env.BETTER_AUTH_SECRET = 'test-secret-0123456789-abcdefghijkl';
process.env.ADMIN_EMAIL = 'admin@test.local';
process.env.ADMIN_PASSWORD = 'test-password-12345';
process.env.LLM_MOCK = '1';

const { migrateAuth } = await import('../src/auth.js');
const { app } = await import('../src/app.js');
const { closeDb } = await import('../src/db/index.js');
const { startWorker, stopWorker } = await import('../src/services/generation.js');

await migrateAuth();
startWorker();
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;

test.after(() => {
  stopWorker();
  server.close();
  closeDb();
});

async function request(pathname, options = {}) {
  return fetch(base + pathname, { redirect: 'manual', ...options });
}

test('health endpoints report readiness', async () => {
  const health = await request('/healthz');
  assert.equal(health.status, 200);
  assert.equal((await health.json()).ok, true);

  const ready = await request('/readyz');
  assert.equal(ready.status, 200);
  assert.equal((await ready.json()).ok, true);
});

test('unauthenticated API calls return JSON 401', async () => {
  for (const pathname of ['/api/me', '/api/sites', '/api/catalog']) {
    const res = await request(pathname);
    assert.equal(res.status, 401, pathname);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal((await res.json()).error, 'unauthorized');
  }
});

test('public sign-up route is blocked', async () => {
  const res = await request('/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'x@y.z', password: 'password12345', name: 'X' }),
  });
  assert.equal(res.status, 403);
  assert.equal((await res.json()).error, 'signup_disabled');
});

test('cross-origin writes are rejected', async () => {
  const res = await request('/api/settings', {
    method: 'PUT',
    headers: { 'content-type': 'application/json', origin: 'https://evil.example' },
    body: '{}',
  });
  assert.equal(res.status, 403);
  assert.equal((await res.json()).error, 'cross_origin');
});

test('SPA fallback carries a nonce-based CSP', async () => {
  const res = await request('/');
  assert.equal(res.status, 200);
  const csp = res.headers.get('content-security-policy') || '';
  assert.match(csp, /script-src 'self' 'nonce-[A-Za-z0-9+/=]+'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.doesNotMatch(csp, /unsafe-eval/);
  assert.match(await res.text(), /<div id="root"><\/div>/);
});

test('unknown API routes stay JSON', async () => {
  const res = await request('/api/does-not-exist');
  assert.equal(res.status, 404);
  assert.equal((await res.json()).error, 'not_found');
});
