import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  LLM_BASE_URL, LLM_MODEL, LLM_MOCK, LLM_MAX_TOKENS, LLM_TIMEOUT_MS,
  MAX_CONCURRENT_JOBS, MAX_JOB_ATTEMPTS, JOB_LEASE_MS, SKILL_PATH,
  MAX_JOB_RUNTIME_MS,
  CHAPTER_CONCURRENCY, CHAPTER_WORD_MARGIN, LLM_RETRY_BACKOFF_MAX_MS
} from '../config.js';
import { LIMITS, SCHEMA_VERSION, targetChapterCount, countTopics, chapterWordBudget } from '../limits.js';
import { decrypt } from '../crypto.js';
import { assertSafeLlmBase } from './url-safety.js';
import { friendlyGenerationError } from './generation-errors.js';
import { optionsPrompt, parseSiteOptions } from '../site-options.js';
import { validateDepth, assembleGlossary, wordsOf } from './depth.js';
import { sqlite, ensureProfile, now, slugify, siteRow, siteJsonPath, siteUrl, sharedKeySource, getSettings, loadDraft, saveDraft, clearDraft } from '../db/index.js';

/* ------------------------------------------------------------------ bilingual */
function biv(v) {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const hu = String(v.hu == null ? '' : v.hu).trim();
    const en = String(v.en == null ? '' : v.en).trim();
    return { hu: hu || en, en: en || hu };
  }
  const s = String(v == null ? '' : v).trim();
  return { hu: s, en: s };
}
function bivArr(v) {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const hu = (Array.isArray(v.hu) ? v.hu : [v.hu]).filter(Boolean).map(String);
    const en = (Array.isArray(v.en) ? v.en : [v.en]).filter(Boolean).map(String);
    return { hu: hu.length ? hu : en, en: en.length ? en : hu };
  }
  const a = (Array.isArray(v) ? v : [v]).filter(Boolean).map(String);
  return { hu: a, en: a };
}
function optBiv(v) {
  if (v && typeof v === 'object' && !Array.isArray(v)) return { hu: String(v.hu || ''), en: String(v.en || '') };
  const s = String(v == null ? '' : v).trim();
  return { hu: s, en: s };
}

/* ------------------------------------------------------------------ schema v2 */
const CHECKS_MAX = 6;
function normalizeCheck(c) {
  return { q: biv(c.q || c.question || ''), a: biv(c.a || c.answer || ''), hint: optBiv(c.hint || '') };
}
function normalizeChecks(list, max = CHECKS_MAX) {
  return (Array.isArray(list) ? list : []).slice(0, max)
    .map(normalizeCheck)
    .filter(c => c.q.hu || c.q.en);
}
function normalizeConfusions(list) {
  return (Array.isArray(list) ? list : []).slice(0, 3).map(x => ({
    a: biv(x.a || ''), b: biv(x.b || ''), note: optBiv(x.note || '')
  })).filter(x => x.a.hu || x.b.hu);
}
function normalizeTerms(list) {
  return (Array.isArray(list) ? list : []).slice(0, 12).map(t => ({
    id: String(t.id || slugify(t.term?.en || t.term || 'term')).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '') || 'term',
    term: biv(t.term || t.name || t.id || ''),
    plain: optBiv(t.plain || ''),
    precise: optBiv(t.precise || ''),
    requires: (Array.isArray(t.requires) ? t.requires : []).map(String).filter(Boolean)
  })).filter(t => t.id);
}
function normalizeRefresher(list) {
  return (Array.isArray(list) ? list : []).slice(0, 6).map(r => {
    const out = { label: biv(r.label || r.term || ''), term: r.term ? String(r.term) : '' };
    if (r.chapter && (r.chapter.section || r.chapter.sid)) {
      out.chapter = {
        section: String(r.chapter.section || r.chapter.sid),
        chapter: String(r.chapter.chapter || r.chapter.cid)
      };
    }
    return out;
  }).filter(r => r.label.hu || r.term);
}

function normalizeTheoryBlock(t) {
  const type = ['def', 'thm', 'note', 'warn', 'formula', 'p', 'list', 'code'].includes(t.type) ? t.type : 'p';
  const b = { type, title: biv(t.title || '') };
  if (type === 'formula') {
    b.latex = String(t.latex || '');
    b.note = optBiv(t.note || '');
  } else if (type === 'code') {
    b.lang = String(t.lang || 'text').slice(0, 20);
    b.code = String(t.code || '');
  } else if (type === 'list') {
    b.items = bivArr(t.items);
  } else {
    b.body = biv(t.body || '');
  }
  // Depth fields. Present on every block; required by the validator on def/thm.
  b.plain = optBiv(t.plain || '');
  b.why = optBiv(t.why || '');
  b.precise = optBiv(t.precise || '');
  b.analogy = optBiv(t.analogy || '');
  b.confusions = normalizeConfusions(t.confusions);
  b.checks = normalizeChecks(t.checks, 2);
  b.terms = (Array.isArray(t.terms) ? t.terms : []).map(String).filter(Boolean);
  return b;
}

export function normalizeSite(raw, req = {}, limits = {}) {
  if (!raw || typeof raw !== 'object') throw new Error('The model did not return a JSON object.');
  const maxChapters = Math.max(1, Number(limits.maxChapters) || LIMITS.chapters.defaultMax);
  const maxPerSection = Math.max(1, Math.min(maxChapters, Number(limits.maxPerSection) || LIMITS.chapters.perSection));
  const sections = Array.isArray(raw.sections) ? raw.sections : [];
  if (!sections.length) throw new Error('The generated site has no sections.');
  const out = {
    version: SCHEMA_VERSION,
    title: biv(raw.title || req.title || req.topic || 'Learning site'),
    subtitle: biv(raw.subtitle || req.description || ''),
    summary: biv(raw.summary || req.description || ''),
    sections: []
  };
  let chapters = 0;
  for (const s of sections) {
    if (out.sections.length >= LIMITS.chapters.perSection * 2) break;
    const sec = {
      id: slugify(s.id || s.title?.en || s.title || 'section'),
      num: String(s.num || out.sections.length + 1).padStart(2, '0'),
      title: biv(s.title || 'Section'),
      subtitle: biv(s.subtitle || ''),
      intro: biv(s.intro || ''),
      conceptMap: bivArr(s.conceptMap || []),
      summary: biv(s.summary || ''),
      chapters: []
    };
    for (const c of (Array.isArray(s.chapters) ? s.chapters : []).slice(0, maxPerSection)) {
      if (chapters++ >= maxChapters) break;
      const ch = {
        id: slugify(c.id || c.title?.en || c.title || 'chapter'),
        num: String(c.num || (out.sections.length + 1) + '.' + (sec.chapters.length + 1)),
        title: biv(c.title || 'Chapter'),
        lead: biv(c.lead || ''),
        why: bivArr(c.why),
        when: biv(c.when || ''),
        minutes: Math.max(LIMITS.depth.minMinutes, Math.min(LIMITS.depth.maxMinutes, Number(c.minutes) || 30)),
        terms: normalizeTerms(c.terms),
        refresher: normalizeRefresher(c.refresher),
        recap: {
          points: bivArr(c.recap?.points || []),
          next: optBiv(c.recap?.next || '')
        },
        checks: normalizeChecks(c.checks, 2),
        theory: [],
        examples: [],
        mistakes: bivArr(c.mistakes),
        exercises: []
      };
      for (const t of (Array.isArray(c.theory) ? c.theory : []).slice(0, 24)) ch.theory.push(normalizeTheoryBlock(t));
      for (const e of (Array.isArray(c.examples) ? c.examples : []).slice(0, 6)) {
        const steps = bivArr(e.steps);
        let reasons = e.reasons ? bivArr(e.reasons) : { hu: [], en: [] };
        // Accept steps as [{text,why}] too, splitting into parallel arrays.
        if (Array.isArray(e.steps) && e.steps.some(x => x && typeof x === 'object' && !Array.isArray(x) && (x.text || x.why))) {
          steps.hu = e.steps.map(x => String(x.text?.hu ?? x.text ?? ''));
          steps.en = e.steps.map(x => String(x.text?.en ?? x.text ?? ''));
          reasons = {
            hu: e.steps.map(x => String(x.why?.hu ?? x.why ?? '')),
            en: e.steps.map(x => String(x.why?.en ?? x.why ?? ''))
          };
        }
        ch.examples.push({
          title: biv(e.title || 'Example'), problem: biv(e.problem || ''),
          steps, reasons, answer: biv(e.answer || '')
        });
      }
      for (const q of (Array.isArray(c.exercises) ? c.exercises : []).slice(0, 12)) {
        const type = ['number', 'expr', 'text', 'choice', 'proof'].includes(q.type) ? q.type : 'expr';
        const item = { q: biv(q.q || ''), a: String(q.a == null ? '' : q.a), type, hint: optBiv(q.hint || ''), sol: optBiv(q.sol || '') };
        if (type === 'choice') {
          item.choices = bivArr(q.choices);
          if (item.choices.hu.length < 2) throw new Error('A choice exercise needs at least two choices.');
          if (item.a === '') item.a = '0';
        }
        ch.exercises.push(item);
      }
      sec.chapters.push(ch);
    }
    if (sec.chapters.length) out.sections.push(sec);
  }
  if (!out.sections.length) throw new Error('The generated site has no chapters.');
  out.glossary = assembleGlossary(out);
  return out;
}

/** Read-time normalizer for books stored before schema v2. Never rewrites data. */
export function migrateSite(raw, req = {}) {
  return normalizeSite(raw, req, { maxChapters: LIMITS.chapters.cap, maxPerSection: LIMITS.chapters.perSection });
}

/* ------------------------------------------------------------------ mock model */
function mockChapterText(title, n, lang) {
  const base = lang === 'hu'
    ? `${title} világos, hétköznapi magyarázata. Képzeld el, hogy egy barátodnak magyarázod el, aki még soha nem találkozott ezzel a témával.`
    : `A plain-language explanation of ${title}. Imagine explaining it to a friend who has never met this topic before.`;
  const why = lang === 'hu'
    ? `Azért van rá szükség, mert a korábbi eszközök itt már nem elegendők. Ez a gondolat adja meg a hiányzó lépést, és később minden erre épül.`
    : `It exists because the earlier tools are no longer sufficient. This idea supplies the missing step, and later work builds on it.`;
  const precise = lang === 'hu'
    ? `Pontos megfogalmazás: a feltételek teljesülnek, az értelmezési tartomány nem üres, és az állítás minden megengedett esetre érvényes. A definíció kimondja a kivételeket is.`
    : `Precise version: the conditions hold, the domain is non-empty, and the statement is valid for every allowed case. The definition also names the exceptions.`;
  const analogy = lang === 'hu'
    ? `Analógia: olyan, mint egy térkép, amely megmutatja, melyik utcán indulj el; a számolás csak a gyaloglás.`
    : `Analogy: it is like a map that tells you which street to take; calculation is only the walking.`;
  return `${base} ${why} ${precise} ${analogy} ${n > 1 ? (lang === 'hu' ? 'Ez a második megközelítés ugyanazt az ötletet erősíti meg egy másik példán.' : 'This second approach reinforces the same idea through another example.') : ''}`;
}

