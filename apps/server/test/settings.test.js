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
  assert.equal(settings.chapterConcurrency, 4);
  assert.equal(settings.chapterWordMargin, 1.15);
  assert.equal(settings.budgetTolerance, 0.9);
  assert.equal(settings.huBudgetRatio, 0.8);
  assert.equal(settings.llmMaxTokens, 32000);
});

test('admin updates persist and are clamped to their bounds', () => {
  updateSettings({
    maxBookChapters: 48, chapterBatchSize: 3, chapterConcurrency: 6,
    chapterWordMargin: 1.25, budgetTolerance: 0.85, huBudgetRatio: 0.75, llmMaxTokens: 64000
  });
  assert.deepEqual(getSettings(), {
    maxBookChapters: 48, chapterBatchSize: 3, chapterConcurrency: 6,
    chapterWordMargin: 1.25, budgetTolerance: 0.85, huBudgetRatio: 0.75, llmMaxTokens: 64000
  });

  updateSettings({
    maxBookChapters: 999, chapterBatchSize: 0, chapterConcurrency: 99,
    chapterWordMargin: 9, budgetTolerance: 0, huBudgetRatio: 99, llmMaxTokens: 10
  });
  assert.deepEqual(getSettings(), {
    maxBookChapters: 180, chapterBatchSize: 1, chapterConcurrency: 8,
    chapterWordMargin: 1.5, budgetTolerance: 0.5, huBudgetRatio: 1, llmMaxTokens: 2048
  });
});

test('settings metadata exposes the editable bounds', () => {
  assert.deepEqual(settingsMeta().chapterBatchSize, { min: 1, max: 4, default: 1, step: 1 });
  assert.deepEqual(settingsMeta().chapterConcurrency, { min: 1, max: 8, default: 4, step: 1 });
  assert.deepEqual(settingsMeta().chapterWordMargin, { min: 1, max: 1.5, default: 1.15, step: 0.05 });
  assert.deepEqual(settingsMeta().budgetTolerance, { min: 0.5, max: 1, default: 0.9, step: 0.05 });
  assert.deepEqual(settingsMeta().huBudgetRatio, { min: 0.5, max: 1, default: 0.8, step: 0.05 });
  assert.deepEqual(settingsMeta().maxBookChapters, { min: 8, max: 180, default: 90, step: 1 });
});
