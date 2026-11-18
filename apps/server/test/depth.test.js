import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'bindery-depth-'));
process.env.BETTER_AUTH_SECRET = 'test-secret-0123456789';
process.env.LLM_MOCK = '1';

const { mockSite, normalizeSite } = await import('../src/services/generation.js');
const { validateDepth } = await import('../src/services/depth.js');

const req = { title: 'Depth test', topic: 'Limits', description: 'A depth test.', long_text: '# Limits\n# Sequences' };

function site() { return normalizeSite(mockSite(req), req); }

test('the mock book meets the depth contract', () => {
  const result = validateDepth(site());
  assert.equal(result.ok, true, result.issues.map(i => i.message).join('\n'));
});

test('a chapter below its word budget fails', () => {
  const book = site();
  const c = book.sections[0].chapters[0];
  c.theory = c.theory.filter(t => t.type !== 'p').slice(0, 1);
  const result = validateDepth(book);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some(i => i.code === 'chapter.budget'));
  assert.ok(result.budgets[`${book.sections[0].id}/${c.id}`].hu < result.budgets[`${book.sections[0].id}/${c.id}`].budget);
});

test('a term used before its defining chapter fails', () => {
  const book = site();
  const later = book.sections[0].chapters[1].terms[0];
  book.sections[0].chapters[0].theory.push({
    type: 'p', title: { hu: 'Előre', en: 'Ahead' },
    body: { hu: 'Ez a szöveg említi a ' + later.term.hu + ' fogalmat.', en: 'This text mentions ' + later.term.en + ' before it is defined.' }
  });
  const result = validateDepth(book);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some(i => i.code === 'term.beforeDefined'), JSON.stringify(result.issues.slice(0, 3)));
});

test('a glossary gap fails', () => {
  const book = site();
  book.glossary = book.glossary.slice(1);
  const result = validateDepth(book);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some(i => i.code === 'glossary.missing'));
});

test('more than three new terms in one block fails', () => {
  const book = site();
  const c = book.sections[0].chapters[0];
  const termIds = [];
  for (let i = 0; i < 4; i++) {
    const id = 'extra-' + i;
    c.terms.push({ id, term: { hu: 'Extra ' + i, en: 'Extra ' + i }, plain: { hu: 'H', en: 'E' }, precise: { hu: 'H', en: 'E' }, requires: [] });
    termIds.push(id);
  }
  const block = c.theory.find(t => t.type === 'def' || t.type === 'thm');
  block.terms = termIds;
  const result = validateDepth(book);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some(i => i.code === 'block.termCap'));
});

test('a glossary requirement pointing forward fails', () => {
  const book = site();
  const first = book.glossary[0];
  const later = book.glossary[book.glossary.length - 1];
  first.requires = [later.id];
  const result = validateDepth(book);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some(i => i.code === 'term.requires'));
});
