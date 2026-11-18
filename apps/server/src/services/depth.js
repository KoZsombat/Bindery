/**
 * Depth contract enforcement.
 *
 * `validateDepth(site)` is the automated half of SKILL.md "Explanation depth and
 * beginner accessibility". It runs:
 *   - after every chapter pass (only that chapter),
 *   - once more on the assembled book (all chapters, glossary, prerequisites).
 *
 * It never mutates the book. The pipeline decides what to regenerate.
 */
import { LIMITS, chapterWordBudget } from '../limits.js';

const STOP = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'when', 'then',
  'than', 'your', 'you', 'are', 'was', 'were', 'will', 'have', 'has', 'not', 'can', 'may', 'one',
  'two', 'its', 'our', 'their', 'set', 'use', 'used', 'using', 'value', 'values']);

export function wordsOf(text) {
  return String(text || '')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$]*\$/g, ' ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

function collect(value, out) {
  if (value == null) return out;
  if (typeof value === 'string') { out.push(value); return out; }
  if (Array.isArray(value)) { value.forEach(v => collect(v, out)); return out; }
  if (typeof value === 'object') { Object.values(value).forEach(v => collect(v, out)); }
  return out;
}

/** Prose that counts towards the chapter word budget (exercises excluded on purpose). */
function chapterProse(c, lang) {
  const parts = [c.lead?.[lang], c.when?.[lang], ...(c.why?.[lang] || []), ...(c.mistakes?.[lang] || [])];
  for (const t of c.theory || []) {
    parts.push(t.title?.[lang], t.body?.[lang], t.plain?.[lang], t.why?.[lang], t.precise?.[lang], t.analogy?.[lang]);
    for (const item of t.items?.[lang] || []) parts.push(item);
    for (const x of t.confusions || []) { parts.push(x.a?.[lang], x.b?.[lang], x.note?.[lang]); }
    for (const q of t.checks || []) { parts.push(q.q?.[lang], q.a?.[lang], q.hint?.[lang]); }
  }
  for (const e of c.examples || []) {
    parts.push(e.problem?.[lang], e.answer?.[lang]);
    for (const s of e.steps?.[lang] || []) parts.push(s);
    for (const s of e.reasons?.[lang] || []) parts.push(s);
  }
  for (const q of c.checks || []) { parts.push(q.q?.[lang], q.a?.[lang], q.hint?.[lang]); }
  if (c.recap) { parts.push(...(c.recap.points?.[lang] || []), c.recap.next?.[lang]); }
  return parts;
}

export function chapterBudget(chapter) {
  return chapterWordBudget((chapter.terms || []).length);
}

/** Build the glossary from chapter term registries. Deterministic, de-duplicated by term id. */
export function assembleGlossary(site) {
  const glossary = [];
  const seen = new Set();
  for (const s of site.sections || []) {
    for (const c of s.chapters || []) {
      for (const t of c.terms || []) {
        if (seen.has(t.id)) continue;
        seen.add(t.id);
        glossary.push({
          id: t.id,
          term: t.term,
          plain: t.plain,
          precise: t.precise,
          requires: Array.isArray(t.requires) ? t.requires.slice() : [],
          chapter: { section: s.id, chapter: c.id, num: c.num, title: c.title }
        });
      }
    }
  }
  return glossary;
}

