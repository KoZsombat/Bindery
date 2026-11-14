import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {
  LLM_BASE_URL, LLM_API_KEY, LLM_MODEL, LLM_MOCK, DEV_MOCK,
  MAX_CONCURRENT_JOBS, SKILL_PATH
} from '../config.js';
import { decrypt } from '../crypto.js';
import { sqlite, ensureProfile, now, slugify, siteRow, siteJsonPath, siteUrl } from '../db/index.js';

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
export function normalizeSite(raw, req) {
  if (!raw || typeof raw !== 'object') throw new Error('The model did not return a JSON object.');
  const sections = Array.isArray(raw.sections) ? raw.sections.slice(0, 12) : [];
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
    for (const c of (Array.isArray(s.chapters) ? s.chapters : []).slice(0, 10)) {
      if (chapters++ >= 40) break;
      const ch = {
        id: slugify(c.id || c.title || 'chapter'),
        num: String(c.num || (out.sections.length + 1) + '.' + (sec.chapters.length + 1)),
        title: biv(c.title || 'Chapter'), lead: biv(c.lead || ''),
        why: bivArr(c.why), when: biv(c.when || ''),
        minutes: Math.max(5, Math.min(90, Number(c.minutes) || 25)),
        theory: [], examples: [], mistakes: bivArr(c.mistakes), exercises: []
      };
      for (const t of (Array.isArray(c.theory) ? c.theory : []).slice(0, 12)) {
        const type = ['def', 'thm', 'note', 'warn', 'formula', 'p', 'list'].includes(t.type) ? t.type : 'p';
        const b = { type };
        if (type === 'formula') { b.title = biv(t.title || 'Formula'); b.latex = String(t.latex || ''); b.note = biv(t.note || ''); }
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
    key: decrypt(profile.api_key) || LLM_API_KEY,
    model: profile.api_model || LLM_MODEL
  };
}
export function useMock(cfg) { return LLM_MOCK || (DEV_MOCK && !cfg.key); }
async function callLLM(cfg, messages) {
  if (useMock(cfg)) {
    const delay = Number(process.env.LLM_MOCK_DELAY || 0);
    if (delay > 0) await new Promise(r => setTimeout(r, Math.min(10000, delay)));
    return JSON.stringify(mockSite(messages.request || {}));
  }
  const payload = { model: cfg.model, messages, temperature: 0.35, max_tokens: 12000 };
  if (process.env.LLM_JSON_MODE !== '0') payload.response_format = { type: 'json_object' };
  const doFetch = async body => {
    const r = await fetch(cfg.base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(300000)
    });
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

/* ------------------------------------------------------------------ worker */
const activeJobs = new Set();
let kickTimer = null;
export function kick(delay = 0) {
  if (kickTimer || activeJobs.size >= MAX_CONCURRENT_JOBS) return;
  kickTimer = setTimeout(function () { kickTimer = null; drain(); }, delay);
}
function claimJob() {
  const job = sqlite.prepare("SELECT * FROM jobs WHERE status='queued' ORDER BY id LIMIT 1").get();
  if (!job) return null;
  const t = now();
  const changed = sqlite.prepare("UPDATE jobs SET status='running',log='Contacting the model…',updated_at=? WHERE id=? AND status='queued'").run(t, job.id);
  if (!changed.changes) return null;
  sqlite.prepare("UPDATE sites SET status='running',updated_at=? WHERE id=?").run(t, job.site_id);
  return job;
}
function drain() {
  while (activeJobs.size < MAX_CONCURRENT_JOBS) {
    const job = claimJob();
    if (!job) break;
    activeJobs.add(job.id);
    runJob(job).catch(e => console.error('Job failed:', e)).finally(function () {
      activeJobs.delete(job.id);
      kick(0);
    });
  }
}
async function runJob(job) {
  const site = siteRow(job.site_id);
  if (!site || site.status === 'ready') {
    sqlite.prepare("UPDATE jobs SET status='failed',log='Site missing or already ready',updated_at=? WHERE id=?").run(now(), job.id);
    return;
  }
  try {
    const profile = ensureProfile(site.owner_id);
    const cfg = llmConfig(profile);
    if (!useMock(cfg) && !cfg.key) throw new Error('No API key. Add one in Settings or ask the admin to configure the server.');
    const req = { title: site.title, description: site.description, topic: site.topic, audience: site.audience, language: site.language, long_text: site.source_text };
    const schema = `Return ONE JSON object, no markdown, with this exact shape:
{"title":"...","subtitle":{"hu":"...","en":"..."},"summary":{"hu":"...","en":"..."},"sections":[{"id":"slug","num":"01","title":{"hu":"...","en":"..."},"subtitle":{"hu":"...","en":"..."},"intro":{"hu":"...","en":"..."},"chapters":[{"id":"slug","num":"1.1","title":{"hu":"...","en":"..."},"lead":{"hu":"...","en":"..."},"why":{"hu":["..."],"en":["..."]},"when":{"hu":"...","en":"..."},"minutes":25,"theory":[{"type":"def|thm|note|warn|formula|p|list","title":{"hu":"...","en":"..."},"body":{"hu":"...","en":"..."},"latex":"...","note":{"hu":"...","en":"..."},"items":{"hu":["..."],"en":["..."]}}],"examples":[{"title":{"hu":"...","en":"..."},"problem":{"hu":"...","en":"..."},"steps":{"hu":["..."],"en":["..."]},"answer":{"hu":"...","en":"..."}}],"mistakes":{"hu":["..."],"en":["..."]},"exercises":[{"q":{"hu":"...","en":"..."},"a":"answer","type":"number|expr|text|choice|proof","hint":{"hu":"...","en":"..."},"sol":{"hu":"...","en":"..."},"choices":{"hu":["..."],"en":["..."]}}]}]}]}
Rules: every prose field is a {hu,en} object; math stays inside $...$; 1-8 sections; 1-30 chapters total; 3-6 exercises and 1-3 examples per chapter; exercises must be checkable or proof; no links, no HTML, no download buttons.`;
    const messages = [
      { role: 'system', content: 'You are a careful curriculum writer and the site generator for a learning-book platform. Follow the supplied skill, teach from the supplied sources, and return only valid JSON.' },
      { role: 'user', content: `SKILL:\n${skillText().slice(0, 60000)}\n\nREQUEST:\nTitle: ${req.title}\nDescription: ${req.description}\nTopic: ${req.topic}\nAudience: ${req.audience}\nLanguage preference: ${req.language}\n\nSOURCE MATERIAL:\n${req.long_text || '(none)'}\n\n${schema}` }
    ];
    messages.request = req;
    const parsed = normalizeSite(extractJSON(await callLLM(cfg, messages)), req);
    await fsp.mkdir(path.dirname(siteJsonPath(site.slug)), { recursive: true });
    await fsp.writeFile(siteJsonPath(site.slug), JSON.stringify(parsed, null, 2));
    sqlite.prepare("UPDATE sites SET status='ready',error='',updated_at=? WHERE id=?").run(now(), site.id);
    sqlite.prepare("UPDATE jobs SET status='done',log=?,updated_at=? WHERE id=?").run('Generated and routed at ' + siteUrl(site.slug), now(), job.id);
  } catch (e) {
    sqlite.prepare("UPDATE sites SET status='failed',error=?,updated_at=? WHERE id=?").run(String(e.message || e).slice(0, 2000), now(), site.id);
    sqlite.prepare("UPDATE jobs SET status='failed',log=?,updated_at=? WHERE id=?").run(String(e.stack || e).slice(0, 4000), now(), job.id);
    console.error('Job failed:', e);
  }
}
export function startWorker() { kick(0); }