export function mockOutline(req, maxChapters = LIMITS.chapters.defaultMax) {
  const topics = Math.max(6, countTopics([req.topic, req.description, req.long_text].join('\n')));
  const total = Math.max(LIMITS.chapters.floor, Math.min(maxChapters, Math.ceil(topics * LIMITS.chapters.perTopic)));
  const perSection = 6;
  const sections = [];
  for (let start = 0, si = 0; start < total; start += perSection, si++) {
    const count = Math.min(perSection, total - start);
    const chapters = [];
    for (let i = 0; i < count; i++) {
      const n = start + i + 1;
      chapters.push({
        id: 'chapter-' + n,
        num: `${si + 1}.${i + 1}`,
        title: { hu: `${n}. témakör`, en: `Topic ${n}` },
        focus: `Understand topic ${n} and use it in a worked example.`,
        newTerms: [1, 2, 3].map(k => ({
          id: `term-${n}-${k}`,
          term: { hu: `${n}.${k} fogalom`, en: `Concept ${n}.${k}` },
          requires: n > 1 && i === 0 && k === 1 ? [`term-${n - 1}-1`] : []
        }))
      });
    }
    sections.push({
      id: 'section-' + (si + 1),
      num: String(si + 1).padStart(2, '0'),
      title: { hu: `${si + 1}. rész`, en: `Part ${si + 1}` },
      subtitle: { hu: `A ${si + 1}. rész áttekintése`, en: `Overview of part ${si + 1}` },
      intro: { hu: `Ebben a részben ${count} témakört dolgozunk fel.`, en: `This part covers ${count} topics.` },
      conceptMap: {
        hu: chapters.map(c => c.title.hu),
        en: chapters.map(c => c.title.en)
      },
      summary: { hu: `A rész végére a ${count} témakör összekapcsolódik.`, en: `By the end, the ${count} topics connect.` },
      chapters
    });
  }
  return {
    title: { hu: req.title || 'Minta tanulókönyv', en: req.title || 'Mock learning book' },
    subtitle: { hu: 'Generált minta', en: 'Generated sample' },
    summary: { hu: req.description || 'Minta könyv a folyamat ellenőrzéséhez.', en: req.description || 'A sample book for pipeline checks.' },
    sections
  };
}

export function mockChapters(outline, ids) {
  const flat = outline.sections.flatMap((s, si) => s.chapters.map(c => ({ s, c, si })));
  return ids.map(id => {
    const at = flat.findIndex(x => x.c.id === id);
    let s, c;
    if (at >= 0) ({ s, c } = flat[at]);
    else {
      // The mock may be asked for a chapter from a larger outline than its own
      // request text implies; synthesize the matching registry entry.
      const n = Number((String(id).match(/(\d+)/) || [])[1]) || (flat.length + 1);
      s = { id: 'section-' + Math.ceil(n / 6), num: String(Math.ceil(n / 6)).padStart(2, '0'), title: { hu: `${Math.ceil(n / 6)}. rész`, en: `Part ${Math.ceil(n / 6)}` } };
      c = {
        id, num: `${Math.ceil(n / 6)}.${n}`, title: { hu: `${n}. témakör`, en: `Topic ${n}` }, focus: `Topic ${n}`,
        newTerms: [1, 2, 3].map(k => ({ id: `term-${n}-${k}`, term: { hu: `${n}.${k} fogalom`, en: `Concept ${n}.${k}` }, requires: [] }))
      };
    }
    const prev = at > 0 ? flat[at - 1] : null;
    const terms = (c.newTerms || []).map(t => ({
      id: t.id, term: t.term,
      plain: {
        hu: `${t.term.hu} hétköznapi nyelven: egy egyszerű szabály, amely megmondja, mit szabad és mit nem.`,
        en: `${t.term.en} in plain words: a simple rule that says what is allowed and what is not.`
      },
      precise: {
        hu: `Pontosan: ${t.term.hu} akkor és csak akkor érvényes, ha a feltételek teljesülnek és nincs kivétel.`,
        en: `Precisely: ${t.term.en} holds exactly when the conditions hold and there is no exception.`
      },
      requires: t.requires || []
    }));
    const blocks = [];
    terms.forEach((t, i) => {
      blocks.push({
        type: i === 0 ? 'def' : 'thm',
        title: { hu: t.term.hu, en: t.term.en },
        body: t.plain,
        plain: t.plain,
        why: {
          hu: `A ${t.term.hu} azért létezik, mert a korábbi magyarázat nem fedte le ezt az esetet.`,
          en: `${t.term.en} exists because the earlier explanation did not cover this case.`
        },
        precise: t.precise,
        analogy: {
          hu: `Képzeld el, mint egy ellenőrzőlistát: minden pontot ki kell pipálni, különben nem érvényes.`,
          en: `Picture a checklist: every item must be ticked, otherwise it does not apply.`
        },
        confusions: [{
          a: { hu: t.term.hu, en: t.term.en },
          b: { hu: 'a hasonló, de gyengébb állítás', en: 'the similar but weaker statement' },
          note: { hu: 'A kettő nem ugyanaz: az egyik feltétel nélkül hamis.', en: 'They are not the same: one is false without its condition.' }
        }],
        checks: [{
          q: { hu: `Mondd el a saját szavaiddal: mi a ${t.term.hu}?`, en: `Say in your own words: what is ${t.term.en}?` },
          a: { hu: 'A fenti hétköznapi megfogalmazás lényege.', en: 'The essence of the plain-words version above.' },
          hint: { hu: 'Kezdd a „valami olyasmi, hogy…” fordulattal.', en: 'Start with "something like…".' }
        }],
        terms: [t.id]
      });
      blocks.push({
        type: 'p',
        title: { hu: 'Miért működik?', en: 'Why does it work?' },
        body: mockChapterText(t.term.hu, at + 1, 'hu'),
        plain: mockChapterText(t.term.en, at + 1, 'en')
      });
    });
    blocks.push({
      type: 'code', title: { hu: 'Ellenőrző kód', en: 'Check in code' }, lang: 'text',
      code: 'assert condition;\nprint("ok");'
    });
    const chapterOut = {
      id: c.id,
      num: c.num,
      title: c.title,
      lead: {
        hu: `Ebben a fejezetben a ${c.title.hu} témakörét dolgozzuk fel lépésről lépésre, minden új fogalmat hétköznapi nyelven bevezetve.`,
        en: `This chapter works through ${c.title.en} step by step, introducing every new term in plain words first.`
      },
      why: {
        hu: ['Mert a következő fejezetek erre építenek.', 'Mert a vizsgán önálló lépésként jelenik meg.'],
        en: ['Because later chapters build on it.', 'Because it appears as a standalone step in the exam.']
      },
      when: {
        hu: 'Akkor használd, amikor a feladatban ez a minta ismerhető fel.',
        en: 'Use it when you recognise this pattern in a task.'
      },
      minutes: 40,
      terms,
      refresher: prev
        ? [{
            label: { hu: `Előző fejezet: ${prev.c.title.hu}`, en: `Previous chapter: ${prev.c.title.en}` },
            chapter: { section: prev.s.id, chapter: prev.c.id }
          }]
        : [{ label: { hu: 'Nincs előfeltétel: kezdjük az alapoknál.', en: 'No prerequisite: we start from the basics.' } }],
      recap: {
        points: {
          hu: terms.map(t => `${t.term.hu}: ${t.plain.hu}`).slice(0, 3).concat(['A feltételeket mindig ellenőrizd.']).slice(0, 3),
          en: terms.map(t => `${t.term.en}: ${t.plain.en}`).slice(0, 3).concat(['Always check the conditions.']).slice(0, 3)
        },
        next: {
          hu: 'Következő lépés: oldj meg egy hasonló feladatot önállóan.',
          en: 'Next step: solve a similar exercise on your own.'
        }
      },
      checks: [{
        q: { hu: 'Mi a fejezet fő állítása?', en: 'What is the main claim of the chapter?' },
        a: { hu: 'A fenti definíció a feltételekkel együtt.', en: 'The definition above, together with its conditions.' },
        hint: { hu: 'Nézd meg az első blokkot.', en: 'Look at the first block.' }
      }, {
        q: { hu: 'Melyik feltétel hiányozhat el?', en: 'Which condition can be skipped?' },
        a: { hu: 'Egy sem.', en: 'None of them.' },
        hint: { hu: 'A tétel csak a feltételekkel igaz.', en: 'The theorem is only true with its conditions.' }
      }],
      theory: blocks,
      examples: [{
        title: { hu: 'Kidolgozott példa', en: 'Worked example' },
        problem: {
          hu: `Alkalmazzuk a ${terms[0] ? terms[0].term.hu : 'fogalmat'} egy egyszerű esetre.`,
          en: `Apply ${terms[0] ? terms[0].term.en : 'the concept'} to a simple case.`
        },
        steps: {
          hu: ['Írjuk fel, mit adott a feladat.', 'Ellenőrizzük a feltételeket.', 'Helyettesítsünk be.', 'Számoljunk ki mindent.'],
          en: ['Write down what the task gives.', 'Check the conditions.', 'Substitute.', 'Compute everything.']
        },
        reasons: {
          hu: ['Mert csak így látjuk, mi ismert.', 'Mert a feltétel nélkül az állítás hamis lehet.', 'Mert a képlet így válik használhatóvá.', 'Mert a végeredményt ellenőrizni kell.'],
          en: ['Because only then do we see what is known.', 'Because without the condition the claim may be false.', 'Because the formula becomes usable this way.', 'Because the result must be checked.']
        },
        answer: { hu: 'A feltételek teljesülnek, az eredmény adódik.', en: 'The conditions hold and the result follows.' }
      }],
      mistakes: {
        hu: ['Feltétel nélkül alkalmazzuk a szabályt.', 'A lépések sorrendjét felcseréljük.'],
        en: ['Applying the rule without its condition.', 'Swapping the order of the steps.']
      },
      exercises: [{
        q: { hu: `Melyik állítás igaz a ${terms[0] ? terms[0].term.hu : 'fogalomra'}?`, en: `Which statement is true of ${terms[0] ? terms[0].term.en : 'the concept'}?` },
        a: '0', type: 'choice',
        choices: { hu: ['Csak a feltételekkel.', 'Feltétel nélkül mindig.'], en: ['Only with the conditions.', 'Always, without conditions.'] },
        hint: { hu: 'Nézd meg a definíciót.', en: 'Check the definition.' },
        sol: { hu: 'Az első válasz.', en: 'The first option.' }
      }, {
        q: { hu: 'Mennyi $2+2$?', en: 'What is $2+2$?' }, a: '4', type: 'number',
        hint: { hu: 'Két pár.', en: 'Two pairs.' }, sol: { hu: '$4$', en: '$4$' }
      }]
    };
    // Mock model: pad with real explanation blocks until the chapter meets its
    // word budget in both languages. This exercises the depth validator.
    const budget = chapterWordBudget(terms.length);
    const count = lang => wordsOf([
      chapterOut.lead[lang], ...chapterOut.why[lang], chapterOut.when[lang],
      ...chapterOut.theory.flatMap(t => [t.body?.[lang], t.plain?.[lang], t.why?.[lang], t.precise?.[lang], t.analogy?.[lang],
        ...(t.checks || []).flatMap(q => [q.q?.[lang], q.a?.[lang], q.hint?.[lang]])]),
      ...chapterOut.examples.flatMap(e => [e.problem[lang], ...e.steps[lang], ...e.reasons[lang], e.answer[lang]]),
      ...chapterOut.recap.points[lang], chapterOut.recap.next[lang],
      ...chapterOut.checks.flatMap(q => [q.q[lang], q.a[lang], q.hint[lang]])
    ].join(' '));
    let guard = 0;
    while ((count('hu') < budget || count('en') < budget) && guard++ < 8) {
      chapterOut.theory.push({
        type: 'p',
        title: { hu: 'Mélyebb magyarázat', en: 'Deeper explanation' },
        body: {
          hu: `Nézzük meg ugyanezt egy másik nézőpontból. A ${chapterOut.title.hu} témakörében minden lépés egy kérdésre válaszol: mi az, amit már tudunk, és mi az, amit most kell hozzátenni. Először ismételjük át a feltételeket, majd írjuk fel a célállítást, végül ellenőrizzük, hogy a kapott eredmény valóban kielégíti-e őket. Ez a három lépés önmagában is elég a legtöbb vizsgafeladathoz, mert a vizsgáztató nem a számolás sebességét méri, hanem azt, hogy látod-e, melyik feltétel hova tartozik. Ha elakadsz, ne ugorj a megoldásra: írd le, melyik feltétel nem világos, és azt nézd meg újra. A megértés lassú, de tartós; a magolás gyors, de a vizsga után eltűnik.`,
          en: `Let us look at the same idea from another angle. In ${chapterOut.title.en}, every step answers one question: what do we already know, and what must we add now. First restate the conditions, then write the target statement, then check that the result really satisfies them. These three steps are enough for most exam tasks, because the examiner measures whether you can see where each condition belongs, not how fast you can compute. If you get stuck, do not jump to the solution: write down which condition is unclear and look at that again. Understanding is slow but durable; memorising is fast but disappears after the exam.`
        },
        plain: { hu: 'Ugyanaz az ötlet, másik példán.', en: 'The same idea on another example.' }
      });
    }
    return chapterOut;
  });
}