function termName(t) {
  return String(t?.term?.en || t?.id || '').trim();
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function validateDepth(site) {
  const issues = [];
  const add = (code, message, sid = '', cid = '') => issues.push({ code, message, sid, cid });
  const sections = site?.sections || [];
  const order = [];
  const termOwner = new Map();
  const glossary = Array.isArray(site?.glossary) ? site.glossary : [];
  const glossaryById = new Map(glossary.map(g => [g.id, g]));
  const budgets = {};

  sections.forEach((s, si) => {
    if (!(s.conceptMap?.hu || []).length || !(s.conceptMap?.en || []).length) {
      add('section.conceptMap', `Section ${s.id || si} has no concept map.`, s.id);
    }
    if (!s.summary?.hu || !s.summary?.en) add('section.summary', `Section ${s.id || si} has no summary.`, s.id);
    (s.chapters || []).forEach(c => {
      const idx = order.length;
      order.push({ sid: s.id, cid: c.id, c });
      for (const t of c.terms || []) {
        if (!termOwner.has(t.id)) termOwner.set(t.id, { idx, c, t });
        else add('term.definedTwice', `Term "${t.id}" is defined in more than one chapter.`, s.id, c.id);
      }
    });
  });

  for (const { sid, cid, c } of order) {
    const label = `${cid}`;
    // Required fields
    if (!c.lead?.hu || !c.lead?.en) add('chapter.lead', `${label}: missing lead.`, sid, cid);
    if (!(c.why?.hu || []).length || !(c.why?.en || []).length) add('chapter.why', `${label}: missing why.`, sid, cid);
    if (!c.when?.hu || !c.when?.en) add('chapter.when', `${label}: missing when.`, sid, cid);
    if (!(c.checks || []).length) add('chapter.checks', `${label}: needs check-yourself questions.`, sid, cid);
    for (const q of c.checks || []) {
      if (!q.q?.hu || !q.q?.en || !q.a?.hu || !q.a?.en) add('chapter.checks', `${label}: a check is missing question/answer in one language.`, sid, cid);
    }
    if (!(c.refresher || []).length) add('chapter.refresher', `${label}: missing "Before you start" refresher.`, sid, cid);
    if (!(c.recap?.points?.hu || []).length || !(c.recap?.points?.en || []).length) {
      add('chapter.recap', `${label}: missing recap.`, sid, cid);
    } else {
      const n = c.recap.points.hu.length;
      if (n < LIMITS.depth.minRecapPoints || n > LIMITS.depth.maxRecapPoints ||
          c.recap.points.en.length !== n) {
        add('chapter.recap', `${label}: recap needs ${LIMITS.depth.minRecapPoints}-${LIMITS.depth.maxRecapPoints} bullets in both languages and equal lengths.`, sid, cid);
      }
      if (!c.recap.next?.hu || !c.recap.next?.en) add('chapter.recap', `${label}: recap has no "what's next".`, sid, cid);
    }

    // Worked examples: every step carries a reason.
    const examples = c.examples || [];
    if (!examples.length) add('chapter.example', `${label}: needs at least one worked example.`, sid, cid);
    examples.forEach((e, ei) => {
      const n = e.steps?.hu?.length || 0;
      if (!n || n !== (e.steps?.en?.length || 0)) add('example.steps', `${label}: example ${ei + 1} has mismatched steps.`, sid, cid);
      if ((e.reasons?.hu || []).length !== n || (e.reasons?.en || []).length !== n) {
        add('example.reasons', `${label}: example ${ei + 1} needs one "why this step" per step.`, sid, cid);
      }
    });

    // Per-concept blocks.
    for (const t of c.theory || []) {
      if (t.type !== 'def' && t.type !== 'thm') continue;
      for (const field of ['plain', 'why', 'precise', 'analogy']) {
        if (!t[field]?.hu || !t[field]?.en) {
          add('block.' + field, `${label}: ${t.type} block "${t.title?.en || '?'}" needs ${field} in both languages.`, sid, cid);
        }
      }
      const checks = t.checks || [];
      if (checks.length < 1 || checks.length > 2) {
        add('block.checks', `${label}: ${t.type} block "${t.title?.en || '?'}" needs 1-2 check-yourself questions.`, sid, cid);
      }
      const declared = t.terms || [];
      if (declared.length > LIMITS.depth.maxNewTermsPerBlock) {
        add('block.termCap', `${label}: block "${t.title?.en || '?'}" introduces ${declared.length} terms; max ${LIMITS.depth.maxNewTermsPerBlock}. Split it.`, sid, cid);
      }
      for (const id of declared) {
        if (!(c.terms || []).some(x => x.id === id)) {
          add('block.termOwner', `${label}: block declares unknown term "${id}".`, sid, cid);
        }
        if (!(t.plain?.hu || t.plain?.en)) add('block.plain', `${label}: term block "${id}" lacks plain words.`, sid, cid);
      }
    }

    // Word budget in both languages.
    const budget = chapterBudget(c);
    const hu = wordsOf(chapterProse(c, 'hu').join(' '));
    const en = wordsOf(chapterProse(c, 'en').join(' '));
    budgets[`${sid}/${cid}`] = { budget, hu, en, terms: (c.terms || []).length };
    if (hu < budget || en < budget) {
      add('chapter.budget', `${label}: ${hu} HU / ${en} EN words, budget ${budget}. Add explanation, do not compress.`, sid, cid);
    }

    // Terms: definition completeness.
    for (const t of c.terms || []) {
      if (!t.id || !t.term?.hu || !t.term?.en || !t.plain?.hu || !t.plain?.en || !t.precise?.hu || !t.precise?.en) {
        add('term.shape', `${label}: term "${t.id || '?'}" needs id, term, plain and precise in both languages.`, sid, cid);
      }
    }

    // Refresher links resolve to earlier chapters or known terms.
    for (const r of c.refresher || []) {
      if (r.term && !glossaryById.has(r.term) && !termOwner.has(r.term)) {
        add('refresher.term', `${label}: refresher references unknown term "${r.term}".`, sid, cid);
      }
      if (r.chapter) {
        const at = order.findIndex(x => x.sid === r.chapter.section && x.cid === r.chapter.chapter);
        const self = order.findIndex(x => x.sid === sid && x.cid === cid);
        if (at < 0 || at >= self) add('refresher.chapter', `${label}: refresher chapter link does not point backwards.`, sid, cid);
      }
    }
  }

  // Glossary coverage + prerequisite direction.
  const needed = new Set(termOwner.keys());
  for (const id of needed) {
    if (!glossaryById.has(id)) add('glossary.missing', `Glossary is missing term "${id}".`);
  }
  for (const g of glossary) {
    if (!glossaryById.get(g.id)) continue;
    if (!needed.has(g.id)) add('glossary.orphan', `Glossary term "${g.id}" is not defined by any chapter.`);
    if (!g.chapter?.section || !g.chapter?.chapter) add('glossary.link', `Glossary term "${g.id}" has no chapter link.`);
    const owner = termOwner.get(g.id);
    for (const req of g.requires || []) {
      const reqOwner = termOwner.get(req);
      if (!reqOwner) { add('term.requires', `Term "${g.id}" requires unknown term "${req}".`); continue; }
      if (owner && reqOwner.idx >= owner.idx) add('term.requires', `Term "${g.id}" requires "${req}", which is introduced later.`);
    }
  }

  // Used-before-defined scan. Conservative: only multi-character domain terms,
  // never inside their defining chapter, never common words.
  const orderedTerms = [...termOwner.entries()].map(([id, x]) => ({
    id, idx: x.idx, name: termName(x.t), aliases: x.t.aliases || []
  })).filter(t => t.name.length >= 4 && !STOP.has(t.name.toLowerCase()));
  orderedTerms.sort((a, b) => b.name.length - a.name.length);
  for (const term of orderedTerms) {
    const names = [term.name, ...(term.aliases || [])].filter(n => String(n).length >= 4);
    if (!names.length) continue;
    const re = new RegExp('\\b(' + names.map(escapeRe).join('|') + ')\\b', 'i');
    const self = order[term.idx];
    for (let i = 0; i < order.length; i++) {
      if (i >= term.idx) break;
      const { c } = order[i];
      if (re.test(collect([c.lead, c.why, c.when, c.mistakes, c.recap, c.checks, c.theory, c.examples], []).join(' '))) {
        add('term.beforeDefined', `Term "${term.name}" is used in ${c.id} before ${self ? self.cid : 'its definition'}.`, order[i].sid, c.id);
      }
    }
  }

  return { ok: issues.length === 0, issues, budgets };
}

/** Compact one-line summary for job logs. */
export function depthSummary(result) {
  if (result.ok) return 'depth validation passed';
  const byChapter = new Map();
  for (const i of result.issues) {
    const key = i.cid || i.sid || 'book';
    byChapter.set(key, (byChapter.get(key) || 0) + 1);
  }
  return [...byChapter.entries()].map(([k, n]) => `${k}: ${n}`).join(', ');
}
