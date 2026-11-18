#!/usr/bin/env node
/**
 * Depth-contract validator for one generated book.
 *
 * Usage:
 *   node apps/server/scripts/verify-depth.mjs path/to/site.json
 *   node apps/server/scripts/verify-depth.mjs path/to/site.json --quiet
 *
 * Exit codes: 0 = passes, 1 = depth issues, 2 = unreadable/legacy input.
 * Schema version 1 books predate the depth contract; they are reported as
 * legacy and skipped (they still render, but cannot pass the new gates).
 */
import fs from 'node:fs';
import { validateDepth } from '../src/services/depth.js';
import { LIMITS } from '../src/limits.js';

const file = process.argv[2];
const quiet = process.argv.includes('--quiet');
if (!file) {
  console.error('Usage: node apps/server/scripts/verify-depth.mjs <site.json> [--quiet]');
  process.exit(2);
}
let site;
try {
  site = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (e) {
  console.error('Cannot read ' + file + ': ' + e.message);
  process.exit(2);
}
if (!site || !Array.isArray(site.sections)) {
  console.error('Not a site.json: missing sections.');
  process.exit(2);
}
if (Number(site.version) < 2) {
  console.error(`Schema version ${site.version || 1} is legacy: the depth contract does not apply. The book still renders.`);
  process.exit(2);
}

const result = validateDepth(site);
const rows = Object.entries(result.budgets);
if (!quiet) {
  console.log(`Book: ${site.title}`);
  console.log(`Schema: v${site.version} · chapters: ${rows.length} · glossary terms: ${(site.glossary || []).length}`);
  console.log('');
  console.log('chapter'.padEnd(26) + 'terms'.padStart(7) + 'budget'.padStart(8) + 'HU'.padStart(8) + 'EN'.padStart(8));
  for (const [key, b] of rows) {
    console.log(key.padEnd(26) + String(b.terms).padStart(7) + String(b.budget).padStart(8) +
      String(b.hu).padStart(8) + String(b.en).padStart(8) + (b.hu < b.budget || b.en < b.budget ? '  ← below budget' : ''));
  }
  console.log('');
}
if (result.ok) {
  console.log(`OK: ${rows.length} chapters pass the depth contract (min ${LIMITS.depth.minChapterWords} words + ${LIMITS.depth.wordsPerNewTerm}/new term, ≤ ${LIMITS.depth.maxNewTermsPerBlock} new terms per block).`);
  process.exit(0);
}
console.error(`FAIL: ${result.issues.length} depth issue(s)`);
for (const issue of result.issues.slice(0, 40)) {
  console.error(` - [${issue.code}] ${issue.message}`);
}
if (result.issues.length > 40) console.error(`   … ${result.issues.length - 40} more`);
process.exit(1);