export function mockSite(req, maxChapters) {
  const outline = mockOutline(req, maxChapters);
  const ids = outline.sections.flatMap(s => s.chapters.map(c => c.id));
  const chapters = mockChapters(outline, ids);
  const sections = outline.sections.map(s => ({
    ...s,
    chapters: chapters.filter(c => s.chapters.some(x => x.id === c.id))
  }));
  return normalizeSite({ ...outline, sections }, req, { maxChapters: LIMITS.chapters.cap });
}

/* ------------------------------------------------------------------ model IO */
export function llmConfig(profile) {
  return {
    base: (profile.api_base || LLM_BASE_URL).replace(/\/+$/, ''),
    key: decrypt(profile.api_key),
    model: profile.api_model || LLM_MODEL
  };
}
/** Own key wins; otherwise the first active key shared with this user. */
export function effectiveProfile(profile) {
  if (profile.api_key) return profile;
  return sharedKeySource(profile.user_id) || profile;
}
/** 'own' | 'shared' | 'none', plus the owner's identity when shared. Never the key. */
export function keySource(profile) {
  if (profile.api_key) return { kind: 'own', owner: null };
  const owner = sharedKeySource(profile.user_id);
  return owner
    ? { kind: 'shared', owner: { email: owner.owner_email, name: owner.owner_name, apiBase: owner.api_base, apiModel: owner.api_model } }
    : { kind: 'none', owner: null };
}
export function useMock() { return LLM_MOCK; }

function mockReply(messages) {
  const prompt = (messages || []).map(m => String(m.content || '')).join('\n');
  const requestLine = prompt.match(/REQUEST:\n([\s\S]*?)\n\n/);
  const req = { title: '', topic: '', description: '', long_text: '' };
  if (requestLine) {
    for (const line of requestLine[1].split('\n')) {
      const m = line.match(/^(Title|Topic|Description):\s*(.*)$/);
      if (m) req[m[1].toLowerCase()] = m[2];
    }
  }
  const scope = prompt.match(/SOURCE HEADINGS \/ SCOPE:\n([\s\S]*?)\n\n/);
  if (scope) req.long_text = scope[1];
  if (prompt.includes('Design the COMPLETE outline')) return JSON.stringify(mockOutline(req, 60));
  const ids = [...prompt.matchAll(/id "([^"]+)"/g)].map(m => m[1]);
  if (prompt.includes('WRITE EXACTLY THESE CHAPTERS') && ids.length) {
    const outline = mockOutline(req, 60);
    return JSON.stringify({ chapters: mockChapters(outline, ids) });
  }
  return JSON.stringify(mockSite(req, 60));
}

/** Reject a promise after `ms`, running `onTimeout` so the socket is torn down. */
function withTimeout(promise, ms, message, onTimeout) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      try { onTimeout && onTimeout(); } catch {}
      reject(new Error(message));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function callLLM(cfg, messages, maxTokens = LLM_MAX_TOKENS, onActivity = null) {
  if (useMock()) {
    const delay = Number(process.env.LLM_MOCK_DELAY || 0);
    if (delay > 0) await new Promise(r => setTimeout(r, Math.min(10000, delay)));
    return mockReply(messages);
  }
  const payload = { model: cfg.model, messages, temperature: 0.35, max_tokens: maxTokens };
  if (process.env.LLM_JSON_MODE !== '0') payload.response_format = { type: 'json_object' };
  const stream = process.env.LLM_STREAM !== '0';
  if (stream) {
    payload.stream = true;
    payload.stream_options = { include_usage: true };
  }
  await assertSafeLlmBase(cfg.base);

  async function readStream(res, controller) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '', content = '', usage = null;
    const started = Date.now();
    let lastTick = 0;
    const handle = line => {
      if (!line.startsWith('data:')) return;
      const data = line.slice(5).trim();
      if (!data || data === '[DONE]') return;
      try {
        const chunk = JSON.parse(data);
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) content += delta;
        if (chunk.usage) usage = chunk.usage;
      } catch {}
    };
    while (true) {
      const { done, value } = await withTimeout(
        reader.read(),
        LIMITS.model.idleTimeoutMs,
        `LLM stream idle for ${Math.round(LIMITS.model.idleTimeoutMs / 1000)}s`,
        () => controller.abort()
      );
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      if (onActivity && Date.now() - lastTick >= 800) {
        lastTick = Date.now();
        try { onActivity({ chars: content.length, elapsedMs: Date.now() - started }); } catch {}
      }
      let idx;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        handle(buffer.slice(0, idx).trim());
        buffer = buffer.slice(idx + 1);
      }
    }
    if (buffer.trim()) handle(buffer.trim());
    console.log(`LLM stream: ${Math.round((Date.now() - started) / 1000)}s, completion ${usage?.completion_tokens ?? '?'} tokens, prompt ${usage?.prompt_tokens ?? '?'} tokens`);
    return content;
  }

  const doFetch = async body => {
    // AbortSignal.timeout does not reliably abort a body that is already being
    // streamed by undici, so the timeout is enforced on both the request and
    // the body read. A stuck provider call must fail the chapter, not hang it.
    const controller = new AbortController();
    const killer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
    try {
      const r = await fetch(cfg.base + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.key },
        body: JSON.stringify(body),
        redirect: 'manual',
        signal: controller.signal
      });
      if (r.status >= 300 && r.status < 400) throw new Error('LLM API redirected; point the base URL at the final endpoint.');
      const type = r.headers.get('content-type') || '';
      if (body.stream && type.includes('text/event-stream')) {
        if (!r.ok) {
          const e = new Error('LLM API ' + r.status);
          e.status = r.status;
          e.retryAfter = Number(r.headers.get('retry-after')) || 0;
          throw e;
        }
        return await readStream(r, controller);
      }
      const text = await withTimeout(
        r.text(),
        LLM_TIMEOUT_MS,
        `LLM response body timed out after ${Math.round(LLM_TIMEOUT_MS / 1000)}s`,
        () => controller.abort()
      );
      if (!r.ok) {
        const e = new Error('LLM API ' + r.status + ': ' + text.slice(0, 500));
        e.status = r.status;
        e.retryAfter = Number(r.headers.get('retry-after')) || 0;
        throw e;
      }
      return JSON.parse(text).choices?.[0]?.message?.content || '';
    } finally {
      clearTimeout(killer);
    }
  };
  try { return await doFetch(payload); }
  catch (e) {
    // Providers differ in their output caps. Fall back instead of failing the
    // whole chapter when one rejects the JSON mode or the token budget.
    if (e.status === 400 || e.status === 422) {
      if (payload.response_format) { delete payload.response_format; return doFetch(payload); }
      if (payload.max_tokens > 16_000) { payload.max_tokens = 16_000; return doFetch(payload); }
    }
    throw e;
  }
}
function extractJSON(text) {
  let s = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  return JSON.parse(s);
}
function skillText() {
  try { return fs.readFileSync(SKILL_PATH, 'utf8'); } catch { return ''; }
}

