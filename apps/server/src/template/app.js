'use strict';
(function () {
  const $ = s => document.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const scope = location.host + location.pathname;
  let site = null;
  let lang = localStorage.getItem('lbs.lang') || 'hu';
  let theme = localStorage.getItem('lbs.theme') === 'dark' ? 'dark' : 'light';
  let current = null;
  let runTimer = null;
  let runState = null;
  let examState = null;
  const progressKey = 'lbs.progress:' + scope;
  const wrongKey = 'lbs.wrong:' + scope;
  const statsKey = 'lbs.stats:' + scope;
  const dailyKey = 'lbs.daily:' + scope;
  let progress = load(progressKey, {});
  let wrong = load(wrongKey, {});
  let stats = load(statsKey, { attempts: 0, correct: 0, byKey: {}, streak: 0, lastDay: '' });
  let daily = load(dailyKey, { day: '', keys: [], done: {} });
  /* Habit layer: local-first, no network. Two objects, as in the skill contract. */
  const coachKey = 'lbs.coach:' + scope;
  const funKey = 'lbs.fun:' + scope;
  let state = {
    coach: load(coachKey, {
      calm: false, examDate: '', intention: '', target: null, targetDismissed: false,
      firstDay: '', minutes: {}, plan: null, lastActive: '', welcomeShown: '',
      tags: {}, stuck: {}
    }),
    fun: load(funKey, { planDone: {}, buddy: '' })
  };
  state.coach = Object.assign({
    calm: false, examDate: '', intention: '', target: null, targetDismissed: false,
    firstDay: '', minutes: {}, plan: null, lastActive: '', welcomeShown: '',
    tags: {}, stuck: {}
  }, state.coach || {});
  state.fun = Object.assign({ planDone: {}, buddy: '' }, state.fun || {});
  function saveCoach() { save(coachKey, state.coach); save(funKey, state.fun); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function localDay(d) { d = d || new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseDay(s) { const p = String(s || '').split('-').map(Number); return p.length === 3 && p[0] ? new Date(p[0], p[1] - 1, p[2]) : null; }
  function daysBetween(a, b) { const x = parseDay(a), y = parseDay(b); return x && y ? Math.round((y - x) / 86400000) : 0; }
  function addDaysLocal(day, n) { const d = parseDay(day) || new Date(); d.setDate(d.getDate() + n); return localDay(d); }
  function minutesOn(day) { return Math.round((Number(state.coach.minutes[day]) || 0) * 10) / 10; }

  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v && typeof v === 'object' ? v : fallback; }
    catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
  const today = () => localDay();
  const yesterday = () => addDaysLocal(localDay(), -1);

  const T = (hu, en) => lang === 'en' ? en : hu;
  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const btn = $('#themeBtn');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀' : '☾';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }
  function biv(v, fallback) {
    if (v && typeof v === 'object' && !Array.isArray(v)) return v[lang] || v.hu || v.en || fallback || '';
    return v == null ? (fallback || '') : String(v);
  }
  function bivArr(v) {
    if (v && typeof v === 'object' && !Array.isArray(v)) return (v[lang] || v.hu || v.en || []);
    return Array.isArray(v) ? v : (v == null ? [] : [v]);
  }
  function glossaryEntries() {
    if (!site) return [];
    if (Array.isArray(site.glossary) && site.glossary.length) return site.glossary;
    // Schema v1 books: derive a read-only glossary from whatever terms exist.
    const out = [];
    const seen = new Set();
    site.sections.forEach(s => s.chapters.forEach(c => (c.terms || []).forEach(t => {
      if (seen.has(t.id)) return;
      seen.add(t.id);
      out.push({ id: t.id, term: t.term, plain: t.plain || { hu: '', en: '' }, precise: t.precise || { hu: '', en: '' }, requires: t.requires || [], chapter: { section: s.id, chapter: c.id, num: c.num, title: c.title } });
    })));
    return out;
  }
  let termMatcher = null;
  function termList() {
    if (termMatcher) return termMatcher;
    termMatcher = glossaryEntries()
      .map(g => ({ id: g.id, label: biv(g.term) }))
      .filter(g => g.label && g.label.length >= 3)
      .sort((a, b) => b.label.length - a.label.length);
    return termMatcher;
  }
  function decorateTerms(html) {
    const terms = termList();
    if (!terms.length) return html;
    // Never decorate inside inline code (`...` before conversion).
    return html.split(/(`[^`\n]+`)/).map(part => {
      if (part.startsWith('`')) return part;
      let out = part;
      for (const t of terms) {
        const re = new RegExp('(^|[^\\w])(' + t.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?=[^\\w]|$)', 'gi');
        out = out.replace(re, (m, pre) => pre + '<button type="button" class="term" data-term="' + esc(t.id) + '">' + esc(t.label) + '</button>');
      }
      return out;
    }).join('');
  }
  // Escape HTML, then render fenced blocks and `inline code`. Never trusts model output.
  function rich(v, opts) {
    const blocks = [];
    let s = String(v == null ? '' : v).replace(/```[a-zA-Z0-9+#.-]*\n?([\s\S]*?)```/g, (_, code) => {
      blocks.push(code.replace(/\n$/, ''));
      return '\u0000' + (blocks.length - 1) + '\u0000';
    });
    s = esc(s);
    if (!(opts && opts.terms === false)) s = decorateTerms(s);
    s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => '<pre><code>' + esc(blocks[Number(i)]) + '</code></pre>');
  }
  const chapters = () => (site ? site.sections.flatMap(s => s.chapters.map(c => ({ s, c }))) : []);
  const total = () => chapters().length;
  const readCount = () => chapters().filter(x => progress[x.s.id + '/' + x.c.id]).length;
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;

  function normalize(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/\u2212/g, '-').replace(/[{}]/g, '').replace(/\\left|\\right|\\cdot|\\times/g, '').replace(/[·×]/g, '*').replace(/\s+/g, '').replace(/,/g, '.').replace(/^\+/, '');
  }
  function safeEval(input) {
    let s = String(input).replace(/\s+/g, '').replace(/\u2212/g, '-').replace(/,/g, '.');
    s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
      .replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)')
      .replace(/\\pi/g, 'pi').replace(/\\cdot|\\times/g, '*')
      .replace(/[·×]/g, '*');
    const tokens = s.match(/\d+(?:\.\d+)?|pi|e|sqrt|sin|cos|tan|ln|log|abs|[()+\-*/^]/g) || [];
    if (!tokens.length || tokens.join('') !== s) return NaN;
    let i = 0;
    const peek = () => tokens[i], next = () => tokens[i++];
    function primary() {
      const t = next();
      if (t === undefined) throw new Error('end');
      if (t === '(') { const v = parseExpr(); if (next() !== ')') throw new Error('paren'); return v; }
      if (t === 'pi') return Math.PI;
      if (t === 'e') return Math.E;
      if (/^\d/.test(t)) return Number(t);
      if (['sqrt', 'sin', 'cos', 'tan', 'ln', 'log', 'abs'].includes(t)) {
        if (next() !== '(') throw new Error('call');
        const v = parseExpr();
        if (next() !== ')') throw new Error('paren');
        if (t === 'sqrt') return Math.sqrt(v);
        if (t === 'sin') return Math.sin(v);
        if (t === 'cos') return Math.cos(v);
        if (t === 'tan') return Math.tan(v);
        if (t === 'ln') return Math.log(v);
        if (t === 'log') return Math.log10(v);
        return Math.abs(v);
      }
      throw new Error('token');
    }
    function power() {
      const base = primary();
      if (peek() === '^') { next(); return Math.pow(base, power()); }
      return base;
    }
    function unary() {
      if (peek() === '+') { next(); return unary(); }
      if (peek() === '-') { next(); return -unary(); }
      return power();
    }
    function term() {
      let v = unary();
      while (peek() === '*' || peek() === '/') {
        const op = next(), r = unary();
        v = op === '*' ? v * r : v / r;
      }
      return v;
    }
    function parseExpr() {
      let v = term();
      while (peek() === '+' || peek() === '-') {
        const op = next(), r = term();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }
    try {
      const v = parseExpr();
      return i === tokens.length && Number.isFinite(v) ? v : NaN;
    } catch { return NaN; }
  }
  function check(user, expected, type) {
    if (!user || !String(user).trim()) return false;
    if (type === 'number') {
      const a = safeEval(user), b = safeEval(expected);
      return !isNaN(a) && !isNaN(b) && Math.abs(a - b) <= Math.max(1e-7, Math.abs(b) * 1e-6);
    }
    if (normalize(user) === normalize(expected)) return true;
    const a = safeEval(user), b = safeEval(expected);
    return !isNaN(a) && !isNaN(b) && Math.abs(a - b) <= Math.max(1e-7, Math.abs(b) * 1e-6);
  }

  function saveProgress() {
    save(progressKey, progress);
    const bar = $('#progressBar'); if (bar) bar.style.width = pct(readCount(), total()) + '%';
  }

  function renderMath() {
    if (typeof renderMathInElement !== 'function') return;
    try {
      renderMathInElement($('#main'), {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    } catch {}
  }

  /* ---------------------------------------------------------------- icons */
  const ICON = {
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    play: '<path d="M8 5l11 7-11 7z"/>',
    map: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    notebook: '<path d="M6 3h12v18H6z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
    shuffle: '<path d="M3 7h4l10 10h4M3 17h4l10-10h4"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>',
    sigma: '<path d="M18 4H6l6 8-6 8h12"/>',
    video: '<rect x="3" y="6" width="12" height="12" rx="2"/><path d="M15 10l6-3v10l-6-3z"/>',
    bank: '<path d="M4 6h16M4 12h10M4 18h16"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/>'
  };
  function icon(name) {
    return '<svg class="mi" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">' + ICON[name] + '</svg>';
  }

  /* ---------------------------------------------------------------- modes */
  const MODES = [
    ['today', 'Today’s plan', 'Mai terv', 'target'],
    ['focus', 'Focus / Launchpad', 'Focus / Launchpad', 'compass'],
    ['learn', 'Learn and review', 'Tanulás és ismétlés', 'play'],
    ['map', 'Knowledge map', 'Tudástérkép', 'map'],
    ['daily', 'Daily quest', 'Napi küldetés', 'compass'],
    ['errors', 'Error notebook', 'Hibafüzet', 'notebook'],
    ['mixed', 'Mixed run', 'Vegyes kör', 'shuffle'],
    ['hunt', 'Error hunt', 'Hibavadászat', 'search'],
    ['progress', 'Progress', 'Haladás', 'chart'],
    ['formulas', 'Formula sheet', 'Képletgyűjtemény', 'sigma'],
    ['videos', 'Videos', 'Videók', 'video'],
    ['bank', 'Practice bank', 'Feladatbank', 'bank'],
    ['exam', 'Exam simulator', 'Vizsgaszimulátor', 'clock'],
    ['glossary', 'Glossary', 'Fogalomtár', 'notebook'],
    ['resources', 'Resources', 'Források', 'doc']
  ];
  function renderModes() {
    const active = location.hash.replace(/^#\/?/, '').split('/')[0];
    const byId = id => MODES.find(m => m[0] === id);
    const groups = [
      ['Focus', ['today', 'focus', 'learn', 'map'].map(byId).filter(Boolean)],
      ['Daily practice', ['daily', 'errors', 'mixed', 'hunt', 'progress', 'glossary'].map(byId).filter(Boolean)],
      ['Library', ['formulas', 'videos', 'bank', 'exam', 'resources'].map(byId).filter(Boolean)]
    ];
    const nav = $('#modes');
    if (!nav) return;
    nav.innerHTML = groups.map(([label, items]) =>
      '<div class="mode-group"><div class="mode-label">' + esc(T(label, label)) + '</div>' +
      items.map(([id, en, hu, ic]) =>
        '<a class="mode' + (active === id ? ' active' : '') + '" href="#/' + id + '"' + (active === id ? ' aria-current="page"' : '') + '>' +
        icon(ic) + '<span>' + esc(T(hu, en)) + '</span></a>').join('') + '</div>'
    ).join('');
  }

  /* ----------------------------------------------------------- book chrome */
  function renderTOC() {
    const nav = $('#toc');
    const count = $('#sideCount');
    if (count) count.textContent = readCount() + ' / ' + total();
    nav.innerHTML = site.sections.map(s => {
      const done = s.chapters.filter(c => progress[s.id + '/' + c.id]).length;
      return '<div class="toc-sec"><div class="toc-head"><b>' + esc(s.num) + '</b> ' + esc(biv(s.title)) +
        '<small>' + done + '/' + s.chapters.length + '</small></div>' +
        s.chapters.map(c => '<a href="#/chapter/' + encodeURIComponent(s.id) + '/' + encodeURIComponent(c.id) + '">' +
          '<span>' + esc(c.num) + '</span>' + esc(biv(c.title)) + (progress[s.id + '/' + c.id] ? '<i>✓</i>' : '') + '</a>').join('') +
        '</div>';
    }).join('');
  }

  /* ------------------------------------------------------------ questions */
  function allExercises() {
    const out = [];
    for (const s of site.sections) for (const c of s.chapters) (c.exercises || []).forEach((q, i) => {
      out.push({ s, c, q, i, key: s.id + '/' + c.id + '/' + i });
    });
    return out;
  }
  function findItem(key) { return allExercises().find(x => x.key === key); }
  function checkHTML(c) {
    if (!c || !biv(c.q)) return '';
    return '<details class="selfcheck"><summary>' + T('Ellenőrizd magad', 'Check yourself') + ': ' + rich(biv(c.q)) + '</summary>' +
      '<p class="sc-a"><b>' + T('Válasz.', 'Answer.') + '</b> ' + rich(biv(c.a)) + '</p>' +
      (biv(c.hint) ? '<p class="sc-h"><b>' + T('Tipp.', 'Hint.') + '</b> ' + rich(biv(c.hint)) + '</p>' : '') + '</details>';
  }
  function confusionsHTML(list) {
    if (!Array.isArray(list) || !list.length) return '';
    return '<div class="confusions"><div class="ct">' + T('Ne keverd össze', 'Common confusion') + '</div>' + list.map(x =>
      '<p><b>' + esc(biv(x.a)) + '</b> <span class="vs">' + T('vs', 'vs') + '</span> <b>' + esc(biv(x.b)) + '</b>' +
      (biv(x.note) ? '<br><span class="muted">' + rich(biv(x.note)) + '</span>' : '') + '</p>').join('') + '</div>';
  }
  function theoryHTML(t) {
    const type = t.type || 'p';
    if (type === 'formula') return '<div class="callout formula"><div class="ct">' + T('Képlet', 'Formula') + (biv(t.title) ? ' · ' + esc(biv(t.title)) : '') + '</div><div class="fx">$$' + esc(String(t.latex || '')) + '$$</div>' + (biv(t.note) ? '<p class="muted">' + rich(biv(t.note)) + '</p>' : '') + '</div>';
    if (type === 'code') return '<div class="callout code"><div class="ct">' + T('Kód', 'Code') + (biv(t.title) ? ' · ' + esc(biv(t.title)) : '') + '</div><pre><code>' + esc(String(t.code || '')) + '</code></pre></div>';
    if (type === 'list') return '<div class="callout note"><div class="ct">' + esc(biv(t.title, T('Lista', 'List'))) + '</div><ul>' + bivArr(t.items).map(x => '<li>' + rich(x) + '</li>').join('') + '</ul></div>';
    const labels = { def: T('Definíció', 'Definition'), thm: T('Tétel', 'Theorem'), note: T('Megjegyzés', 'Note'), warn: T('Vigyázat', 'Warning'), p: T('Szöveg', 'Note') };
    const cls = type === 'warn' ? 'warn' : type === 'def' ? 'def' : type === 'thm' ? 'thm' : 'note';
    const label = labels[type] || labels.p, heading = biv(t.title);
    const head = '<div class="ct">' + label + (heading && heading !== label ? ' · ' + esc(heading) : '') + '</div>';
    const depth = (type === 'def' || type === 'thm') ? (
      (biv(t.plain) ? '<div class="plain-words"><span class="tag-label">' + T('Egyszerű szavakkal', 'In plain words') + '</span><p>' + rich(biv(t.plain)) + '</p></div>' : '') +
      (biv(t.why) ? '<div class="why-note"><span class="tag-label">' + T('Miért létezik?', 'Why it exists') + '</span><p>' + rich(biv(t.why)) + '</p></div>' : '') +
      '<div class="precise"><span class="tag-label">' + T('Pontos megfogalmazás', 'Precise version') + '</span><p>' + rich(biv(t.body || t.precise)) + '</p></div>' +
      (biv(t.precise) && biv(t.body) ? '<p class="muted small">' + rich(biv(t.precise)) + '</p>' : '') +
      (biv(t.analogy) ? '<div class="analogy"><span class="tag-label">' + T('Kép vagy hasonlat', 'Analogy or picture') + '</span><p>' + rich(biv(t.analogy)) + '</p></div>' : '') +
      confusionsHTML(t.confusions) +
      (t.checks || []).map(checkHTML).join('')
    ) : '<p>' + rich(biv(t.body)) + '</p>';
    return '<div class="callout ' + cls + '">' + head + depth + '</div>';
  }
  function refresherHTML(c) {
    const list = Array.isArray(c.refresher) ? c.refresher : [];
    if (!list.length) return '';
    return '<div class="callout before"><div class="ct">' + T('Mielőtt elkezded', 'Before you start') + '</div><ul>' + list.map(r => {
      const label = rich(biv(r.label));
      if (r.chapter) return '<li><a href="#/chapter/' + encodeURIComponent(r.chapter.section) + '/' + encodeURIComponent(r.chapter.chapter) + '">' + label + '</a></li>';
      if (r.term) return '<li><button type="button" class="term" data-term="' + esc(r.term) + '">' + label + '</button></li>';
      return '<li>' + label + '</li>';
    }).join('') + '</ul></div>';
  }
  function recapHTML(c) {
    const points = bivArr(c.recap && c.recap.points);
    const next = biv(c.recap && c.recap.next);
    const terms = Array.isArray(c.terms) ? c.terms : [];
    if (!points.length && !next && !terms.length) return '';
    return '<section class="recap"><h2 class="sec-label">' + T('Összefoglalás', 'Recap') + '</h2>' +
      (terms.length ? '<div class="term-chips">' + terms.map(t => '<button type="button" class="term chip-term" data-term="' + esc(t.id) + '">' + esc(biv(t.term)) + '</button>').join('') + '</div>' : '') +
      (points.length ? '<ul>' + points.map(p => '<li>' + rich(p) + '</li>').join('') + '</ul>' : '') +
      (next ? '<p class="next-step"><b>' + T('Mi jön most?', "What's next") + '</b> ' + rich(next) + '</p>' : '') + '</section>';
  }
  function chapterChecksHTML(c) {
    const checks = Array.isArray(c.checks) ? c.checks : [];
    if (!checks.length) return '';
    return '<section class="chapter-checks"><h2 class="sec-label">' + T('Ellenőrizd magad', 'Check yourself') + '</h2>' + checks.map(checkHTML).join('') + '</section>';
  }

  function qCard(item, n, opts) {
    const q = item.q, type = q.type || 'expr';
    const meta = opts && opts.meta ? '<div class="qmeta">' + esc(item.c.num) + ' · ' + esc(biv(item.c.title)) + '</div>' : '';
    let controls;
    if (type === 'choice') {
      controls = '<div class="choice-list">' + bivArr(q.choices).map((c, j) =>
        '<button class="btn choice" type="button" data-qchoice="' + j + '">' + esc(c) + '</button>').join('') + '</div>';
    } else if (type === 'proof') {
      controls = '<div class="self"><button class="btn" type="button" data-qproof="1">' + T('Kész', 'Solved') + '</button></div>';
    } else {
      controls = '<div class="answer-row"><input class="answer" data-qinput type="text" placeholder="' + T('Válasz…', 'Answer…') + '" aria-label="' + T('Válasz', 'Answer') + '">' +
        '<button class="btn primary" type="button" data-qcheck>' + T('Ellenőrzés', 'Check') + '</button>' +
        (biv(q.hint) ? '<button class="btn" type="button" data-qhint>' + T('Segítség', 'Hint') + '</button>' : '') + '</div>';
    }
    return '<div class="ex" id="q-' + esc(item.key.replace(/[^a-zA-Z0-9_-]+/g, '-')) + '" data-qkey="' + esc(item.key) + '">' + meta +
      '<div class="ex-head"><span class="num">' + String(n || (item.i + 1)).padStart(2, '0') + '</span><div class="ex-q">' + rich(biv(q.q)) + '</div></div>' +
      controls + '<div class="feedback"></div>' +
      (biv(q.hint) ? '<div class="hint">' + rich(biv(q.hint)) + '</div>' : '') +
      (biv(q.sol) ? '<div class="sol-wrap"><button class="btn sm" type="button" data-qsol>' + T('Megoldás', 'Show solution') + '</button><div class="sol"><b>' + T('Megoldás.', 'Solution.') + '</b> ' + rich(biv(q.sol)) + '</div></div>' : '') + '</div>';
  }
  function record(key, ok) {
    stats.attempts = (stats.attempts || 0) + 1;
    if (ok) stats.correct = (stats.correct || 0) + 1;
    const b = stats.byKey[key] || { a: 0, c: 0 };
    b.a++; if (ok) b.c++;
    stats.byKey[key] = b;
    if (ok) delete wrong[key]; else wrong[key] = Date.now();
    if (daily.day === today() && (daily.keys || []).includes(key) && ok) daily.done[key] = true;
    if (stats.lastDay !== today()) {
      stats.streak = stats.lastDay === yesterday() ? (stats.streak || 0) + 1 : 1;
      stats.lastDay = today();
    }
    save(statsKey, stats);
    save(wrongKey, wrong);
    save(dailyKey, daily);
    if (runState) { runState.attempts++; if (ok) runState.correct++; updateRunScore(); }
    if (examState && examState.active) { examState.attempts++; if (ok) examState.correct++; updateExamScore(); }
  }
  function markFeedback(ex, ok, q, locked) {
    const fb = ex.querySelector('.feedback');
    if (fb) {
      fb.className = 'feedback ' + (ok ? 'ok' : 'bad');
      fb.textContent = ok ? T('Helyes.', 'Correct.') : T('Nem stimmel. Kérj segítséget, vagy nézd meg a megoldást.', 'Not quite. Ask for a hint or show the solution.');
    }
    ex.classList.toggle('solved', ok);
    if (locked) {
      ex.dataset.answered = '1';
      $$('button[data-qchoice], button[data-qcheck], button[data-qproof]', ex).forEach(b => { b.disabled = true; });
      const input = ex.querySelector('input[data-qinput]');
      if (input) input.disabled = true;
      const sol = ex.querySelector('.sol');
      if (sol) sol.classList.add('show');
    }
  }
  function bindQuestions(root) {
    $$('[data-qkey]', root).forEach(ex => {
      const item = findItem(ex.dataset.qkey);
      if (!item) return;
      const q = item.q;
      const locked = !!(examState && (examState.active || examState.finished));
      const answer = ok => {
        record(item.key, ok);
        state.coach.stuck[item.key] = -1;
        saveCoach();
        markFeedback(ex, ok, q, locked);
        if (!ok) offerTags(ex);
        if (!ok && runState) runState.wrong.push(item.key);
        if (ok && location.hash.startsWith('#/errors')) setTimeout(() => { if (location.hash.startsWith('#/errors')) renderErrors(); }, 700);
        if (location.hash.startsWith('#/daily')) setTimeout(updateDailyCount, 100);
      };
      $$('[data-qchoice]', ex).forEach(btn => btn.addEventListener('click', () => {
        answer(String(btn.dataset.qchoice) === String(q.a));
      }));
      $$('[data-qcheck]', ex).forEach(btn => btn.addEventListener('click', () => {
        const input = ex.querySelector('[data-qinput]');
        answer(check(input ? input.value : '', q.a, q.type));
      }));
      $$('[data-qproof]', ex).forEach(btn => btn.addEventListener('click', () => answer(true)));
      $$('[data-qhint]', ex).forEach(btn => btn.addEventListener('click', () => {
        const h = ex.querySelector('.hint'); if (h) h.classList.toggle('show');
      }));
      $$('[data-qsol]', ex).forEach(btn => btn.addEventListener('click', () => {
        const s = ex.querySelector('.sol'); if (s) s.classList.toggle('show');
      }));
    });
  }

  /* --------------------------------------------------------------- daily */
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function seededShuffle(arr, seed) {
    const a = arr.slice();
    let x = seed || 1;
    for (let i = a.length - 1; i > 0; i--) {
      x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
      const j = x % (i + 1);
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function ensureDaily() {
    const day = today();
    if (daily.day !== day) {
      const pool = allExercises();
      const keys = seededShuffle(pool, hashStr(scope + day)).slice(0, Math.min(5, pool.length)).map(x => x.key);
      daily = { day, keys, done: {} };
      save(dailyKey, daily);
    }
    return daily;
  }
  function updateDailyCount() {
    const el = $('#dailyDone');
    if (!el) return;
    const n = (ensureDaily().keys || []).filter(k => daily.done[k]).length;
    el.textContent = n + ' / ' + (daily.keys || []).length;
  }

  /* -------------------------------------------------------------- helpers */
  function emptyState(title, text) {
    return '<div class="empty"><div class="empty-ic">' + icon('doc') + '</div><h2>' + esc(title) + '</h2><p>' + esc(text) + '</p></div>';
  }
  function sectionBars() {
    return '<div class="bars">' + site.sections.map(s => {
      const done = s.chapters.filter(c => progress[s.id + '/' + c.id]).length;
      return '<div class="bar-row"><div class="bar-head"><a href="#/section/' + encodeURIComponent(s.id) + '">' + esc(s.num) + '. ' + esc(biv(s.title)) + '</a><span>' + done + '/' + s.chapters.length + '</span></div>' +
        '<div class="bar"><i style="width:' + pct(done, s.chapters.length) + '%"></i></div></div>';
    }).join('') + '</div>';
  }
  function updateRunScore() {
    const el = $('#runScore');
    if (el && runState) el.textContent = runState.correct + ' / ' + runState.attempts;
  }
  function updateExamScore() {
    const el = $('#examScore');
    if (el && examState) el.textContent = examState.correct + ' / ' + examState.attempts;
  }

  /* ---------------------------------------------------------------- pages */
  function welcomeBackHTML() {
    const c = coach();
    if (!c.lastActive) return '';
    const gap = daysBetween(c.lastActive, today());
    if (gap < 7 || c.welcomeShown === today()) return '';
    c.welcomeShown = today();
    saveCoach();
    return '<div class="callout note welcome-back"><b>' + T('Üdv újra itt.', 'Welcome back.') + '</b> ' +
      T('Semmi nem veszett el. A legkisebb lépés is elég ma: öt perc, és megvan a nap.', 'Nothing is lost. The smallest step is enough today: five minutes and the day counts.') +
      '<div class="hero-actions"><a class="btn primary" href="#/errors">' + T('Rossz nap? 5 perc is számít.', 'Bad day? 5 minutes counts.') + '</a>' +
      '<a class="btn" href="#/today">' + T('Mai terv', "Today's plan") + '</a></div></div>';
  }
  function renderHome() {
    current = null;
    $('#main').innerHTML =
      '<section class="hero"><div class="kicker">' + esc(biv(site.subtitle)) + '</div><h1>' + esc(biv(site.title)) + '</h1>' +
      '<p class="lead">' + rich(biv(site.summary)) + '</p>' +
      welcomeBackHTML() +
      '<div class="hero-actions"><a class="btn primary" href="#/today">' + T('Mai terv indítása', "Start today's plan") + '</a>' +
      '<a class="btn" href="#/learn">' + T('Tanulás és ismétlés', 'Learn and review') + '</a>' +
      '<a class="btn" href="#/glossary">' + T('Fogalomtár', 'Glossary') + '</a></div>' +
      '<div class="hero-meta"><span><b>' + site.sections.length + '</b> ' + T('rész', 'parts') + '</span><span><b>' + total() + '</b> ' + T('fejezet', 'chapters') + '</span><span><b>' + readCount() + '/' + total() + '</b> ' + T('elolvasva', 'read') + '</span></div></section>' +
      '<div class="grid">' + site.sections.map(s => '<a class="card-link" href="#/section/' + encodeURIComponent(s.id) + '">' +
        '<div class="card-top"><span class="pill">' + esc(s.num) + '. ' + T('rész', 'part') + '</span></div>' +
        '<h2>' + esc(biv(s.title)) + '</h2><p>' + rich(biv(s.subtitle)) + '</p>' +
        '<div class="mini"><span>' + s.chapters.length + ' ' + T('fejezet', 'chapters') + '</span><i style="width:' + pct(s.chapters.filter(c => progress[s.id + '/' + c.id]).length, s.chapters.length) + '%"></i></div></a>').join('') + '</div>';
    saveProgress();
    renderMath();
  }

  function renderSection(sid) {
    const s = site.sections.find(x => x.id === sid);
    if (!s) return renderHome();
    current = null;
    const done = s.chapters.filter(c => progress[s.id + '/' + c.id]).length;
    const mins = s.chapters.reduce((n, c) => n + (Number(c.minutes) || 20), 0);
    $('#main').innerHTML = '<div class="kicker">' + esc(s.num) + '. ' + T('rész', 'PART') + '</div><h1>' + esc(biv(s.title)) + '</h1>' +
      '<p class="lead">' + rich(biv(s.subtitle)) + '</p><p>' + rich(biv(s.intro)) + '</p>' +
      '<div class="section-meta"><span><b>' + s.chapters.length + '</b> ' + T('fejezet', 'chapters') + '</span><span><b>' + done + '</b> ' + T('elolvasva', 'read') + '</span><span><b>' + mins + '</b> ' + T('perc', 'min') + '</span></div>' +
      (bivArr(s.conceptMap).length ? '<div class="callout concept-map"><div class="ct">' + T('Hogyan kapcsolódnak?', 'How they connect') + '</div><ol>' + bivArr(s.conceptMap).map(x => '<li>' + rich(x) + '</li>').join('') + '</ol></div>' : '') +
      '<div class="chapter-list">' + s.chapters.map(c => '<a class="chapter-row" href="#/chapter/' + encodeURIComponent(s.id) + '/' + encodeURIComponent(c.id) + '">' +
        '<span class="n">' + esc(c.num) + '</span><div><h3>' + esc(biv(c.title)) + '</h3><p>' + esc(biv(c.lead)).slice(0, 150) + '…</p></div><span>' + (progress[s.id + '/' + c.id] ? '✓' : '→') + '</span></a>').join('') + '</div>' +
      (biv(s.summary) ? '<div class="callout section-summary"><div class="ct">' + T('A rész összefoglalása', 'Section summary') + '</div><p>' + rich(biv(s.summary)) + '</p></div>' : '');
    saveProgress();
    renderMath();
  }

  function renderChapter(sid, cid) {
    const s = site.sections.find(x => x.id === sid);
    const c = s && s.chapters.find(x => x.id === cid);
    if (!c) return renderHome();
    current = { s, c };
    const list = chapters(), idx = list.findIndex(x => x.s.id === sid && x.c.id === cid);
    const prev = list[idx - 1], next = list[idx + 1];
    const exs = c.exercises || [];
    $('#main').innerHTML = '<article class="book"><div class="running"><span>' + esc(s.num) + '. ' + esc(biv(s.title)) + '</span><span>' + esc(c.num) + '. ' + T('fejezet', 'chapter') + '</span></div>' +
      '<header class="ch-head"><div class="ch-num">' + esc(c.num) + '</div><div><h1>' + esc(biv(c.title)) + '</h1><p class="lead">' + rich(biv(c.lead)) + '</p></div></header>' +
      '<div class="pills"><span>' + (c.minutes || 20) + ' ' + T('perc', 'min') + '</span><span>' + exs.length + ' ' + T('feladat', 'exercises') + '</span>' +
      (Array.isArray(c.terms) && c.terms.length ? '<span>' + c.terms.length + ' ' + T('új fogalom', 'new terms') + '</span>' : '') + '</div>' +
      refresherHTML(c) +
      (bivArr(c.why).length ? '<div class="callout why"><div class="ct">' + T('Miért?', 'Why?') + '</div>' + bivArr(c.why).map(p => '<p>' + rich(p) + '</p>').join('') + '</div>' : '') +
      (biv(c.when) ? '<div class="callout when"><div class="ct">' + T('Mikor használd?', 'When to use it') + '</div><p>' + rich(biv(c.when)) + '</p></div>' : '') +
      (c.theory || []).map(theoryHTML).join('') +
      ((c.examples || []).length ? '<section><h2 class="sec-label">' + T('Kidolgozott példák', 'Worked examples') + '</h2>' + c.examples.map((e, i) => {
        const steps = bivArr(e.steps), reasons = bivArr(e.reasons);
        return '<div class="example"><div class="ex-title"><span class="pill">' + T('PÉLDA ', 'EXAMPLE ') + (i + 1) + '</span><h3>' + esc(biv(e.title)) + '</h3></div><p>' + rich(biv(e.problem)) + '</p><ol>' +
          steps.map((x, j) => '<li>' + rich(x) + (reasons[j] ? '<small class="step-why"><b>' + T('Miért?', 'Why this step') + '</b> ' + rich(reasons[j]) + '</small>' : '') + '</li>').join('') +
          '</ol><p class="answer-line"><b>' + T('Eredmény:', 'Answer:') + '</b> ' + rich(biv(e.answer)) + '</p></div>';
      }).join('') + '</section>' : '') +
      (bivArr(c.mistakes).length ? '<div class="callout warn"><div class="ct">' + T('Tipikus hibák', 'Common mistakes') + '</div><ul>' + bivArr(c.mistakes).map(x => '<li>' + rich(x) + '</li>').join('') + '</ul></div>' : '') +
      '<section><h2 class="sec-label">' + T('Gyakorló feladatok', 'Practice exercises') + '</h2><div class="ex-list">' + exs.map((q, i) => qCard({ s, c, q, i, key: s.id + '/' + c.id + '/' + i })).join('') + '</div></section>' +
      chapterChecksHTML(c) + recapHTML(c) +
      (prev || next ? '<nav class="chapter-nav">' + (prev ? '<a href="#/chapter/' + encodeURIComponent(prev.s.id) + '/' + encodeURIComponent(prev.c.id) + '"><small>' + T('Előző', 'Previous') + '</small><b>' + esc(prev.c.num) + '. ' + esc(biv(prev.c.title)) + '</b></a>' : '<span></span>') +
        (next ? '<a class="next" href="#/chapter/' + encodeURIComponent(next.s.id) + '/' + encodeURIComponent(next.c.id) + '"><small>' + T('Következő', 'Next') + '</small><b>' + esc(next.c.num) + '. ' + esc(biv(next.c.title)) + '</b></a>' : '<span></span>') + '</nav>' : '') +
      '<div class="read-line"><button class="btn ' + (progress[s.id + '/' + c.id] ? '' : 'primary') + '" data-read="' + (progress[s.id + '/' + c.id] ? '0' : '1') + '">' + (progress[s.id + '/' + c.id] ? T('Visszavonás', 'Mark unread') : T('Fejezet kész', 'Mark chapter read')) + '</button></div></article>';
    saveProgress();
    renderTOC();
    renderMath();
    bindQuestions($('#main'));
    bindRead();
    if (coach().focusKey) {
      if (focusExercise(coach().focusKey)) { delete coach().focusKey; saveCoach(); }
    }
  }

  function bindRead() {
    $$('[data-read]').forEach(btn => btn.addEventListener('click', () => {
      if (!current) return;
      const sid = current.s.id, cid = current.c.id;
      if (btn.dataset.read === '1') progress[sid + '/' + cid] = true;
      else delete progress[sid + '/' + cid];
      renderChapter(sid, cid);
      renderTOC();
      saveProgress();
    }));
  }

  function renderFocus() {
    current = null;
    const list = chapters();
    const read = readCount();
    const next = list.find(x => !progress[x.s.id + '/' + x.c.id]) || list[0];
    const d = ensureDaily();
    const done = (d.keys || []).filter(k => daily.done[k]).length;
    const wrongN = Object.keys(wrong).length;
    const continueHref = next ? '#/chapter/' + encodeURIComponent(next.s.id) + '/' + encodeURIComponent(next.c.id) : '#/';
    $('#main').innerHTML = '<section class="hero compact"><div class="kicker">' + T('Fókusz', 'Focus') + '</div><h1>' + esc(biv(site.title)) + '</h1>' +
      '<p class="lead">' + T('Folytasd ott, ahol abbahagytad, és tartsd karban a tudásod napi gyakorlással.', 'Continue where you left off and keep the knowledge fresh with daily practice.') + '</p>' +
      '<div class="hero-actions"><a class="btn primary" href="' + continueHref + '">' + (next ? T('Folytatás', 'Continue') + ' · ' + esc(next.c.num) : T('Kezdés', 'Start')) + '</a>' +
      '<a class="btn" href="#/learn">' + T('Tanulás és ismétlés', 'Learn and review') + '</a></div>' +
      '<div class="hero-meta"><span><b>' + pct(read, total()) + '%</b> ' + T('elolvasva', 'read') + '</span><span><b>' + done + '/' + (d.keys || []).length + '</b> ' + T('napi küldetés', 'daily quest') + '</span><span><b>' + wrongN + '</b> ' + T('hibafüzet', 'error notebook') + '</span></div></section>' +
      '<div class="stat-grid">' +
      '<a class="stat-card" href="#/daily"><span class="stat-ic">' + icon('compass') + '</span><b>' + done + '/' + (d.keys || []).length + '</b><span>' + T('Napi küldetés', 'Daily quest') + '</span></a>' +
      '<a class="stat-card" href="#/errors"><span class="stat-ic">' + icon('notebook') + '</span><b>' + wrongN + '</b><span>' + T('Hibafüzet', 'Error notebook') + '</span></a>' +
      '<a class="stat-card" href="#/bank"><span class="stat-ic">' + icon('bank') + '</span><b>' + allExercises().length + '</b><span>' + T('Feladatbank', 'Practice bank') + '</span></a>' +
      '<a class="stat-card" href="#/progress"><span class="stat-ic">' + icon('chart') + '</span><b>' + stats.streak + '</b><span>' + T('Napos sorozat', 'Day streak') + '</span></a></div>' +
      '<h2 class="sec-label">' + T('Részek', 'Parts') + '</h2>' + sectionBars();
  }

  function renderLearn() {
    current = null;
    const wrongN = Object.keys(wrong).length;
    $('#main').innerHTML = '<div class="kicker">' + T('Fókusz', 'Focus') + '</div><h1>' + T('Tanulás és ismétlés', 'Learn and review') + '</h1>' +
      '<p class="lead">' + T('A fejezetek sorrendben épülnek egymásra. Olvasottnak jelölt fejezetek zöld pipát kapnak.', 'Chapters build on each other. Read chapters get a green check.') + '</p>' +
      (wrongN ? '<div class="callout note"><b>' + T('Ismétlésre vár', 'Waiting for review') + ':</b> ' + wrongN + ' ' + T('hibás feladat.', 'missed exercises.') + ' <a href="#/errors">' + T('Hibafüzet megnyitása', 'Open error notebook') + '</a></div>' : '') +
      site.sections.map(s => '<section class="learn-sec"><div class="learn-head"><span class="pill">' + esc(s.num) + '</span><h2>' + esc(biv(s.title)) + '</h2>' +
        '<span class="learn-count">' + s.chapters.filter(c => progress[s.id + '/' + c.id]).length + '/' + s.chapters.length + '</span></div>' +
        '<div class="chapter-list">' + s.chapters.map(c => '<a class="chapter-row" href="#/chapter/' + encodeURIComponent(s.id) + '/' + encodeURIComponent(c.id) + '">' +
          '<span class="n">' + esc(c.num) + '</span><div><h3>' + esc(biv(c.title)) + '</h3><p>' + (progress[s.id + '/' + c.id] ? T('Elolvasva', 'Read') : T('Nincs elolvasva', 'Unread')) + '</p></div>' +
          '<span>' + (progress[s.id + '/' + c.id] ? '✓' : '→') + '</span></a>').join('') + '</div></section>').join('');
  }

  function renderMap() {
    current = null;
    $('#main').innerHTML = '<div class="kicker">' + T('Fókusz', 'Focus') + '</div><h1>' + T('Tudástérkép', 'Knowledge map') + '</h1>' +
      '<p class="lead">' + T('A könyv szerkezete egy pillantásra. Kattints egy fejezetre az ugráshoz.', 'The book structure at a glance. Click a chapter to jump.') + '</p>' +
      '<div class="map-legend"><span><i class="dot done"></i>' + T('elolvasva', 'read') + '</span><span><i class="dot"></i>' + T('hátralévő', 'remaining') + '</span></div>' +
      '<div class="map">' + site.sections.map(s => {
        const done = s.chapters.filter(c => progress[s.id + '/' + c.id]).length;
        return '<div class="map-sec"><div class="map-sec-head"><span class="pill">' + esc(s.num) + '</span><h2>' + esc(biv(s.title)) + '</h2><span class="learn-count">' + done + '/' + s.chapters.length + '</span></div>' +
          '<div class="map-nodes">' + s.chapters.map(c => '<a class="node' + (progress[s.id + '/' + c.id] ? ' done' : '') + '" href="#/chapter/' + encodeURIComponent(s.id) + '/' + encodeURIComponent(c.id) + '" title="' + esc(biv(c.title)) + '">' + esc(c.num) + '</a>').join('') + '</div>' +
          '<div class="map-titles">' + s.chapters.map(c => '<span>' + esc(c.num) + ' ' + esc(biv(c.title)) + '</span>').join('') + '</div></div>';
      }).join('') + '</div>';
  }

  function renderDaily() {
    current = null;
    const d = ensureDaily();
    const keys = d.keys || [];
    const done = keys.filter(k => daily.done[k]).length;
    const items = keys.map(findItem).filter(Boolean);
    $('#main').innerHTML = '<div class="kicker">' + T('Napi gyakorlás', 'Daily practice') + '</div><h1>' + T('Napi küldetés', 'Daily quest') + '</h1>' +
      '<p class="lead">' + T('Öt feladat a teljes könyvből, naponta újrahúzva. A helyes válaszok eltűnnek a hibafüzetből.', 'Five exercises from the whole book, reshuffled every day. Correct answers leave the error notebook.') + '</p>' +
      '<div class="run-bar"><span>' + T('Kész', 'Done') + ': <b id="dailyDone">' + done + ' / ' + keys.length + '</b></span><span>' + T('Sorozat', 'Streak') + ': <b>' + stats.streak + '</b></span></div>' +
      (items.length ? '<div class="ex-list">' + items.map((x, i) => qCard(x, i + 1, { meta: true })).join('') + '</div>' : emptyState(T('Nincs feladat', 'No exercises'), T('Ez a könyv még nem tartalmaz gyakorlófeladatot.', 'This book has no exercises yet.')));
    renderMath();
    bindQuestions($('#main'));
  }

  function renderErrors() {
    current = null;
    const items = Object.keys(wrong).map(findItem).filter(Boolean);
    $('#main').innerHTML = '<div class="kicker">' + T('Napi gyakorlás', 'Daily practice') + '</div><h1>' + T('Hibafüzet', 'Error notebook') + '</h1>' +
      '<p class="lead">' + T('Minden téves válasz ide kerül. Javítsd ki őket; a helyes válasz törli a bejegyzést.', 'Every missed answer lands here. Fix them; a correct answer removes the entry.') + '</p>' +
      '<div class="run-bar"><span>' + T('Bejegyzés', 'Entries') + ': <b>' + items.length + '</b></span><span>' + T('Összes próbálkozás', 'Total attempts') + ': <b>' + stats.attempts + '</b></span></div>' +
      (items.length ? '<div class="ex-list">' + items.map((x, i) => qCard(x, i + 1, { meta: true })).join('') + '</div>' :
        emptyState(T('Üres a hibafüzet', 'Notebook is empty'), T('Oldj meg feladatokat; a téves válaszok automatikusan ide kerülnek.', 'Solve exercises; missed answers appear here automatically.')));
    renderMath();
    bindQuestions($('#main'));
  }

  function renderMixed() {
    current = null;
    runState = { attempts: 0, correct: 0, wrong: [] };
    const items = seededShuffle(allExercises(), hashStr(scope + Date.now())).slice(0, 12);
    $('#main').innerHTML = '<div class="kicker">' + T('Napi gyakorlás', 'Daily practice') + '</div><h1>' + T('Vegyes kör', 'Mixed run') + '</h1>' +
      '<p class="lead">' + T('Tizenkét feladat fejezeteken át, véletlen sorrendben. Nincs időlimit.', 'Twelve exercises across chapters in random order. No time limit.') + '</p>' +
      '<div class="run-bar"><span>' + T('Pontszám', 'Score') + ': <b id="runScore">0 / 0</b></span><button class="btn" type="button" id="reroll">' + T('Újrahúzás', 'Reroll') + '</button></div>' +
      (items.length ? '<div class="ex-list">' + items.map((x, i) => qCard(x, i + 1, { meta: true })).join('') + '</div>' : emptyState(T('Nincs feladat', 'No exercises'), T('Ez a könyv még nem tartalmaz gyakorlófeladatot.', 'This book has no exercises yet.')));
    renderMath();
    bindQuestions($('#main'));
    const btn = $('#reroll');
    if (btn) btn.addEventListener('click', renderMixed);
  }

  function mistakeClaim(text) {
    const s = String(text || '').trim();
    const quoted = s.match(/^[„"]([^”"]+)[”"]/);
    if (quoted) return quoted[1].trim();
    const cut = s.split(/\s+[–—]\s+|\.\s*A javítás|:\s*A javítás/)[0];
    return (cut || s).trim();
  }
  function renderHunt() {
    current = null;
    const rounds = [];
    for (const { s, c } of chapters()) {
      const mistakes = bivArr(c.mistakes).map(mistakeClaim).filter(Boolean);
      const facts = (c.theory || []).map(t => biv(t.body)).filter(Boolean);
      if (!mistakes.length || facts.length < 2) continue;
      const options = seededShuffle([
        { text: mistakes[0], bad: true },
        ...facts.slice(0, 3).map(text => ({ text, bad: false }))
      ], hashStr(s.id + c.id));
      rounds.push({ s, c, options, bad: options.findIndex(o => o.bad) });
      if (rounds.length >= 6) break;
    }
    $('#main').innerHTML = '<div class="kicker">' + T('Napi gyakorlás', 'Daily practice') + '</div><h1>' + T('Hibavadászat', 'Error hunt') + '</h1>' +
      '<p class="lead">' + T('Minden körben pontosan egy állítás tipikus hiba. Találd meg.', 'Exactly one statement per round is a common mistake. Find it.') + '</p>' +
      '<div class="run-bar"><span>' + T('Körök', 'Rounds') + ': <b>' + rounds.length + '</b></span><span>' + T('Helyes', 'Correct') + ': <b id="huntScore">0</b></span></div>' +
      (rounds.length ? rounds.map((r, i) => '<div class="hunt" data-bad="' + r.bad + '"><div class="hunt-head"><span class="num">' + String(i + 1).padStart(2, '0') + '</span><div><b>' + esc(r.c.num) + ' · ' + esc(biv(r.c.title)) + '</b><p>' + T('Melyik állítás hiba?', 'Which statement is a mistake?') + '</p></div></div>' +
        '<div class="hunt-opts">' + r.options.map((o, j) => '<button class="hunt-opt" type="button" data-opt="' + j + '">' + rich(o.text) + '</button>').join('') + '</div><div class="feedback"></div></div>').join('') :
        emptyState(T('Nincs hibavadászat', 'No error hunt'), T('Ehhez a könyvhöz nincsenek tipikus hibák rögzítve.', 'This book has no recorded common mistakes.')));
    renderMath();
    let solved = 0;
    $$('.hunt').forEach(box => {
      const bad = Number(box.dataset.bad);
      $$('.hunt-opt', box).forEach(btn => btn.addEventListener('click', () => {
        if (box.dataset.done) return;
        box.dataset.done = '1';
        const ok = Number(btn.dataset.opt) === bad;
        btn.classList.add(ok ? 'good' : 'bad');
        if (!ok) { const right = box.querySelector('[data-opt="' + bad + '"]'); if (right) right.classList.add('good'); }
        const fb = box.querySelector('.feedback');
        fb.className = 'feedback ' + (ok ? 'ok' : 'bad');
        fb.textContent = ok ? T('Helyes, ez a tipikus hiba.', 'Correct, that is the mistake.') : T('Nem ez. A zöld a tipikus hiba.', 'Not that one. Green marks the mistake.');
        if (ok) solved++;
        const score = $('#huntScore'); if (score) score.textContent = solved;
      }));
    });
  }

  function renderProgress() {
    current = null;
    const attempted = stats.attempts || 0;
    const correct = stats.correct || 0;
    const accuracy = attempted ? Math.round(correct / attempted * 100) : 0;
    const wrongN = Object.keys(wrong).length;
    $('#main').innerHTML = '<div class="kicker">' + T('Napi gyakorlás', 'Daily practice') + '</div><h1>' + T('Haladás', 'Progress') + '</h1>' +
      '<div class="stat-grid">' +
      '<div class="stat-card"><b>' + pct(readCount(), total()) + '%</b><span>' + T('Elolvasva', 'Read') + '</span></div>' +
      '<div class="stat-card"><b>' + attempted + '</b><span>' + T('Feladatpróba', 'Exercise attempts') + '</span></div>' +
      '<div class="stat-card"><b>' + accuracy + '%</b><span>' + T('Pontosság', 'Accuracy') + '</span></div>' +
      '<div class="stat-card"><b>' + stats.streak + '</b><span>' + T('Napos sorozat', 'Day streak') + '</span></div>' +
      '<div class="stat-card"><b>' + wrongN + '</b><span>' + T('Hibafüzet', 'Error notebook') + '</span></div>' +
      '<div class="stat-card"><b>' + minutesOn(today()) + '</b><span>' + T('perc ma', 'minutes today') + '</span></div>' +
      '<div class="stat-card"><b>' + weeklyMinutes() + '</b><span>' + T('perc ezen a héten', 'minutes this week') + '</span></div></div>' +
      '<div class="coach-panel"><h3>' + T('Miért csúszol el?', 'Why do you miss?') + '</h3>' + tagsHTML(tagPatterns()) + '</div>' +
      '<h2 class="sec-label">' + T('Fejezetek', 'Chapters') + '</h2>' + sectionBars() +
      '<h2 class="sec-label">' + T('Fejezet szintű pontosság', 'Per-chapter accuracy') + '</h2>' +
      '<div class="accuracy">' + chapters().map(({ s, c }) => {
        let a = 0, ok = 0;
        for (let i = 0; i < (c.exercises || []).length; i++) {
          const b = stats.byKey[s.id + '/' + c.id + '/' + i];
          if (b) { a += b.a; ok += b.c; }
        }
        return '<div class="acc-row"><span>' + esc(c.num) + ' ' + esc(biv(c.title)) + '</span><span class="acc-bar"><i style="width:' + (a ? pct(ok, a) : 0) + '%"></i></span><b>' + (a ? Math.round(ok / a * 100) + '%' : '—') + '</b></div>';
      }).join('') + '</div>';
    saveProgress();
  }

  function renderFormulas() {
    current = null;
    const rows = [];
    for (const s of site.sections) for (const c of s.chapters) for (const t of (c.theory || [])) {
      if (t.type === 'formula' && t.latex) rows.push({ c, t });
    }
    $('#main').innerHTML = '<div class="kicker">' + T('Könyvtár', 'Library') + '</div><h1>' + T('Képletgyűjtemény', 'Formula sheet') + '</h1>' +
      '<p class="lead">' + T('A könyv összes képlete fejezetenként.', 'Every formula in the book, grouped by chapter.') + '</p>' +
      (rows.length ? '<div class="formulas">' + rows.map(({ c, t }) => '<div class="formula"><div class="formula-meta">' + esc(c.num) + ' · ' + esc(biv(c.title)) + '</div><h3>' + esc(biv(t.title)) + '</h3><div class="fx">$$' + esc(String(t.latex)) + '$$</div>' +
        (biv(t.note) ? '<p class="muted">' + rich(biv(t.note)) + '</p>' : '') + '</div>').join('') + '</div>' :
        emptyState(T('Nincs képlet', 'No formulas'), T('Ez a könyv nem tartalmaz képletblokkokat. A programozási anyag kódpéldákra épül.', 'This book has no formula blocks. The programming material is built on code examples.')));
    renderMath();
  }

  function renderVideos() {
    current = null;
    const vids = Array.isArray(site.videos) ? site.videos : [];
    $('#main').innerHTML = '<div class="kicker">' + T('Könyvtár', 'Library') + '</div><h1>' + T('Videók', 'Videos') + '</h1>' +
      '<p class="lead">' + T('A könyvhöz csatolt videós anyagok.', 'Video material attached to this book.') + '</p>' +
      (vids.length ? '<div class="grid">' + vids.map(v => '<a class="card-link" href="' + esc(v.url || '#') + '" target="_blank" rel="noopener noreferrer"><h2>' + esc(biv(v.title) || v.title) + '</h2><p>' + esc(biv(v.note) || '') + '</p></a>').join('') + '</div>' :
        emptyState(T('Nincs videó', 'No videos'), T('Ehhez a könyvhöz nem került videó. A tananyag a fejezetekben, példákban és feladatokban található.', 'No videos were supplied for this book. The material lives in the chapters, examples and exercises.')));
  }

  function renderBank() {
    current = null;
    const pool = allExercises();
    runState = { attempts: 0, correct: 0, wrong: [] };
    const items = seededShuffle(pool, hashStr(scope + Date.now())).slice(0, Math.min(20, pool.length));
    $('#main').innerHTML = '<div class="kicker">' + T('Könyvtár', 'Library') + '</div><h1>' + T('Feladatbank', 'Practice bank') + '</h1>' +
      '<p class="lead">' + T('Húsz véletlen feladat a teljes könyvből. Újrahúzhatod, amikor csak szeretnéd.', 'Twenty random exercises from the whole book. Reroll whenever you like.') + '</p>' +
      '<div class="run-bar"><span>' + T('Pontszám', 'Score') + ': <b id="runScore">0 / 0</b></span><span>' + T('Készlet', 'Pool') + ': <b>' + pool.length + '</b></span><button class="btn" type="button" id="reroll">' + T('Újrahúzás', 'Reroll') + '</button></div>' +
      (items.length ? '<div class="ex-list">' + items.map((x, i) => qCard(x, i + 1, { meta: true })).join('') + '</div>' : emptyState(T('Nincs feladat', 'No exercises'), T('Ez a könyv még nem tartalmaz gyakorlófeladatot.', 'This book has no exercises yet.')));
    renderMath();
    bindQuestions($('#main'));
    const btn = $('#reroll'); if (btn) btn.addEventListener('click', renderBank);
  }

  function examStart(count, minutes) {
    const pool = seededShuffle(allExercises(), hashStr(scope + Date.now())).slice(0, Math.min(count, allExercises().length));
    examState = { active: true, finished: false, items: pool, attempts: 0, correct: 0, endsAt: Date.now() + minutes * 60000, total: pool.length };
    renderExamRun();
    clearInterval(runTimer);
    runTimer = setInterval(() => {
      if (!examState || !examState.active) return;
      const left = examState.endsAt - Date.now();
      const el = $('#examClock');
      if (el) el.textContent = fmtClock(left);
      if (left <= 0) examFinish();
    }, 1000);
  }
  function fmtClock(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  function examFinish() {
    if (!examState || !examState.active) return;
    examState.active = false;
    examState.finished = true;
    if (runTimer) { clearInterval(runTimer); runTimer = null; }
    renderExamRun(true);
  }
  function renderExamRun(finished) {
    current = null;
    const st = examState;
    const left = Math.max(0, st.endsAt - Date.now());
    $('#main').innerHTML = '<div class="kicker">' + T('Könyvtár', 'Library') + '</div><h1>' + T('Vizsgaszimulátor', 'Exam simulator') + '</h1>' +
      '<div class="run-bar"><span>' + T('Hátralévő idő', 'Time left') + ': <b id="examClock">' + fmtClock(left) + '</b></span><span>' + T('Pontszám', 'Score') + ': <b id="examScore">' + st.correct + ' / ' + st.attempts + '</b></span>' +
      (finished ? '<button class="btn primary" type="button" id="again">' + T('Új vizsga', 'New exam') + '</button>' : '<button class="btn" type="button" id="finish">' + T('Befejezés', 'Finish') + '</button>') + '</div>' +
      (finished ? '<div class="callout note"><b>' + T('Eredmény', 'Result') + ':</b> ' + st.correct + ' / ' + st.items.length + ' (' + pct(st.correct, st.items.length) + '%)</div>' : '') +
      '<div class="ex-list">' + st.items.map((x, i) => qCard(x, i + 1, { meta: true })).join('') + '</div>';
    renderMath();
    bindQuestions($('#main'));
    if (finished) {
      $$('[data-qkey]').forEach(ex => $$('[data-qinput],[data-qcheck],[data-qchoice],[data-qproof]', ex).forEach(el => { el.disabled = true; }));
    }
    const finish = $('#finish'); if (finish) finish.addEventListener('click', examFinish);
    const again = $('#again'); if (again) again.addEventListener('click', renderExam);
  }
  function renderExam() {
    current = null;
    examState = null;
    if (runTimer) { clearInterval(runTimer); runTimer = null; }
    const pool = allExercises().length;
    $('#main').innerHTML = '<div class="kicker">' + T('Könyvtár', 'Library') + '</div><h1>' + T('Vizsgaszimulátor', 'Exam simulator') + '</h1>' +
      '<p class="lead">' + T('Időzített vegyes vizsga a teljes könyvből. Válasz után a helyes megoldás is megjelenik.', 'A timed mixed exam from the whole book. The correct answer appears after you answer.') + '</p>' +
      (pool ? '<div class="exam-setup"><label>' + T('Feladatok', 'Questions') + '<select id="examCount"><option value="10">10</option><option value="20" selected>20</option><option value="30">30</option></select></label>' +
        '<label>' + T('Idő', 'Time') + '<select id="examMinutes"><option value="15">15 min</option><option value="30" selected>30 min</option><option value="45">45 min</option></select></label>' +
        '<button class="btn primary" type="button" id="examStart">' + T('Vizsga indítása', 'Start exam') + '</button></div>' :
        emptyState(T('Nincs feladat', 'No exercises'), T('Ez a könyv még nem tartalmaz gyakorlófeladatot.', 'This book has no exercises yet.')));
    const start = $('#examStart');
    if (start) start.addEventListener('click', () => examStart(Number($('#examCount').value), Number($('#examMinutes').value)));
  }

  function renderResources() {
    current = null;
    const ex = allExercises().length;
    const formulas = site.sections.reduce((n, s) => n + s.chapters.reduce((m, c) => m + (c.theory || []).filter(t => t.type === 'formula').length, 0), 0);
    const code = site.sections.reduce((n, s) => n + s.chapters.reduce((m, c) => m + (c.theory || []).filter(t => t.type === 'code').length, 0), 0);
    $('#main').innerHTML = '<div class="kicker">' + T('Könyvtár', 'Library') + '</div><h1>' + T('Források', 'Resources') + '</h1>' +
      '<p class="lead">' + T('A könyv metaadatai és a benne található anyagok.', 'Book metadata and the material it contains.') + '</p>' +
      '<div class="res-grid">' +
      '<div class="res-card"><b>' + site.sections.length + '</b><span>' + T('rész', 'parts') + '</span></div>' +
      '<div class="res-card"><b>' + total() + '</b><span>' + T('fejezet', 'chapters') + '</span></div>' +
      '<div class="res-card"><b>' + ex + '</b><span>' + T('feladat', 'exercises') + '</span></div>' +
      '<div class="res-card"><b>' + code + '</b><span>' + T('kódpélda', 'code blocks') + '</span></div>' +
      '<div class="res-card"><b>' + formulas + '</b><span>' + T('képlet', 'formulas') + '</span></div></div>' +
      '<div class="callout note"><b>' + T('Nyelv', 'Language') + ':</b> ' + T('magyar és angol', 'Hungarian and English') + ' · <b>' + T('Hozzáférés', 'Access') + ':</b> ' + T('bejelentkezéshez kötött', 'requires sign-in') + '</div>' +
      '<h2 class="sec-label">' + T('Tartalom', 'Contents') + '</h2>' +
      '<div class="chapter-list">' + chapters().map(x => '<a class="chapter-row" href="#/chapter/' + encodeURIComponent(x.s.id) + '/' + encodeURIComponent(x.c.id) + '">' +
        '<span class="n">' + esc(x.c.num) + '</span><div><h3>' + esc(biv(x.c.title)) + '</h3><p>' + esc(biv(x.c.lead)).slice(0, 120) + '…</p></div><span>→</span></a>').join('') + '</div>' +
      '<p class="muted small">' + T('Ez az oldal a Learning Book Builderrel készült. A könyv a saját URL-jén érhető el; nincs letöltés.', 'This site was generated with Learning Book Builder. It is served at its own URL and is not downloadable.') + '</p>';
    renderMath();
  }


  /* ------------------------------------------------------------- glossary */
  function renderGlossary(focusId) {
    current = null;
    const entries = glossaryEntries().slice().sort((a, b) => biv(a.term).localeCompare(biv(b.term)));
    $('#main').innerHTML = '<div class="kicker">' + T('Fogalomtár', 'Glossary') + '</div><h1>' + T('Fogalomtár és tárgymutató', 'Glossary and term index') + '</h1>' +
      '<p class="lead">' + T('Minden fogalom egyszer van definiálva; a fejezetek innen hivatkoznak rá. Kattints egy kifejezésre a szövegben, és itt nyílik meg.', 'Every term is defined once; chapters link here. Tap a term in the text and its entry opens here.') + '</p>' +
      '<label class="gloss-search"><span class="sr">' + T('Keresés a fogalomtárban', 'Search the glossary') + '</span><input type="search" id="glossSearch" placeholder="' + T('Fogalom keresése…', 'Search terms…') + '"></label>' +
      (entries.length ? '<div class="term-index">' + entries.map(g => '<a href="#/glossary/' + encodeURIComponent(g.id) + '">' + esc(biv(g.term)) + '</a>').join('') + '</div>' +
        '<div class="glossary">' + entries.map(g => '<article class="gloss-entry' + (focusId === g.id ? ' focus' : '') + '" id="gloss-' + esc(g.id) + '" data-search="' + esc((biv(g.term) + ' ' + biv(g.plain) + ' ' + biv(g.precise)).toLowerCase()) + '">' +
          '<div class="gloss-head"><h2>' + esc(biv(g.term)) + '</h2>' + (g.chapter ? '<a class="pill" href="#/chapter/' + encodeURIComponent(g.chapter.section) + '/' + encodeURIComponent(g.chapter.chapter) + '">' + T('Fejezet ', 'Chapter ') + esc(g.chapter.num || '') + '</a>' : '') + '</div>' +
          (biv(g.plain) ? '<p class="plain-words"><span class="tag-label">' + T('Egyszerű szavakkal', 'In plain words') + '</span> ' + rich(biv(g.plain), { terms: false }) + '</p>' : '') +
          (biv(g.precise) ? '<p class="precise-line"><span class="tag-label">' + T('Pontosan', 'Precisely') + '</span> ' + rich(biv(g.precise), { terms: false }) + '</p>' : '') +
          (Array.isArray(g.requires) && g.requires.length ? '<p class="muted small">' + T('Ehhez előbb: ', 'Needs first: ') + g.requires.map(id => { const q = glossaryEntries().find(x => x.id === id); return q ? '<a href="#/glossary/' + encodeURIComponent(id) + '">' + esc(biv(q.term)) + '</a>' : esc(id); }).join(', ') + '</p>' : '') +
          '</article>').join('') + '</div>' :
        emptyState(T('Nincs fogalomtár', 'No glossary yet'), T('Ez a könyv a régi formátumot használja; a fogalomtár a következő generáláskor jelenik meg.', 'This book uses the older format; the glossary appears on the next generation.')));
    if (focusId) {
      const el = document.getElementById('gloss-' + focusId);
      if (el) setTimeout(() => el.scrollIntoView({ block: 'center' }), 30);
    }
    const input = $('#glossSearch');
    if (input) input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      $$('.gloss-entry').forEach(el => { el.style.display = !q || (el.dataset.search || '').includes(q) ? '' : 'none'; });
    });
  }

  function renderSearch(q) {
    current = null;
    const needle = String(q || '').trim().toLowerCase();
    const chapterHits = chapters().filter(x => (biv(x.c.title) + ' ' + biv(x.c.lead) + ' ' + biv(x.c.when) + ' ' + (x.c.theory || []).map(t => biv(t.body) + ' ' + biv(t.plain)).join(' ')).toLowerCase().includes(needle));
    const termHits = glossaryEntries().filter(g => (biv(g.term) + ' ' + biv(g.plain) + ' ' + biv(g.precise)).toLowerCase().includes(needle));
    const formulaHits = [];
    for (const { s, c } of chapters()) for (const t of (c.theory || [])) if (t.type === 'formula' && (biv(t.title) + ' ' + (t.latex || '')).toLowerCase().includes(needle)) formulaHits.push({ s, c, t });
    $('#main').innerHTML = '<div class="kicker">' + T('Keresés', 'Search') + '</div><h1>' + esc(q) + '</h1>' +
      '<p class="lead">' + T('Fejezetek, fogalmak és képletek. A fogalomtár minden bejegyzése kereshető.', 'Chapters, terms and formulas. Every glossary entry is searchable.') + '</p>' +
      '<h2 class="sec-label">' + T('Fogalmak', 'Terms') + '</h2>' +
      (termHits.length ? '<div class="term-index">' + termHits.map(g => '<a href="#/glossary/' + encodeURIComponent(g.id) + '">' + esc(biv(g.term)) + '</a>').join('') + '</div>' : '<p class="muted">' + T('Nincs találat.', 'No match.') + '</p>') +
      '<h2 class="sec-label">' + T('Fejezetek', 'Chapters') + '</h2>' +
      (chapterHits.length ? '<div class="chapter-list">' + chapterHits.map(x => '<a class="chapter-row" href="#/chapter/' + encodeURIComponent(x.s.id) + '/' + encodeURIComponent(x.c.id) + '"><span class="n">' + esc(x.c.num) + '</span><div><h3>' + esc(biv(x.c.title)) + '</h3><p>' + esc(biv(x.c.lead)).slice(0, 120) + '…</p></div><span>→</span></a>').join('') + '</div>' : '<p class="muted">' + T('Nincs találat.', 'No match.') + '</p>') +
      '<h2 class="sec-label">' + T('Képletek', 'Formulas') + '</h2>' +
      (formulaHits.length ? '<div class="term-index">' + formulaHits.map(f => '<a href="#/chapter/' + encodeURIComponent(f.s.id) + '/' + encodeURIComponent(f.c.id) + '">' + esc(biv(f.t.title)) + '</a>').join('') + '</div>' : '<p class="muted">' + T('Nincs találat.', 'No match.') + '</p>');
  }

  function termTip() {
    let tip = document.getElementById('termTip');
    if (tip) return tip;
    tip = document.createElement('div');
    tip.id = 'termTip';
    tip.className = 'term-tip';
    tip.hidden = true;
    document.body.appendChild(tip);
    return tip;
  }
  function showTermTip(btn) {
    const entry = glossaryEntries().find(g => g.id === btn.dataset.term);
    if (!entry) return;
    const tip = termTip();
    tip.innerHTML = '<b>' + esc(biv(entry.term)) + '</b><p>' + rich(biv(entry.plain) || biv(entry.precise)) + '</p>' +
      '<a href="#/glossary/' + encodeURIComponent(entry.id) + '">' + T('Fogalomtár bejegyzés', 'Glossary entry') + '</a>';
    tip.hidden = false;
    const r = btn.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    tip.style.maxWidth = width + 'px';
    tip.style.left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12)) + 'px';
    const below = r.bottom + 8;
    tip.style.top = (below + 180 > window.innerHeight ? Math.max(12, r.top - 188) : below) + 'px';
  }
  function hideTermTip() { const tip = document.getElementById('termTip'); if (tip) tip.hidden = true; }

  /* --------------------------------------------------------------- habits */
  const MIN_DAY_MINUTES = 5;
  function coach() { return state.coach; }
  function weekStart(day) {
    const d = parseDay(day); if (!d) return day;
    const dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dow);
    return localDay(d);
  }
  function weeklyMinutes() {
    const start = weekStart(today());
    let total = 0;
    for (let i = 0; i < 7; i++) total += minutesOn(addDaysLocal(start, i));
    return Math.round(total);
  }
  function weekDaysStudied() {
    const start = weekStart(today());
    let n = 0;
    for (let i = 0; i < 7; i++) if (minutesOn(addDaysLocal(start, i)) > 0) n++;
    return n;
  }
  function suggestedTarget() {
    const c = coach();
    if (c.target) return c.target;
    if (!c.firstDay) return 30;
    const weeks = Math.max(0, Math.floor(daysBetween(c.firstDay, today()) / 7));
    return Math.min(120, 30 + weeks * 15);
  }
  function addMinutes(m) {
    const c = coach(), d = today();
    c.minutes[d] = Math.round(((Number(c.minutes[d]) || 0) + m) * 100) / 100;
    if (!c.firstDay) c.firstDay = d;
    c.lastActive = d;
    saveCoach();
  }
  function startMinuteTracking() {
    let last = Date.now();
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(ev => window.addEventListener(ev, () => { last = Date.now(); }, { passive: true }));
    setInterval(() => {
      if (document.hidden) return;
      if (Date.now() - last > 120000) return;
      addMinutes(0.25);
      const todayEl = document.getElementById('todayMinutes');
      if (todayEl) todayEl.textContent = minutesOn(today());
    }, 15000);
  }
  function calendarHTML(days) {
    const cells = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = addDaysLocal(today(), -i);
      const m = minutesOn(day);
      cells.push('<span class="day-cell' + (m > 0 ? ' studied' : '') + (m >= suggestedTarget() ? ' target' : '') + '" title="' + esc(day + ' · ' + m + ' ' + T('perc', 'min')) + '"><b>' + m + '</b><i>' + Number(day.slice(8)) + '</i></span>');
    }
    return '<div class="calendar">' + cells.join('') + '</div>';
  }
  function planFor(minutes) {
    const next = chapters().find(x => !progress[x.s.id + '/' + x.c.id]);
    const due = Object.keys(wrong).length;
    const share = ratio => Math.max(MIN_DAY_MINUTES, Math.round(minutes * ratio));
    const steps = [];
    if (due) steps.push({ kind: 'recall', href: '#/errors', minutes: share(0.25), startWrong: due, label: T('Hibafüzet: előhívás', 'Error notebook: recall first'), detail: due + ' ' + T('esedékes bejegyzés', 'due entries') });
    else steps.push({ kind: 'warmup', href: next ? '#/chapter/' + encodeURIComponent(next.s.id) + '/' + encodeURIComponent(next.c.id) : '#/bank', minutes: share(0.15), label: T('Bemelegítés egy ismert anyaggal', 'Warm up with known material'), detail: T('Nincs esedékes ismétlés — ez jó hír.', 'Nothing due — that is good news.') });
    steps.push(next
      ? { kind: 'learn', href: '#/chapter/' + encodeURIComponent(next.s.id) + '/' + encodeURIComponent(next.c.id), minutes: share(0.4), key: next.s.id + '/' + next.c.id, label: T('Tanulás: ', 'Learn: ') + biv(next.c.title), detail: T('Egy fejezet, elmélettel és példával. Az ismétlés külön lépés.', 'One chapter with theory and an example. Review is a separate step.') }
      : { kind: 'learn', href: '#/bank', minutes: share(0.35), label: T('Minden fejezet elolvasva', 'Every chapter read'), detail: T('Irány a gyakorlás.', 'Move to practice.') });
    steps.push({ kind: 'practice', href: '#/mixed', minutes: share(0.2), startAttempts: stats.attempts || 0, label: T('Vegyes gyakorlás', 'Mixed practice'), detail: T('Külön blokk; nem keveredik a tanuló blokkal.', 'A separate block; it does not mix with the learning block.') });
    steps.push({ kind: 'redo', href: '#/errors', minutes: share(0.15), startWrong: due, label: T('A mai hibák újra', "Redo today's misses"), detail: T('Csak a ma elrontott feladatok.', 'Only the items missed today.') });
    return { date: today(), minutes, steps, done: {}, created: Date.now() };
  }
  /** Plan labels are rendered at paint time, so switching language never leaves stale copy. */
  function stepText(step) {
    const entry = step.key ? chapters().find(x => x.s.id + '/' + x.c.id === step.key) : null;
    if (step.kind === 'recall') return { label: T('Hibafüzet: előhívás', 'Error notebook: recall first'), detail: Object.keys(wrong).length + ' ' + T('esedékes bejegyzés', 'due entries') };
    if (step.kind === 'warmup') return { label: T('Bemelegítés egy ismert anyaggal', 'Warm up with known material'), detail: T('Nincs esedékes ismétlés — ez jó hír.', 'Nothing due — that is good news.') };
    if (step.kind === 'learn') return {
      label: entry ? T('Tanulás: ', 'Learn: ') + biv(entry.c.title) : T('Minden fejezet elolvasva', 'Every chapter read'),
      detail: T('Egy fejezet, elmélettel és példával. Az ismétlés külön lépés.', 'One chapter with theory and an example. Review is a separate step.')
    };
    if (step.kind === 'practice') return { label: T('Vegyes gyakorlás', 'Mixed practice'), detail: T('Külön blokk; nem keveredik a tanuló blokkal.', 'A separate block; it does not mix with the learning block.') };
    return { label: T('A mai hibák újra', "Redo today's misses"), detail: T('Csak a ma elrontott feladatok.', 'Only the items missed today.') };
  }
  function stepDone(step, idx) {
    const p = coach().plan;
    if (!p) return false;
    if (p.done[idx]) return true;
    if (step.kind === 'recall' || step.kind === 'redo') return step.startWrong == null ? false : Object.keys(wrong).length < step.startWrong;
    if (step.kind === 'learn' && step.key) return !!progress[step.key];
    if (step.kind === 'practice' && step.startAttempts != null) return (stats.attempts || 0) >= step.startAttempts + 4;
    return false;
  }
  function renderToday() {
    current = null;
    const c = coach();
    if (!c.plan || c.plan.date !== today()) c.plan = null;
    const plan = c.plan;
    const target = suggestedTarget();
    const todayMin = minutesOn(today());
    const weeksLeft = c.examDate ? Math.max(0, daysBetween(today(), c.examDate)) : null;
    const remaining = chapters().filter(x => !progress[x.s.id + '/' + x.c.id]).length;
    const perWeek = weeksLeft && weeksLeft > 0 ? Math.ceil(remaining / Math.max(1, weeksLeft / 7)) : null;
    const tags = tagPatterns();
    const thisMonth = today().slice(0, 7);
    const monthDays = [];
    for (let d = 1; d <= 31; d++) {
      const day = thisMonth + '-' + pad2(d);
      if (parseDay(day) && parseDay(day).getMonth() + 1 === Number(thisMonth.slice(5))) monthDays.push(day);
    }
    const summary = weeklySummaryText();
    const exported = exportCode();
    $('#main').innerHTML = '<div class="kicker">' + T('Napi terv', "Today's plan") + '</div><h1>' + T('Mai terv', "Today's plan") + '</h1>' +
      '<p class="lead">' + T('Válassz időkeretet, és a terv külön lépésekre bontja: ismétlés, tanulás, gyakorlás, hibajavítás. A tanulás és az ismétlés nem keveredik egy blokkban.', 'Pick a time box and the plan splits into separate steps: recall, learn, practice, redo. Learning and review never mix inside one block.') + '</p>' +
      '<div class="run-bar"><span>' + T('Ma tanultál', 'Studied today') + ': <b id="todayMinutes">' + todayMin + '</b> ' + T('perc', 'min') + '</span>' +
      '<span>' + T('Cél', 'Target') + ': <b>' + target + '</b> ' + T('perc', 'min') + '</span>' +
      '<span>' + T('Ezen a héten', 'This week') + ': <b>' + weeklyMinutes() + '</b> ' + T('perc', 'min') + ' · <b>' + weekDaysStudied() + '</b> ' + T('nap', 'days') + '</span></div>' +
      '<div class="plan-picker">' + [30, 60, 120].map(m => '<button class="btn ' + (plan && plan.minutes === m ? 'primary' : '') + '" type="button" data-plan-min="' + m + '">' + m + ' ' + T('perc', 'min') + '</button>').join('') +
      '<button class="btn" type="button" data-plan-min="5">' + T('Rossz nap? 5 perc is számít.', 'Bad day? 5 minutes counts.') + '</button></div>' +
      (plan ? '<ol class="plan-steps">' + plan.steps.map((step, i) => {
        const done = stepDone(step, i);
        const currentStep = !done && plan.steps.findIndex((s, j) => !stepDone(s, j)) === i;
        const copy = stepText(step);
        return '<li class="' + (done ? 'done' : '') + (currentStep ? ' current' : '') + '"><div class="plan-main"><span class="plan-kicker">' + (currentStep ? T('Most', 'Current') : done ? T('Kész', 'Done') : T('Következik', 'Next')) + ' · ' + step.minutes + ' ' + T('perc', 'min') + '</span>' +
          '<a href="' + step.href + '"><b>' + esc(copy.label) + '</b></a><span class="muted">' + esc(copy.detail) + '</span></div>' +
          (done ? '<span class="plan-check">✓</span>' : '<button class="btn sm" type="button" data-plan-done="' + i + '">' + T('Kész', 'Done') + '</button>') + '</li>';
      }).join('') + '</ol>' + (plan.steps.every((s, i) => stepDone(s, i)) ? '<div class="callout note"><b>' + T('Megvan a mai terv.', 'Today\'s plan is complete.') + '</b> ' + T('A holnapi önmagadnak tartozol ennyivel — és kész.', 'That is all you owe tomorrow-you.') + '</div>' : '') :
        emptyState(T('Válassz 30, 60 vagy 120 percet', 'Choose 30, 60 or 120 minutes'), T('A terv a hibafüzetedből, a következő fejezetből és egy vegyes körből áll. Üres állapotok vannak, nem hamis feladatok.', 'The plan is built from your notebook, the next chapter and a mixed run. Empty states only, never fake tasks.'))) +
      '<h2 class="sec-label">' + T('Napi cél és szokás', 'Daily target and habit') + '</h2>' +
      '<div class="coach-grid"><div class="coach-panel"><h3>' + T('Napi percek', 'Minutes per day') + '</h3>' + calendarHTML(35) +
      '<p class="muted small">' + T('A percek csak aktív időt számolnak: a látható fülön töltött időt. A kihagyott nap nem hiba, csak információ.', 'Minutes count active time only: while the tab is visible. A missed day is information, not failure.') + '</p>' +
      '<div class="target-row"><label>' + T('Napi cél', 'Daily target') + ' <select data-coach-target>' + [30, 45, 60, 75, 90, 105, 120].map(n => '<option value="' + n + '"' + (n === target ? ' selected' : '') + '>' + n + ' ' + T('perc', 'min') + '</option>').join('') + '</select></label>' +
      '<span class="muted small">' + T('Javaslat: ', 'Suggested: ') + target + ' ' + T('perc (4-5 hét alatt 60-120 felé)', 'min (ramps to 60-120 over 4-5 weeks)') + '</span></div></div>' +
      '<div class="coach-panel"><h3>' + T('Tempó a vizsgáig', 'Pace to the exam') + '</h3>' +
      '<label class="coach-label">' + T('Vizsga dátuma', 'Exam date') + '<input type="date" data-coach-exam value="' + esc(c.examDate || '') + '"></label>' +
      '<p>' + (c.examDate ? (weeksLeft === 0 ? T('Ma van a vizsga.', 'The exam is today.') : T('Hátralévő fejezet: ', 'Chapters left: ') + '<b>' + remaining + '</b>' + (perWeek ? ' · ' + T('kb. ', 'about ') + '<b>' + perWeek + '</b> ' + T('fejezet / hét', 'chapters per week') + ' ' + T('a határidőig', 'to finish by') + ' ' + esc(c.examDate) : '')) : T('Add meg a vizsga dátumát, és kiszámoljuk a heti tempót.', 'Set the exam date and we compute the weekly pace.')) + '</p>' +
      '<div class="study-days">' + monthDays.map(day => '<span class="' + (minutesOn(day) > 0 ? 'studied' : '') + '" title="' + esc(day + ' · ' + minutesOn(day) + ' ' + T('perc', 'min')) + '">' + Number(day.slice(8)) + '</span>').join('') + '</div>' +
      '<p class="muted small">' + T('A mintázat segít látni, ha visszacsúsznál a vizsga előtti magolásba.', 'The pattern makes a slide back into cramming visible.') + '</p></div></div>' +
      '<h2 class="sec-label">' + T('Szokásépítés', 'Habit tools') + '</h2>' +
      '<div class="coach-grid"><div class="coach-panel"><h3>' + T('Rögzített időpont', 'Fixed-time reminder') + '</h3>' +
      '<label class="coach-label">' + T('Szándék', 'Implementation intention') + '<input type="text" data-coach-intention maxlength="160" value="' + esc(c.intention || T('Ha 18:30 van és az asztalnál ülök, akkor megnyitom a mai tervet.', 'If it is 18:30 and I am at my desk, then I open today’s plan.')) + '"></label>' +
      '<button class="btn" type="button" data-ics>' + T('Napi .ics letöltése', 'Download daily .ics') + '</button>' +
      '<p class="muted small">' + T('Nincs szerver, nincs értesítés: a naptárad emlékeztet.', 'No server, no notifications: your calendar reminds you.') + '</p>' +
      '<button class="btn sm ' + (c.calm ? 'primary' : '') + '" type="button" data-calm>' + T('Nyugodt mód', 'Calm mode') + ': ' + (c.calm ? T('be', 'on') : T('ki', 'off')) + '</button></div>' +
      '<div class="coach-panel"><h3>' + T('Miért csúszol el?', 'Why do you miss?') + '</h3>' + tagsHTML(tags) + '</div></div>' +
      '<div class="coach-panel"><h3>' + T('Heti összegzés és haladáskód', 'Weekly summary and progress code') + '</h3>' +
      '<p class="muted small">' + T('Másold ki, oszd meg egy baráttal. Nincs fiók és nincs hálózat.', 'Copy it and share it with a friend. No account, no network.') + '</p>' +
      '<textarea id="buddyText" rows="5" readonly>' + esc(summary) + '</textarea>' +
      '<div class="hero-actions"><button class="btn" type="button" data-copy-summary>' + T('Összegzés másolása', 'Copy summary') + '</button>' +
      '<button class="btn" type="button" data-show-code>' + T('Haladáskód mutatása', 'Show progress code') + '</button></div>' +
      '<div id="codeBox" hidden><textarea id="exportCode" rows="4" readonly>' + esc(exported) + '</textarea>' +
      '<label class="coach-label">' + T('Behozatal (összefésül, nem töröl)', 'Import (merges, never deletes)') + '<textarea id="importCode" rows="3"></textarea></label>' +
      '<button class="btn sm" type="button" data-import-code>' + T('Behozatal', 'Import') + '</button></div></div>';
    renderMath();
  }
  function tagPatterns() {
    const counts = { concept: 0, slip: 0, misread: 0 };
    Object.keys(coach().tags || {}).forEach(k => { const v = coach().tags[k]; if (counts[v] != null) counts[v]++; });
    return counts;
  }
  function tagLabel(id) {
    return id === 'concept' ? T('Nem tudtam a fogalmat', "Didn't know the concept")
      : id === 'slip' ? T('Számolási hiba', 'Calculation slip')
      : T('Félreolvastam a kérdést', 'Misread the question');
  }
  function tagsHTML(counts) {
    const total = counts.concept + counts.slip + counts.misread;
    if (!total) return '<p class="muted">' + T('Még nincs címkézett hiba. Ha elrontasz egy feladatot, megkérdezzük, miért.', 'No tagged misses yet. When you miss an exercise we ask why.') + '</p>';
    const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    return '<p><b>' + T('Leggyakoribb minta: ', 'Most common pattern: ') + tagLabel(top) + '</b> (' + counts[top] + '/' + total + ')</p>' +
      '<ul class="tag-list">' + Object.keys(counts).map(k => '<li>' + tagLabel(k) + ': <b>' + counts[k] + '</b></li>').join('') + '</ul>';
  }
  function weeklySummaryText() {
    const c = coach();
    const read = readCount(), totalC = total();
    return T(
      'Tanulási összegzés — ' + today() + '\nEzen a héten ' + weeklyMinutes() + ' perc, ' + weekDaysStudied() + ' nap.\nMa ' + minutesOn(today()) + ' perc.\nElolvasva: ' + read + '/' + totalC + ' fejezet.\nSorozat: ' + (stats.streak || 0) + ' nap.\nHibafüzet: ' + Object.keys(wrong).length + ' bejegyzés.\nVizsga: ' + (c.examDate || 'nincs megadva') + '.',
      'Study summary — ' + today() + '\nThis week: ' + weeklyMinutes() + ' minutes across ' + weekDaysStudied() + ' days.\nToday: ' + minutesOn(today()) + ' minutes.\nRead: ' + read + '/' + totalC + ' chapters.\nStreak: ' + (stats.streak || 0) + ' days.\nError notebook: ' + Object.keys(wrong).length + ' entries.\nExam: ' + (c.examDate || 'not set') + '.'
    );
  }
  function exportCode() {
    const c = coach();
    const payload = { v: 1, minutes: c.minutes, read: progress, streak: stats.streak || 0, examDate: c.examDate || '', target: c.target || null };
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(payload)))); } catch { return ''; }
  }
  function importCode(code) {
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob(String(code || '').trim()))));
      if (!data || data.v !== 1) return false;
      const c = coach();
      Object.keys(data.minutes || {}).forEach(day => {
        const m = Number(data.minutes[day]) || 0;
        if (m > (Number(c.minutes[day]) || 0)) c.minutes[day] = m;
      });
      Object.keys(data.read || {}).forEach(k => { if (data.read[k]) progress[k] = true; });
      if (!c.examDate && data.examDate) c.examDate = data.examDate;
      if (!c.target && data.target) c.target = data.target;
      stats.streak = Math.max(stats.streak || 0, Number(data.streak) || 0);
      saveCoach(); saveProgress(); save(statsKey, stats);
      return true;
    } catch { return false; }
  }
  function icsText() {
    const c = coach();
    const m = String(c.intention || '').match(/(\d{1,2})[:.](\d{2})/);
    const hh = m ? Math.min(23, Number(m[1])) : 18;
    const mm = m ? Math.min(59, Number(m[2])) : 30;
    const day = today().replace(/-/g, '');
    const clean = s => String(s || '').replace(/\r?\n/g, ' ').replace(/([,;\\])/g, '\\$1').slice(0, 200);
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bindery//Study plan//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT', 'UID:study-' + hashStr(scope) + '@bindery.local', 'DTSTAMP:' + stamp,
      'DTSTART:' + day + 'T' + pad2(hh) + pad2(mm) + '00', 'RRULE:FREQ=DAILY',
      'SUMMARY:' + clean(biv(site.title) + ' — ' + T('napi tanulás', 'daily study')),
      'DESCRIPTION:' + clean(c.intention || T('Napi tanuló blokk', 'Daily study block')),
      'DURATION:PT60M', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  function downloadText(name, text, type) {
    const blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  function offerTags(ex) {
    const key = ex.dataset.qkey;
    if (!key) return;
    let row = ex.querySelector('.miss-tags');
    if (!row) {
      row = document.createElement('div');
      row.className = 'miss-tags';
      row.innerHTML = '<span>' + T('Miért nem ment?', 'Why did I miss it?') + '</span>' +
        ['concept', 'slip', 'misread'].map(id => '<button type="button" class="btn sm" data-miss="' + id + '">' + tagLabel(id) + '</button>').join('');
      const fb = ex.querySelector('.feedback');
      if (fb) fb.appendChild(row); else ex.appendChild(row);
    }
    row.querySelectorAll('[data-miss]').forEach(btn => btn.classList.toggle('primary', coach().tags[key] === btn.dataset.miss));
  }
  function scanStuck() {
    if (!site || coach().calm) return;
    $$('.ex[data-qkey]').forEach(ex => {
      const key = ex.dataset.qkey, started = coach().stuck[key];
      if (!started || started < 0) return;
      if (ex.dataset.answered === '1' || ex.classList.contains('solved')) return;
      if (ex.querySelector('.stuck')) return;
      if (Date.now() - started < 15 * 60000) return;
      const box = document.createElement('div');
      box.className = 'stuck';
      box.innerHTML = '<b>' + T('15 perce ezen a feladaton vagy.', 'You have been on this exercise for 15 minutes.') + '</b> ' +
        T('Nézd meg a megoldást, majd oldj meg egy hasonlót. Ez nem feladás, hanem a következő lépés.', 'Look at the solution, then try a similar one. That is not giving up; it is the next step.') +
        '<div class="hero-actions"><button class="btn sm" type="button" data-stuck-sol>' + T('Megoldás mutatása', 'Show the solution') + '</button>' +
        '<button class="btn sm" type="button" data-stuck-similar>' + T('Hasonló feladat', 'Similar exercise') + '</button>' +
        '<button class="btn sm" type="button" data-stuck-dismiss>' + T('Elrejtés', 'Dismiss') + '</button></div>';
      ex.appendChild(box);
    });
  }
  function similarExercise(key) {
    const item = findItem(key);
    if (!item) return;
    const sib = allExercises().filter(x => x.c.id === item.c.id && x.key !== key && (x.q.type || 'expr') === (item.q.type || 'expr'));
    return sib[0] || allExercises().filter(x => x.c.id === item.c.id && x.key !== key)[0] || null;
  }
  function focusExercise(key) {
    const node = $$('.ex[data-qkey]').find(ex => ex.dataset.qkey === key);
    if (!node) return false;
    node.scrollIntoView({ block: 'center', behavior: 'smooth' });
    node.classList.add('flash');
    setTimeout(() => node.classList.remove('flash'), 1600);
    return true;
  }

  /* --------------------------------------------------------------- router */
  function route() {
    if (!site) return;
    if (runTimer) { clearInterval(runTimer); runTimer = null; }
    if (examState && examState.active && !location.hash.startsWith('#/exam')) examState.active = false;
    const h = location.hash.replace(/^#\/?/, '');
    const p = h.split('/').filter(Boolean);
    renderModes();
    if (p[0] === 'chapter' && p[1] && p[2]) return renderChapter(decodeURIComponent(p[1]), decodeURIComponent(p[2]));
    if (p[0] === 'section' && p[1]) return renderSection(decodeURIComponent(p[1]));
    if (p[0] === 'glossary') return renderGlossary(p[1] ? decodeURIComponent(p[1]) : '');
    if (p[0] === 'search') return renderSearch(p.slice(1).map(decodeURIComponent).join('/'));
    const pages = {
      today: renderToday, focus: renderFocus, learn: renderLearn, map: renderMap, daily: renderDaily,
      errors: renderErrors, mixed: renderMixed, hunt: renderHunt, progress: renderProgress,
      formulas: renderFormulas, videos: renderVideos, bank: renderBank, exam: renderExam,
      resources: renderResources
    };
    if (pages[p[0]]) {
      if (p[0] === 'today') renderToday();
      else pages[p[0]]();
      return;
    }
    renderHome();
  }

  function setChrome() {
    if (!site) return;
    $('#siteTitle').textContent = biv(site.title);
    $('#siteSubtitle').textContent = biv(site.subtitle) || T('tanulókönyv', 'learning book');
    $('#footTitle').textContent = biv(site.title);
    document.title = biv(site.title) + ' — Learning book';
    document.documentElement.lang = lang;
    const tocLabel = $('#tocLabel');
    if (tocLabel) tocLabel.textContent = T('Tartalomjegyzék', 'Contents');
    const footNote = $('#footNote');
    if (footNote) footNote.textContent = T('a Learning Book Builderrel készült', 'generated with Learning Book Builder');
    $('#langBtn').textContent = lang === 'en' ? 'HU' : 'EN';
    $('#searchInput').placeholder = T('Keresés…', 'Search…');
  }


  /* --------------------------------------------------------- habit events */
  function note(text) {
    let el = document.getElementById('habitNote');
    if (!el) { el = document.createElement('div'); el.id = 'habitNote'; el.className = 'habit-note'; document.body.appendChild(el); }
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(note.timer);
    note.timer = setTimeout(() => el.classList.remove('show'), 2600);
  }
  function planDone(idx) {
    const p = coach().plan;
    if (!p) return;
    p.done[idx] = true;
    saveCoach();
    renderToday();
  }
  document.addEventListener('click', e => {
    const t = e.target;
    if (!t || !t.closest) return;
    const termBtn = t.closest('.term');
    if (termBtn) { e.preventDefault(); showTermTip(termBtn); return; }
    if (!t.closest('#termTip')) hideTermTip();
    const planMin = t.closest('[data-plan-min]');
    if (planMin) {
      coach().plan = planFor(Number(planMin.dataset.planMin) || 30);
      saveCoach();
      renderToday();
      return;
    }
    const doneBtn = t.closest('[data-plan-done]');
    if (doneBtn) { planDone(Number(doneBtn.dataset.planDone)); return; }
    const miss = t.closest('[data-miss]');
    if (miss) {
      const ex = miss.closest('.ex[data-qkey]');
      if (!ex) return;
      coach().tags[ex.dataset.qkey] = miss.dataset.miss;
      saveCoach();
      const row = miss.closest('.miss-tags');
      if (row) row.querySelectorAll('[data-miss]').forEach(b => b.classList.toggle('primary', b === miss));
      return;
    }
    if (t.closest('[data-ics]')) {
      downloadText('study-plan.ics', icsText(), 'text/calendar;charset=utf-8');
      note(T('Naptárfájl letöltve.', 'Calendar file downloaded.'));
      return;
    }
    if (t.closest('[data-calm]')) {
      coach().calm = !coach().calm;
      saveCoach();
      document.body.classList.toggle('calm-mode', !!coach().calm);
      renderToday();
      return;
    }
    if (t.closest('[data-copy-summary]')) {
      const text = weeklySummaryText();
      const done = () => note(T('Összegzés a vágólapon.', 'Summary copied.'));
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => note(T('Nem sikerült másolni; jelöld ki kézzel.', 'Copy failed; select it manually.')));
      else {
        const ta = document.getElementById('buddyText');
        if (ta) { ta.removeAttribute('readonly'); ta.select(); document.execCommand && document.execCommand('copy'); ta.setAttribute('readonly', ''); done(); }
      }
      return;
    }
    if (t.closest('[data-show-code]')) {
      const box = document.getElementById('codeBox');
      if (box) box.hidden = !box.hidden;
      return;
    }
    if (t.closest('[data-import-code]')) {
      const src = document.getElementById('importCode');
      const ok = importCode(src ? src.value : '');
      note(ok ? T('Haladás összefésülve. Semmit nem töröltünk.', 'Progress merged. Nothing was deleted.') : T('Ez a kód nem érvényes.', 'That code is not valid.'));
      if (ok) renderToday();
      return;
    }
    const sol = t.closest('[data-stuck-sol]');
    if (sol) {
      const ex = sol.closest('.ex');
      const btn = ex && ex.querySelector('[data-qsol]');
      if (btn) btn.click();
      return;
    }
    const sim = t.closest('[data-stuck-similar]');
    if (sim) {
      const ex = sim.closest('.ex');
      const item = ex && findItem(ex.dataset.qkey);
      const target = ex && similarExercise(ex.dataset.qkey);
      if (item && target) {
        coach().stuck[item.key] = -1;
        saveCoach();
        if (!focusExercise(target.key)) {
          coach().focusKey = target.key;
          saveCoach();
          location.hash = '#/chapter/' + encodeURIComponent(target.s.id) + '/' + encodeURIComponent(target.c.id);
        }
      }
      return;
    }
    const dismiss = t.closest('[data-stuck-dismiss]');
    if (dismiss) {
      const ex = dismiss.closest('.ex');
      if (ex) coach().stuck[ex.dataset.qkey] = -1;
      saveCoach();
      const box = dismiss.closest('.stuck');
      if (box) box.remove();
      return;
    }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (!t || !t.matches) return;
    if (t.matches('[data-coach-target]')) { coach().target = Number(t.value) || null; saveCoach(); renderToday(); }
    if (t.matches('[data-coach-exam]')) { coach().examDate = t.value; saveCoach(); renderToday(); }
    if (t.matches('[data-coach-intention]')) { coach().intention = t.value; saveCoach(); }
  });
  document.addEventListener('focusin', e => {
    const t = e.target;
    if (t && t.matches && t.matches('.term')) showTermTip(t);
  });
  window.addEventListener('hashchange', hideTermTip);

  async function boot() {
    if (window.__SITE__) {
      site = window.__SITE__;
    } else {
      try {
        const r = await fetch('site.json', { cache: 'no-store' });
        if (!r.ok) throw new Error('site.json ' + r.status);
        site = await r.json();
      } catch (e) {
        $('#main').innerHTML = '<div class="callout warn"><b>Could not load this site.</b><p>' + esc(e.message) + '</p></div>';
        return;
      }
    }
    applyTheme();
    setChrome(); renderModes(); renderTOC();
    const themeBtn = $('#themeBtn');
    if (themeBtn) themeBtn.addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('lbs.theme', theme); applyTheme(); });
    $('#langBtn').addEventListener('click', () => { lang = lang === 'en' ? 'hu' : 'en'; localStorage.setItem('lbs.lang', lang); setChrome(); renderModes(); renderTOC(); route(); });
    $('#brandLink').addEventListener('click', e => { e.preventDefault(); location.hash = '#/'; });
    $('#searchInput').addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const q = e.target.value.trim();
      if (!q) return;
      location.hash = '#/search/' + encodeURIComponent(q);
    });
    document.body.classList.toggle('calm-mode', !!coach().calm);
    startMinuteTracking();
    setInterval(scanStuck, 30000);
    window.addEventListener('hashchange', route);
    route();
  }

  boot();
})();
