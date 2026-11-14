'use strict';
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let site = null;
  let lang = localStorage.getItem('lbs.lang') || 'hu';
  let current = null;
  const progressKey = 'lbs.progress:' + location.host + location.pathname;
  let progress = {};
  try { progress = JSON.parse(localStorage.getItem(progressKey) || '{}'); } catch { progress = {}; }

  const T = (hu, en) => lang === 'en' ? en : hu;
  function biv(v, fallback) {
    if (v && typeof v === 'object' && !Array.isArray(v)) return v[lang] || v.hu || v.en || fallback || '';
    return v == null ? (fallback || '') : String(v);
  }
  function bivArr(v) {
    if (v && typeof v === 'object' && !Array.isArray(v)) return (v[lang] || v.hu || v.en || []);
    return Array.isArray(v) ? v : (v == null ? [] : [v]);
  }
  const chapters = () => (site ? site.sections.flatMap(s => s.chapters.map(c => ({ s, c }))) : []);
  const total = () => chapters().length;
  const readCount = () => chapters().filter(x => progress[x.s.id + '/' + x.c.id]).length;

  function saveProgress() {
    try { localStorage.setItem(progressKey, JSON.stringify(progress)); } catch {}
    const pct = total() ? Math.round(readCount() / total() * 100) : 0;
    const bar = $('#progressBar'); if (bar) bar.style.width = pct + '%';
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

  function renderTOC() {
    const nav = $('#toc');
    nav.innerHTML = site.sections.map(s => {
      const done = s.chapters.filter(c => progress[s.id + '/' + c.id]).length;
      return '<div class="toc-sec"><div class="toc-head"><b>' + esc(s.num) + '</b> ' + esc(biv(s.title)) +
        '<small>' + done + '/' + s.chapters.length + '</small></div>' +
        s.chapters.map(c => '<a href="#/chapter/' + encodeURIComponent(s.id) + '/' + encodeURIComponent(c.id) + '">' +
          '<span>' + esc(c.num) + '</span>' + esc(biv(c.title)) + (progress[s.id + '/' + c.id] ? '<i>✓</i>' : '') + '</a>').join('') +
        '</div>';
    }).join('');
  }

  function renderHome() {
    current = null;
    $('#main').innerHTML =
      '<section class="hero"><div class="kicker">' + esc(biv(site.subtitle)) + '</div><h1>' + esc(biv(site.title)) + '</h1>' +
      '<p class="lead">' + esc(biv(site.summary)) + '</p>' +
      '<div class="hero-meta"><span><b>' + site.sections.length + '</b> ' + T('rész', 'parts') + '</span><span><b>' + total() + '</b> ' + T('fejezet', 'chapters') + '</span><span><b>' + readCount() + '/' + total() + '</b> ' + T('elolvasva', 'read') + '</span></div></section>' +
      '<div class="grid">' + site.sections.map(s => '<a class="card-link" href="#/section/' + encodeURIComponent(s.id) + '">' +
        '<div class="card-top"><span class="pill">' + esc(s.num) + '. ' + T('rész', 'part') + '</span></div>' +
        '<h2>' + esc(biv(s.title)) + '</h2><p>' + esc(biv(s.subtitle)) + '</p>' +
        '<div class="mini"><span>' + s.chapters.length + ' ' + T('fejezet', 'chapters') + '</span><i style="width:' + Math.round(s.chapters.filter(c => progress[s.id + '/' + c.id]).length / s.chapters.length * 100) + '%"></i></div></a>').join('') + '</div>';
    saveProgress();
    renderMath();
  }

  function renderSection(sid) {
    const s = site.sections.find(x => x.id === sid);
    if (!s) return renderHome();
    current = null;
    $('#main').innerHTML = '<div class="kicker">' + esc(s.num) + '. ' + T('rész', 'PART') + '</div><h1>' + esc(biv(s.title)) + '</h1>' +
      '<p class="lead">' + esc(biv(s.subtitle)) + '</p><p>' + esc(biv(s.intro)) + '</p>' +
      '<div class="chapter-list">' + s.chapters.map(c => '<a class="chapter-row" href="#/chapter/' + encodeURIComponent(s.id) + '/' + encodeURIComponent(c.id) + '">' +
        '<span class="n">' + esc(c.num) + '</span><div><h3>' + esc(biv(c.title)) + '</h3><p>' + esc(biv(c.lead)).slice(0, 150) + '…</p></div><span>' + (progress[s.id + '/' + c.id] ? '✓' : '→') + '</span></a>').join('') + '</div>';
    saveProgress();
    renderMath();
  }

  function theoryHTML(t) {
    const type = t.type || 'p';
    if (type === 'formula') return '<div class="callout formula"><div class="ct">' + T('Képlet', 'Formula') + (biv(t.title) ? ' · ' + esc(biv(t.title)) : '') + '</div><div class="fx">$$' + String(t.latex || '') + '$$</div>' + (biv(t.note) ? '<p class="muted">' + esc(biv(t.note)) + '</p>' : '') + '</div>';
    if (type === 'list') return '<div class="callout note"><div class="ct">' + esc(biv(t.title, T('Lista', 'List'))) + '</div><ul>' + bivArr(t.items).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
    const labels = { def: T('Definíció', 'Definition'), thm: T('Tétel', 'Theorem'), note: T('Megjegyzés', 'Note'), warn: T('Vigyázat', 'Warning'), p: T('Szöveg', 'Note') };
    const cls = type === 'warn' ? 'warn' : type === 'def' ? 'def' : type === 'thm' ? 'thm' : 'note';
    return '<div class="callout ' + cls + '"><div class="ct">' + (labels[type] || labels.p) + (biv(t.title) ? ' · ' + esc(biv(t.title)) : '') + '</div><p>' + esc(biv(t.body)) + '</p></div>';
  }

  function exerciseHTML(q, i) {
    const type = q.type || 'expr';
    let controls;
    if (type === 'choice') controls = (bivArr(q.choices) || []).map((c, j) => '<button class="btn choice" data-ex="' + i + '" data-choice="' + j + '">' + esc(c) + '</button>').join('');
    else if (type === 'proof') controls = '<div class="self"><button class="btn" data-proof="1" data-ex="' + i + '">' + T('Kész', 'Solved') + '</button></div>';
    else controls = '<div class="answer-row"><input class="answer" data-ex="' + i + '" type="text" placeholder="' + T('Válasz…', 'Answer…') + '" aria-label="' + T('Válasz', 'Answer') + '">' +
      '<button class="btn primary" data-check="' + i + '">' + T('Ellenőrzés', 'Check') + '</button>' +
      (biv(q.hint) ? '<button class="btn" data-hint="' + i + '">' + T('Segítség', 'Hint') + '</button>' : '') + '</div>';
    return '<div class="ex" data-ex="' + i + '"><div class="ex-head"><span class="num">' + String(i + 1).padStart(2, '0') + '</span><div class="ex-q">' + esc(biv(q.q)) + '</div></div>' +
      controls + '<div class="feedback"></div>' + (biv(q.hint) ? '<div class="hint" data-hintbox="' + i + '">' + esc(biv(q.hint)) + '</div>' : '') +
      (biv(q.sol) ? '<div class="sol-wrap"><button class="btn sm" data-sol="' + i + '">' + T('Megoldás', 'Show solution') + '</button><div class="sol" data-solbox="' + i + '"><b>' + T('Megoldás.', 'Solution.') + '</b> ' + esc(biv(q.sol)) + '</div></div>' : '') + '</div>';
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
      '<header class="ch-head"><div class="ch-num">' + esc(c.num) + '</div><div><h1>' + esc(biv(c.title)) + '</h1><p class="lead">' + esc(biv(c.lead)) + '</p></div></header>' +
      '<div class="pills"><span>' + (c.minutes || 20) + ' ' + T('perc', 'min') + '</span><span>' + exs.length + ' ' + T('feladat', 'exercises') + '</span></div>' +
      (bivArr(c.why).length ? '<div class="callout why"><div class="ct">' + T('Miért?', 'Why?') + '</div>' + bivArr(c.why).map(p => '<p>' + esc(p) + '</p>').join('') + '</div>' : '') +
      (biv(c.when) ? '<div class="callout when"><div class="ct">' + T('Mikor használd?', 'When to use it') + '</div><p>' + esc(biv(c.when)) + '</p></div>' : '') +
      (c.theory || []).map(theoryHTML).join('') +
      ((c.examples || []).length ? '<section><h2 class="sec-label">' + T('Kidolgozott példák', 'Worked examples') + '</h2>' + c.examples.map((e, i) => '<div class="example"><div class="ex-title"><span class="pill">' + T('PÉLDA ', 'EXAMPLE ') + (i + 1) + '</span><h3>' + esc(biv(e.title)) + '</h3></div><p>' + esc(biv(e.problem)) + '</p><ol>' + bivArr(e.steps).map(x => '<li>' + esc(x) + '</li>').join('') + '</ol><p class="answer-line"><b>' + T('Eredmény:', 'Answer:') + '</b> ' + esc(biv(e.answer)) + '</p></div>').join('') + '</section>' : '') +
      (bivArr(c.mistakes).length ? '<div class="callout warn"><div class="ct">' + T('Tipikus hibák', 'Common mistakes') + '</div><ul>' + bivArr(c.mistakes).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' : '') +
      '<section><h2 class="sec-label">' + T('Gyakorló feladatok', 'Practice exercises') + '</h2><div class="ex-list">' + exs.map(exerciseHTML).join('') + '</div></section>' +
      (prev || next ? '<nav class="chapter-nav">' + (prev ? '<a href="#/chapter/' + encodeURIComponent(prev.s.id) + '/' + encodeURIComponent(prev.c.id) + '"><small>' + T('Előző', 'Previous') + '</small><b>' + esc(prev.c.num) + '. ' + esc(biv(prev.c.title)) + '</b></a>' : '<span></span>') +
        (next ? '<a class="next" href="#/chapter/' + encodeURIComponent(next.s.id) + '/' + encodeURIComponent(next.c.id) + '"><small>' + T('Következő', 'Next') + '</small><b>' + esc(next.c.num) + '. ' + esc(biv(next.c.title)) + '</b></a>' : '<span></span>') + '</nav>' : '') +
      '<div class="read-line"><button class="btn ' + (progress[s.id + '/' + c.id] ? '' : 'primary') + '" data-read="' + (progress[s.id + '/' + c.id] ? '0' : '1') + '">' + (progress[s.id + '/' + c.id] ? T('Visszavonás', 'Mark unread') : T('Fejezet kész', 'Mark chapter read')) + '</button></div></article>';
    saveProgress();
    renderTOC();
    renderMath();
    bindExercises();
  }

  function normalize(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/\u2212/g, '-').replace(/[{}]/g, '').replace(/\\left|\\right|\\cdot|\\times/g, '').replace(/[·×]/g, '*').replace(/\s+/g, '').replace(/,/g, '.').replace(/^\+/, '');
  }
  function safeEval(expr) {
    let e = String(expr).replace(/\s+/g, '').replace(/\u2212/g, '-').replace(/,/g, '.');
    e = e.replace(/\\left|\\right|\\,|\\;/g, '').replace(/\\pi/g, 'pi').replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)');
    e = e.replace(/\^/g, '**').replace(/sqrt/gi, 'Math.sqrt').replace(/\bpi\b/gi, 'Math.PI').replace(/\be\b/g, 'Math.E');
    e = e.replace(/\bln\b/gi, 'Math.log').replace(/\blog\b/gi, 'Math.log10').replace(/\bsin\b/gi, 'Math.sin').replace(/\bcos\b/gi, 'Math.cos').replace(/\btan\b/gi, 'Math.tan');
    if (!/^[-+*/().\d\sMathsqrtPIElogasincoetanbexp]*$/.test(e)) return NaN;
    try { const v = Function('"use strict";return (' + e + ')')(); return typeof v === 'number' && isFinite(v) ? v : NaN; } catch { return NaN; }
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
  function bindExercises() {
    if (!current) return;
    const exs = current.c.exercises || [];
    $$('.ex').forEach(ex => {
      const i = Number(ex.dataset.ex);
      const q = exs[i];
      const fb = ex.querySelector('.feedback');
      ex.querySelectorAll('[data-choice]').forEach(btn => btn.addEventListener('click', () => {
        const ok = String(btn.dataset.choice) === String(q.a);
        fb.className = 'feedback ' + (ok ? 'ok' : 'bad');
        fb.textContent = ok ? T('Helyes.', 'Correct.') : T('Nem ez a helyes válasz.', 'Not the correct answer.');
      }));
      ex.querySelectorAll('[data-check]').forEach(btn => btn.addEventListener('click', () => {
        const input = ex.querySelector('.answer');
        const ok = check(input.value, q.a, q.type);
        fb.className = 'feedback ' + (ok ? 'ok' : 'bad');
        fb.textContent = ok ? T('Helyes.', 'Correct.') : T('Nem stimmel. Kérj segítséget, vagy nézd meg a megoldást.', 'Not quite. Ask for a hint or show the solution.');
      }));
      ex.querySelectorAll('[data-hint]').forEach(btn => btn.addEventListener('click', () => {
        const h = ex.querySelector('[data-hintbox]');
        if (h) h.classList.toggle('show');
      }));
      ex.querySelectorAll('[data-sol]').forEach(btn => btn.addEventListener('click', () => {
        const s = ex.querySelector('[data-solbox]');
        if (s) s.classList.toggle('show');
      }));
      ex.querySelectorAll('[data-proof]').forEach(btn => btn.addEventListener('click', () => {
        fb.className = 'feedback ok';
        fb.textContent = T('Elmentve. Ellenőrizd a megoldást.', 'Saved. Check the solution.');
      }));
    });
    const read = current ? current.s.id + '/' + current.c.id : '';
    $$('[data-read]').forEach(btn => btn.addEventListener('click', () => {
      if (!current) return;
      const sid = current.s.id, cid = current.c.id;
      if (btn.dataset.read === '1') progress[read] = true;
      else delete progress[read];
      renderChapter(sid, cid);
    }));
  }

  function route() {
    if (!site) return;
    const h = location.hash.replace(/^#\/?/, '');
    const p = h.split('/').filter(Boolean);
    if (p[0] === 'chapter' && p[1] && p[2]) return renderChapter(decodeURIComponent(p[1]), decodeURIComponent(p[2]));
    if (p[0] === 'section' && p[1]) return renderSection(decodeURIComponent(p[1]));
    renderHome();
  }

  function setChrome() {
    if (!site) return;
    $('#siteTitle').textContent = biv(site.title);
    $('#siteSubtitle').textContent = biv(site.subtitle);
    $('#footTitle').textContent = biv(site.title);
    document.title = biv(site.title) + ' — Learning book';
    document.documentElement.lang = lang;
    $('#langBtn').textContent = lang === 'en' ? 'HU' : 'EN';
    $('#searchInput').placeholder = T('Keresés…', 'Search…');
  }

  async function boot() {
    try {
      const r = await fetch('site.json', { cache: 'no-store' });
      if (!r.ok) throw new Error('site.json ' + r.status);
      site = await r.json();
    } catch (e) {
      $('#main').innerHTML = '<div class="callout warn"><b>Could not load this site.</b><p>' + esc(e.message) + '</p></div>';
      return;
    }
    setChrome(); renderTOC();
    $('#langBtn').addEventListener('click', () => { lang = lang === 'en' ? 'hu' : 'en'; localStorage.setItem('lbs.lang', lang); setChrome(); renderTOC(); route(); });
    $('#brandLink').addEventListener('click', e => { e.preventDefault(); location.hash = '#/'; });
    $('#searchInput').addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const q = e.target.value.trim().toLowerCase();
      if (!q) return;
      const hit = chapters().find(x => (biv(x.c.title) + ' ' + biv(x.c.lead)).toLowerCase().includes(q));
      if (hit) location.hash = '#/chapter/' + encodeURIComponent(hit.s.id) + '/' + encodeURIComponent(hit.c.id);
    });
    window.addEventListener('hashchange', route);
    route();
  }
  boot();
})();
