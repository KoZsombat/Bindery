/* Bilingual coverage validator.
   Run: node site/tools/validate-bilingual.js
   Exits non-zero on missing overlays, shape mismatches, changed answers or Hungarian prose. */
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const contentDir = path.join(root, 'content');
const enDir = path.join(contentDir, '_en');

function makeMB() {
  const MB = {
    sections: [], formulas: [], videos: [], examBank: [], enContent: {}, glossary: [],
    section: s => MB.sections.push(s),
    def: (title, body) => ({ t: 'def', title, body }),
    thm: (title, body) => ({ t: 'thm', title, body }),
    note: (title, body) => ({ t: 'note', title, body }),
    warn: (title, body) => ({ t: 'warn', title, body }),
    formula: (title, latex, note) => ({ t: 'formula', title, latex, note }),
    p: body => ({ t: 'p', body }),
    list: (title, items) => ({ t: 'list', title, items }),
    example: o => o,
    q: o => Object.assign({ level: 1, type: 'expr' }, o),
    video: o => o
  };
  return MB;
}

function load(files, MB) {
  const ctx = vm.createContext({ MB, window: { MB }, console, String });
  for (const f of files) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
}
function numbered(dir, re) {
  return fs.readdirSync(dir).filter(f => re.test(f)).sort();
}

const MB = makeMB();
load(numbered(contentDir, /^\d{2}-.*\.js$/).map(f => path.join(contentDir, f)), MB);
load([path.join(contentDir, '_glossary.js'), path.join(contentDir, '_formulas.js'), path.join(contentDir, '_videos.js')].filter(fs.existsSync), MB);
load(numbered(enDir, /^\d{2}-.*\.js$/).map(f => path.join(enDir, f)), MB);
load([path.join(enDir, '_formulas.js'), path.join(enDir, '_videos.js')].filter(fs.existsSync), MB);

const errors = [];
const warnings = [];
const fail = m => errors.push(m);
const warn = m => warnings.push(m);

const HUNGARIAN = /\b(és|hogy|nem|van|vagy|minden|létezik|egy|az|meg|csak|már|még|kell|lehet|olyan|amely|illetve|szám|függvény|határérték|derivált|integrál|sorozat|valós|halmaz|egyenlet|fejezet|rész|feladat)\b/i;
const ALLOW = /k(z|ö)zépszintű érettségi|\bZH1?\b|\bZH2\b|\bvizsga\b|BME|VIK|Felsőfok|Szabó Tamás/i;
function checkText(where, value) {
  if (typeof value !== 'string' || !value.trim()) return;
  const stripped = value.replace(ALLOW, ' ');
  if (HUNGARIAN.test(stripped) && !/Hungarian-language search|Search terms \(Hungarian\)/i.test(value)) fail('Hungarian word in ' + where + ': ' + JSON.stringify(value.slice(0, 120)));
  if (/[őű]/i.test(stripped) && !/Hungarian-language search|Search terms \(Hungarian\)/i.test(value)) fail('Hungarian character in ' + where + ': ' + JSON.stringify(value.slice(0, 120)));
  const dollars = (value.match(/\$/g) || []).length;
  if (dollars % 2) fail('unbalanced $ in ' + where + ': ' + JSON.stringify(value.slice(0, 120)));
}
function checkField(where, hu, en) {
  if (en === undefined || en === null) {
    if (String(hu == null ? '' : hu).trim()) fail('missing translation in ' + where);
    return;
  }
  if (typeof en === 'string') {
    if (!en.trim()) {
      if (String(hu == null ? '' : hu).trim()) fail('empty translation in ' + where);
      return;
    }
    const huDollars = (String(hu).match(/\$/g) || []).length;
    const enDollars = (en.match(/\$/g) || []).length;
    if (huDollars !== enDollars) warn('math segment count differs in ' + where + ' (' + huDollars + ' vs ' + enDollars + ')');
    checkText(where, en);
  }
}

