import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'book-builder-i18n-test-'));

const { sqlite, backfillSiteI18n, publicSite, closeDb } = await import('../src/db/index.js');

const sitesDir = path.join(process.env.DATA_DIR, 'sites');
const t = new Date().toISOString();
const insert = sqlite.prepare(`INSERT INTO sites
  (owner_id,slug,title,description,status,published,created_at,updated_at)
  VALUES (?,?,?,?,'ready',1,?,?)`);

function writeSite(slug, book) {
  fs.mkdirSync(path.join(sitesDir, slug), { recursive: true });
  fs.writeFileSync(path.join(sitesDir, slug, 'site.json'), JSON.stringify(book));
}

test.after(() => closeDb());

test('legacy single-language titles are paired with the request title', () => {
  insert.run('owner', 'legacy-hu', 'English request title', 'English description', t, t);
  writeSite('legacy-hu', { title: 'Magyar könyvcím', summary: { hu: 'Összefoglaló.', en: 'Summary.' } });

  insert.run('owner', 'same-language', 'Same title', 'Description', t, t);
  writeSite('same-language', { title: 'Same title' });

  backfillSiteI18n();

  const paired = sqlite.prepare("SELECT title_hu,title_en,summary_hu,summary_en FROM sites WHERE slug='legacy-hu'").get();
  assert.deepEqual(paired, {
    title_hu: 'Magyar könyvcím',
    title_en: 'English request title',
    summary_hu: 'Összefoglaló.',
    summary_en: 'Summary.',
  });

  const same = sqlite.prepare("SELECT title_hu,title_en FROM sites WHERE slug='same-language'").get();
  assert.deepEqual(same, { title_hu: null, title_en: null });

  const site = sqlite.prepare("SELECT * FROM sites WHERE slug='same-language'").get();
  assert.deepEqual(publicSite(site).titleI18n, { hu: 'Same title', en: 'Same title' });
});
