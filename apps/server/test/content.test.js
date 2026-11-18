import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'book-builder-test-'));
process.env.BETTER_AUTH_SECRET = 'test-secret-0123456789';
process.env.LLM_MOCK = '1';

const { normalizeSite, mockSite, validateSite } = await import('../src/services/generation.js');
const { slugify } = await import('../src/db/index.js');

const req = { title: 'Algebra', topic: 'Linear equations', description: 'A short course.', long_text: 'Solve for x.' };

test('slugify produces a stable route segment', () => {
  assert.equal(slugify('Lineáris egyenletek'), 'linearis-egyenletek');
  assert.equal(slugify('  '), 'site');
});

test('mock site survives normalization and schema validation', () => {
  const site = normalizeSite(mockSite(req), req);
  const result = validateSite(site);
  assert.equal(result.ok, true, result.error);
  assert.equal(site.version, 2);
  assert.ok(site.glossary.length > 0);
  assert.equal(site.sections[0].chapters[0].exercises.find(q => q.type === 'number').a, '4');
});

test('schema rejects a chapter with no exercises', () => {
  const site = normalizeSite(mockSite(req), req);
  site.sections[0].chapters[0].exercises = [];
  const result = validateSite(site);
  assert.equal(result.ok, false);
  assert.match(result.error, /exercises/);
});

test('schema rejects a bilingual field missing one language', () => {
  const site = normalizeSite(mockSite(req), req);
  site.sections[0].title.en = '';
  const result = validateSite(site);
  assert.equal(result.ok, false);
  assert.match(result.error, /title\.en/);
});

test('schema rejects an empty answer unless the exercise is a proof', () => {
  const site = normalizeSite(mockSite(req), req);
  site.sections[0].chapters[0].exercises[0].a = '';
  assert.equal(validateSite(site).ok, false);
  site.sections[0].chapters[0].exercises[0].type = 'proof';
  assert.equal(validateSite(site).ok, true);
});

test('generated app checks answers without eval (CSP has no unsafe-eval)', () => {
  const src = fs.readFileSync(new URL('../src/template/app.js', import.meta.url), 'utf8');
  assert.equal(/\bFunction\s*\(|\beval\s*\(/.test(src), false);
});