/* -------------------------------------------------------- source chunking */
/** Split the source into paragraph blocks, then pack into ~chunkChars chunks. */
export function chunkSource(text, size = LIMITS.source.chunkChars) {
  const blocks = String(text || '').split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
  const chunks = [];
  let current = '';
  for (const block of blocks) {
    if (current && current.length + block.length + 2 > size) { chunks.push(current); current = ''; }
    current += (current ? '\n\n' : '') + block;
    while (current.length > size) { chunks.push(current.slice(0, size)); current = current.slice(size); }
  }
  if (current) chunks.push(current);
  return chunks.slice(0, LIMITS.source.scoreChunks);
}

function tokensOf(s) {
  return String(s || '').toLowerCase().match(/[a-z0-9áéíóöőúüű]{4,}/g) || [];
}

/**
 * Attach only the chunks that mention this chapter's topics. Never truncate the
 * source: if the best chunks exceed the budget, they are cut at a block boundary
 * and the log says how much of the source was used.
 */
export function selectSourceChunks(source, chapter, outline) {
  const text = String(source || '');
  if (!text) return { text: '(none)', usedChunks: 0, totalChunks: 0 };
  const chunks = chunkSource(text);
  const terms = (chapter.newTerms || []).map(t => t.term?.en || t.term?.hu || t.id).join(' ');
  const wanted = new Set(tokensOf(`${chapter.title?.en || ''} ${chapter.title?.hu || ''} ${chapter.focus || ''} ${terms}`));
  const scored = chunks.map((chunk, i) => {
    const have = new Set(tokensOf(chunk));
    let score = 0;
    wanted.forEach(t => { if (have.has(t)) score++; });
    return { i, chunk, score };
  }).sort((a, b) => b.score - a.score || a.i - b.i);
  const picked = [];
  let used = 0;
  for (const x of scored) {
    if (used >= LIMITS.source.chapterBudgetChars) break;
    if (x.score === 0 && picked.length) continue;
    picked.push(x);
    used += x.chunk.length;
  }
  picked.sort((a, b) => a.i - b.i);
  let out = picked.map(x => x.chunk).join('\n\n');
  if (out.length > LIMITS.source.chapterBudgetChars) out = out.slice(0, LIMITS.source.chapterBudgetChars);
  return { text: out || '(none)', usedChunks: picked.length, totalChunks: chunks.length };
}

/** Headings + scope lines for the outline pass: the whole source, cheaply. */
export function sourceDigest(source) {
  const lines = String(source || '').split(/\r?\n/);
  const keep = [];
  let size = 0;
  for (const raw of lines) {
    const line = raw.trim();
    const heading = /^#{1,6}\s/.test(line) || /^(\d{1,2}(\.\d{1,2}){0,2}[.)]|[IVXLC]{1,5}[.)]|[-*•])\s/.test(line);
    if (!heading) continue;
    if (line.length > 160) continue;
    if (size + line.length > LIMITS.source.outlineDigestChars) break;
    keep.push(line);
    size += line.length + 1;
  }
  return keep.join('\n') || '(no headings found)';
}

/* -------------------------------------------------- multi-pass generation */
function requestText(req) {
  return `Title: ${req.title}\nTopic: ${req.topic}\nDescription: ${req.description}\nAudience: ${req.audience}\nLanguage preference: ${req.language}\n`;
}

const DEPTH_RULES = `EXPLANATION DEPTH — a complete beginner must be able to follow:
- Every definition/theorem/method block carries: plain (1-3 everyday sentences, first), why (the problem it solves, before formalism), precise (exact statement with every condition), analogy (a concrete analogy, picture description or numeric toy example), confusions (0-3 "X vs Y" boxes), checks (1-2 instant questions with answers), terms (the new term ids this block introduces; max 3).
- Every technical term is defined on first use, in the chapter where it first appears. Never use a term that is not in the glossary yet.
- Every worked example step has a parallel "reason" explaining why that step is taken.
- Each chapter has refresher (2-4 earlier ideas with links), checks (2 chapter-level questions), recap (3-5 bullets + what's next).
- Depth beats brevity. Add blocks until every term and every step is explained. Never compress because the book has many topics; add chapters instead.
- Reading level: a motivated 16-year-old with no prior knowledge. Jargon is explained, not avoided.
- Word budget: at least 700 words of explanation plus 250 words per new term, per language, per chapter. A shorter chapter fails validation.`;

function normalizeOutline(raw, req, maxChapters) {
  if (!raw || typeof raw !== 'object') throw new Error('The model did not return an outline object.');
  const used = new Set();
  const termIds = new Set();
  const sections = [];
  let total = 0;
  for (const s of (Array.isArray(raw.sections) ? raw.sections : [])) {
    if (sections.length >= LIMITS.chapters.perSection * 3 || total >= maxChapters) break;
    const sec = {
      id: slugify(s.id || s.title?.en || s.title || 'section'),
      num: String(s.num || sections.length + 1).padStart(2, '0'),
      title: biv(s.title || 'Section'),
      subtitle: biv(s.subtitle || s.title || 'Section'),
      intro: biv(s.intro || s.subtitle || s.title || 'Section'),
      conceptMap: bivArr(s.conceptMap || []),
      summary: biv(s.summary || ''),
      chapters: []
    };
    while (used.has(sec.id)) sec.id += '-x';
    used.add(sec.id);
    for (const c of (Array.isArray(s.chapters) ? s.chapters : [])) {
      if (total >= maxChapters) break;
      let id = slugify(c.id || c.title?.en || c.title || 'chapter');
      while (used.has(id)) id += '-x';
      used.add(id);
      const newTerms = (Array.isArray(c.newTerms) ? c.newTerms : []).slice(0, 8).map(t => ({
        id: String(t.id || slugify(t.term?.en || t.term || 'term')).toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
        term: biv(t.term || t.id || ''),
        requires: (Array.isArray(t.requires) ? t.requires : []).map(String).filter(Boolean)
      })).filter(t => {
        if (!t.id || termIds.has(t.id)) return false;
        termIds.add(t.id);
        return true;
      });
      sec.chapters.push({
        id, num: String(c.num || (sections.length + 1) + '.' + (sec.chapters.length + 1)),
        title: biv(c.title || 'Chapter'), focus: String(c.focus || '').trim(), newTerms
      });
      total++;
    }
    if (sec.chapters.length) sections.push(sec);
  }
  if (!total) throw new Error('The outline has no chapters.');
  return {
    title: biv(raw.title || req.title || 'Learning book'),
    subtitle: biv(raw.subtitle || req.description || ''),
    summary: biv(raw.summary || req.description || ''),
    sections, total
  };
}

/** Term registry in reading order; drop requirements that point forward or nowhere. */
function buildTermRegistry(outline) {
  const registry = new Map();
  const chapters = outline.sections.flatMap(s => s.chapters.map(c => ({ s, c })));
  chapters.forEach(({ s, c }) => {
    for (const t of c.newTerms || []) {
      if (registry.has(t.id)) continue;
      registry.set(t.id, { ...t, section: s.id, chapter: c.id, num: c.num });
    }
  });
  for (const t of registry.values()) {
    t.requires = (t.requires || []).filter(id => {
      const owner = registry.get(id);
      if (!owner) return false;
      const a = chapters.findIndex(x => x.c.id === owner.chapter);
      const b = chapters.findIndex(x => x.c.id === t.chapter);
      return a >= 0 && b >= 0 && a < b;
    });
  }
  return registry;
}

function chapterPrompt(req, skill, outline, section, batch, registry, source, issues = [], wordMargin = CHAPTER_WORD_MARGIN, optionsText = '') {
  const target = batch.map(c => `- id "${c.id}", num "${c.num}", title HU "${c.title.hu}" / EN "${c.title.en}"${c.focus ? `, focus: ${c.focus}` : ''}\n  new terms: ${(c.newTerms || []).map(t => `${t.id} (${t.term.en})`).join(', ') || '(none)'}`).join('\n');
  const outlineText = outline.sections.map(s =>
    `${s.num}. ${s.title.hu} / ${s.title.en}\n` + s.chapters.map(c => `   ${c.num} ${c.id} — ${c.title.hu} / ${c.title.en}`).join('\n')
  ).join('\n');
  const chapterOrder = outline.sections.flatMap(s => s.chapters.map(c => c.id));
  const batchIds = new Set(batch.map(c => c.id));
  const batchIdx = batch.map(c => chapterOrder.indexOf(c.id)).filter(i => i >= 0);
  const lastIdx = batchIdx.length ? Math.max(...batchIdx) : 0;
  const earlier = [], later = [];
  for (const t of registry.values()) {
    if (batchIds.has(t.chapter)) continue;
    const idx = chapterOrder.indexOf(t.chapter);
    if (idx > lastIdx) later.push(t);
    else earlier.push(t);
  }
  const definedText = earlier.map(t => `${t.id} = ${t.term.en} / ${t.term.hu} (chapter ${t.num})`).join('\n') || '(none yet — this is the first chapter)';
  const laterText = later.slice(0, 120).map(t => `${t.term.en} / ${t.term.hu}`).join(', ') || '(none)';
  const newTermText = batch.flatMap(c => (c.newTerms || []).map(t => `${t.id} = ${t.term.en} / ${t.term.hu}${t.requires?.length ? `; requires: ${t.requires.join(', ')}` : ''}`)).join('\n') || '(none)';
  const issueText = issues.length ? `\nFIX THESE VALIDATION ISSUES FROM THE PREVIOUS ATTEMPT:\n- ${issues.join('\n- ')}\n` : '';
  const termCount = batch.reduce((n, c) => n + (c.newTerms || []).length, 0);
  const budget = chapterWordBudget(termCount);
  const minWords = Math.ceil(budget * wordMargin);
  const maxWords = Math.round(budget * 1.5);
  return `SKILL (structure and style):\n${skill.slice(0, LIMITS.model.promptSkillChars)}\n\n${DEPTH_RULES}\n\n${optionsText}\n\nREQUEST:\n${requestText(req)}\n\nRELEVANT SOURCE EXCERPTS (selected for these chapters; the rest of the source is covered by other chapters):\n${source.text}\n\nBOOK OUTLINE (do not change its scope):\n${outlineText}\n\nTERMS ALREADY DEFINED (link to them, do not redefine):\n${definedText}\n\nTERMS YOU MUST DEFINE IN THIS PASS (exact ids):\n${newTermText}\n\nTERMS DEFINED LATER (do not use these names in this pass, not even as examples):\n${laterText}\n\nWRITE EXACTLY THESE CHAPTERS (section ${section.num}, ${section.title.hu} / ${section.title.en}):\n${target}\n${issueText}
Return ONE JSON object: {"chapters":[ ... ]} with exactly ${batch.length} chapter(s), in the same order and with the exact ids above.
Chapter shape:
{"id":"...","num":"...","title":{"hu":"...","en":"..."},"lead":{"hu":"...","en":"..."},"why":{"hu":["..."],"en":["..."]},"when":{"hu":"...","en":"..."},"minutes":40,
 "terms":[{"id":"term-id","term":{"hu":"...","en":"..."},"plain":{"hu":"...","en":"..."},"precise":{"hu":"...","en":"..."},"requires":["earlier-term-id"]}],
 "refresher":[{"label":{"hu":"...","en":"..."},"term":"term-id","chapter":{"section":"sid","chapter":"cid"}}],
 "checks":[{"q":{"hu":"...","en":"..."},"a":{"hu":"...","en":"..."},"hint":{"hu":"...","en":"..."}}],
 "recap":{"points":{"hu":["..."],"en":["..."]},"next":{"hu":"...","en":"..."}},
 "theory":[{"type":"def|thm|note|warn|p|list|formula|code","title":{"hu":"...","en":"..."},"body":{"hu":"...","en":"..."},
   "plain":{"hu":"...","en":"..."},"why":{"hu":"...","en":"..."},"precise":{"hu":"...","en":"..."},"analogy":{"hu":"...","en":"..."},
   "confusions":[{"a":{"hu":"...","en":"..."},"b":{"hu":"...","en":"..."},"note":{"hu":"...","en":"..."}}],
   "checks":[{"q":{"hu":"...","en":"..."},"a":{"hu":"...","en":"..."},"hint":{"hu":"...","en":"..."}}],
   "terms":["term-id"],"items":{"hu":["..."],"en":["..."]},"latex":"...","note":{"hu":"...","en":"..."},"lang":"c","code":"..."}],
 "examples":[{"title":{"hu":"...","en":"..."},"problem":{"hu":"...","en":"..."},"steps":{"hu":["..."],"en":["..."]},"reasons":{"hu":["..."],"en":["..."]},"answer":{"hu":"...","en":"..."}}],
 "mistakes":{"hu":["..."],"en":["..."]},
 "exercises":[{"q":{"hu":"...","en":"..."},"a":"...","type":"number|expr|text|choice|proof","choices":{"hu":["..."],"en":["..."]},"hint":{"hu":"...","en":"..."},"sol":{"hu":"...","en":"..."}}]}

HARD RULES:
- Exactly the ids above, in order. Both languages carry the full explanation, never a summary.
- Define every term listed above, exactly once, in this chapter's "terms". Do not redefine terms already defined.
- Each def/thm block introduces at most 3 terms and includes plain, why, precise, analogy, 1-2 checks.
- Every example step has a matching reason. exercises: 6-10, checkable, mixed types.
- Length: between ${minWords} and ${maxWords} words of explanation per language in this pass. Both languages are counted separately; a chapter below the minimum is rejected and rewritten. Do not pad above the maximum; an overlong reply may be cut off.
- Complete valid JSON. Return only this pass's chapters.`;
}

