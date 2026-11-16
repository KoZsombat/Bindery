import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  LLM_BASE_URL, LLM_MODEL, LLM_MOCK, LLM_MAX_TOKENS,
  MAX_CONCURRENT_JOBS, MAX_JOB_ATTEMPTS, JOB_LEASE_MS, SKILL_PATH
} from '../config.js';
import { decrypt } from '../crypto.js';
import { assertSafeLlmBase } from './url-safety.js';
import { sqlite, ensureProfile, now, slugify, siteRow, siteJsonPath, siteUrl, sharedKeySource, getSettings } from '../db/index.js';

/* ------------------------------------------------------------------ model */
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
export function normalizeSite(raw, req, limits = {}) {
  if (!raw || typeof raw !== 'object') throw new Error('The model did not return a JSON object.');
  const maxChapters = Math.max(1, Number(limits.maxChapters) || 60);
  const maxPerSection = Math.max(1, Math.min(maxChapters, Number(limits.maxPerSection) || 25));
  const sections = Array.isArray(raw.sections) ? raw.sections.slice(0, Math.min(12, maxChapters)) : [];
  if (!sections.length) throw new Error('The generated site has no sections.');
  const out = {
    version: 1,
    title: String(raw.title || req.title || req.topic || 'Learning site').slice(0, 160),
    subtitle: biv(raw.subtitle || req.description || ''),
    summary: biv(raw.summary || req.description || ''),
    sections: []
  };
  let chapters = 0;
  for (const s of sections) {
    const sec = {
      id: slugify(s.id || s.title || 'section'),
      num: String(s.num || out.sections.length + 1).padStart(2, '0'),
      title: biv(s.title || 'Section'), subtitle: biv(s.subtitle || ''), intro: biv(s.intro || ''), chapters: []
    };
    for (const c of (Array.isArray(s.chapters) ? s.chapters : []).slice(0, maxPerSection)) {
      if (chapters++ >= maxChapters) break;
      const ch = {
        id: slugify(c.id || c.title || 'chapter'),
        num: String(c.num || (out.sections.length + 1) + '.' + (sec.chapters.length + 1)),
        title: biv(c.title || 'Chapter'), lead: biv(c.lead || ''),
        why: bivArr(c.why), when: biv(c.when || ''),
        minutes: Math.max(5, Math.min(90, Number(c.minutes) || 25)),
        theory: [], examples: [], mistakes: bivArr(c.mistakes), exercises: []
      };
      for (const t of (Array.isArray(c.theory) ? c.theory : []).slice(0, 12)) {
        const type = ['def', 'thm', 'note', 'warn', 'formula', 'p', 'list', 'code'].includes(t.type) ? t.type : 'p';
        const b = { type };
        if (type === 'formula') { b.title = biv(t.title || 'Formula'); b.latex = String(t.latex || ''); b.note = biv(t.note || ''); }
        else if (type === 'code') { b.title = biv(t.title || 'Code'); b.lang = String(t.lang || 'text').slice(0, 20); b.code = String(t.code || ''); }
        else if (type === 'list') { b.title = biv(t.title || ''); b.items = bivArr(t.items); }
        else if (type === 'p') { b.body = biv(t.body || ''); }
        else { b.title = biv(t.title || ''); b.body = biv(t.body || ''); }
        ch.theory.push(b);
      }
      for (const e of (Array.isArray(c.examples) ? c.examples : []).slice(0, 4)) {
        ch.examples.push({
          title: biv(e.title || 'Example'), problem: biv(e.problem || ''),
          steps: bivArr(e.steps), answer: biv(e.answer || '')
        });
      }
      for (const q of (Array.isArray(c.exercises) ? c.exercises : []).slice(0, 8)) {
        const type = ['number', 'expr', 'text', 'choice', 'proof'].includes(q.type) ? q.type : 'expr';
        const item = { q: biv(q.q || ''), a: String(q.a == null ? '' : q.a), type, hint: biv(q.hint || ''), sol: biv(q.sol || '') };
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
  return out;
}
export function mockSite(req) {
  return {
    title: req.title || 'Sample learning book',
    subtitle: { hu: 'A generated example', en: 'A generated example' },
    summary: { hu: req.description || 'Built from the request.', en: req.description || 'Built from the request.' },
    sections: [{
      id: 'basics', num: '01', title: { hu: 'Alapok', en: 'Foundations' },
      subtitle: { hu: 'Kezdet', en: 'Getting started' },
      intro: { hu: req.topic || 'Bevezetés', en: req.topic || 'Introduction' },
      chapters: [{
        id: 'first', num: '1.1', title: { hu: 'Első fejezet', en: 'First chapter' },
        lead: { hu: req.long_text || 'Rövid bevezetés.', en: req.long_text || 'A short introduction.' },
        why: { hu: ['Mert minden erre épül.'], en: ['Because everything builds on it.'] },
        when: { hu: 'Az elején.', en: 'At the beginning.' }, minutes: 20,
        theory: [{ type: 'def', title: { hu: 'Definíció', en: 'Definition' }, body: { hu: 'Egy egyszerű példa.', en: 'A simple example.' } }],
        examples: [{ title: { hu: 'Példa', en: 'Example' }, problem: { hu: '$2+2=?$', en: '$2+2=?$' }, steps: { hu: ['Összeadunk.'], en: ['Add them.'] }, answer: { hu: '$4$', en: '$4$' } }],
        mistakes: { hu: ['Nem kell tippelni.'], en: ['Do not guess.'] },
        exercises: [{ q: { hu: 'Mennyi $2+2$?', en: 'What is $2+2$?' }, a: '4', type: 'number', hint: { hu: 'Két pár.', en: 'Two pairs.' }, sol: { hu: '$4$', en: '$4$' } }]
      }]
    }]
  };
}
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
async function callLLM(cfg, messages, maxTokens = LLM_MAX_TOKENS) {
  if (useMock()) {
    const delay = Number(process.env.LLM_MOCK_DELAY || 0);
    if (delay > 0) await new Promise(r => setTimeout(r, Math.min(10000, delay)));
    return JSON.stringify(mockSite(messages.request || {}));
  }
  const payload = { model: cfg.model, messages, temperature: 0.35, max_tokens: maxTokens };
  if (process.env.LLM_JSON_MODE !== '0') payload.response_format = { type: 'json_object' };
  await assertSafeLlmBase(cfg.base);
  const doFetch = async body => {
    const r = await fetch(cfg.base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.key },
      body: JSON.stringify(body),
      redirect: 'manual',
      signal: AbortSignal.timeout(300000)
    });
    if (r.status >= 300 && r.status < 400) throw new Error('LLM API redirected; point the base URL at the final endpoint.');
    const text = await r.text();
    if (!r.ok) { const e = new Error('LLM API ' + r.status + ': ' + text.slice(0, 500)); e.status = r.status; throw e; }
    return JSON.parse(text).choices?.[0]?.message?.content || '';
  };
  try { return await doFetch(payload); }
  catch (e) {
    if (payload.response_format && (e.status === 400 || e.status === 422)) { delete payload.response_format; return doFetch(payload); }
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

/* ------------------------------------------------- multi-pass book generation */
// A full course is 20-30 bilingual chapters. One completion cannot hold that,
// so the model first designs an outline, then writes chapters in small batches.
// Each batch is validated on its own and merged into the outline.
function requestText(req) {
  return `Title: ${req.title}\nTopic: ${req.topic}\nDescription: ${req.description}\nAudience: ${req.audience}\nLanguage preference: ${req.language}\n`;
}
function normalizeOutline(raw, req, maxChapters) {
  if (!raw || typeof raw !== 'object') throw new Error('The model did not return an outline object.');
  const used = new Set();
  const sections = [];
  let total = 0;
  for (const s of (Array.isArray(raw.sections) ? raw.sections : [])) {
    if (sections.length >= 8 || total >= maxChapters) break;
    const sec = {
      id: slugify(s.id || s.title || 'section'),
      num: String(s.num || sections.length + 1).padStart(2, '0'),
      title: biv(s.title || 'Section'),
      subtitle: biv(s.subtitle || s.title || 'Section'),
      intro: biv(s.intro || s.subtitle || s.title || 'Section'), chapters: []
    };
    while (used.has(sec.id)) sec.id += '-x';
    used.add(sec.id);
    for (const c of (Array.isArray(s.chapters) ? s.chapters : [])) {
      if (total >= maxChapters) break;
      let id = slugify(c.id || c.title || 'chapter');
      while (used.has(id)) id += '-x';
      used.add(id);
      sec.chapters.push({
        id, num: String(c.num || (sections.length + 1) + '.' + (sec.chapters.length + 1)),
        title: biv(c.title || 'Chapter'), focus: String(c.focus || '').trim()
      });
      total++;
    }
    if (sec.chapters.length) sections.push(sec);
  }
  if (!total) throw new Error('The outline has no chapters.');
  return {
    title: String(raw.title || req.title || 'Learning book').slice(0, 160),
    subtitle: biv(raw.subtitle || req.description || ''),
    summary: biv(raw.summary || req.description || ''),
    sections, total
  };
}
async function generateOutline(cfg, req, skill, call, maxChapters) {
  const minChapters = Math.min(6, maxChapters);
  const messages = [
    { role: 'system', content: 'You design the outline of a bilingual learning book. Return only valid JSON.' },
    { role: 'user', content: `SKILL:\n${skill.slice(0, 60000)}\n\nREQUEST:\n${requestText(req)}\n\nSOURCE MATERIAL:\n${req.long_text || '(none)'}\n\nDesign the COMPLETE outline first; chapters are written separately, so the outline must lock the full scope.\nReturn ONE JSON object:\n{"title":"...","subtitle":{"hu":"...","en":"..."},"summary":{"hu":"...","en":"..."},"sections":[{"id":"slug","num":"01","title":{"hu":"...","en":"..."},"subtitle":{"hu":"...","en":"..."},"intro":{"hu":"...","en":"..."},"chapters":[{"id":"slug","num":"1.1","title":{"hu":"...","en":"..."},"focus":"one sentence: what the chapter teaches"}]}]}\nRules:\n- 2-6 sections, ${minChapters}-${maxChapters} chapters total. A full-semester course needs 18-24; a focused topic needs fewer.\n- Cover EVERY topic the SOURCE MATERIAL requires. If it lists chapters or a coverage checklist, preserve their scope; merge only true duplicates. Never silently drop a listed topic.\n- Chapter ids are unique lowercase ASCII slugs; nums are sequential ("01", "1.1", "1.2", "2.1").\n- Order chapters prerequisite-first and spread them across sections.\n- No lesson content yet: only title, subtitle, summary, section intro and each chapter's focus sentence.\n- Complete valid JSON; shorten the focus text rather than truncating the object.` }
  ];
  let lastError = 'No outline.';
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await call(cfg, messages);
    try {
      const outline = normalizeOutline(extractJSON(text), req, maxChapters);
      if (outline.total < minChapters) {
        throw new Error(`The outline has only ${outline.total} chapters. Cover all topics from SOURCE MATERIAL and produce at least ${minChapters}; merge near-duplicates only.`);
      }
      return outline;
    } catch (e) {
      lastError = String(e.message || e).slice(0, 500);
      messages.push({ role: 'user', content: 'The outline was rejected: ' + lastError + '\nReturn the complete corrected outline JSON only. Same schema, no commentary.' });
    }
  }
  throw new Error('Could not build a book outline: ' + lastError);
}
function chapterPrompt(req, skill, outline, section, batch) {
  const target = batch.map(c => `- id "${c.id}", num "${c.num}", title HU "${c.title.hu}" / EN "${c.title.en}"${c.focus ? `, focus: ${c.focus}` : ''}`).join('\n');
  const outlineText = outline.sections.map(s =>
    `${s.num}. ${s.title.hu} / ${s.title.en}\n` + s.chapters.map(c => `   ${c.num} ${c.id} — ${c.title.hu} / ${c.title.en}`).join('\n')
  ).join('\n');
  return `SKILL:\n${skill.slice(0, 60000)}\n\nREQUEST:\n${requestText(req)}\n\nSOURCE MATERIAL:\n${req.long_text || '(none)'}\n\nBOOK OUTLINE (do not change its scope):\n${outlineText}\n\nWRITE EXACTLY THESE CHAPTERS (section ${section.num}, ${section.title.hu} / ${section.title.en}):\n${target}\n\nReturn ONE JSON object: {"chapters":[ ... ]} with exactly ${batch.length} chapter(s), in the same order and with the exact ids above.\nChapter shape:\n{"id":"...","num":"...","title":{"hu":"...","en":"..."},"lead":{"hu":"...","en":"..."},"why":{"hu":["..."],"en":["..."]},"when":{"hu":"...","en":"..."},"minutes":30,"theory":[{"type":"def|thm|note|warn|p|list|formula|code","title":{"hu":"...","en":"..."},"body":{"hu":"...","en":"..."},"items":{"hu":["..."],"en":["..."]},"latex":"...","note":{"hu":"...","en":"..."},"lang":"c","code":"..."}],"examples":[{"title":{"hu":"...","en":"..."},"problem":{"hu":"...","en":"..."},"steps":{"hu":["..."],"en":["..."]},"answer":{"hu":"...","en":"..."}}],"mistakes":{"hu":["..."],"en":["..."]},"exercises":[{"q":{"hu":"...","en":"..."},"a":"...","type":"number|expr|text|choice|proof","choices":{"hu":["..."],"en":["..."]},"hint":{"hu":"...","en":"..."},"sol":{"hu":"...","en":"..."}}]}\n\nDEPTH — each chapter must be a complete 25-40 minute lesson, not a summary:\n- lead: 2-4 sentences on what the reader will be able to do; why: 2-3 concrete bullets; when: 1-2 sentences.\n- theory: 6-9 blocks. Every def/thm/note/warn body is 2-6 full sentences. Include at least 2 "code" blocks with complete, compile-ready programs (lang c/cpp), each introduced and explained in prose. Use inline backticks only for identifiers, never for multi-line code. Math stays in $...$.\n- examples: 2-3, each with a concrete problem, 4-8 numbered steps that explain the reasoning, and the final answer. At least one traces execution line by line.\n- mistakes: 3-5 concrete failure modes with the fix.\n- exercises: 6-8 mixed types; answers must be checkable; give hints and solutions.\n- Teach the "focus" above; no filler, no repeated boilerplate, no placeholders.\nEvery prose field is {"hu":"...","en":"..."} and both languages must carry the full explanation. Return only this batch's chapters, exactly ids/order. Complete valid JSON: if space is tight, shorten prose but never omit required fields or truncate the object.`;
}
async function writeChapterBatch(cfg, req, skill, outline, section, batch, call, limits) {
  const messages = [
    { role: 'system', content: 'You write chapters for a bilingual learning book. Return only valid JSON.' },
    { role: 'user', content: chapterPrompt(req, skill, outline, section, batch) }
  ];
  let lastError = 'No output.';
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await call(cfg, messages);
    let raw;
    try { raw = extractJSON(text); } catch (e) {
      lastError = 'The reply was not valid JSON (likely truncated): ' + String(e.message || e).slice(0, 200);
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
        version: 1, title: outline.title, subtitle: outline.subtitle, summary: outline.summary,
        sections: [{ id: section.id, num: section.num, title: section.title, subtitle: section.subtitle, intro: section.intro, chapters: got }]
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
export async function buildBook({ cfg, req, skill = skillText(), call = callLLM, onProgress = () => {}, maxChapters, batchSize, maxTokens } = {}) {
  const settings = getSettings();
  maxChapters = maxChapters ?? settings.maxBookChapters;
  batchSize = batchSize ?? settings.chapterBatchSize;
  maxTokens = maxTokens ?? settings.llmMaxTokens;
  const callModel = (c, m) => call(c, m, maxTokens);
  const limits = { maxChapters, maxPerSection: maxChapters };
  if (useMock()) return normalizeSite(mockSite(req), req, limits);
  const outline = await generateOutline(cfg, req, skill, callModel, maxChapters);
  onProgress(`Outline ready: ${outline.total} chapters. Writing chapters…`);
  const sections = [];
  let done = 0;
  for (const section of outline.sections) {
    const chapters = [];
    for (let i = 0; i < section.chapters.length; i += batchSize) {
      const batch = section.chapters.slice(i, i + batchSize);
      let written;
      try {
        written = await writeChapterBatch(cfg, req, skill, outline, section, batch, callModel, limits);
      } catch (e) {
        if (batch.length === 1) throw e;
        // A batch that still truncates after a repair is retried one chapter at a time.
        written = [];
        for (const one of batch) {
          written.push(...await writeChapterBatch(cfg, req, skill, outline, section, [one], callModel, limits));
        }
      }
      chapters.push(...written);
      done += batch.length;
      onProgress(`Wrote ${done}/${outline.total} chapters.`);
    }
    sections.push({ ...section, chapters });
  }
  const book = normalizeSite({ version: 1, title: outline.title, subtitle: outline.subtitle, summary: outline.summary, sections }, req, limits);
  const check = validateSite(book);
  if (!check.ok) throw new Error('The assembled book failed validation: ' + check.error);
  return book;
}

/* ------------------------------------------------------------------ validation */
const B = z.object({ hu: z.string().min(1), en: z.string().min(1) });
const BOpt = z.object({ hu: z.string(), en: z.string() });
const Theory = z.discriminatedUnion('type', [
  z.object({ type: z.literal('formula'), title: B, latex: z.string().min(1), note: BOpt }),
  z.object({ type: z.literal('code'), title: B, lang: z.string().max(20), code: z.string().min(1) }),
  z.object({ type: z.literal('list'), title: B, items: z.object({ hu: z.array(z.string().min(1)).min(1), en: z.array(z.string().min(1)).min(1) }) }),
  z.object({ type: z.literal('p'), body: B }),
  z.object({ type: z.enum(['def', 'thm', 'note', 'warn']), title: B, body: B })
]);
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
  when: B, minutes: z.number().min(5).max(90),
  theory: z.array(Theory).min(1), examples: z.array(z.object({ title: B, problem: B, steps: z.object({ hu: z.array(z.string().min(1)).min(1), en: z.array(z.string().min(1)).min(1) }), answer: B })).min(1),
  mistakes: z.object({ hu: z.array(z.string().min(1)).min(1), en: z.array(z.string().min(1)).min(1) }),
  exercises: z.array(Exercise).min(1)
});
const Section = z.object({ id: z.string().min(1), num: z.string().min(1), title: B, subtitle: B, intro: B, chapters: z.array(Chapter).min(1) });
export const SiteSchema = z.object({ version: z.number(), title: z.string().min(1), subtitle: B, summary: B, sections: z.array(Section).min(1) });
export function validateSite(site) {
  const result = SiteSchema.safeParse(site);
  return result.success ? { ok: true, error: '' } : { ok: false, error: result.error.issues.slice(0, 8).map(i => i.path.join('.') + ': ' + i.message).join('; ') };
}

/* ------------------------------------------------------------------ worker */
const activeJobs = new Set();
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
  const changed = sqlite.prepare("UPDATE jobs SET status='running',attempts=attempts+1,locked_at=?,next_attempt_at=NULL,log='Contacting the model…',updated_at=? WHERE id=? AND status='queued'").run(t, t, job.id);
  if (!changed.changes) return null;
  sqlite.prepare("UPDATE sites SET status='running',updated_at=? WHERE id=?").run(t, job.site_id);
  return { ...job, attempts: (job.attempts || 0) + 1 };
}
/** Milliseconds until the earliest queued job becomes eligible (0 when one is ready now). */
function nextWakeDelay() {
  if (sqlite.prepare("SELECT 1 FROM jobs WHERE status='queued' AND (next_attempt_at IS NULL OR next_attempt_at<=?) LIMIT 1").get(now())) return 0;
  const row = sqlite.prepare("SELECT MIN(next_attempt_at) AS t FROM jobs WHERE status='queued'").get();
  return row?.t ? Math.max(0, new Date(row.t).getTime() - Date.now()) : 0;
}
export function recoverJobs(leaseMs = JOB_LEASE_MS) {
  const stale = new Date(Date.now() - leaseMs).toISOString();
  const rows = sqlite.prepare("SELECT * FROM jobs WHERE status='running' AND (locked_at IS NULL OR locked_at<?)").all(stale);
  for (const row of rows) {
    if (activeJobs.has(row.id)) continue;
    if ((row.attempts || 0) >= MAX_JOB_ATTEMPTS) {
      sqlite.prepare("UPDATE jobs SET status='failed',last_error='Worker lease expired',locked_at=NULL,updated_at=? WHERE id=?").run(now(), row.id);
      sqlite.prepare("UPDATE sites SET status='failed',error='Generation worker stopped before completion. Try again.',updated_at=? WHERE id=?").run(now(), row.site_id);
    } else {
      sqlite.prepare("UPDATE jobs SET status='queued',locked_at=NULL,next_attempt_at=?,updated_at=? WHERE id=?").run(now(), now(), row.id);
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
    const parsed = await buildBook({
      cfg, req,
      onProgress: log => sqlite.prepare('UPDATE jobs SET log=?,updated_at=? WHERE id=?').run(log, now(), job.id)
    });
    if (sqlite.prepare('SELECT cancel_requested FROM jobs WHERE id=?').get(job.id)?.cancel_requested) {
      sqlite.prepare("UPDATE jobs SET status='cancelled',locked_at=NULL,updated_at=? WHERE id=?").run(now(), job.id);
      sqlite.prepare("UPDATE sites SET status='cancelled',error='Cancelled by user.',updated_at=? WHERE id=?").run(now(), site.id);
      return;
    }
    const dir = path.dirname(siteJsonPath(site.slug));
    await fsp.mkdir(dir, { recursive: true });
    await fsp.writeFile(siteJsonPath(site.slug), JSON.stringify(parsed, null, 2));
    sqlite.prepare("UPDATE sites SET status='ready',error='',updated_at=? WHERE id=?").run(now(), site.id);
    sqlite.prepare("UPDATE jobs SET status='done',log=?,last_error='',locked_at=NULL,next_attempt_at=NULL,updated_at=? WHERE id=?").run('Generated and routed at ' + siteUrl(site.slug), now(), job.id);
  } catch (e) {
    const attempt = job.attempts || 1;
    const message = String(e.message || e).slice(0, 2000);
    if (attempt < MAX_JOB_ATTEMPTS) {
      const delay = Math.min(60000, 5000 * Math.pow(2, attempt - 1));
      const next = new Date(Date.now() + delay).toISOString();
      sqlite.prepare("UPDATE jobs SET status='queued',locked_at=NULL,next_attempt_at=?,last_error=?,log=?,updated_at=? WHERE id=?").run(next, message, 'Retrying after: ' + message, now(), job.id);
      sqlite.prepare("UPDATE sites SET status='queued',error=?,updated_at=? WHERE id=?").run(message, now(), site.id);
    } else {
      sqlite.prepare("UPDATE sites SET status='failed',error=?,updated_at=? WHERE id=?").run(message, now(), site.id);
      sqlite.prepare("UPDATE jobs SET status='failed',locked_at=NULL,last_error=?,log=?,updated_at=? WHERE id=?").run(message, String(e.stack || e).slice(0, 4000), now(), job.id);
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
  recoverJobs(0);
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
