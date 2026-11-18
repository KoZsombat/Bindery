import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';

process.env.NODE_ENV = 'production';
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'book-builder-share-test-'));
process.env.BETTER_AUTH_SECRET = 'test-secret-0123456789-abcdefghijkl';
process.env.ENCRYPTION_KEY = 'test-encryption-key-0123456789-abcdef';
process.env.ADMIN_EMAIL = 'admin@test.local';
process.env.ADMIN_PASSWORD = 'test-password-12345';
process.env.BETTER_AUTH_URL = 'http://127.0.0.1:18091';
process.env.COOKIE_SECURE = '0';
process.env.LLM_MOCK = '0';

const { migrateAuth, seedAdmin } = await import('../src/auth.js');
const { app } = await import('../src/app.js');
const { closeDb, ensureProfile, sqlite } = await import('../src/db/index.js');
const { effectiveProfile, keySource, llmConfig } = await import('../src/services/generation.js');

await migrateAuth();
await seedAdmin();
const server = app.listen(18091, '127.0.0.1');
await once(server, 'listening');
const base = 'http://127.0.0.1:18091';

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

const OWNER_KEY = 'sk-owner-secret-0123456789';

test('a shared key is usable by the grantee and never exposed', async () => {
  const admin = await login('admin@test.local', 'test-password-12345');

  const created = await fetch(base + '/api/admin/users', {
    method: 'POST',
    headers: headers(admin),
    body: JSON.stringify({ email: 'grantee@test.local', password: 'grantee-password-123' }),
  });
  assert.equal(created.status, 201);
  const granteeId = (await created.json()).user.id;

  // No own key yet: sharing must be rejected.
  const early = await fetch(base + '/api/settings/shares', {
    method: 'POST',
    headers: headers(admin),
    body: JSON.stringify({ email: 'grantee@test.local' }),
  });
  assert.equal(early.status, 400);
  assert.equal((await early.json()).error, 'no_api_key');

  const saved = await fetch(base + '/api/settings', {
    method: 'PUT',
    headers: headers(admin),
    body: JSON.stringify({ apiBase: 'https://1.1.1.1/v1', apiModel: 'test-model', apiKey: OWNER_KEY }),
  });
  assert.equal(saved.status, 200);

  const shared = await fetch(base + '/api/settings/shares', {
    method: 'POST',
    headers: headers(admin),
    body: JSON.stringify({ email: 'grantee@test.local' }),
  });
  assert.equal(shared.status, 201);
  const sharedBody = await shared.json();
  assert.equal(sharedBody.shares.outgoing.length, 1);
  assert.equal(sharedBody.shares.outgoing[0].grantee.email, 'grantee@test.local');
  assert.doesNotMatch(JSON.stringify(sharedBody), /sk-owner-secret/);

  const grantee = await login('grantee@test.local', 'grantee-password-123');
  const meRes = await fetch(base + '/api/me', { headers: { cookie: grantee } });
  const meText = await meRes.text();
  assert.doesNotMatch(meText, /sk-owner-secret/);
  const me = JSON.parse(meText);
  assert.equal(me.profile.hasKey, false);
  assert.equal(me.profile.keySource, 'shared');
  assert.equal(me.profile.sharedBy.email, 'admin@test.local');
  assert.equal(me.profile.canGenerate, true);

  // The grantee's effective config resolves to the owner's key server-side.
  const cfg = llmConfig(effectiveProfile(ensureProfile(granteeId)));
  assert.equal(cfg.key, OWNER_KEY);
  assert.equal(cfg.base, 'https://1.1.1.1/v1');
  assert.equal(cfg.model, 'test-model');

  // The grantee sees the grant and can cancel it from their side.
  const incomingRes = await fetch(base + '/api/settings/shares', { headers: { cookie: grantee } });
  const incoming = await incomingRes.json();
  assert.equal(incoming.shares.incoming.length, 1);
  assert.equal(incoming.shares.incoming[0].owner.email, 'admin@test.local');
  assert.equal(incoming.shares.incoming[0].active, true);

  const revoke = await fetch(base + '/api/settings/shares/' + incoming.shares.incoming[0].id, {
    method: 'DELETE',
    headers: headers(grantee),
  });
  assert.equal(revoke.status, 200);
  assert.equal((await revoke.json()).shares.incoming.length, 0);
  assert.equal(keySource(ensureProfile(granteeId)).kind, 'none');

  // Without a key again, generation is refused.
  const denied = await fetch(base + '/api/sites', {
    method: 'POST',
    headers: headers(grantee),
    body: JSON.stringify({ title: 'Shared key gone', topic: 'Shared key gone', force: true }),
  });
  assert.equal(denied.status, 400);
  assert.equal((await denied.json()).error, 'no_api_key');

  // Owner can grant again and revoke from their side.
  const regrant = await fetch(base + '/api/settings/shares', {
    method: 'POST',
    headers: headers(admin),
    body: JSON.stringify({ email: 'grantee@test.local' }),
  });
  assert.equal(regrant.status, 201);
  const outgoing = (await regrant.json()).shares.outgoing;
  assert.equal(outgoing.length, 1);
  const ownerRevoke = await fetch(base + '/api/settings/shares/' + outgoing[0].id, {
    method: 'DELETE',
    headers: headers(admin),
  });
  assert.equal(ownerRevoke.status, 200);
  assert.equal(keySource(ensureProfile(granteeId)).kind, 'none');
});