async function generateOutline(cfg, req, skill, call, maxChapters, onProgress, optionsText = '') {
  const topics = countTopics([req.topic, req.description, req.long_text].join('\n'));
  const minChapters = Math.min(maxChapters, Math.max(LIMITS.chapters.floor, topics || 6));
  const digest = sourceDigest(req.long_text || '');
  const messages = [
    { role: 'system', content: 'You design the outline and term registry of a bilingual learning book. Return only valid JSON.' },
    { role: 'user', content: `${DEPTH_RULES}\n\nSKILL (condensed scope rules):\n${skill.slice(0, LIMITS.model.promptSkillChars)}\n\n${optionsText}\n\nREQUEST:\n${requestText(req)}\n\nSOURCE HEADINGS / SCOPE:\n${digest}\n\nDesign the COMPLETE outline and the term registry first; chapters are written separately. Every chapter needs its own new terms so definitions are not duplicated.\nReturn ONE JSON object:\n{"title":{"hu":"...","en":"..."},"subtitle":{"hu":"...","en":"..."},"summary":{"hu":"...","en":"..."},"sections":[{"id":"slug","num":"01","title":{"hu":"...","en":"..."},"subtitle":{"hu":"...","en":"..."},"intro":{"hu":"...","en":"..."},"conceptMap":{"hu":["..."],"en":["..."]},"summary":{"hu":"...","en":"..."},"chapters":[{"id":"slug","num":"1.1","title":{"hu":"...","en":"..."},"focus":"one sentence","newTerms":[{"id":"term-slug","term":{"hu":"...","en":"..."},"requires":["earlier-term-id"]}]}]}]}\nRules:\n- 8-${maxChapters} chapters total (topic count suggests ${targetChapterCount({ ...req, sourceText: req.long_text }, maxChapters)}). Split a chapter instead of thinning it.\n- Cover EVERY topic in the source. Never silently drop a listed topic.\n- 1-6 sections; unique lowercase ASCII slugs; sequential nums.\n- At most 3 new terms per chapter block later; list 2-5 newTerms per chapter here.\n- Term ids unique across the book; prerequisites point only to earlier terms.\n- Complete valid JSON; shorten the focus text rather than truncating the object.` }
  ];
  let lastError = 'No outline.';
  for (let attempt = 0; attempt < LIMITS.model.outlineAttempts; attempt++) {
    const text = await call(cfg, messages);
    try {
      const outline = normalizeOutline(extractJSON(text), req, maxChapters);
      if (outline.total < minChapters) {
        throw new Error(`The outline has only ${outline.total} chapters. Cover all ${topics || 6}+ source topics and produce at least ${minChapters}; split chapters instead of compressing.`);
      }
      const registry = buildTermRegistry(outline);
      outline.registry = [...registry.values()];
      onProgress && onProgress({ phase: 'outline', done: outline.total, total: outline.total, message: `Outline ready: ${outline.total} chapters, ${registry.size} terms.` });
      return outline;
    } catch (e) {
      lastError = String(e.message || e).slice(0, 500);
      messages.push({ role: 'user', content: 'The outline was rejected: ' + lastError + '\nReturn the complete corrected outline JSON only. Same schema, no commentary.' });
    }
  }
  throw new Error('Could not build a book outline: ' + lastError);
}

/** Network-level failures worth retrying. Rate limits and provider 5xx are also
 *  transient: they cost a call, not a job attempt. */
function isTransientCallError(e) {
  if (e?.status === 429 || (e?.status >= 500 && e?.status < 600)) return true;
  if (e?.status) return false;
  const code = e?.cause?.code || e?.code;
  if (['ENOTFOUND', 'EAI_AGAIN', 'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EPIPE',
    'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_SOCKET', 'UND_ERR_CLOSED'].includes(code)) return true;
  return /fetch failed|could not be resolved|socket hang up|timed out|aborted/i.test(String(e?.message || ''));
}

/** Run async work over items with at most `limit` in flight. On failure, stop
 *  starting new items; work already in flight finishes and keeps its results. */
async function poolMap(items, limit, fn) {
  let next = 0;
  let failure = null;
  const worker = async () => {
    while (!failure && next < items.length) {
      const item = items[next++];
      try { await fn(item); } catch (e) { failure = failure || e; }
    }
  };
  await Promise.all(Array.from({ length: Math.min(Math.max(1, limit), items.length) }, worker));
  if (failure) throw failure;
}

