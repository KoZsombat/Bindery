import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SITE_OPTIONS, optionsPrompt, parseSiteOptions } from '../src/site-options.js';

test('defaults reproduce the current skill', () => {
  const parsed = parseSiteOptions({});
  assert.deepEqual(parsed, DEFAULT_SITE_OPTIONS);
  assert.equal(parsed.purpose, 'exam');
  assert.equal(parsed.level, 'undergrad');
  assert.equal(parsed.assessment, 'mixed');
  assert.equal(parsed.balance, 'balanced');
  assert.equal(parsed.sources, 'only');
  assert.equal(parsed.domain, 'math');
  assert.equal(parsed.tone, 'textbook');
  assert.equal(parsed.examples, 'one');
  assert.equal(parsed.minutes, 40);
  assert.equal(parsed.customInstructions, '');
});

test('bad or partial input falls back to defaults without throwing', () => {
  assert.deepEqual(parseSiteOptions('not json'), DEFAULT_SITE_OPTIONS);
  assert.deepEqual(parseSiteOptions({ purpose: 'nonsense', minutes: 999 }), DEFAULT_SITE_OPTIONS);
  assert.equal(parseSiteOptions({ purpose: 'course' }).purpose, 'course');
  assert.equal(parseSiteOptions({ minutes: '25' }).minutes, 25);
});

test('prompt carries the chosen options and user instructions last', () => {
  const text = optionsPrompt({
    purpose: 'course',
    level: 'beginner',
    assessment: 'mcq',
    domain: 'programming',
    customInstructions: 'Use my professor notation and skip Cyrillic.',
  });
  assert.match(text, /course companion/i);
  assert.match(text, /no prior knowledge/i);
  assert.match(text, /multiple choice/i);
  assert.match(text, /fenced code blocks/i);
  assert.match(text, /USER CUSTOM INSTRUCTIONS/);
  assert.match(text, /professor notation/);
  // The custom block comes after the structured options.
  assert.ok(text.indexOf('USER CUSTOM INSTRUCTIONS') > text.indexOf('- Domain:'));
});

test('time estimate covers checks and scales with chapters and options', async () => {
  const { estimateGeneration } = await import('../src/limits.js');
  const a = estimateGeneration({ chapters: 12, concurrency: 4, options: {} });
  assert.ok(a.minMs > 0 && a.maxMs > a.minMs);
  assert.ok(a.minutes === undefined);
  assert.ok(a.includesChecks);
  // 12 chapters at 4 workers should be tens of minutes, not "12 × 1 minute".
  assert.ok(a.minMs / 60000 >= 8, `too small: ${a.minMs / 60000} min`);
  assert.ok(a.maxMs / 60000 <= 60, `too large: ${a.maxMs / 60000} min`);

  const heavy = estimateGeneration({ chapters: 12, concurrency: 4, options: { examples: 'three', balance: 'practice' } });
  assert.ok(heavy.totalMs > a.totalMs);

  const calibrated = estimateGeneration({ chapters: 20, concurrency: 4, perChapterWallMs: 240000 });
  assert.ok(calibrated.calibrated);
  assert.ok(calibrated.totalMs > estimateGeneration({ chapters: 10, concurrency: 4, perChapterWallMs: 240000 }).totalMs);
});
