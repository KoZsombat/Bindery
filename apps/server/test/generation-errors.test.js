import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'book-builder-errors-test-'));

const { closeDb, publicSite } = await import('../src/db/index.js');
const { generationErrorCode, friendlyGenerationError } = await import('../src/services/generation-errors.js');

test.after(() => closeDb());

const RAW_JSON = "Chapter 1.1 (halmazok-logika) failed: Could not write chapters 1.1: The reply was not valid JSON (likely truncated): Expected ',' or '}' after property value in JSON at position 67544 (line 757 column 12)";

function site(error) {
  return publicSite({
    id: 1, slug: 'emelt-matek-erettsegi', title: 'Emelt matek', description: '', topic: '', audience: '',
    language: 'both', status: 'failed', published: 1, example: 0, created_at: '', updated_at: '',
    error, archived: 0,
  });
}

test('internal parse failures are classified and never sent to clients', () => {
  assert.equal(generationErrorCode(RAW_JSON), 'model_incomplete');
  assert.equal(generationErrorCode('LLM API 429: slow down'), 'model_rate_limited');
  assert.equal(generationErrorCode('No API key. Add one in Settings.'), 'no_api_key');
  assert.equal(generationErrorCode('something exploded in a very internal way'), 'generation_failed');

  const serialized = site(RAW_JSON);
  assert.equal(serialized.errorCode, 'model_incomplete');
  assert.match(serialized.error, /cut off/);
  for (const leak of ['position', 'JSON', 'halmazok-logika', 'Expected']) {
    assert.ok(!serialized.error.includes(leak), `leaked ${leak}: ${serialized.error}`);
  }
});

test('no error means no error code', () => {
  assert.equal(generationErrorCode(''), '');
  assert.equal(friendlyGenerationError(''), '');
  const serialized = site('');
  assert.equal(serialized.error, '');
  assert.equal(serialized.errorCode, null);
});
