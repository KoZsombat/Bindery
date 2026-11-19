import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'book-builder-recovery-test-'));
process.env.BETTER_AUTH_SECRET = 'test-secret-0123456789-abcdefghijkl';
process.env.ENCRYPTION_KEY = 'test-encryption-key-0123456789-abcdef';
process.env.LLM_MOCK = '1';

const { closeDb, now, sqlite } = await import('../src/db/index.js');
const { recoverJobs } = await import('../src/services/generation.js');
const { MAX_JOB_ATTEMPTS } = await import('../src/config.js');

test.after(() => closeDb());

function seedInterruptedJob(attempts) {
  const t = now();
  const lockedAt = new Date(Date.now() - 60_000).toISOString();
  const site = sqlite.prepare(
    'INSERT INTO sites (owner_id,slug,title,status,error,created_at,updated_at) VALUES (?,?,?,?,?,?,?)'
  ).run('user-1', `slug-${Math.random().toString(36).slice(2)}`, 'Interrupted', 'running', '', t, t);
  const job = sqlite.prepare(
    'INSERT INTO jobs (site_id,status,attempts,locked_at,created_at,updated_at) VALUES (?,?,?,?,?,?)'
  ).run(site.lastInsertRowid, 'running', attempts, lockedAt, t, t);
  return { siteId: site.lastInsertRowid, jobId: job.lastInsertRowid };
}

test('startup recovery resumes an interrupted job without burning retries', () => {
  const { siteId, jobId } = seedInterruptedJob(MAX_JOB_ATTEMPTS);

  const resumed = recoverJobs(0, { resetAttempts: true });
  assert.ok(resumed >= 1);

  const job = sqlite.prepare('SELECT * FROM jobs WHERE id=?').get(jobId);
  assert.equal(job.status, 'queued');
  assert.equal(job.attempts, 0);
  assert.equal(job.locked_at, null);

  const site = sqlite.prepare('SELECT * FROM sites WHERE id=?').get(siteId);
  assert.equal(site.status, 'queued');
  assert.equal(site.error, '');
});

test('a runtime lease expiry still fails a job that exhausted its retries', () => {
  const { siteId, jobId } = seedInterruptedJob(MAX_JOB_ATTEMPTS);

  recoverJobs(0);

  const job = sqlite.prepare('SELECT * FROM jobs WHERE id=?').get(jobId);
  assert.equal(job.status, 'failed');
  const site = sqlite.prepare('SELECT * FROM sites WHERE id=?').get(siteId);
  assert.equal(site.status, 'failed');
});