let chapters = 0, exercises = 0;
for (const s of MB.sections) {
  if (!s.chapters || !s.chapters.length) fail('section without chapters: ' + s.id);
  for (const c of s.chapters) {
    chapters++;
    const key = s.id + '/' + c.id;
    const e = MB.enContent[key];
    if (!e) { fail('missing overlay: ' + key); continue; }
    for (const k of ['title', 'lead', 'summary', 'when']) checkField(key + '.' + k, c[k], e[k]);
    /* Optional depth fields (generated books and future example content). */
    if (c.terms) {
      if (!e.terms || e.terms.length !== c.terms.length) fail('terms length: ' + key);
      (c.terms || []).forEach((t, i) => {
        const x = (e.terms || [])[i] || {};
        checkField(key + '.terms[' + i + '].term', t.term, x.term || t.term);
        checkField(key + '.terms[' + i + '].plain', t.plain, x.plain || t.plain);
        checkField(key + '.terms[' + i + '].precise', t.precise, x.precise || t.precise);
      });
    }
    if (c.refresher) {
      if (!e.refresher || e.refresher.length !== c.refresher.length) fail('refresher length: ' + key);
      (c.refresher || []).forEach((r, i) => checkField(key + '.refresher[' + i + ']', r.label, (e.refresher || [])[i] && e.refresher[i].label));
    }
    if (c.recap) {
      if (!e.recap || !e.recap.points || e.recap.points.length !== ((c.recap.points || []).length)) fail('recap length: ' + key);
      checkField(key + '.recap.next', c.recap.next, e.recap && e.recap.next);
    }
    if (c.checks) {
      if (!e.checks || e.checks.length !== c.checks.length) fail('checks length: ' + key);
      (c.checks || []).forEach((q, i) => {
        const x = (e.checks || [])[i] || {};
        checkField(key + '.checks[' + i + '].q', q.q, x.q || q.q);
        checkField(key + '.checks[' + i + '].a', q.a, x.a || q.a);
      });
    }
    if ((c.why || []).length && (!e.why || e.why.length !== (c.why || []).length)) fail('why length: ' + key);
    (e.why || []).forEach((x, i) => checkField(key + '.why[' + i + ']', (c.why || [])[i], x));

    if ((e.theory || []).length !== (c.theory || []).length) fail('theory length: ' + key);
    (c.theory || []).forEach((t, i) => {
      const x = (e.theory || [])[i];
      if (!x) { fail('missing theory[' + i + ']: ' + key); return; }
      if (['def', 'thm', 'note', 'warn'].includes(t.t)) {
        checkField(key + '.theory[' + i + '].title', t.title, x.title);
        checkField(key + '.theory[' + i + '].body', t.body, x.body);
      } else if (t.t === 'formula') {
        checkField(key + '.theory[' + i + '].title', t.title, x.title);
        checkField(key + '.theory[' + i + '].note', t.note, x.note);
      } else if (t.t === 'p') {
        checkField(key + '.theory[' + i + '].body', t.body, x.body);
      } else if (t.t === 'list') {
        checkField(key + '.theory[' + i + '].title', t.title, x.title);
        if ((x.items || []).length !== (t.items || []).length) fail('list length: ' + key + ' theory[' + i + ']');
        (t.items || []).forEach((it, j) => checkField(key + '.theory[' + i + '].items[' + j + ']', it, (x.items || [])[j]));
      }
    });

    if ((e.examples || []).length !== (c.examples || []).length) fail('examples length: ' + key);
    (c.examples || []).forEach((ex, i) => {
      const x = (e.examples || [])[i];
      if (!x) { fail('missing example[' + i + ']: ' + key); return; }
      for (const k of ['title', 'problem', 'answer']) checkField(key + '.examples[' + i + '].' + k, ex[k], x[k]);
      if ((x.steps || []).length !== (ex.steps || []).length) fail('steps length: ' + key + ' example[' + i + ']');
      (ex.steps || []).forEach((step, j) => checkField(key + '.examples[' + i + '].steps[' + j + ']', step, (x.steps || [])[j]));
    });

    if ((e.mistakes || []).length !== (c.mistakes || []).length) fail('mistakes length: ' + key);
    (c.mistakes || []).forEach((m, i) => checkField(key + '.mistakes[' + i + ']', m, (e.mistakes || [])[i]));

    if ((e.exercises || []).length !== (c.exercises || []).length) fail('exercises length: ' + key);
    (c.exercises || []).forEach((q, i) => {
      exercises++;
      const x = (e.exercises || [])[i];
      if (!x) { fail('missing exercise[' + i + ']: ' + key); return; }
      checkField(key + '.exercises[' + i + '].q', q.q, x.q);
      if (q.hint) checkField(key + '.exercises[' + i + '].hint', q.hint, x.hint);
      if (q.sol) checkField(key + '.exercises[' + i + '].sol', q.sol, x.sol);
      if (q.choices) {
        if ((x.choices || []).length !== q.choices.length) fail('choices length: ' + key + ' exercise[' + i + ']');
        q.choices.forEach((ch, j) => checkField(key + '.exercises[' + i + '].choices[' + j + ']', ch, (x.choices || [])[j]));
      }
      for (const forbidden of ['a', 'type', 'alt', 'latex', 't', 'level', 'num', 'minutes', 'id']) {
        if (x[forbidden] !== undefined) fail('forbidden field ' + forbidden + ' in ' + key + ' exercise[' + i + ']');
      }
      if (x.a !== undefined && q.a !== x.a) fail('answer changed in ' + key + ' exercise[' + i + ']');
    });

    if (c.video) {
      if (!e.video) fail('missing video translation: ' + key);
      else for (const k of ['title', 'channel', 'note']) checkField(key + '.video.' + k, c.video[k], e.video[k]);
    }
  }
}

