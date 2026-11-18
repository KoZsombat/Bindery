import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'book-builder-settings-'));

const { getSettings, updateSettings, settingsMeta } = await import('../src/db/index.js');

test('generation caps default from configuration', () => {
  const settings = getSettings();
  assert.equal(settings.maxBookChapters, 90);
  assert.equal(settings.chapterBatchSize, 1);
  assert.equal(settings.llmMaxTokens, 32000);
});

test('admin updates persist and are clamped to their bounds', () => {
  updateSettings({ maxBookChapters: 48, chapterBatchSize: 3, llmMaxTokens: 64000 });
  assert.deepEqual(getSettings(), { maxBookChapters: 48, chapterBatchSize: 3, llmMaxTokens: 64000 });

  updateSettings({ maxBookChapters: 999, chapterBatchSize: 0, llmMaxTokens: 10 });
  assert.deepEqual(getSettings(), { maxBookChapters: 180, chapterBatchSize: 1, llmMaxTokens: 2048 });
});

test('settings metadata exposes the editable bounds', () => {
  assert.deepEqual(settingsMeta().chapterBatchSize, { min: 1, max: 4, default: 1 });
  assert.deepEqual(settingsMeta().maxBookChapters, { min: 8, max: 180, default: 90 });
});