test('an own key wins over any shared key', async () => {
  const admin = await login('admin@test.local', 'test-password-12345');
  const created = await fetch(base + '/api/admin/users', {
    method: 'POST',
    headers: headers(admin),
    body: JSON.stringify({ email: 'own@test.local', password: 'own-password-12345' }),
  });
  assert.equal(created.status, 201);
  const ownId = (await created.json()).user.id;

  await fetch(base + '/api/settings/shares', {
    method: 'POST',
    headers: headers(admin),
    body: JSON.stringify({ email: 'own@test.local' }),
  });

  const own = await login('own@test.local', 'own-password-12345');
  const saved = await fetch(base + '/api/settings', {
    method: 'PUT',
    headers: headers(own),
    body: JSON.stringify({ apiBase: 'https://1.1.1.1/v1', apiModel: 'own-model', apiKey: 'sk-own-key-0123456789' }),
  });
  assert.equal(saved.status, 200);

  const source = keySource(ensureProfile(ownId));
  assert.equal(source.kind, 'own');
  const cfg = llmConfig(effectiveProfile(ensureProfile(ownId)));
  assert.equal(cfg.key, 'sk-own-key-0123456789');
  assert.equal(cfg.model, 'own-model');
});

test('admins list every site with its owner', async () => {
  const admin = await login('admin@test.local', 'test-password-12345');
  const created = await fetch(base + '/api/admin/users', {
    method: 'POST',
    headers: headers(admin),
    body: JSON.stringify({ email: 'list@test.local', password: 'list-password-12345' }),
  });
  assert.equal(created.status, 201);
  const userId = (await created.json()).user.id;
  const t = new Date().toISOString();
  sqlite.prepare(`INSERT INTO sites
      (owner_id,slug,title,description,topic,audience,language,status,published,source_text,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(userId, 'admin-list-check', 'Other user site', '', '', '', 'both', 'ready', 0, '', t, t);

  const adminSites = await (await fetch(base + '/api/sites', { headers: { cookie: admin } })).json();
  const row = adminSites.sites.find(site => site.slug === 'admin-list-check');
  assert.ok(row, 'admin sees another user site');
  assert.equal(row.ownerEmail, 'list@test.local');

  const user = await login('list@test.local', 'list-password-12345');
  const userSites = await (await fetch(base + '/api/sites', { headers: { cookie: user } })).json();
  assert.ok(userSites.sites.some(site => site.slug === 'admin-list-check'));
  assert.equal(userSites.sites.find(site => site.slug === 'admin-list-check').ownerEmail, undefined);
});