/* Glossary: bilingual definitions and chapter links that resolve. */
const chapterKeys = new Set(MB.sections.flatMap(s => s.chapters.map(c => s.id + '/' + c.id)));
const glossaryIds = new Set();
(MB.glossary || []).forEach((g, i) => {
  const where = 'glossary[' + i + ']';
  if (!g.id || glossaryIds.has(g.id)) fail('duplicate or missing glossary id: ' + g.id);
  glossaryIds.add(g.id);
  checkField(where + '.term', g.term && g.term.hu, g.term && g.term.en);
  checkField(where + '.plain', g.plain && g.plain.hu, g.plain && g.plain.en);
  checkField(where + '.precise', g.precise && g.precise.hu, g.precise && g.precise.en);
  const key = g.chapter && g.chapter.section + '/' + g.chapter.chapter;
  if (!key || !chapterKeys.has(key)) fail(where + ': unresolved chapter link ' + key);
});
if (!(MB.glossary || []).length) warn('no glossary entries');

if (!MB.enFormulas || MB.enFormulas.length !== MB.formulas.length) fail('formula overlay count ' + (MB.enFormulas || []).length + ' != ' + MB.formulas.length);
(MB.enFormulas || []).forEach((x, i) => {
  const f = MB.formulas[i];
  if (!f) return;
  checkField('formula[' + i + '].cat', f.cat, x.cat);
  checkField('formula[' + i + '].name', f.name, x.name);
  checkField('formula[' + i + '].note', f.note, x.note);
});
if (!MB.enVideos || MB.enVideos.length !== MB.videos.length) fail('video overlay count ' + (MB.enVideos || []).length + ' != ' + MB.videos.length);
(MB.enVideos || []).forEach((x, i) => {
  const v = MB.videos[i];
  if (!v) return;
  for (const k of ['cat', 'title', 'channel', 'note']) checkField('video[' + i + '].' + k, v[k], x[k]);
});

/* Generator templates: every item call must carry an English block, and categories need EN metadata. */
const gen = fs.readFileSync(path.join(root, 'assets/js/generators.js'), 'utf8');
const itemCalls = (gen.match(/(?<!function )\bitem\(/g) || []).length;
const enCalls = (gen.match(/\ben:\s*\{/g) || []).length;
if (itemCalls !== enCalls) fail('generator item calls without en block: ' + (itemCalls - enCalls) + ' of ' + itemCalls);
const catCount = (gen.match(/^\s*id:\s*'/gm) || []).length;
const titleEn = (gen.match(/titleEn:/g) || []).length;
const descEn = (gen.match(/descEn:/g) || []).length;
if (catCount !== titleEn || catCount !== descEn) fail('generator category metadata: ' + catCount + ' ids, ' + titleEn + ' titleEn, ' + descEn + ' descEn');

console.log('chapters:', chapters, 'exercises:', exercises);
console.log('formulas:', MB.formulas.length, MB.enFormulas && MB.enFormulas.length);
console.log('videos:', MB.videos.length, MB.enVideos && MB.enVideos.length);
console.log('glossary:', (MB.glossary || []).length);
console.log('generator items:', itemCalls, 'with en:', enCalls, 'categories:', catCount);
if (warnings.length) {
  console.log('\nWARNINGS (' + warnings.length + ')');
  warnings.slice(0, 50).forEach(w => console.log(' - ' + w));
}
if (errors.length) {
  console.error('\nERRORS (' + errors.length + ')');
  errors.slice(0, 100).forEach(e => console.error(' - ' + e));
  process.exit(1);
}
console.log('\nOK: bilingual coverage complete.');