async function writeChapterBatch(cfg, req, skill, outline, section, batch, call, limits, registry, source, issues, optionsText = '', repairRound = 0) {
  const messages = [
    { role: 'system', content: 'You write chapters for a bilingual learning book. Return only valid JSON.' },
    { role: 'user', content: chapterPrompt(req, skill, outline, section, batch, registry, source, issues, limits.wordMargin, optionsText) }
  ];
  if (repairRound > 0) {
    messages.push({
      role: 'user',
      content: `This is repair attempt ${repairRound + 1} for the same chapter. The previous rewrite still failed the checks. Change the content materially — add the missing explanation, checks or examples — not just the wording. Keep the exact same ids. Return only the complete JSON.`
    });
  }
  let lastError = 'No output.';
  /** A cut-off reply usually means the output budget, not the prompt, was short. */
  let tokenScale = 1;
  for (let attempt = 0; attempt < LIMITS.model.chapterRetries; attempt++) {
    let text;
    try {
      text = await call(cfg, messages, tokenScale);
    } catch (e) {
      // A resolver/socket blip must not cost a whole job attempt: retry here.
      if (!isTransientCallError(e) || attempt === LIMITS.model.chapterRetries - 1) throw e;
      const wait = Math.min(LLM_RETRY_BACKOFF_MAX_MS, Math.max(Number(e.retryAfter || 0) * 1000, 1000 * (attempt + 1)));
      console.error(`Chapter call failed, retrying in ${wait} ms:`, e.message || e);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    let raw;
    try { raw = extractJSON(text); } catch (e) {
      lastError = 'The reply was not valid JSON (likely truncated): ' + String(e.message || e).slice(0, 200);
      tokenScale = Math.min(4, tokenScale * 2);
      messages.push({ role: 'user', content: 'Your previous reply was incomplete or invalid JSON. Return the complete JSON for the same chapters now. Shorten the prose if needed, but keep every required field.' });
      continue;
    }
    const got = Array.isArray(raw.chapters) ? raw.chapters : [];
    if (got.length !== batch.length || got.some((c, i) => String(c?.id ?? '') !== batch[i].id)) {
      lastError = `Expected exactly ${batch.length} chapter(s) with ids ${batch.map(c => c.id).join(', ')}; got ${got.length}.`;
      messages.push({ role: 'user', content: lastError + ' Return only {"chapters":[...]} for exactly those ids, in order, nothing else.' });
      continue;
    }
    try {
      const probe = normalizeSite({
        version: SCHEMA_VERSION, title: outline.title, subtitle: outline.subtitle, summary: outline.summary,
        sections: [{ id: section.id, num: section.num, title: section.title, subtitle: section.subtitle, intro: section.intro, conceptMap: section.conceptMap, summary: section.summary, chapters: got }]
      }, req, limits);
      const check = validateSite(probe);
      if (!check.ok) throw new Error(check.error);
      const chapters = probe.sections[0].chapters;
      chapters.forEach((ch, i) => { ch.id = batch[i].id; ch.num = batch[i].num; });
      return chapters;
    } catch (e) {
      lastError = String(e.message || e).slice(0, 500);
      messages.push({ role: 'user', content: 'The chapters failed validation: ' + lastError + '\nFix every issue and return the complete corrected JSON only, same ids and order.' });
    }
  }
  throw new Error('Could not write chapters ' + batch.map(c => c.num).join(', ') + ': ' + lastError);
}

/** Prerequisites may only point at terms introduced no later than their chapter.
 *  The model sometimes lists a same-chapter or still-unwritten term; dropping it
 *  keeps the glossary direction valid instead of failing an otherwise good book. */
function dropForwardRequires(book) {
  const earlier = new Set();
  for (const s of book.sections) {
    for (const c of s.chapters) {
      const here = new Set((c.terms || []).map(t => t.id));
      for (const t of c.terms || []) {
        t.requires = (t.requires || []).filter(id => id !== t.id && (earlier.has(id) || here.has(id)));
      }
      for (const id of here) earlier.add(id);
    }
  }
}

/** Refresher links must point at earlier chapters and known terms. The model
 *  sometimes links forward; drop the link and keep the human-readable label. */
function dropForwardRefreshers(book) {
  const order = [];
  const termIds = new Set();
  for (const s of book.sections) {
    for (const c of s.chapters) {
      order.push({ sid: s.id, cid: c.id });
      for (const t of c.terms || []) termIds.add(t.id);
    }
  }
  const pos = new Map(order.map((x, i) => [x.sid + '/' + x.cid, i]));
  for (const s of book.sections) {
    for (const c of s.chapters) {
      const self = pos.get(s.id + '/' + c.id);
      c.refresher = (c.refresher || []).filter(r => {
        if (r.term && !termIds.has(r.term)) r.term = '';
        if (!r.chapter) return true;
        const at = pos.get(r.chapter.section + '/' + r.chapter.chapter);
        return at !== undefined && at < self;
      });
      if (!c.refresher.length) c.refresher.push({ label: { hu: 'Kezdés előtt', en: 'Before you start' } });
    }
  }
}

/** Assemble a site-like object from the draft (only chapters that exist). */
function draftBook(outline, written) {
  const sections = outline.sections.map(s => ({
    id: s.id, num: s.num, title: s.title, subtitle: s.subtitle, intro: s.intro,
    conceptMap: s.conceptMap, summary: s.summary,
    chapters: s.chapters.map(c => written[c.id]).filter(Boolean)
  })).filter(s => s.chapters.length);
  const book = normalizeSite({
    version: SCHEMA_VERSION, title: outline.title, subtitle: outline.subtitle, summary: outline.summary, sections
  }, {}, { maxChapters: LIMITS.chapters.cap, maxPerSection: LIMITS.chapters.perSection });
  dropForwardRequires(book);
  dropForwardRefreshers(book);
  book.glossary = assembleGlossary(book);
  return book;
}

/**
 * Issues that the chapter being written can actually fix. A "term used before
 * its definition" issue belongs to the *earlier* chapter that used it, so it is
 * repaired by the final validation pass (which regenerates that chapter), not
 * by retrying the chapter that defines the term.
 */
function issuesForChapter(result, chapter) {
  return result.issues
    .filter(i => i.cid === chapter.id)
    .map(i => `${i.code}: ${i.message}`);
}

/**
 * Multi-pass, resumable generation:
 *   1 outline + term registry, 2 per-chapter passes (validated immediately),
 *   3 glossary assembly, 4 depth validation with targeted regeneration,
 *   5 caller writes site.json only on success.
 *
 * `draft` is the previous state from the database (or null). `saveDraft` is
 * called after every chapter so a crash resumes where it stopped.
 */
export async function buildBook({
  cfg, req, skill = skillText(), call = callLLM, onProgress = () => {},
  maxChapters, batchSize, maxTokens, draft = null, saveDraft = null, onActivity = null,
  source = req.long_text || '', options = null, regenerateChapter = null, deadlineAt = null
} = {}) {
  const settings = getSettings();
  maxChapters = maxChapters ?? settings.maxBookChapters;
  batchSize = batchSize ?? settings.chapterBatchSize;
  maxTokens = maxTokens ?? settings.llmMaxTokens;
  const optionsText = optionsPrompt(options);
  const checkTime = () => {
    if (!deadlineAt || Date.now() < deadlineAt) return;
    throw new Error(`Generation exceeded its ${Math.round(MAX_JOB_RUNTIME_MS / 60000)}-minute time budget. The draft is saved; retry to resume.`);
  };
  const concurrency = Math.max(1, Math.min(8, Number(settings.chapterConcurrency) || CHAPTER_CONCURRENCY));
  const depthOptions = { budgetTolerance: settings.budgetTolerance, huBudgetRatio: settings.huBudgetRatio };
  const checkDepth = book => validateDepth(book, depthOptions);
  /** Scale 1 keeps the configured budget; truncation retries can raise it. */
  const callModel = (c, m, scale = 1) =>
    call(c, m, Math.min(200_000, Math.max(maxTokens, Math.round(maxTokens * scale))), onActivity);
  const limits = {
    maxChapters, maxPerSection: Math.min(LIMITS.chapters.perSection, maxChapters),
    wordMargin: settings.chapterWordMargin
  };
  const persist = state => { try { saveDraft && saveDraft(state); } catch (e) { console.error('Draft save failed:', e.message); } };

  let outline = draft?.outline ? normalizeOutline(draft.outline, req, maxChapters) : null;
  const written = { ...(draft?.chapters || {}) };
  let state = draft || { phase: 'outline', outline: null, chapters: {} };

  if (!outline) {
    checkTime();
    outline = await generateOutline(cfg, req, skill, callModel, maxChapters, onProgress, optionsText);
    state = { phase: 'chapters', outline, chapters: written };
    persist(state);
  } else if (draft?.phase === 'outline') {
    state.phase = 'chapters';
    persist(state);
  }

  // Targeted rewrite: drop just this chapter, keep every other written chapter.
  const targetChapter = regenerateChapter ? String(regenerateChapter) : '';
  if (targetChapter) {
    const exists = outline.sections.some(s => s.chapters.some(c => c.id === targetChapter));
    if (!exists) throw new Error(`Chapter "${targetChapter}" is not in this book.`);
    delete written[targetChapter];
    state = { phase: 'chapters', outline, chapters: written };
    persist(state);
  }

  const registry = buildTermRegistry(outline);
  const flat = outline.sections.flatMap(s => s.chapters.map(c => ({ s, c })));
  const total = flat.length;
  let done = Object.keys(written).length;
  onProgress({
    phase: 'chapters', done, total,
    message: targetChapter
      ? `Regenerating chapter ${targetChapter}…`
      : `Resuming: ${done}/${total} chapters already written.`
  });

  /** Recent per-chapter wall time, including any depth repair in that pass. */
  const observedChapterMs = [];
  const perChapterEstimate = () => {
    const recent = observedChapterMs.slice(-8).sort((a, b) => a - b);
    if (!recent.length) return LIMITS.model.chapterEstimateMs;
    return recent[Math.min(recent.length - 1, Math.floor(recent.length * 0.75))];
  };
  /**
   * Chapters run in waves of `concurrency`; one remaining chapter still takes
   * one full call. Returns null when nothing is left so the UI hides the ETA
   * instead of claiming "~0s".
   */
  const etaFor = remaining => {
    if (remaining <= 0) return null;
    const waves = Math.ceil(remaining / concurrency);
    return new Date(Date.now() + waves * perChapterEstimate()).toISOString();
  };
  let chapterEtaAt = null;

  const units = [];
  for (const s of outline.sections) {
    const pending = s.chapters.filter(c => !written[c.id]);
    for (let i = 0; i < pending.length; i += batchSize) {
      units.push({ section: s, batch: pending.slice(i, i + batchSize) });
    }
  }
  if (units.length) {
    chapterEtaAt = etaFor(total - done);
    onProgress({ phase: 'chapters', done, total, etaAt: chapterEtaAt, message: `Writing ${total - done} chapters in ${units.length} pass(es)…` });
  }
  const writeUnit = async ({ section: s, batch }) => {
    checkTime();
    const unitStart = Date.now();
    const selected = selectSourceChunks(source, {
      ...batch[0],
      newTerms: batch.flatMap(c => c.newTerms || [])
    }, outline);
    onProgress({
      phase: 'chapters', done, total,
      chapter: batch[0].num + ' ' + batch[0].title.en,
      etaAt: chapterEtaAt,
      message: `Writing ${batch.map(c => c.num + ' ' + c.title.en).join(', ')}…`
    });
    let produced;
    try {
      produced = await writeChapterBatch(cfg, req, skill, outline, s, batch, callModel, limits, registry, selected, [], optionsText);
    } catch (e) {
      if (batch.length === 1) throw new Error(`Chapter ${batch[0].num} (${batch[0].id}) failed: ${e.message}`);
      // A batch that still truncates is retried one chapter at a time.
      produced = [];
      for (const one of batch) {
        produced.push(...await writeChapterBatch(cfg, req, skill, outline, s, [one], callModel, limits, registry,
          selectSourceChunks(source, one, outline), [], optionsText));
      }
    }
    for (const chapter of produced) {
      const outlineChapter = batch.find(c => c.id === chapter.id) || chapter;
      chapter.id = outlineChapter.id;
      chapter.num = outlineChapter.num;
      written[chapter.id] = chapter;
      const probeBook = draftBook(outline, written);
      const issues = issuesForChapter(checkDepth(probeBook), chapter);
      if (issues.length) {
        onProgress({ phase: 'validate', done, total, chapter: chapter.id, message: `Re-generating ${chapter.num}: ${issues.length} depth issue(s).` });
        const retry = await writeChapterBatch(cfg, req, skill, outline, s, [outlineChapter], callModel, limits, registry,
          selectSourceChunks(source, outlineChapter, outline), issues.slice(0, 8), optionsText);
        written[chapter.id] = retry[0];
        const after = issuesForChapter(checkDepth(draftBook(outline, written)), retry[0]);
        if (after.length) {
          // Keep the attempt; the validation pass below retries it with its own rounds.
          console.warn(`Chapter ${chapter.id} still has ${after.length} depth issue(s) after the inline repair.`);
        }
      }
      done++;
      state = { phase: 'chapters', outline, chapters: written };
      persist(state);
      chapterEtaAt = etaFor(total - done);
      onProgress({ phase: 'chapters', done, total, chapter: chapter.id, etaAt: chapterEtaAt, message: `Wrote ${done}/${total} chapters · ${chapter.num} ${chapter.title?.en || ''}.` });
    }
    // Measure the whole pass (including depth repairs) per produced chapter.
    const perChapter = (Date.now() - unitStart) / Math.max(1, produced.length);
    for (let i = 0; i < Math.max(1, produced.length); i++) observedChapterMs.push(perChapter);
  };

  // Chapter passes are independent once the outline and term registry exist, so
  // a small worker pool hides provider latency. A failure stops new units but
  // lets in-flight calls finish and persist their chapters for the retry.
  await poolMap(units, concurrency, writeUnit);

  // 3 — glossary pass (deterministic assembly + de-duplication).
  const book = draftBook(outline, written);
  book.glossary = assembleGlossary(book);
  onProgress({ phase: 'glossary', done: total, total, message: `Glossary assembled: ${book.glossary.length} terms.` });

  // 4 — validation pass: deterministic cleanup first, then targeted repairs.
  // Only chapters that still fail are rewritten, with a fresh issue list each round.
  const refreshDepth = next => {
    dropForwardRequires(next); // forward/unknown term links are fixable without the model
    next.glossary = assembleGlossary(next);
    return checkDepth(next);
  };
  let depth = refreshDepth(book);
  for (let round = 0; !depth.ok && round < LIMITS.model.validationRetries; round++) {
    const byChapter = new Map();
    for (const issue of depth.blocking) {
      if (!issue.cid) continue;
      if (!byChapter.has(issue.cid)) byChapter.set(issue.cid, []);
      byChapter.get(issue.cid).push(`${issue.code}: ${issue.message}`);
    }
    if (!byChapter.size) break;
    checkTime();
    const repairTotal = byChapter.size;
    let repairDone = 0;
    let repairEtaAt = etaFor(repairTotal);
    await poolMap([...byChapter], concurrency, async ([cid, issues]) => {
      const entry = flat.find(x => x.c.id === cid);
      if (!entry) return;
      onProgress({ phase: 'validate', done: repairDone, total: repairTotal, chapter: cid, etaAt: repairEtaAt, message: `Validation round ${round + 1}: re-generating ${entry.c.num}.` });
      const sourceSel = selectSourceChunks(source, entry.c, outline);
      const got = await writeChapterBatch(cfg, req, skill, outline, entry.s, [entry.c], callModel, limits, registry, sourceSel, issues.slice(0, 8), optionsText, round);
      written[cid] = got[0];
      state = { phase: 'validate', outline, chapters: written };
      persist(state);
      repairDone++;
      repairEtaAt = etaFor(repairTotal - repairDone);
      onProgress({ phase: 'validate', done: repairDone, total: repairTotal, chapter: cid, etaAt: repairEtaAt, message: `Repaired ${repairDone}/${repairTotal} chapter(s)…` });
    });
    const next = draftBook(outline, written);
    depth = refreshDepth(next);
    Object.assign(book, next);
  }
  if (!depth.ok) {
    const first = depth.blocking.slice(0, 6).map(i => i.message).join(' | ');
    throw new Error(`The assembled book failed the depth contract (${depth.blocking.length} issues): ${first}`);
  }

  book.glossary = assembleGlossary(book);
  const json = JSON.stringify(book);
  if (Buffer.byteLength(json) > LIMITS.json.siteBytes) {
    throw new Error(`The book is larger than the ${Math.round(LIMITS.json.siteBytes / 1048576)} MiB site.json limit. Split it into parts.`);
  }
  const check = validateSite(book);
  if (!check.ok) throw new Error('The assembled book failed validation: ' + check.error);
  if (saveDraft) saveDraft({ phase: 'done', outline, chapters: written });
  onProgress({ phase: 'done', done: total, total, message: `Book ready: ${total} chapters, ${book.glossary.length} terms, depth validation passed.` });
  return book;
}

/* ------------------------------------------------------------------ validation */
const B = z.object({ hu: z.string().min(1), en: z.string().min(1) });
const BOpt = z.object({ hu: z.string(), en: z.string() });
const Check = z.object({ q: B, a: B, hint: BOpt });
const Confusion = z.object({ a: B, b: B, note: BOpt });
const Term = z.object({ id: z.string().min(1), term: B, plain: BOpt, precise: BOpt, requires: z.array(z.string()).default([]) });
const Theory = z.discriminatedUnion('type', [
  z.object({ type: z.literal('formula'), title: B, latex: z.string().min(1), note: BOpt }),
  z.object({ type: z.literal('code'), title: B, lang: z.string().max(20), code: z.string().min(1) }),
  z.object({ type: z.literal('list'), title: B, items: z.object({ hu: z.array(z.string().min(1)).min(1), en: z.array(z.string().min(1)).min(1) }) }),
  z.object({ type: z.literal('p'), body: B }),
  z.object({ type: z.enum(['def', 'thm', 'note', 'warn']), title: B, body: B })
]).and(z.object({
  plain: BOpt.optional(), why: BOpt.optional(), precise: BOpt.optional(), analogy: BOpt.optional(),
  confusions: z.array(Confusion).optional(), checks: z.array(Check).optional(),
  terms: z.array(z.string()).optional()
}));
const Exercise = z.object({
  q: B, a: z.string(), type: z.enum(['number', 'expr', 'text', 'choice', 'proof']),
  hint: BOpt, sol: BOpt, choices: z.object({ hu: z.array(z.string().min(1)).min(2), en: z.array(z.string().min(1)).min(2) }).optional()
}).superRefine((q, ctx) => {
  if (q.type !== 'proof' && !q.a.trim()) ctx.addIssue({ code: 'custom', message: 'answer is required' });
  if (q.type === 'choice' && !q.choices) ctx.addIssue({ code: 'custom', message: 'choice exercise needs choices' });
});
const Chapter = z.object({
  id: z.string().min(1), num: z.string().min(1), title: B, lead: B,
  why: z.object({ hu: z.array(z.string().min(1)).min(1), en: z.array(z.string().min(1)).min(1) }),
  when: B, minutes: z.number().min(LIMITS.depth.minMinutes).max(LIMITS.depth.maxMinutes),
  terms: z.array(Term).default([]),
  refresher: z.array(z.object({
    label: B, term: z.string().optional(),
    chapter: z.object({ section: z.string(), chapter: z.string() }).optional()
  })).default([]),
  recap: z.object({ points: z.object({ hu: z.array(z.string().min(1)), en: z.array(z.string().min(1)) }), next: BOpt }),
  checks: z.array(Check).default([]),
  theory: z.array(Theory).min(1),
  examples: z.array(z.object({
    title: B, problem: B,
    steps: z.object({ hu: z.array(z.string().min(1)).min(1), en: z.array(z.string().min(1)).min(1) }),
    reasons: z.object({ hu: z.array(z.string()).default([]), en: z.array(z.string()).default([]) }).optional(),
    answer: B
  })).min(1),
  mistakes: z.object({ hu: z.array(z.string().min(1)).min(1), en: z.array(z.string().min(1)).min(1) }),
  exercises: z.array(Exercise).min(1)
});
const Section = z.object({
  id: z.string().min(1), num: z.string().min(1), title: B, subtitle: B, intro: B,
  conceptMap: z.object({ hu: z.array(z.string()), en: z.array(z.string()) }).default({ hu: [], en: [] }),
  summary: BOpt.default({ hu: '', en: '' }),
  chapters: z.array(Chapter).min(1)
});
export const SiteSchema = z.object({
  version: z.number(), title: B, subtitle: B, summary: B,
  sections: z.array(Section).min(1),
  glossary: z.array(z.object({
    id: z.string().min(1), term: B, plain: BOpt, precise: BOpt,
    requires: z.array(z.string()).default([]),
    chapter: z.object({ section: z.string(), chapter: z.string(), num: z.string().optional(), title: B.optional() })
  })).default([])
});
export function validateSite(site) {
  const result = SiteSchema.safeParse(site);
  return result.success ? { ok: true, error: '' } : { ok: false, error: result.error.issues.slice(0, 8).map(i => i.path.join('.') + ': ' + i.message).join('; ') };
}

/* ------------------------------------------------------------------ worker */
const activeJobs = new Set();
/** True between SIGTERM and exit: in-flight jobs must not overwrite the requeue. */
let stopping = false;
let kickTimer = null;
export function kick(delay = 0) {
  if (activeJobs.size >= MAX_CONCURRENT_JOBS) return;
  if (kickTimer) {
    if (delay > 0) return;
    clearTimeout(kickTimer);
  }
  kickTimer = setTimeout(function () { kickTimer = null; drain(); }, Math.max(0, delay));
}
function claimJob() {
  const t = now();
  const job = sqlite.prepare("SELECT * FROM jobs WHERE status='queued' AND (next_attempt_at IS NULL OR next_attempt_at<=?) ORDER BY id LIMIT 1").get(t);
  if (!job) return null;
  const changed = sqlite.prepare("UPDATE jobs SET status='running',attempts=attempts+1,locked_at=?,next_attempt_at=NULL,log='Contacting the model…',progress=NULL,updated_at=? WHERE id=? AND status='queued'").run(t, t, job.id);
  if (!changed.changes) return null;
  sqlite.prepare("UPDATE sites SET status='running',error='',updated_at=? WHERE id=?").run(t, job.site_id);
  return { ...job, attempts: (job.attempts || 0) + 1 };
}
/** Milliseconds until the earliest queued job becomes eligible (0 when one is ready now). */
function nextWakeDelay() {
  if (sqlite.prepare("SELECT 1 FROM jobs WHERE status='queued' AND (next_attempt_at IS NULL OR next_attempt_at<=?) LIMIT 1").get(now())) return 0;
  const row = sqlite.prepare("SELECT MIN(next_attempt_at) AS t FROM jobs WHERE status='queued'").get();
  return row?.t ? Math.max(0, new Date(row.t).getTime() - Date.now()) : 0;
}
/**
 * Requeue jobs whose worker died. A deploy is not a generation failure, so
 * `resetAttempts` (used at startup) keeps the retry budget intact and never
 * fails a site just because the container was replaced mid-book.
 */
export function recoverJobs(leaseMs = JOB_LEASE_MS, { resetAttempts = false } = {}) {
  const stale = new Date(Date.now() - leaseMs).toISOString();
  const rows = sqlite.prepare("SELECT * FROM jobs WHERE status='running' AND (locked_at IS NULL OR locked_at<?)").all(stale);
  for (const row of rows) {
    if (activeJobs.has(row.id)) continue;
    if (!resetAttempts && (row.attempts || 0) >= MAX_JOB_ATTEMPTS) {
      sqlite.prepare("UPDATE jobs SET status='failed',last_error='Worker lease expired',locked_at=NULL,updated_at=? WHERE id=?").run(now(), row.id);
      sqlite.prepare("UPDATE sites SET status='failed',error='Generation worker stopped before completion. Try again.',updated_at=? WHERE id=?").run(now(), row.site_id);
    } else {
      sqlite.prepare("UPDATE jobs SET status='queued',attempts=?,locked_at=NULL,next_attempt_at=?,updated_at=? WHERE id=?")
        .run(resetAttempts ? 0 : (row.attempts || 0), now(), now(), row.id);
      sqlite.prepare("UPDATE sites SET status='queued',error='',updated_at=? WHERE id=?").run(now(), row.site_id);
    }
  }
  return rows.length;
}
function drain() {
  while (activeJobs.size < MAX_CONCURRENT_JOBS) {
    const job = claimJob();
    if (!job) break;
    activeJobs.add(job.id);
    runJob(job).catch(e => console.error('Job failed:', e)).finally(function () {
      activeJobs.delete(job.id);
      kick(nextWakeDelay());
    });
  }
}
/** Reconstruct a resumable draft from a published site.json (chapter rewrites). */
function draftFromBook(book) {
  const chapters = {};
  const sections = (book.sections || []).map((s, si) => ({
    id: s.id || `section-${si + 1}`,
    num: s.num || String(si + 1).padStart(2, '0'),
    title: biv(s.title),
    subtitle: biv(s.subtitle || s.title),
    intro: biv(s.intro || s.subtitle || s.title),
    conceptMap: bivArr(s.conceptMap || []),
    summary: biv(s.summary || ''),
    chapters: (s.chapters || []).map(c => {
      chapters[c.id] = c;
      return {
        id: c.id,
        num: c.num,
        title: biv(c.title),
        focus: String(c.focus || ''),
        newTerms: (c.terms || []).map(t => ({ id: t.id, term: biv(t.term), requires: t.requires || [] })),
      };
    }),
  }));
  return {
    phase: 'done',
    outline: { title: biv(book.title), subtitle: biv(book.subtitle), summary: biv(book.summary), sections, total: Object.keys(chapters).length },
    chapters,
  };
}

async function runJob(job) {
  const site = siteRow(job.site_id);
  if (!site || site.archived || site.status === 'ready') {
    sqlite.prepare("UPDATE jobs SET status='failed',log='Site missing, archived or already ready',updated_at=? WHERE id=?").run(now(), job.id);
    return;
  }
  if (sqlite.prepare('SELECT cancel_requested FROM jobs WHERE id=?').get(job.id)?.cancel_requested) {
    sqlite.prepare("UPDATE jobs SET status='cancelled',locked_at=NULL,updated_at=? WHERE id=?").run(now(), job.id);
    sqlite.prepare("UPDATE sites SET status='cancelled',error='Cancelled by user.',updated_at=? WHERE id=?").run(now(), site.id);
    return;
  }
  try {
    const profile = ensureProfile(site.owner_id);
    const cfg = llmConfig(effectiveProfile(profile));
    if (!useMock() && !cfg.key) throw new Error('No API key. Add one in Settings.');
    const req = { title: site.title, description: site.description, topic: site.topic, audience: site.audience, language: site.language, long_text: site.source_text };
    let draft = loadDraft(site.id);
    if (!draft && job.chapter_id) {
      try {
        draft = draftFromBook(JSON.parse(fs.readFileSync(siteJsonPath(site.slug), 'utf8')));
      } catch {
        throw new Error('This site has no generated content to rewrite.');
      }
    }
    const options = parseSiteOptions(site.options);
    // Live status, not just chapter boundaries: the builder shows the phase,
    // the current chapter and streamed characters while a call is in flight.
    let live = { phase: 'outline', done: 0, total: 0, chapter: '', activity: null, etaAt: null };
    const writeLive = message => {
      try {
        sqlite.prepare('UPDATE jobs SET log=?,progress=?,updated_at=? WHERE id=?')
          .run(String(message || 'Working…').slice(0, 2000), JSON.stringify(live), now(), job.id);
      } catch (e) { console.error('Progress write failed:', e.message); }
    };
    writeLive('Designing the outline and term registry…');
    let lastActivityWrite = 0;
    const parsed = await buildBook({
      cfg, req,
      maxChapters: site.max_chapters || undefined,
      draft,
      options,
      regenerateChapter: job.chapter_id || null,
      deadlineAt: Date.now() + MAX_JOB_RUNTIME_MS,
      saveDraft: state => saveDraft(site.id, state),
      source: site.source_text || '',
      onProgress: p => {
        live = {
          phase: p.phase || live.phase, done: p.done || 0, total: p.total || 0,
          chapter: p.chapter || '', activity: null, etaAt: p.etaAt || null
        };
        writeLive(p.message);
      },
      onActivity: a => {
        const t = Date.now();
        if (t - lastActivityWrite < 1200) return;
        lastActivityWrite = t;
        live.activity = { chars: a.chars, elapsedMs: a.elapsedMs, updatedAt: new Date().toISOString() };
        writeLive(`Writing ${live.chapter || 'the current chapter'} — ${Number(a.chars).toLocaleString('en-US')} characters received (${Math.round(a.elapsedMs / 1000)} s)`);
      }
    });
    if (stopping) return; // stopWorker already requeued it; the next start resumes.
    if (sqlite.prepare('SELECT cancel_requested FROM jobs WHERE id=?').get(job.id)?.cancel_requested) {
      sqlite.prepare("UPDATE jobs SET status='cancelled',locked_at=NULL,updated_at=? WHERE id=?").run(now(), job.id);
      sqlite.prepare("UPDATE sites SET status='cancelled',error='Cancelled by user.',updated_at=? WHERE id=?").run(now(), site.id);
      return;
    }
    const json = JSON.stringify(parsed, null, 2);
    if (Buffer.byteLength(json) > LIMITS.json.siteBytes) throw new Error('Generated site.json exceeds the size limit.');
    const dir = path.dirname(siteJsonPath(site.slug));
    await fsp.mkdir(dir, { recursive: true });
    await fsp.writeFile(siteJsonPath(site.slug), json);
    clearDraft(site.id);
    const chapterCount = (parsed.sections || []).reduce((n, s) => n + (s.chapters || []).length, 0);
    sqlite.prepare(`UPDATE sites SET status='ready',error='',title_hu=?,title_en=?,summary_hu=?,summary_en=?,chapter_count=?,updated_at=? WHERE id=?`)
      .run(parsed.title?.hu || site.title, parsed.title?.en || site.title, parsed.summary?.hu || '', parsed.summary?.en || '', chapterCount, now(), site.id);
    sqlite.prepare("UPDATE jobs SET status='done',log=?,last_error='',locked_at=NULL,next_attempt_at=NULL,progress=NULL,updated_at=? WHERE id=?").run('Generated and routed at ' + siteUrl(site.slug), now(), job.id);
  } catch (e) {
    if (stopping) {
      console.warn('Generation interrupted by shutdown; job left queued for the next start.');
      return;
    }
    const attempt = job.attempts || 1;
    const message = String(e.message || e).slice(0, 2000);
    const friendly = friendlyGenerationError(message);
    // A failed chapter rewrite must not take down an already published book.
    const keepsPublished = job.kind === 'chapter' && fs.existsSync(siteJsonPath(site.slug));
    // A depth-contract failure or an exhausted time budget will not improve by
    // rewriting the same book again; keep the draft and stop.
    const fatal = /time budget|depth contract|failed validation/i.test(message);
    if (!fatal && attempt < MAX_JOB_ATTEMPTS) {
      const delay = Math.min(60000, 5000 * Math.pow(2, attempt - 1));
      const next = new Date(Date.now() + delay).toISOString();
      // The draft stays: the retry resumes instead of restarting the book.
      sqlite.prepare("UPDATE jobs SET status='queued',locked_at=NULL,next_attempt_at=?,last_error=?,log=?,updated_at=? WHERE id=?").run(next, message, 'Retrying: ' + friendly, now(), job.id);
      sqlite.prepare("UPDATE sites SET status=?,error=?,updated_at=? WHERE id=?")
        .run(keepsPublished ? 'ready' : 'queued', keepsPublished ? '' : message, now(), site.id);
    } else {
      sqlite.prepare("UPDATE sites SET status=?,error=?,updated_at=? WHERE id=?")
        .run(keepsPublished ? 'ready' : 'failed', keepsPublished ? '' : message, now(), site.id);
      // The stack stays in last_error; the log is what the owner sees.
      sqlite.prepare("UPDATE jobs SET status='failed',locked_at=NULL,last_error=?,log=?,updated_at=? WHERE id=?").run(message, friendly, now(), job.id);
    }
    console.error('Job failed:', e);
  }
}
let heartbeat = 0;
let heartbeatTimer = null;
let maintenanceTimer = null;

/** Last time the queue loop was alive, used by /readyz. */
export function workerHeartbeat() {
  return heartbeat;
}

export function workerSnapshot() {
  return { activeJobs: activeJobs.size, heartbeat, running: !!heartbeatTimer };
}

export function startWorker() {
  // Single-instance deployment: any job still marked running at startup is
  // orphaned by the previous process, so do not wait for the full lease.
  // A deploy must not consume a retry either: requeue with a fresh budget.
  stopping = false;
  const resumed = recoverJobs(0, { resetAttempts: true });
  if (resumed) console.log(`Resuming ${resumed} interrupted generation job(s).`);
  heartbeat = Date.now();
  if (!heartbeatTimer) {
    heartbeatTimer = setInterval(() => {
      heartbeat = Date.now();
      if (!activeJobs.size) return;
      try {
        const t = now();
        const renew = sqlite.prepare("UPDATE jobs SET locked_at=? WHERE id=? AND status='running'");
        for (const id of activeJobs) renew.run(t, id);
      } catch (e) {
        console.error('Job lease renewal failed:', e);
      }
    }, 10000);
    heartbeatTimer.unref();
  }
  if (!maintenanceTimer) {
    maintenanceTimer = setInterval(() => {
      try { recoverJobs(); } catch (e) { console.error('Job recovery failed:', e); }
    }, 60000);
    maintenanceTimer.unref();
  }
  kick(nextWakeDelay());
}

export function stopWorker() {
  stopping = true;
  clearInterval(heartbeatTimer);
  clearInterval(maintenanceTimer);
  clearTimeout(kickTimer);
  heartbeatTimer = null;
  maintenanceTimer = null;
  kickTimer = null;
  // Hand still-running jobs back to the queue before the DB closes so the next
  // process resumes them instead of leaving them stuck in `running`.
  try {
    const t = now();
    const requeue = sqlite.prepare("UPDATE jobs SET status='queued',locked_at=NULL,updated_at=? WHERE id=? AND status='running'");
    for (const id of activeJobs) requeue.run(t, id);
  } catch {}
}
