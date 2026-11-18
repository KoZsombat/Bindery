/* MatekBázis — book-style SPA */
(function () {
  const MB = window.MB;
  const $ = MB.qs, $$ = MB.qsa;
  const main = document.getElementById('main');
  const state = MB.store.get();
  state.read = state.read || {};
  state.ex = state.ex || {};
  state.tests = state.tests || {};
  state.theme = state.theme || 'light';
  state.lang = state.lang || localStorage.getItem('bindery.lang') || 'en';
  MB.lang = state.lang;

  /* ---------- data indexes ---------- */
  const allChapters = [];
  MB.sections.forEach(function (s) {
    s.chapters.forEach(function (c) {
      c.sectionId = s.id;
      c.sectionTitle = s.title;
      allChapters.push(c);
    });
  });
  const EXTRA_SECTIONS = ['sorok', 'taylor', 'tobbvaltozos', 'diff-fourier', 'linearis', 'diszkret'];
  const PREREQ = {
    alapok: [],
    logika: ['alapok'],
    komplex: ['alapok'],
    sorozatok: ['alapok', 'logika'],
    hatarertek: ['sorozatok'],
    derivalas: ['hatarertek'],
    integralas: ['derivalas'],
    sorok: ['sorozatok', 'integralas'],
    taylor: ['sorok', 'derivalas'],
    tobbvaltozos: ['derivalas', 'integralas'],
    'diff-fourier': ['integralas', 'sorozatok'],
    linearis: ['alapok'],
    diszkret: ['logika']
  };
  MB.sections.forEach(function (s) {
    s.role = EXTRA_SECTIONS.indexOf(s.id) >= 0 ? 'extra' : 'core';
    s.prereq = PREREQ[s.id] || [];
    s.builds = [];
  });
  MB.sections.forEach(function (s) {
    s.prereq.forEach(function (pid) {
      const ps = getSection(pid);
      if (ps) ps.builds.push(s.id);
    });
  });
  MB.allChapters = allChapters;
  function getSection(id) { return MB.sections.find(function (s) { return s.id === id; }); }
  function getChapter(sid, cid) {
    const s = getSection(sid);
    return s && s.chapters.find(function (c) { return c.id === cid; });
  }
  function chapterKey(sid, cid) { return sid + '/' + cid; }
  function isRead(c) { return !!state.read[chapterKey(c.sectionId, c.id)]; }
  function exKey(c, i) { return c.sectionId + '/' + c.id + '/' + i; }
  function save() { MB.store.set(state); }
  function totalExercises() {
    return allChapters.reduce(function (n, c) { return n + (c.exercises ? c.exercises.length : 0); }, 0);
  }
  function autoExercises(c) {
    return (c.exercises || []).filter(function (q) { return q.type !== 'proof' && q.type !== 'open'; });
  }

  /* ---------- icons / theme ---------- */
  MB.hydrateIcons(document);

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const btn = document.getElementById('themeBtn');
    if (btn) btn.innerHTML = MB.icon(state.theme === 'dark' ? 'sun' : 'moon');
  }
  function applyLang() {
    MB.lang = state.lang;
    document.documentElement.lang = state.lang;
    const btn = document.getElementById('langBtn');
    if (btn) btn.textContent = state.lang === 'en' ? 'HU' : 'EN';
    MB.qsa('[data-i18n]').forEach(function (el) { el.textContent = MB.t(el.dataset.i18n); });
    const nav = document.getElementById('nav');
    if (nav) { nav.innerHTML = navHTML(); MB.translateDOM(nav); }
    MB.qsa('[data-i18n-placeholder]').forEach(function (el) { el.placeholder = MB.t(el.dataset.i18nPlaceholder); });
  }
  applyTheme();
  applyLang();

  /* ---------- navigation ---------- */
  function navHTML() {
    let h = '';
    let extraLabel = false;
    MB.sections.forEach(function (s) {
      if (s.role === 'extra' && !extraLabel) {
        h += '<div class="nav-group-label nav-extra-label">' + MB.T('Előretekintés · opcionális', 'Looking ahead · optional') + '</div>';
        extraLabel = true;
      }
      h += '<div class="nav-group open' + (s.role === 'extra' ? ' is-extra' : '') + '" data-group="' + s.id + '">';
      h += '<a class="nav-item" data-nav="' + s.id + '" href="#/section/' + s.id + '">' +
        '<span class="num">' + s.num + '</span><span class="label">' + MB.esc(MB.sTitle(s)) + '</span>' +
        '<span class="count">' + s.chapters.length + '</span></a>';
      h += '<div class="nav-children">';
      s.chapters.forEach(function (c) {
        h += '<a class="nav-child" data-child="' + chapterKey(s.id, c.id) + '" href="#/chapter/' + s.id + '/' + c.id + '">' +
          '<span>' + c.num + '</span><span>' + MB.esc(MB.cTitle(c)) + '</span>' +
          (isRead(c) ? '<span class="ok">✓</span>' : '') + '</a>';
      });
      h += '</div></div>';
    });
    return h;
  }
  document.getElementById('nav').innerHTML = navHTML();
  MB.hydrateIcons(document);

  function updateNav(route) {
    $$('.nav-item').forEach(function (a) { a.classList.toggle('active', route.section === a.dataset.nav); });
    $$('.nav-child').forEach(function (a) {
      a.classList.toggle('active', route.section + '/' + route.chapter === a.dataset.child);
    });
    $$('.side-link').forEach(function (a) {
      a.classList.toggle('active', route.name === a.dataset.nav);
    });
    const readCount = allChapters.filter(isRead).length;
    const pct = allChapters.length ? Math.round(readCount / allChapters.length * 100) : 0;
    document.getElementById('sidePct').textContent = pct + '%';
    document.getElementById('sideBar').style.width = pct + '%';
  }

  function setCrumbs(parts) {
    const el = document.getElementById('crumbs');
    el.innerHTML = parts.map(function (p, i) {
      const last = i === parts.length - 1;
      if (last) return '<b>' + MB.esc(p.label) + '</b>';
      return '<a href="' + p.href + '">' + MB.esc(p.label) + '</a><span class="sep">/</span>';
    }).join('');
  }

  /* ---------- math ---------- */
  function renderMath(root) {
    if (!window.renderMathInElement) return;
    try {
      renderMathInElement(root || main, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false
      });
    } catch (e) { console.warn('KaTeX', e); }
  }

  /* ---------- chapter components ---------- */
  function checksHTML(list) {
    if (!list || !list.length) return '';
    return (Array.isArray(list) ? list : [list]).map(function (q) {
      if (!q || !q.q) return '';
      return '<details class="selfcheck"><summary>' + MB.T('Ellenőrizd magad', 'Check yourself') + ': ' + MB.decorateTerms(q.q) + '</summary>' +
        '<p class="sc-a"><b>' + MB.T('Válasz.', 'Answer.') + '</b> ' + MB.decorateTerms(q.a || '') + '</p>' +
        (q.hint ? '<p class="sc-h"><b>' + MB.T('Tipp.', 'Hint.') + '</b> ' + MB.decorateTerms(q.hint) + '</p>' : '') + '</details>';
    }).join('');
  }
  function theoryHTML(t) {
    if (t.t === 'p') return '<p>' + MB.decorateTerms(t.body) + '</p>';
    if (t.t === 'list') {
      return '<div class="callout ' + (t.tone || 'note') + '"><div class="ct">' + MB.icon('layers') + MB.esc(t.title) + '</div><div class="body"><ul>' +
        t.items.map(function (i) { return '<li>' + MB.decorateTerms(i) + '</li>'; }).join('') + '</ul></div></div>';
    }
    const label = MB.T({ def: 'Definíció', thm: 'Tétel', note: 'Megjegyzés', warn: 'Vigyázat', formula: 'Képlet' }[t.t] || 'Megjegyzés',
      { def: 'Definition', thm: 'Theorem', note: 'Note', warn: 'Warning', formula: 'Formula' }[t.t] || 'Note');
    const icon = t.t === 'warn' ? 'alert' : t.t === 'thm' ? 'target' : t.t === 'def' ? 'book' : t.t === 'formula' ? 'sigma' : 'info';
    let body = '';
    if (t.t === 'formula') {
      body = '<div class="fx">$$' + t.latex + '$$</div>' + (t.note ? '<p class="muted" style="font-size:.82rem;margin:.3rem 0 0">' + MB.decorateTerms(t.note) + '</p>' : '');
    } else {
      body = '';
      if (t.plain) body += '<div class="plain-words"><span class="tag-label">' + MB.T('Egyszerű szavakkal', 'In plain words') + '</span><p>' + MB.decorateTerms(t.plain) + '</p></div>';
      if (t.why) body += '<div class="why-note"><span class="tag-label">' + MB.T('Miért létezik?', 'Why it exists') + '</span><p>' + MB.decorateTerms(t.why) + '</p></div>';
      body += '<div class="precise"><span class="tag-label">' + MB.T('Pontos megfogalmazás', 'Precise version') + '</span><p>' + MB.decorateTerms(t.precise || t.body) + '</p></div>';
      if (t.analogy) body += '<div class="analogy"><span class="tag-label">' + MB.T('Kép vagy hasonlat', 'Analogy or picture') + '</span><p>' + MB.decorateTerms(t.analogy) + '</p></div>';
      if (t.confusions && t.confusions.length) body += '<div class="confusions"><div class="ct">' + MB.T('Ne keverd össze', 'Common confusion') + '</div>' + t.confusions.map(function (x) {
        return '<p><b>' + MB.esc(x.a) + '</b> <span class="vs">' + MB.T('vs', 'vs') + '</span> <b>' + MB.esc(x.b) + '</b>' + (x.note ? '<br><span class="muted">' + MB.decorateTerms(x.note) + '</span>' : '') + '</p>';
      }).join('') + '</div>';
      body += checksHTML(t.checks);
    }
    return '<div class="callout ' + t.t + '"><div class="ct">' + MB.icon(icon) + label + (t.title ? ' · ' + MB.esc(t.title) : '') + '</div><div class="body">' + body + '</div></div>';
  }

  function exampleHTML(ex, i) {
    const steps = ex.steps || [], reasons = ex.reasons || [];
    return '<div class="example"><div class="example-head"><span class="badge">' + MB.T('PÉLDA ', 'EXAMPLE ') + (i + 1) + '</span><h3>' + MB.esc(ex.title) + '</h3></div>' +
      '<div class="example-body"><div class="problem">' + MB.decorateTerms(ex.problem) + '</div>' +
      (steps.length ? '<ol class="steps">' + steps.map(function (s, j) {
        return '<li>' + MB.decorateTerms(s) + (reasons[j] ? '<small class="step-why"><b>' + MB.T('Miért?', 'Why this step') + '</b> ' + MB.decorateTerms(reasons[j]) + '</small>' : '') + '</li>';
      }).join('') + '</ol>' : '') +
      (ex.answer ? '<div class="answer-line"><b>' + MB.T('Eredmény:', 'Answer:') + '</b> ' + MB.decorateTerms(ex.answer) + '</div>' : '') +
      '</div></div>';
  }

  function videoHTML(v, c) {
    if (!v) return '';
    const sec = getSection(c.sectionId);
    const search = v.search || (c.title + ' ' + (sec ? MB.sTitle(sec) : c.sectionTitle) + MB.T(' magyar matematika', ' mathematics'));
    const yt = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(search);
    const embed = v.id ? ' data-embed="' + v.id + '"' : v.list ? ' data-embed-list="' + v.list + '"' : '';
    const opener = (v.id || v.list)
      ? '<button class="video-play" data-action="embed"' + embed + '><span class="circle">' + MB.icon('play') + '</span><span>' + MB.T('Videó megnyitása', 'Play video') + '</span></button>'
      : '<a class="video-play" href="' + yt + '" target="_blank" rel="noopener"><span class="circle">' + MB.icon('play') + '</span><span>' + MB.T('Videók a témában', 'Videos on this topic') + '</span></a>';
    return '<div class="video-block"><div class="video-frame">' + opener + '</div>' +
      '<div class="video-meta"><div><h3>' + MB.esc(v.title) + '</h3><p>' + MB.esc(v.channel || MB.T('Ajánlott videó', 'Recommended video')) + '</p></div>' +
      '<div style="display:flex;gap:10px;align-items:center"><span class="src">' + MB.esc(MB.T(v.kind || 'VIDEÓ', { VIDEÓ: 'VIDEO', KERESÉS: 'SEARCH', 'LEJÁTSZÁSI LISTA': 'PLAYLIST' }[v.kind] || 'VIDEO')) + '</span>' +
      '<a class="btn sm" href="' + yt + '" target="_blank" rel="noopener">' + MB.T('Több videó ', 'More videos ') + MB.icon('external') + '</a></div></div></div>';
  }

  function exerciseHTML(q, i, c) {
    const key = chapterKey(c.sectionId, c.id);
    const done = !!state.ex[key + '/' + i];
    const type = q.type || 'expr';
    let controls = '';
    if (type === 'proof' || type === 'open') {
      controls = '<div class="self-check"><button class="btn sm" data-self="1">' + MB.T('Megvan, kész', 'Got it, done') + '</button><button class="btn sm" data-self="0">' + MB.T('Nem ment', 'Not yet') + '</button></div>';
    } else if (type === 'choice') {
      controls = '<div class="answer-row">' + (q.choices || []).map(function (ch, j) {
        return '<button class="btn sm" data-choice="' + j + '">' + ch + '</button>';
      }).join('') + '</div>';
    } else {
      controls = '<div class="answer-row"><input class="answer-input" type="text" inputmode="text" placeholder="' + MB.T('Írd be az eredményt…', 'Type the result…') + '" aria-label="' + MB.T('Válasz', 'Answer') + '">' +
        '<button class="btn sm check" data-check>' + MB.T('Ellenőrzés', 'Check') + '</button>' +
        '<button class="btn sm hint-btn" data-hint>' + MB.T('Segítség', 'Hint') + '</button></div>';
    }
    const dataAns = q.a == null ? '' : MB.esc(typeof q.a === 'object' ? JSON.stringify(q.a) : q.a);
    const dataAlt = q.alt ? MB.esc(JSON.stringify(q.alt)) : '';
    const dataChoices = q.choices ? MB.esc(JSON.stringify(q.choices)) : '';
    return '<div class="ex' + (done ? ' done' : '') + '" data-ex="' + i + '" data-ans="' + dataAns + '" data-type="' + type + '" data-alt="' + dataAlt + '"' +
      ' data-kind="chapter" data-topic="' + MB.esc(c.sectionId) + '" data-funid="' + MB.esc(key + '/' + i) + '"' +
      ' data-q="' + MB.esc(q.q) + '" data-solution="' + MB.esc(q.sol || '') + '" data-exhint="' + MB.esc(q.hint || '') + '"' +
      ' data-level="' + (q.level || 1) + '" data-choices="' + dataChoices + '">' +
      '<div class="ex-top"><div class="ex-idx">' + String(i + 1).padStart(2, '0') + '</div><div class="ex-body"><div class="ex-q">' + q.q +
      '<span class="ex-level" title="' + MB.T('Nehézség', 'Difficulty') + '">' + [1, 2, 3].map(function (n) { return '<i class="' + (n <= (q.level || 1) ? 'on' : '') + '"></i>'; }).join('') + '</span></div></div></div>' +
      '<div class="ex-bottom">' + controls +
      (q.hint ? '<div class="hint-text">' + MB.icon('bulb') + ' ' + q.hint + '</div>' : '') +
      '<div class="feedback"></div>' +
      (q.sol ? '<div style="margin-top:8px"><button class="btn sm sol-btn" data-sol>' + MB.T('Megoldás mutatása', 'Show answer') + '</button></div><div class="solution"><b>' + MB.T('Megoldás.', 'Solution.') + '</b> ' + q.sol + '</div>' : '') +
      '</div></div>';
  }

  function chapterView(s, c) {
    const source = c;
    c = MB.pickChapter(c);
    const idx = allChapters.indexOf(source);
    const prev = allChapters[idx - 1], next = allChapters[idx + 1];
    const read = isRead(c);
    const exs = c.exercises || [];
    const nAuto = autoExercises(c).length;
    const hasVideo = !!c.video;
    document.title = MB.cTitle(c) + ' — MatekBázis';

    let h = '<article class="book">';
    h += '<header class="chapter-head">';
    h += '<div class="running-head"><span class="gold">' + MB.T(s.num + '. rész', 'Part ' + s.num) + '</span><span class="line"></span><span>' + MB.esc(MB.sTitle(s)) + (s.role === 'extra' ? MB.T(' · opcionális', ' · optional') : '') + '</span><span class="line"></span><span>' + MB.T(c.num + '. fejezet', 'Chapter ' + c.num) + '</span></div>';
    h += '<div class="chapter-opener"><div class="chapter-num">' + c.num + '</div><div class="chapter-title-wrap"><h1>' + MB.esc(MB.cTitle(c)) + '</h1><p class="lead">' + MB.decorateTerms(MB.cLead(c)) + '</p></div></div>';
    h += '<div class="chapter-meta">' +
      '<span class="meta-pill">' + MB.icon('clock') + '<b>' + (c.minutes || 20) + ' ' + MB.T('perc', 'min') + '</b> ' + MB.T('olvasás', 'read') + '</span>' +
      '<span class="meta-pill">' + MB.icon('dumbbell') + '<b>' + exs.length + '</b> ' + MB.T('feladat', 'exercises') + '</span>' +
      (hasVideo ? '<span class="meta-pill">' + MB.icon('video') + MB.T('videó', 'video') + '</span>' : '') +
      '<span class="meta-pill">' + MB.icon('target') + MB.T('ZH-témakör:', 'Exam topic:') + ' <b>' + MB.esc(MB.tag(c.examTag || s.examTag || 'alapozás')) + '</b></span>' +
      (s.role === 'extra' ? '<span class="meta-pill">' + MB.T('opcionális előretekintés', 'optional preview') + '</span>' : '') +
      (s.prereq.length ? '<span class="meta-pill">' + MB.T('előfeltétel:', 'prerequisite:') + ' <b>' + s.prereq.map(function (pid) { const p = getSection(pid); return p ? MB.esc(MB.sTitle(p)) : pid; }).join(', ') + '</b></span>' : '') +
      (read ? '<span class="meta-pill" style="color:var(--ok);border-color:var(--ok)">' + MB.icon('check') + MB.T('elolvasva', 'read') + '</span>' : '') +
      '</div></header>';

    if (c.refresher && c.refresher.length) {
      h += '<div class="callout note before"><div class="ct">' + MB.icon('layers') + MB.T('Mielőtt elkezded', 'Before you start') + '</div><div class="body"><ul>' +
        c.refresher.map(function (r) {
          const label = MB.decorateTerms(r.label || '');
          if (r.chapter) return '<li><a href="#/chapter/' + r.chapter.section + '/' + r.chapter.chapter + '">' + label + '</a></li>';
          if (r.term) return '<li><button type="button" class="term" data-term="' + MB.esc(r.term) + '">' + label + '</button></li>';
          return '<li>' + label + '</li>';
        }).join('') + '</ul></div></div>';
    }

    /* 1 — theory */
    h += '<section class="book-section" id="elmelet"><h2 class="section-label">' + MB.T('Elmélet', 'Theory') + ' <span class="sub">' + MB.T('a miért, a hogyan és a mikor', 'the why, the how and the when') + '</span></h2>';
    if (c.why) {
      h += '<div class="callout why"><div class="ct">' + MB.icon('bulb') + MB.T('Miért van ez így?', 'Why does this work?') + '</div><div class="body">' +
        (Array.isArray(c.why) ? c.why.map(function (p) { return '<p>' + MB.decorateTerms(p) + '</p>'; }).join('') : '<p>' + MB.decorateTerms(c.why) + '</p>') + '</div></div>';
    }
    if (c.when) {
      h += '<div class="callout when"><div class="ct">' + MB.icon('target') + MB.T('Mikor használd?', 'When to use it') + '</div><div class="body">' + MB.decorateTerms(c.when) + '</div></div>';
    }
    (c.theory || []).forEach(function (t) { h += theoryHTML(t); });
    if (c.demo) h += '<div data-demo="' + c.demo + '"></div>';
    h += '</section>';

    /* 2 — video */
    if (hasVideo) {
      h += '<section class="book-section" id="video"><h2 class="section-label">' + MB.T('Videó', 'Video') + ' <span class="sub">' + MB.T('nézd meg, majd olvasd újra', 'watch it, then read again') + '</span></h2>' + videoHTML(c.video, c) + '</section>';
    }

    /* 3 — examples */
    if (c.examples && c.examples.length) {
      h += '<section class="book-section" id="peldak"><h2 class="section-label">' + MB.T('Kidolgozott példák', 'Worked examples') + ' <span class="sub">' + MB.T('lépésről lépésre', 'step by step') + '</span></h2>';
      c.examples.forEach(function (ex, i) { h += exampleHTML(ex, i); });
      h += '</section>';
    }

    /* 4 — mistakes */
    if (c.mistakes && c.mistakes.length) {
      h += '<section class="book-section" id="hibak"><div class="mistakes"><h3>' + MB.icon('alert') + ' ' + MB.T('Tipikus hibák', 'Common mistakes') + '</h3><ul>' +
        c.mistakes.map(function (m) { return '<li>' + MB.decorateTerms(m) + '</li>'; }).join('') + '</ul></div></section>';
    }

    /* 5 — exercises */
    h += '<section class="book-section" id="feladatok"><h2 class="section-label">' + MB.T('Gyakorló feladatok', 'Practice exercises') + ' <span class="sub">' + MB.T(exs.length + ' feladat · ellenőrizhető válaszok', exs.length + ' exercises · checkable answers') + '</span></h2>';
    h += '<div class="ex-wrap"><div class="ex-head"><span class="hint">' + MB.T('Írd be az eredményt, majd kattints az ellenőrzésre. A megoldás csak útmutató.', 'Type the result, then click Check. The solution is only a guide.') + '</span></div>';
    exs.forEach(function (q, i) { h += exerciseHTML(q, i, c); });
    h += '</div></section>';

    /* 5b — chapter checks + recap */
    if (c.checks && c.checks.length) {
      h += '<section class="book-section"><h2 class="section-label">' + MB.T('Ellenőrizd magad', 'Check yourself') + '</h2>' + checksHTML(c.checks) + '</section>';
    }
    if (c.recap) {
      h += '<section class="book-section"><h2 class="section-label">' + MB.T('Összefoglalás', 'Recap') + '</h2>' +
        ((c.terms && c.terms.length) ? '<div class="term-chips">' + c.terms.map(function (t) {
          return '<button type="button" class="term chip-term" data-term="' + MB.esc(t.id) + '">' + MB.esc(t.term) + '</button>';
        }).join('') + '</div>' : '') +
        (c.recap.points && c.recap.points.length ? '<ul>' + c.recap.points.map(function (p) { return '<li>' + MB.decorateTerms(p) + '</li>'; }).join('') + '</ul>' : '') +
        (c.recap.next ? '<p class="next-step"><b>' + MB.T('Mi jön most?', "What's next") + '</b> ' + MB.decorateTerms(c.recap.next) + '</p>' : '') +
        '</section>';
    }

    /* 6 — explain it */
    if (MB.teachHTML) h += MB.teachHTML(c, s);

    /* 7 — test CTA */
    if (nAuto > 0) {
      h += '<div class="test-cta"><div><h3>' + MB.T('Készen állsz a fejezet tesztre?', 'Ready for the chapter test?') + '</h3><p>' + MB.T(nAuto + ' automatikusan ellenőrizhető feladat · időlimit 10 perc · pontszám és részletes kiértékelés a végén.', nAuto + ' auto-checkable exercises · 10-minute limit · score and detailed review at the end.') + '</p></div>' +
        '<a class="btn primary" href="#/test/' + s.id + '/' + c.id + '">' + MB.icon('trophy') + ' ' + MB.T('Teszt indítása', 'Start test') + '</a></div>';
    }

    /* 7 — done + nav */
    h += '<div class="done-banner"><p>' + (read
      ? MB.T('Ezt a fejezetet már elolvasottnak jelölted.', 'You have already marked this chapter as read.')
      : MB.T('Ha végigmentél a fejezeten, jelöld elolvasottnak — ez számít bele a haladásba.', 'When you finish the chapter, mark it as read — it counts towards your progress.')) + '</p>' +
      '<button class="btn ' + (read ? '' : 'navy') + '" data-read="' + (read ? '0' : '1') + '">' + MB.icon(read ? 'refresh' : 'check') + MB.T(read ? 'Visszavonás' : 'Fejezet kész', read ? 'Undo' : 'Mark chapter read') + '</button></div>';

    if (prev || next) {
      h += '<nav class="chapter-nav" aria-label="' + MB.T('Fejezetnavigáció', 'Chapter navigation') + '">';
      h += prev ? '<a href="#/chapter/' + prev.sectionId + '/' + prev.id + '"><small>' + MB.icon('arrowLeft') + ' ' + MB.T('Előző', 'Previous') + '</small><b>' + prev.num + ' · ' + MB.esc(MB.cTitle(prev)) + '</b></a>' : '<span></span>';
      h += next ? '<a class="next" href="#/chapter/' + next.sectionId + '/' + next.id + '"><small>' + MB.T('Következő', 'Next') + ' ' + MB.icon('arrowRight') + '</small><b>' + next.num + ' · ' + MB.esc(MB.cTitle(next)) + '</b></a>' : '<span></span>';
      h += '</nav>';
    }
    h += '</article>';
    return h;
  }

  /* ---------- views ---------- */
  function viewHome() {
    document.title = MB.T('MatekBázis — az első félév alapjai', 'MatekBázis — the basics of the first semester');
    const totalEx = totalExercises();
    const readCount = allChapters.filter(isRead).length;
    const pct = allChapters.length ? Math.round(readCount / allChapters.length * 100) : 0;
    const core = MB.sections.filter(function (x) { return x.role === 'core'; });
    const extra = MB.sections.filter(function (x) { return x.role === 'extra'; });
    let h = '<div class="hero">';
    h += '<div class="eyebrow">' + MB.T('BME VIK · Mérnökinformatikus · Felkészítő', 'BME VIK · Computer Engineering · Preparation') + '</div>';
    h += '<h1>' + MB.T('Az első félév alapjai.<br>Könyvformában.', 'The basics of the first semester.<br>In book form.') + '</h1>';
    h += '<p class="lead">' + MB.T('Nem a teljes tananyag. Az a biztos alap, amivel az első hetek nem az alapok pótlásáról szólnak: algebra, logika, komplex számok, sorozatok, határérték, deriválás, integrálás. A haladóbb részek külön, opcionális előretekintésként szerepelnek.', 'Not the whole syllabus. The solid foundation that makes the first weeks about new material instead of patching old gaps: algebra, logic, complex numbers, sequences, limits, derivatives, integrals. The advanced parts are separate, optional previews.') + '</p>';
    h += '<div class="hero-actions"><a class="btn primary" href="#/today">' + MB.T('Mai terv indítása', "Start today's plan") + '</a>' +
      '<a class="btn ghost" href="#/chapter/alapok/algebra">' + MB.T('Kezdd az alapoknál ', 'Start with the foundations ') + MB.icon('arrowRight') + '</a>' +
      '<a class="btn ghost" href="#/section/alapok">' + MB.T('Mit hozz magaddal?', 'What you should already know') + '</a>' +
      '<a class="btn ghost" href="#/exam">' + MB.T('ZH-szimulátor', 'Exam simulator') + '</a></div>';
    h += '<div class="hero-foot"><span><b>' + core.length + '</b> ' + MB.T('alaprész', 'core parts') + '</span><span><b>' + extra.length + '</b> ' + MB.T('előretekintés', 'optional previews') + '</span><span><b>' + allChapters.length + '</b> ' + MB.T('fejezet', 'chapters') + '</span><span><b>' + totalEx + '</b> ' + MB.T('feladat', 'exercises') + '</span><span><b>' + pct + '%</b> ' + MB.T('kész', 'complete') + '</span></div>';
    h += '</div>';

    h += '<div class="stat-grid">' +
      '<div class="stat"><b>' + readCount + '/' + allChapters.length + '</b><span>' + MB.T('Elolvasott fejezet', 'Chapters read') + '</span></div>' +
      '<div class="stat"><b>' + Object.keys(state.ex).length + '</b><span>' + MB.T('Megoldott feladat', 'Exercises solved') + '</span></div>' +
      '<div class="stat"><b>' + MB.videos.length + '</b><span>' + MB.T('Ajánlott videó', 'Recommended videos') + '</span></div>' +
      '<div class="stat"><b>' + Object.keys(state.tests).length + '</b><span>' + MB.T('Kitöltött teszt', 'Tests completed') + '</span></div>' +
      '</div>';
    h += (MB.habit && MB.habit.homeHTML) ? MB.habit.homeHTML() : '';
    h += (MB.coach && MB.coach.homeHTML) ? MB.coach.homeHTML() : '';
    h += (MB.fun && MB.fun.homeHTML) ? MB.fun.homeHTML() : '';
    h += '<div class="note-box" style="margin:0 0 12px"><h4>' + MB.T('Miből indulunk ki?', 'What we assume') + '</h4><p style="margin:0 0 8px">' + MB.T('Feltételezem, hogy <b>középszintű érettségi</b> szinten tanultál matematikát, de sok mindent elfelejtettél. Az <b>1. rész</b> ezért ismétlés, nem nulláról kezdés: a „Miért?” blokkok a régi szabályokat elevenítik fel, a feladatok pedig visszamérnek. Ha valami ismerős, ugorj a feladatokra; ha nem, olvasd el a magyarázatot.', 'I assume you studied mathematics at the level of the Hungarian secondary-school leaving exam (standard level) but have forgotten much of it. Part 1 is therefore revision, not a from-zero course: the “Why?” boxes rebuild the old rules, and the exercises check them. If something is familiar, skip to the exercises; if not, read the explanation.') + '</p><p style="margin:0">' + MB.T('Ez <b>felkészítő</b>, nem a teljes félév anyaga. A 08–13. részek opcionális előretekintések: csak akkor vedd őket elő, ha a magabiztos alap megvan.', 'This is a <b>preparation</b> book, not the complete semester. Parts 08–13 are optional previews: open them only after the core is solid.') + '</p></div>';
    h += '<div class="note-box" style="margin:0 0 32px"><h4>' + MB.T('Nem kell telepíteni semmit', 'Nothing to install') + '</h4><p style="margin:0">' + MB.T('Nyisd meg az <b>index.html</b>-t dupla kattintással, vagy indítsd a <b>start.bat</b>-ot (Windows) / <b>start.command</b>-ot (macOS). Minden helyben fut: a videók kivételével internet sem kell hozzá.', 'Open <b>index.html</b> by double-clicking it, or start <b>start.bat</b> (Windows) / <b>start.command</b> (macOS). Everything runs locally; only the videos need the internet.') + '</p></div>';

    h += '<div class="home-section"><div class="section-head"><div><h2>' + MB.T('Hogyan használd a könyvet', 'How to use the book') + '</h2><p>' + MB.T('Nem kell mindent egyszerre. Egy fejezet négy mozdulat.', 'You do not have to do everything at once. One chapter has four moves.') + '</p></div></div>' +
      '<div class="grid-2">' +
      '<div class="card"><div class="section-label">01 · ' + MB.T('Olvasd', 'Read') + '</div><p style="margin:0;font-size:.9rem">' + MB.T('Kezdd a <b>Miért?</b> blokkal. A definíció csak utána jön — előbb kép legyen arról, mit csinálunk.', 'Start with the <b>Why?</b> block. The definition comes after — first get a picture of what we are doing.') + '</p></div>' +
      '<div class="card"><div class="section-label">02 · ' + MB.T('Nézd meg', 'Watch') + '</div><p style="margin:0;font-size:.9rem">' + MB.T('A videó nem helyettesíti a jegyzetet, de egy jó magyarázat után a képletek helyükre kerülnek.', 'A video does not replace the notes, but a good explanation puts the formulas in place.') + '</p></div>' +
      '<div class="card"><div class="section-label">03 · ' + MB.T('Számold', 'Calculate') + '</div><p style="margin:0;font-size:.9rem">' + MB.T('A kidolgozott példát takard le, próbáld magadtól, aztán hasonlítsd össze a lépésekkel.', 'Cover the worked example, try it yourself, then compare the steps.') + '</p></div>' +
      '<div class="card"><div class="section-label">04 · ' + MB.T('Teszteld', 'Test') + '</div><p style="margin:0;font-size:.9rem">' + MB.T('A fejezet végén ellenőrizhető feladatok és egy időlimites teszt mutatja meg, hol állsz.', 'Checkable exercises and a timed test at the end of each chapter show where you stand.') + '</p></div>' +
      '</div></div>';

    h += '<div class="home-section"><div class="section-head"><div><h2>' + MB.T('Tanulási útvonal', 'Learning path') + '</h2><p>' + MB.T('Alapok először, aztán egymásra épülő lépések. Nem kell mindent egyszerre.', 'Foundations first, then cumulative steps. You do not need everything at once.') + '</p></div></div>';
    h += '<div class="path-row"><span class="path-label">' + MB.T('Kötelező mag', 'Core path') + '</span>';
    ['alapok', 'logika', 'komplex', 'sorozatok', 'hatarertek', 'derivalas', 'integralas'].forEach(function (id, i) {
      const sec = getSection(id);
      h += (i ? '<span class="path-arrow">→</span>' : '') + '<a class="path-node" href="#/section/' + id + '"><b>' + sec.num + '</b> ' + MB.esc(MB.sTitle(sec)) + '</a>';
    });
    h += '</div>';
    h += '<div class="path-row"><span class="path-label">' + MB.T('07 után', 'After 07') + '</span><span class="path-node extra"><b>07</b> ' + MB.sTitle(getSection('integralas')) + '</span><span class="path-arrow">→</span>';
    ['sorok', 'taylor', 'tobbvaltozos', 'diff-fourier'].forEach(function (id, i) {
      const sec = getSection(id);
      h += (i ? '<span class="path-arrow">→</span>' : '') + '<a class="path-node extra" href="#/section/' + id + '"><b>' + sec.num + '</b> ' + MB.esc(MB.sTitle(sec)) + '</a>';
    });
    h += '</div>';
    h += '<p class="path-note">' + MB.T('Külön sáv: <a href="#/section/linearis">12 · Lineáris algebra</a> az Alapokra, <a href="#/section/diszkret">13 · Diszkrét matematika</a> a Logikára épül. Ezek nem előfeltételei az analízisnek, de ugyanígy alapokra épülnek.', 'Separate track: <a href="#/section/linearis">12 · Linear algebra</a> builds on Foundations, <a href="#/section/diszkret">13 · Discrete mathematics</a> builds on Logic. They are not prerequisites for analysis, but they also start from basics.') + '</p></div>';

    function sectionCard(s) {
      const read = s.chapters.filter(isRead).length;
      const p = Math.round(read / s.chapters.length * 100);
      return '<a class="section-card' + (s.role === 'extra' ? ' is-extra' : '') + '" href="#/section/' + s.id + '"><div class="top"><span class="num">' + MB.T(s.num + '. RÉSZ', 'PART ' + s.num) + '</span><span class="meta-pill">' + MB.T(s.role === 'extra' ? 'opcionális' : 'alap', s.role === 'extra' ? 'optional' : 'core') + '</span></div>' +
        '<h3>' + MB.esc(MB.sTitle(s)) + '</h3><p>' + MB.esc(MB.sSub(s)) + '</p>' +
        '<div class="meta"><span>' + read + '/' + s.chapters.length + '</span><span class="mini-bar"><i style="width:' + p + '%"></i></span><span>' + p + '%</span></div></a>';
    }
    h += '<div class="home-section"><div class="section-head"><div><h2>' + MB.T('A felkészítő magja', 'The core of the preparation') + '</h2><p>' + MB.T('Ezt a 7 részt érdemes sorrendben végigvenni. Minden az előzőre épül.', 'Work through these 7 parts in order. Each builds on the previous one.') + '</p></div></div><div class="roadmap">' + core.map(sectionCard).join('') + '</div></div>';
    h += '<div class="home-section"><div class="section-head"><div><h2>' + MB.T('Előretekintés', 'Looking ahead') + '</h2><p>' + MB.T('Opcionális. Akkor nyúlj hozzá, ha a mag megy — ezek már a félév későbbi vagy más tárgyainak anyagai.', 'Optional. Open these after the core is solid — they belong to later parts of the semester or to other courses.') + '</p></div></div><div class="roadmap">' + extra.map(sectionCard).join('') + '</div></div>';

    h += '<div class="home-section"><div class="section-head"><div><h2>' + MB.T('A két zárthelyi és a vizsga', 'The two midterms and the exam') + '</h2><p>' + MB.T('A 2025–2026-os követelmények szerint.', 'According to the 2025–2026 requirements.') + '</p></div><a href="#/exam">' + MB.T('Összes szimulátor', 'All simulators') + ' ' + MB.icon('arrowRight') + '</a></div><div class="exam-strip">' +
      '<div class="exam-card"><span class="tag">' + MB.T('1. zárthelyi · 9. hét', 'Midterm 1 · week 9') + '</span><h3>' + MB.T('Komplex számok, sorozatok, határérték', 'Complex numbers, sequences, limits') + '</h3><p>' + MB.T('75 perc · 100 pont. Definíció + ε–N bizonyítás, határértékszámítás, komplex műveletek és gyökök, értelmezési tartomány, szakadások.', '75 minutes · 100 points. Definition + ε–N proof, computing limits, complex operations and roots, domain, discontinuities.') + '</p><div class="chips"><span class="chip">' + MB.T('komplex', 'complex') + '</span><span class="chip">' + MB.T('sorozat', 'sequence') + '</span><span class="chip">' + MB.T('határérték', 'limit') + '</span><span class="chip">' + MB.T('folytonosság', 'continuity') + '</span></div><p style="margin-top:12px"><a class="btn sm navy" href="#/exam/zh1">' + MB.T('ZH1 szimulátor', 'ZH1 simulator') + '</a></p></div>' +
      '<div class="exam-card"><span class="tag">' + MB.T('2. zárthelyi · 13. hét', 'Midterm 2 · week 13') + '</span><h3>' + MB.T('Deriválás és alkalmazásai', 'Differentiation and its applications') + '</h3><p>' + MB.T('75 perc. Inverz függvény, láncszabály, L’Hospital, monotonitás, szélsőérték, konvexitás, inflexió, implicit deriválás.', '75 minutes. Inverse functions, chain rule, L’Hôpital, monotonicity, extrema, convexity, inflection, implicit differentiation.') + '</p><div class="chips"><span class="chip">' + MB.T('derivált', 'derivative') + '</span><span class="chip">' + MB.T('L’Hospital', 'L’Hôpital') + '</span><span class="chip">' + MB.T('függvényvizsgálat', 'function analysis') + '</span><span class="chip">' + MB.T('inverz', 'inverse') + '</span></div><p style="margin-top:12px"><a class="btn sm navy" href="#/exam/zh2">' + MB.T('ZH2 szimulátor', 'ZH2 simulator') + '</a></p></div>' +
      '<div class="exam-card"><span class="tag">' + MB.T('Vizsga · 90 perc', 'Exam · 90 minutes') + '</span><h3>' + MB.T('Az egész félév + integrálás', 'The whole semester + integration') + '</h3><p>' + MB.T('A vizsgán az integrálszámítás hangsúlyos, külön 40% elérése kell belőle. Teszt + kifejtős rész, definíciók és tételek is.', 'Integration carries extra weight in the exam: you must reach 40% of it separately. Test + written part, including definitions and theorems.') + '</p><div class="chips"><span class="chip">' + MB.T('integrál', 'integral') + '</span><span class="chip">' + MB.T('elmélet', 'theory') + '</span><span class="chip">' + MB.T('teszt', 'test') + '</span></div><p style="margin-top:12px"><a class="btn sm navy" href="#/exam/vizsga">' + MB.T('Vizsga szimulátor', 'Exam simulator') + '</a></p></div>' +
      '<div class="exam-card"><span class="tag">' + MB.T('Forrás · 2025–2026', 'Source · 2025–2026') + '</span><h3>' + MB.T('Eredeti feladatsorok', 'Original papers') + '</h3><p>' + MB.T('A ZH-k, pót- és javító ZH-k, valamint a négy 2025-ös vizsga teljes feladatsora és megoldása letölthető.', 'The midterms, resit and correction midterms, and all four 2025 exams can be downloaded with their solutions.') + '</p><div class="chips"><span class="chip">PDF</span><span class="chip">' + MB.T('megoldások', 'solutions') + '</span></div><p style="margin-top:12px"><a class="btn sm" href="#/resources">' + MB.T('Feladatsorok ', 'Papers ') + MB.icon('arrowRight') + '</a></p></div>' +
      '</div></div>';

    return h;
  }

  function viewSection(s) {
    document.title = MB.sTitle(s) + ' — MatekBázis';
    const read = s.chapters.filter(isRead).length;
    let h = '<div class="page-head"><div class="kicker">' + MB.T(s.num + '. rész', 'Part ' + s.num) + '</div><h1>' + MB.esc(MB.sTitle(s)) + '</h1><p class="lead">' + MB.sIntro(s) + '</p>' +
      '<div class="chapter-meta"><span class="meta-pill"><b>' + s.chapters.length + '</b> ' + MB.T('fejezet', 'chapters') + '</span><span class="meta-pill"><b>' + read + '</b> ' + MB.T('elolvasva', 'read') + '</span><span class="meta-pill">' + MB.icon('clock') + '<b>' + s.chapters.reduce(function (n, c) { return n + (c.minutes || 20); }, 0) + '</b> ' + MB.T('perc', 'min') + '</span><span class="meta-pill">' + MB.T('ZH: ', 'Exam: ') + '<b>' + MB.esc(MB.tag(s.examTag || 'alapozás')) + '</b></span>' +
      (s.role === 'extra' ? '<span class="meta-pill">' + MB.T('opcionális előretekintés', 'optional preview') + '</span>' : '') + '</div></div>';
    if (MB.coach && MB.coach.sectionCTA) h += MB.coach.sectionCTA(s);
    if (s.id === 'alapok') {
      h += '<div class="note-box" style="margin-bottom:14px"><h4>' + MB.T('Miből indulunk ki?', 'What we assume') + '</h4><p style="margin:0">' +
        MB.T('Feltételezem, hogy <b>középszintű érettségi</b> szinten tanultál matematikát, de sok mindent elfelejtettél. Ez a rész ezért <b>ismétlés</b>, nem nulláról kezdés: a „Miért?” blokkok a régi szabályokat elevenítik fel, a feladatok visszamérnek. Ha valami ismerős, ugorj a feladatokra.',
          'I assume you studied mathematics at the level of the Hungarian secondary-school leaving exam (standard level) but have forgotten much of it. This part is therefore <b>revision</b>, not a from-zero course: the “Why?” boxes rebuild the old rules and the exercises check them. If something is familiar, skip to the exercises.') + '</p></div>';
    }
    if (s.role === 'extra') {
      h += '<div class="note-box" style="margin-bottom:14px"><h4>' + MB.T('Opcionális előretekintés', 'Optional preview') + '</h4><p style="margin:0">' +
        MB.T('Ez a rész nem szükséges az első hetekhez. Akkor vedd elő, ha a felkészítő magja már megy; különben előbb térj vissza az alapokhoz.',
          'This part is not required for the first weeks. Open it after the core preparation is solid; otherwise return to the foundations first.') + '</p></div>';
    }
    if (s.prereq.length) {
      h += '<div class="note-box" style="margin-bottom:14px"><h4>' + MB.T('Mielőtt elkezded', 'Before you start') + '</h4><p style="margin:0">' + MB.T('Ez a rész erre épül:', 'This part builds on:') + ' ' +
        s.prereq.map(function (pid) { const p = getSection(pid); return p ? '<a href="#/section/' + p.id + '">' + p.num + ' · ' + MB.esc(MB.sTitle(p)) + '</a>' : pid; }).join(', ') +
        '. ' + MB.T('Ha valamelyik hiányos, előbb azt vedd át.', 'If any of them is shaky, review it first.') + '</p></div>';
    }
    if (s.conceptMap && s.conceptMap.length) {
      h += '<div class="note-box"><h4>' + MB.T('Hogyan kapcsolódnak?', 'How they connect') + '</h4><ol style="margin:0;padding-left:1.2rem">' +
        s.conceptMap.map(function (x) { return '<li>' + MB.decorateTerms(x) + '</li>'; }).join('') + '</ol></div>';
    }
    h += '<div class="chapter-list">';
    s.chapters.forEach(function (c) {
      h += '<a class="chapter-row' + (isRead(c) ? ' done' : '') + '" href="#/chapter/' + s.id + '/' + c.id + '">' +
        '<span class="n">' + c.num + '</span><div><h3>' + MB.esc(MB.cTitle(c)) + '</h3><p>' + MB.esc(MB.strip(MB.cLead(c))).slice(0, 118) + '…</p></div>' +
        '<span class="state">' + (isRead(c) ? '✓' : '→') + '</span></a>';
    });
    h += '</div>';
    if (s.summary) h += '<div class="note-box"><h4>' + MB.T('A rész összefoglalása', 'Section summary') + '</h4><p style="margin:0">' + MB.decorateTerms(s.summary) + '</p></div>';
    return h;
  }

  /* ---------- glossary ---------- */
  function viewGlossary(focusId) {
    document.title = MB.T('Fogalomtár — MatekBázis', 'Glossary — MatekBázis');
    const entries = (MB.glossary || []).slice().sort(function (a, b) {
      return MB.termLabel(a).localeCompare(MB.termLabel(b));
    });
    let h = '<div class="page-head"><div class="kicker">' + MB.T('Függelék B', 'Appendix B') + '</div><h1>' + MB.T('Fogalomtár és tárgymutató', 'Glossary and term index') + '</h1>' +
      '<p class="lead">' + MB.T('Minden fogalom egyszer van definiálva; a fejezetek innen hivatkoznak rá. Kattints egy kifejezésre a szövegben, és itt nyílik meg.', 'Every term is defined once; chapters link here. Tap a term in the text and its entry opens here.') + '</p>' +
      '<div class="formula-search"><input class="input" id="glossSearch" type="search" placeholder="' + MB.T('Fogalom keresése…', 'Search terms…') + '" style="width:100%"></div></div>';
    if (!entries.length) return h + '<div class="note-box"><p style="margin:0">' + MB.T('Ehhez a könyvhöz még nincs fogalomtár.', 'This book has no glossary yet.') + '</p></div>';
    h += '<div class="term-index">' + entries.map(function (g) {
      return '<a href="#/glossary/' + g.id + '">' + MB.esc(MB.termLabel(g)) + '</a>';
    }).join('') + '</div>';
    h += '<div class="glossary">' + entries.map(function (g) {
      const plain = MB.lang === 'en' ? (g.plain.en || g.plain.hu) : (g.plain.hu || g.plain.en);
      const precise = MB.lang === 'en' ? (g.precise.en || g.precise.hu) : (g.precise.hu || g.precise.en);
      return '<article class="gloss-entry' + (focusId === g.id ? ' focus' : '') + '" id="gloss-' + MB.esc(g.id) + '">' +
        '<div class="gloss-head"><h2>' + MB.esc(MB.termLabel(g)) + '</h2>' +
        (g.chapter ? '<a class="meta-pill" href="#/chapter/' + g.chapter.section + '/' + g.chapter.chapter + '">' + MB.T('Fejezet', 'Chapter') + '</a>' : '') + '</div>' +
        '<p class="plain-words"><span class="tag-label">' + MB.T('Egyszerű szavakkal', 'In plain words') + '</span> ' + plain + '</p>' +
        '<p class="precise-line"><span class="tag-label">' + MB.T('Pontosan', 'Precisely') + '</span> ' + precise + '</p></article>';
    }).join('') + '</div>';
    return h;
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
    const g = MB.termById(btn.dataset.term);
    if (!g) return;
    const tip = termTip();
    const plain = MB.lang === 'en' ? (g.plain.en || g.plain.hu) : (g.plain.hu || g.plain.en);
    tip.innerHTML = '<b>' + MB.esc(MB.termLabel(g)) + '</b><p>' + plain + '</p><a href="#/glossary/' + g.id + '">' + MB.T('Fogalomtár bejegyzés', 'Glossary entry') + '</a>';
    tip.hidden = false;
    const r = btn.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    tip.style.maxWidth = width + 'px';
    tip.style.left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12)) + 'px';
    tip.style.top = (r.bottom + 8 + 180 > window.innerHeight ? Math.max(12, r.top - 188) : r.bottom + 8) + 'px';
  }
  function hideTermTip() { const tip = document.getElementById('termTip'); if (tip) tip.hidden = true; }
  document.addEventListener('click', function (e) {
    const b = e.target.closest && e.target.closest('.term');
    if (b) { e.preventDefault(); showTermTip(b); return; }
    if (!e.target.closest || !e.target.closest('#termTip')) hideTermTip();
  });
  document.addEventListener('focusin', function (e) {
    if (e.target && e.target.matches && e.target.matches('.term')) showTermTip(e.target);
  });
  window.addEventListener('hashchange', hideTermTip);

  /* ---------- formulas ---------- */
  function viewFormulas() {
    document.title = MB.T('Képletgyűjtemény — MatekBázis', 'Formula sheet — MatekBázis');
    const items = MB.formulas.map(function (f, i) { return MB.pickFormula(f, i); });
    const cats = [];
    items.forEach(function (f) { if (cats.indexOf(f.cat) < 0) cats.push(f.cat); });
    let h = '<div class="page-head"><div class="kicker">' + MB.T('Függelék A', 'Appendix A') + '</div><h1>' + MB.T('Képletgyűjtemény', 'Formula sheet') + '</h1><p class="lead">' + MB.T('A félév összes képlete egy helyen, témák szerint. Kereshető — írd be például, hogy „lánc”, „Moivre” vagy „parciális”.', 'All the formulas of the semester in one place, grouped by topic. Searchable — try “chain”, “Moivre” or “partial”.') + '</p></div>';
    h += '<div class="formula-search"><input class="input" id="formulaSearch" type="search" placeholder="' + MB.T('Keresés a képletekben…', 'Search the formulas…') + '" style="width:100%"></div>';
    cats.forEach(function (cat) {
      h += '<section class="formula-cat" data-cat="' + MB.esc(cat) + '"><h2>' + MB.esc(cat) + '</h2>';
      items.forEach(function (f) {
        if (f.cat !== cat) return;
        const ref = f.ref ? getChapter(f.ref[0], f.ref[1]) : null;
        h += '<div class="formula-item" data-search="' + MB.esc(MB.fold(f.name + ' ' + cat + ' ' + (f.note || ''))) + '"><div class="name">' + f.name + '</div><div class="fx">$$' + f.latex + '$$</div>' +
          (f.note ? '<div class="note">' + f.note + '</div>' : '') +
          (ref ? '<div class="ref"><a href="#/chapter/' + f.ref[0] + '/' + f.ref[1] + '">→ ' + ref.num + '. ' + MB.esc(MB.cTitle(ref)) + '</a></div>' : '') + '</div>';
      });
      h += '</section>';
    });
    return h;
  }

  /* ---------- videos ---------- */
  function viewVideos() {
    document.title = MB.T('Videók — MatekBázis', 'Videos — MatekBázis');
    const all = MB.videos.map(function (v, i) { return MB.pickVideo(v, i); });
    let h = '<div class="page-head"><div class="kicker">' + MB.T('Függelék B', 'Appendix B') + '</div><h1>' + MB.T('Videók', 'Videos') + '</h1><p class="lead">' + MB.T('Válogatott magyar és angol videók a fejezetekhez. A lejátszó kattintásra töltődik be, így az oldal gyors marad.', 'Selected Hungarian and English videos for the chapters. The player loads on click, so the page stays fast.') + '</p></div>';
    const cats = [];
    all.forEach(function (v) { if (cats.indexOf(v.cat) < 0) cats.push(v.cat); });
    cats.forEach(function (cat) {
      h += '<section class="book-section"><h2 class="section-label">' + MB.esc(cat) + '</h2><div class="video-grid">';
      all.forEach(function (v) {
        if (v.cat !== cat) return;
        h += '<div class="video-card"><div class="video-frame"><button class="video-play" data-action="embed"' + (v.id ? ' data-embed="' + v.id + '"' : ' data-embed-list="' + v.list + '"') + '><span class="circle">' + MB.icon('play') + '</span><span>' + MB.esc(v.title) + '</span></button></div>' +
          '<div class="video-info"><span class="tag">' + MB.esc(v.channel) + '</span><h3>' + MB.esc(v.title) + '</h3><p>' + MB.esc(v.note || '') + '</p>' +
          (v.search ? '<p style="margin-top:6px"><a href="https://www.youtube.com/results?search_query=' + encodeURIComponent(v.search) + '" target="_blank" rel="noopener">' + MB.T('Több videó a témában →', 'More videos on this topic →') + '</a></p>' : '') + '</div></div>';
      });
      h += '</div></section>';
    });

    h += '<section class="book-section"><h2 class="section-label">' + MB.T('Helyi előadásfelvételek', 'Local lecture recordings') + ' <span class="sub">' + MB.T('az Info.zip-ből', 'from Info.zip') + '</span></h2>';
    h += '<div class="note-box" style="margin-bottom:10px"><h4>' + MB.T('Analízis 1 · 2020-as félév', 'Analysis 1 · 2020 semester') + '</h4><p style="margin:0 0 8px">' + MB.T('A teljes, kb. 1 GB-os előadásvideók a <code>D:\\[NEW DONLOADS]\\Info.zip → Info/1. félév/Analízis 1/Előadások/2020</code> mappában vannak. A fájlnevek alapján azonosítható, melyik óra melyik téma:', 'The full lecture videos (about 1 GB) are in the <code>D:\\[NEW DONLOADS]\\Info.zip → Info/1. félév/Analízis 1/Előadások/2020</code> folder. The file names show which session covers which topic:') + '</p><div class="archive">' +
      [['2020-09-08 komplex aritmetika', 'complex arithmetic'], ['2020-09-17 R teljessége, sorozat határértéke', 'completeness of R, limit of a sequence'], ['2020-09-22 limesz egyértelműsége, példák', 'uniqueness of the limit, examples'], ['2020-09-29 rendőr elv, nagyságrend, rekurzív sorozatok', 'squeeze theorem, orders of growth, recursive sequences'], ['2020-10-06 (1+x/n)^n, Cauchy sorozat', '(1+x/n)^n, Cauchy sequences'], ['2020-10-08 függvények, valósban valós határérték', 'functions, real limits of real functions'], ['2020-10-13 függvény határérték, átviteli elv', 'function limits, sequential criterion'], ['2020-10-15 példák, műveletek határértékkel, folytonosság', 'examples, operations with limits, continuity'], ['2020-10-20 szakadások, Bolzano, Weierstrass', 'discontinuities, Bolzano, Weierstrass'], ['2020-10-22 topológiai alapok R-en, derivált', 'topological basics on R, the derivative'], ['2020-10-27 lineáris approximáció, deriválási szabályok', 'linear approximation, differentiation rules'], ['2020-10-29 inverz fgv deriváltja, exp, log, arc függvények', 'derivative of the inverse, exp, log, arc functions'], ['2020-11-03 hiperbolikus függvények, szélsőérték, Rolle-tétel', 'hyperbolic functions, extrema, Rolle’s theorem'], ['2020-11-05 Lagrange-tétel, integrálszámítás 1. főtétel, L’Hospital', 'Lagrange’s theorem, first fundamental theorem of calculus, L’Hôpital'], ['2020-11-10 függvényvizsgálat, monotonitás, szélsőértékek', 'function analysis, monotonicity, extrema']]
        .map(function (x) { return '<div class="archive-row">' + MB.icon('video') + '<span>' + MB.esc(MB.T(x[0] + '.mkv', x[0].slice(0, 10) + ' · ' + x[1])) + '</span></div>'; }).join('') +
      '</div></div>';
    h += '<div class="note-box"><h4>' + MB.T('Hogyan nézd?', 'How to watch') + '</h4><p style="margin:0">' + MB.T('Egy videó akkor hasznos, ha közben papír van előtted. Előbb olvasd el a fejezet „Miért?” blokkját, utána nézd meg a videót, végül oldd meg a fejezet első három feladatát. A passzív videónézés nem hoz eredményt.', 'A video is only useful with paper in front of you. First read the chapter’s “Why?” block, then watch the video, and finally solve the first three exercises of the chapter. Passive watching brings no results.') + '</p></div></section>';
    return h;
  }

  /* ---------- resources ---------- */
  const RES = [
    { kind: 'Hivatalos jegyzet', title: 'Matematika 1. — elmélet', file: 'matematika1.pdf', desc: 'Fritz–Kónya–Pataki–Tasnádi: definíciók, tételek, bizonyítások.',
      kindEn: 'Official notes', titleEn: 'Mathematics 1 — theory', descEn: 'Fritz–Kónya–Pataki–Tasnádi: definitions, theorems, proofs.' },
    { kind: 'Hivatalos jegyzet', title: 'Matematika 1. — gyakorlatok', file: 'matematika1_gyakorlat.pdf', desc: 'A gyakorlatanyag és a megoldott példatár.',
      kindEn: 'Official notes', titleEn: 'Mathematics 1 — exercises', descEn: 'The practice material together with a solved exercise book.' },
    { kind: 'Bulk jegyzet', title: 'Analízis 1 jegyzet', file: 'Analízis 1 Jegyzet.pdf', desc: 'Sűrített, gyakorlatközpontú jegyzet a ZH-khoz.',
      kindEn: 'Bulk notes', titleEn: 'Analysis 1 notes', descEn: 'A condensed, practice-focused note set for the midterms.' },
    { kind: 'Példatár', title: 'Komplex számok példatár', file: 'KomplexSzamokPeldatar.pdf', desc: 'Komplex algebra, trigonometrikus alak, gyökök.',
      kindEn: 'Exercise book', titleEn: 'Complex numbers exercise book', descEn: 'Complex algebra, trigonometric form, roots.' },
    { kind: 'Alapozás', title: 'Kecsap példatár', file: 'kecsap_peldatar.pdf', desc: 'Bevezető matematika (opcionális) feladatai.',
      kindEn: 'Foundations', titleEn: 'Kecsap exercise book', descEn: 'Exercises for introductory mathematics (optional).' },
    { kind: 'Analízis 2', title: 'Analízis 2 jegyzet', file: 'Analízis 2 Jegyzet.pdf', desc: 'Sorok, többváltozós analízis, integrálok.',
      kindEn: 'Analysis 2', titleEn: 'Analysis 2 notes', descEn: 'Series, multivariable analysis, integrals.' },
    { kind: 'Analízis 2', title: 'Analízis 2 ZH + vizsga', file: 'Analízis 2 ZH, Vizsga Ultimate.pdf', desc: 'Kidolgozott ZH- és vizsgaanyag.',
      kindEn: 'Analysis 2', titleEn: 'Analysis 2 midterm + exam', descEn: 'Worked midterm and exam material.' },
    { kind: 'Saját jegyzet', title: 'Matematika Túlélőcsomag', file: 'BME VIK Matek Felkészítő — Az első félév alapjai.pdf', desc: 'A saját átfogó felkészítő jegyzeted.',
      kindEn: 'Own notes', titleEn: 'Maths survival pack', descEn: 'Your own comprehensive preparation notes.' },
    { kind: 'Saját jegyzet', title: 'Matematika alapozó (javított)', file: 'Matematika alapozó az első félévhez – BME VIK mérnökinformatikus.pdf', desc: 'Bővített változat, megoldókulccsal.',
      kindEn: 'Own notes', titleEn: 'Maths foundations (revised)', descEn: 'An expanded version with an answer key.' },
    { kind: 'Saját jegyzet', title: 'Matematika alapozó (bővített)', file: 'Matematika alapozó az első félévhez – BME VIK mérnökinformatikus (1).pdf', desc: 'A legrészletesebb alapozó változat.',
      kindEn: 'Own notes', titleEn: 'Maths foundations (expanded)', descEn: 'The most detailed foundations version.' }
  ];
  const EXAMS = [
    { label: 'ZH1 2026 A', labelEn: 'ZH1 2026 · paper A', file: 'ZH1_2026_A_feladat.pdf' },
    { label: 'ZH1 2026 B', labelEn: 'ZH1 2026 · paper B', file: 'ZH1_2026_B_feladat.pdf' },
    { label: 'ZH1 2026 megoldás', labelEn: 'ZH1 2026 · solutions', file: 'ZH1_2026_megoldas.pdf' },
    { label: 'PZH1 2026 A', labelEn: 'PZH1 2026 · paper A', file: 'PZH1_2026_A_feladat.pdf' },
    { label: 'PZH1 2026 B', labelEn: 'PZH1 2026 · paper B', file: 'PZH1_2026_B_feladat.pdf' },
    { label: 'PZH1 2026 megoldás', labelEn: 'PZH1 2026 · solutions', file: 'PZH1_2026_megoldas.pdf' },
    { label: 'ZH2 2026 A', labelEn: 'ZH2 2026 · paper A', file: 'ZH2_2026_A_feladat.pdf' },
    { label: 'ZH2 2026 B', labelEn: 'ZH2 2026 · paper B', file: 'ZH2_2026_B_feladat.pdf' },
    { label: 'ZH2 2026 A megoldás', labelEn: 'ZH2 2026 · solutions A', file: 'ZH2_2026_A_megoldas.pdf' },
    { label: 'ZH2 2026 B megoldás', labelEn: 'ZH2 2026 · solutions B', file: 'ZH2_2026_B_megoldas.pdf' },
    { label: 'PZH2 2026 A', labelEn: 'PZH2 2026 · paper A', file: 'PZH2_2026_A_feladat.pdf' },
    { label: 'PZH2 2026 A megoldás', labelEn: 'PZH2 2026 · solutions A', file: 'PZH2_2026_A_megoldas.pdf' },
    { label: 'ZH1 2025 A', labelEn: 'ZH1 2025 · paper A', file: 'ZH1_2025_A_feladat.pdf' },
    { label: 'ZH1 2025 B', labelEn: 'ZH1 2025 · paper B', file: 'ZH1_2025_B_feladat.pdf' },
    { label: 'ZH1 2025 megoldás', labelEn: 'ZH1 2025 · solutions', file: 'ZH1_2025_megoldas.pdf' },
    { label: 'ZH2 2025 A', labelEn: 'ZH2 2025 · paper A', file: 'ZH2_2025_A_feladat.pdf' },
    { label: 'ZH2 2025 B', labelEn: 'ZH2 2025 · paper B', file: 'ZH2_2025_B_feladat.pdf' },
    { label: 'ZH2 2025 megoldás', labelEn: 'ZH2 2025 · solutions', file: 'ZH2_2025_megoldas.pdf' },
    { label: 'Vizsga 2025/1 teszt', labelEn: 'Exam 2025/1 · test', file: 'Vizsga_2025_1_teszt.pdf' },
    { label: 'Vizsga 2025/1 A kifejtés', labelEn: 'Exam 2025/1 · written part A', file: 'Vizsga_2025_1_A_kifejt.pdf' },
    { label: 'Vizsga 2025/1 B kifejtés', labelEn: 'Exam 2025/1 · written part B', file: 'Vizsga_2025_1_B_kifejt.pdf' },
    { label: 'Vizsga 2025/2 teszt', labelEn: 'Exam 2025/2 · test', file: 'Vizsga_2025_2_teszt.pdf' },
    { label: 'Vizsga 2025/2 A kifejtés', labelEn: 'Exam 2025/2 · written part A', file: 'Vizsga_2025_2_A_kifejt.pdf' },
    { label: 'Vizsga 2025/2 B kifejtés', labelEn: 'Exam 2025/2 · written part B', file: 'Vizsga_2025_2_B_kifejt.pdf' },
    { label: 'Vizsga 2025/3 teszt', labelEn: 'Exam 2025/3 · test', file: 'Vizsga_2025_3_teszt.pdf' },
    { label: 'Vizsga 2025/3 A kifejtés', labelEn: 'Exam 2025/3 · written part A', file: 'Vizsga_2025_3_A_kifejt.pdf' },
    { label: 'Vizsga 2025/3 B kifejtés', labelEn: 'Exam 2025/3 · written part B', file: 'Vizsga_2025_3_B_kifejt.pdf' },
    { label: 'Vizsga 2025/4 teszt', labelEn: 'Exam 2025/4 · test', file: 'Vizsga_2025_4_teszt.pdf' },
    { label: 'Vizsga 2025/4 A kifejtés', labelEn: 'Exam 2025/4 · written part A', file: 'Vizsga_2025_4_A_kifejt.pdf' },
    { label: 'Vizsga 2025/4 B kifejtés', labelEn: 'Exam 2025/4 · written part B', file: 'Vizsga_2025_4_B_kifejt.pdf' }
  ];
  function viewResources() {
    document.title = MB.T('Forrásanyagok — MatekBázis', 'Resources — MatekBázis');
    let h = '<div class="page-head"><div class="kicker">' + MB.T('Függelék C', 'Appendix C') + '</div><h1>' + MB.T('Forrásanyagok', 'Resources') + '</h1><p class="lead">' + MB.T('A könyv alapjául szolgáló jegyzetek, példatárak és az eredeti zárthelyi- és vizsgafeladatsorok. A PDF-ek helyben megnyílnak.', 'The notes, exercise books and original midterm and exam papers behind this book. The PDFs open locally.') + '</p></div>';
    h += '<h2 class="section-label">' + MB.T('Jegyzetek és példatárak', 'Notes and exercise books') + '</h2><div class="res-grid">';
    RES.forEach(function (r) {
      h += '<a class="res-card" href="resources/' + encodeURIComponent(r.file) + '" target="_blank" rel="noopener"><span class="ico">' + MB.icon('file') + '</span><div><span class="kind">' + MB.esc(MB.T(r.kind, r.kindEn)) + '</span><h3>' + MB.esc(MB.T(r.title, r.titleEn)) + '</h3><p>' + MB.esc(MB.T(r.desc, r.descEn)) + '</p></div></a>';
    });
    h += '</div>';
    h += '<h2 class="section-label" style="margin-top:34px">' + MB.T('Zárthelyik és vizsgák', 'Midterms and exams') + ' <span class="sub">2025–2026</span></h2><div class="res-grid">';
    EXAMS.forEach(function (e) {
      h += '<a class="res-card" href="resources/' + encodeURIComponent(e.file) + '" target="_blank" rel="noopener"><span class="ico">' + MB.icon('file') + '</span><div><span class="kind">PDF</span><h3>' + MB.esc(MB.T(e.label, e.labelEn)) + '</h3><p>' + MB.T('Eredeti feladatsor / megoldás', 'Original paper / solutions') + '</p></div></a>';
    });
    h += '</div>';
    h += '<div class="note-box" style="margin-top:26px"><h4>' + MB.T('Honnan jönnek ezek?', 'Where do these come from?') + '</h4><p style="margin:0">' + MB.T('A fájlok a <code>D:\\[NEW DONLOADS]\\Info.zip</code> első és második féléves anyagaiból, valamint a saját felkészítő PDF-jeidből származnak. A vizsgák anyaga és a pontozás a 2025–2026-os tanév tanszéki tájékoztatója szerint szerepel — mindig ellenőrizd az aktuális követelményrendszert a tárgy honlapján.', 'The files come from the first- and second-semester material in <code>D:\\[NEW DONLOADS]\\Info.zip</code>, and from your own preparation PDFs. The exam material and scoring follow the department’s 2025–2026 information — always check the current requirements on the course website.') + '</p></div>';
    return h;
  }

  /* ---------- router ---------- */
  function parseRoute() {
    const hash = location.hash.replace(/^#\/?/, '');
    const parts = hash.split('/').filter(Boolean);
    if (!parts.length) return { name: 'home' };
    if (parts[0] === 'section') return { name: 'section', section: parts[1] };
    if (parts[0] === 'chapter') return { name: 'chapter', section: parts[1], chapter: parts[2] };
    if (parts[0] === 'formulas') return { name: 'formulas' };
    if (parts[0] === 'videos') return { name: 'videos' };
    if (parts[0] === 'resources') return { name: 'resources' };
    if (parts[0] === 'practice') return { name: 'practice', cat: parts[1] };
    if (parts[0] === 'exam') return { name: 'exam', mode: parts[1] };
    if (parts[0] === 'test') return { name: 'test', section: parts[1], chapter: parts[2] };
    if (parts[0] === 'daily') return { name: 'daily' };
    if (parts[0] === 'review' && (parts[1] === '5' || parts[1] === '10')) return { name: 'reviewSession', minutes: Number(parts[1]), section: parts[2] };
    if (parts[0] === 'review') return { name: 'review' };
    if (parts[0] === 'sessions') return { name: 'sessions' };
    if (parts[0] === 'learn') return { name: 'learn', minutes: Number(parts[1]) === 20 ? 20 : 10, section: parts[2] };
    if (parts[0] === 'mixed') return { name: 'mixed' };
    if (parts[0] === 'hunt') return { name: 'hunt', id: parts[1] };
    if (parts[0] === 'progress') return { name: 'progress' };
    if (parts[0] === 'coach') return { name: 'coach' };
    if (parts[0] === 'today') return { name: 'today' };
    if (parts[0] === 'glossary') return { name: 'glossary', term: parts[1] };
    if (parts[0] === 'map') return { name: 'map' };
    if (parts[0] === 'diagnostic') return { name: 'diagnostic', section: parts[1] };
    if (parts[0] === 'launch') return { name: 'learn', minutes: 10, section: parts[1] };
    if (parts[0] === 'sprint') return { name: 'reviewSession', minutes: 10, section: parts[1] };
    return { name: 'home' };
  }

  function render() {
    const r = parseRoute();
    let html = '';
    if (r.name === 'home') {
      html = viewHome();
      setCrumbs([]);
    } else if (r.name === 'section') {
      const s = getSection(r.section);
      if (!s) { location.hash = '#/'; return; }
      html = viewSection(s);
      setCrumbs([{ label: MB.T(s.num + '. ' + MB.sTitle(s), 'Part ' + s.num + ' · ' + MB.sTitle(s)) }]);
    } else if (r.name === 'chapter') {
      const s = getSection(r.section), c = s && getChapter(r.section, r.chapter);
      if (!s || !c) { location.hash = '#/'; return; }
      html = chapterView(s, c);
      setCrumbs([{ label: MB.T(s.num + '. ' + MB.sTitle(s), 'Part ' + s.num + ' · ' + MB.sTitle(s)), href: '#/section/' + s.id }, { label: MB.T(c.num + '. ' + MB.cTitle(c), 'Chapter ' + c.num + ' · ' + MB.cTitle(c)) }]);
    } else if (r.name === 'formulas') {
      html = viewFormulas();
      setCrumbs([{ label: MB.T('Képletgyűjtemény', 'Formula sheet') }]);
    } else if (r.name === 'videos') {
      html = viewVideos();
      setCrumbs([{ label: MB.T('Videók', 'Videos') }]);
    } else if (r.name === 'resources') {
      html = viewResources();
      setCrumbs([{ label: MB.T('Forrásanyagok', 'Resources') }]);
    } else if (r.name === 'practice') {
      html = viewPractice(r.cat);
      setCrumbs([{ label: MB.T('Feladatbank', 'Practice bank') }]);
    } else if (r.name === 'exam') {
      html = viewExam(r.mode);
      setCrumbs([{ label: MB.T('ZH / vizsga', 'Exams') }]);
    } else if (r.name === 'test') {
      const s = getSection(r.section), c = s && getChapter(r.section, r.chapter);
      if (!s || !c) { location.hash = '#/'; return; }
      html = viewTest(s, c);
      setCrumbs([{ label: MB.T(s.num + '. ' + MB.sTitle(s), 'Part ' + s.num + ' · ' + MB.sTitle(s)), href: '#/section/' + s.id }, { label: MB.T(c.num + '. ' + MB.cTitle(c), 'Chapter ' + c.num + ' · ' + MB.cTitle(c)), href: '#/chapter/' + s.id + '/' + c.id }, { label: MB.T('Teszt', 'Test') }]);
    } else if (r.name === 'daily') {
      html = MB.dailyView ? MB.dailyView() : '';
      setCrumbs([{ label: MB.T('Napi küldetés', 'Daily quest') }]);
    } else if (r.name === 'review') {
      html = MB.reviewView ? MB.reviewView() : '';
      setCrumbs([{ label: MB.T('Hibafüzet', 'Error notebook') }]);
    } else if (r.name === 'mixed') {
      html = MB.mixedView ? MB.mixedView() : '';
      setCrumbs([{ label: MB.T('Vegyes menet', 'Mixed run') }]);
    } else if (r.name === 'hunt') {
      html = MB.huntView ? MB.huntView(r.id) : '';
      setCrumbs([{ label: MB.T('Hibavadászat', 'Error hunt') }]);
    } else if (r.name === 'progress') {
      html = MB.progressView ? MB.progressView() : '';
      setCrumbs([{ label: MB.T('Haladás', 'Progress') }]);
    } else if (r.name === 'today') {
      html = MB.habit && MB.habit.todayView ? MB.habit.todayView() : '';
      setCrumbs([{ label: MB.T('Mai terv', "Today's plan") }]);
    } else if (r.name === 'glossary') {
      html = viewGlossary(r.term);
      setCrumbs([{ label: MB.T('Fogalomtár', 'Glossary') }]);
    } else if (r.name === 'coach') {
      html = MB.coachView ? MB.coachView() : '';
      setCrumbs([{ label: MB.T('Fókusz', 'Focus') }]);
    } else if (r.name === 'sessions') {
      html = MB.sessionsView ? MB.sessionsView() : '';
      setCrumbs([{ label: MB.T('Tanulás és ismétlés', 'Learn and review') }]);
    } else if (r.name === 'learn') {
      html = MB.sessionView ? MB.sessionView('learn', r.minutes, r.section) : '';
      setCrumbs([{ label: MB.T('Tanulás', 'Learn') }]);
    } else if (r.name === 'reviewSession') {
      html = MB.sessionView ? MB.sessionView('review', r.minutes, r.section) : '';
      setCrumbs([{ label: MB.T('Ismétlés', 'Review') }]);
    } else if (r.name === 'map') {
      html = MB.mapView ? MB.mapView() : '';
      setCrumbs([{ label: MB.T('Tudástérkép', 'Knowledge map') }]);
    } else if (r.name === 'diagnostic') {
      html = MB.diagView ? MB.diagView(r.section) : '';
      setCrumbs([{ label: MB.T('Felmérés', 'Diagnostic') }]);
    }
    main.innerHTML = MB.protectMath(html);
    updateNav(r);
    if (MB.mountDemos) MB.mountDemos(main);
    renderMath(main);
    MB.translateDOM(main);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    closeSidebar();
    if (r.name === 'formulas') initFormulaSearch();
    if (MB.fun && MB.fun.afterRender) MB.fun.afterRender(r);
    if (MB.coach && MB.coach.afterRender) MB.coach.afterRender(r);
    if (MB.habit && MB.habit.afterRender) MB.habit.afterRender(r);
  }

  /* ---------- interactions ---------- */
  function markRead(c, on) {
    const k = chapterKey(c.sectionId, c.id);
    if (on) state.read[k] = true; else delete state.read[k];
    save();
  }
  function markDone(c, i, on) {
    const k = chapterKey(c.sectionId, c.id) + '/' + i;
    if (on) state.ex[k] = true; else delete state.ex[k];
    save();
  }
  function chapterFromEx(el) {
    const article = el.closest('.book');
    if (!article) return null;
    const r = parseRoute();
    if (r.name === 'chapter' || r.name === 'test') return getChapter(r.section, r.chapter);
    return null;
  }

  document.addEventListener('click', function (e) {
    const t = e.target;
    const check = t.closest('[data-check]');
    if (check) {
      const ex = check.closest('.ex');
      const c = chapterFromEx(ex);
      const i = +ex.dataset.ex;
      const input = ex.querySelector('.answer-input');
      const fb = ex.querySelector('.feedback');
      const ans = ex.dataset.ans;
      const type = ex.dataset.type;
      const alt = ex.dataset.alt ? JSON.parse(ex.dataset.alt) : [];
      const ok = MB.check(input.value, ans, type, alt);
      fb.className = 'feedback show ' + (ok ? 'ok' : 'learning');
      fb.textContent = ok
        ? MB.T('Helyes. Ez már megy — a következő lépés egy kicsit nehezebb legyen.', 'Correct. You have this one — make the next step slightly harder.')
        : MB.T('Még nem. Ez nem hiba, hanem információ: kérj egy kisebb lépést vagy nyisd ki a segítséget. A hibafüzet innen tudja, mit ismételj.', 'Not yet. This is not a failure, it is information: ask for a smaller step or open the hint. The error notebook uses it to decide what to review.');
      if (MB.fun && MB.fun.answer) MB.fun.answer(ex, ok, input.value);
      if (ok && c) { markDone(c, i, true); ex.classList.add('done'); updateNav(parseRoute()); }
      input.focus();
      return;
    }
    const hint = t.closest('[data-hint]');
    if (hint) {
      const h = hint.closest('.ex').querySelector('.hint-text');
      if (h) h.classList.toggle('show');
      return;
    }
    const sol = t.closest('[data-sol]');
    if (sol) {
      const s = sol.closest('.ex').querySelector('.solution');
      if (s) s.classList.toggle('show');
      return;
    }
    const choice = t.closest('[data-choice]');
    if (choice) {
      const ex = choice.closest('.ex');
      const c = chapterFromEx(ex);
      const i = +ex.dataset.ex;
      const ans = ex.dataset.ans;
      const fb = ex.querySelector('.feedback');
      const ok = String(choice.dataset.choice) === String(ans);
      fb.className = 'feedback show ' + (ok ? 'ok' : 'learning');
      fb.textContent = ok ? MB.T('Helyes válasz.', 'Correct answer.') : MB.T('Még nem. Gondold végig újra, vagy kérj segítséget — nem kell elsőre tudni.', 'Not yet. Think it through again, or ask for a hint — you do not have to know it first time.');
      if (MB.fun && MB.fun.answer) MB.fun.answer(ex, ok, choice.dataset.choice);
      if (ok && c) { markDone(c, i, true); ex.classList.add('done'); updateNav(parseRoute()); }
      return;
    }
    const self = t.closest('[data-self]');
    if (self) {
      const ex = self.closest('.ex');
      const c = chapterFromEx(ex);
      if (MB.fun && MB.fun.answer) MB.fun.answer(ex, self.dataset.self === '1', '');
      if (c) { markDone(c, +ex.dataset.ex, self.dataset.self === '1'); updateNav(parseRoute()); }
      self.closest('.self-check').innerHTML = self.dataset.self === '1'
        ? '<span style="color:var(--ok);font-family:var(--font-ui);font-size:.78rem">' + MB.T('Elmentve: megvan.', 'Saved: got it.') + '</span>'
        : '<span style="color:var(--muted);font-family:var(--font-ui);font-size:.78rem">' + MB.T('Rendben, nézd át a megoldást, majd térj vissza rá.', 'All right — read the solution, then come back to it.') + '</span>';
      return;
    }
    const read = t.closest('[data-read]');
    if (read) {
      const r = parseRoute();
      const c = getChapter(r.section, r.chapter);
      if (c) {
        markRead(c, read.dataset.read === '1');
        render();
        MB.toast(read.dataset.read === '1' ? MB.T('Fejezet elolvasva.', 'Chapter marked as read.') : MB.T('Jelölés visszavonva.', 'Mark removed.'));
      }
      return;
    }
    const embed = t.closest('[data-action="embed"]');
    if (embed) {
      const id = embed.dataset.embed;
      const list = embed.dataset.embedList;
      const frame = embed.closest('.video-frame');
      const src = id ? 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0' : 'https://www.youtube-nocookie.com/embed/videoseries?list=' + list + '&autoplay=1&rel=0';
      frame.innerHTML = '<iframe src="' + src + '" title="' + MB.T('Videó', 'Video') + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      return;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('answer-input')) {
      const ex = e.target.closest('.ex');
      const btn = ex && ex.querySelector('[data-check]');
      if (btn) { e.preventDefault(); btn.click(); }
    }
  });

  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('scrim').classList.remove('open');
    document.getElementById('navFab').classList.remove('open');
    document.getElementById('navFab').setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }
  document.getElementById('navFab').addEventListener('click', function () {
    const s = document.getElementById('sidebar');
    const open = !s.classList.contains('open');
    s.classList.toggle('open', open);
    document.getElementById('scrim').classList.toggle('open', open);
    document.getElementById('navFab').classList.toggle('open', open);
    document.getElementById('navFab').setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  });
  document.getElementById('scrim').addEventListener('click', closeSidebar);
  document.getElementById('themeBtn').addEventListener('click', function () {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    save(); applyTheme();
  });
  document.getElementById('langBtn').addEventListener('click', function () {
    state.lang = state.lang === 'en' ? 'hu' : 'en';
    try { localStorage.setItem('bindery.lang', state.lang); } catch (e) {}
    save(); applyLang(); render();
  });

  window.addEventListener('hashchange', render);

  /* ---------- search ---------- */
  const searchIndex = [];
  function pushEntry(lang, kind, title, sub, href, text) {
    searchIndex.push({ lang: lang, kind: kind, title: title, sub: sub, href: href, text: MB.fold(text) });
  }
  MB.sections.forEach(function (s) {
    pushEntry('hu', 'rész', s.title, s.subtitle, '#/section/' + s.id, s.title + ' ' + s.subtitle + ' ' + s.intro);
    s.chapters.forEach(function (c) {
      pushEntry('hu', 'fejezet', c.num + '. ' + c.title, s.title, '#/chapter/' + s.id + '/' + c.id,
        c.title + ' ' + MB.strip(c.lead) + ' ' + (c.theory || []).map(function (t) { return MB.strip(t.title || '') + ' ' + MB.strip(t.body || '') + ' ' + (t.note || ''); }).join(' '));
    });
  });
  MB.formulas.forEach(function (f) {
    pushEntry('hu', 'képlet', f.name, f.cat, f.ref ? '#/chapter/' + f.ref[0] + '/' + f.ref[1] : '#/formulas', f.name + ' ' + f.cat + ' ' + (f.note || ''));
  });
  MB.videos.forEach(function (v) {
    pushEntry('hu', 'videó', v.title, v.channel, '#/videos', v.title + ' ' + v.channel + ' ' + (v.note || '') + ' ' + v.cat);
  });
  (MB.glossary || []).forEach(function (g) {
    pushEntry('hu', 'fogalom', MB.termLabel(g), MB.T('fogalomtár', 'glossary'), '#/glossary/' + g.id, g.term.hu + ' ' + g.term.en + ' ' + g.plain.hu + ' ' + g.precise.hu);
  });
  /* English entries: the pickers only translate while MB.lang is 'en', so switch for the build. */
  (function buildEnglishIndex() {
    const prevLang = MB.lang;
    MB.lang = 'en';
    try {
      MB.sections.forEach(function (s) {
        pushEntry('en', 'part', MB.sTitle(s), MB.sSub(s), '#/section/' + s.id,
          MB.sTitle(s) + ' ' + MB.sSub(s) + ' ' + MB.sIntro(s));
        s.chapters.forEach(function (c) {
          const e = MB.pickChapter(c);
          pushEntry('en', 'chapter', e.num + '. ' + MB.cTitle(e), MB.sTitle(s), '#/chapter/' + s.id + '/' + c.id,
            MB.cTitle(e) + ' ' + MB.strip(MB.cLead(e)) + ' ' + (e.theory || []).map(function (t) { return MB.strip(t.title || '') + ' ' + MB.strip(t.body || '') + ' ' + (t.note || ''); }).join(' '));
        });
      });
      MB.formulas.forEach(function (f, i) {
        const e = MB.pickFormula(f, i);
        pushEntry('en', 'formula', e.name, e.cat, f.ref ? '#/chapter/' + f.ref[0] + '/' + f.ref[1] : '#/formulas',
          e.name + ' ' + e.cat + ' ' + (e.note || ''));
      });
      MB.videos.forEach(function (v, i) {
        const e = MB.pickVideo(v, i);
        pushEntry('en', 'video', e.title, e.channel, '#/videos',
          e.title + ' ' + e.channel + ' ' + (e.note || '') + ' ' + e.cat);
      });
      (MB.glossary || []).forEach(function (g) {
        pushEntry('en', 'term', MB.termLabel(g), 'Glossary', '#/glossary/' + g.id, g.term.en + ' ' + g.term.hu + ' ' + g.plain.en + ' ' + g.precise.en);
      });
    } finally {
      MB.lang = prevLang;
    }
  })();

  const modal = document.getElementById('searchModal');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  let sel = 0, current = [];

  function openSearch() {
    modal.classList.add('open');
    input.value = '';
    input.focus();
    showResults('');
  }
  function closeSearch() { modal.classList.remove('open'); }
  function showResults(q) {
    const terms = MB.fold(q).split(/\s+/).filter(Boolean);
    current = searchIndex.filter(function (it) {
      if (it.lang !== MB.lang) return false;
      return terms.every(function (t) { return it.text.indexOf(t) >= 0; });
    }).slice(0, 40);
    sel = 0;
    if (!current.length) {
      results.innerHTML = '<div class="search-empty">' + MB.T('Nincs találat. Próbálj rövidebb kulcsszót (pl. „lánc”, „sorozat”, „Moivre”).', 'No results. Try a shorter keyword (e.g. “chain”, “sequence”, “Moivre”).') + '</div>';
      return;
    }
    results.innerHTML = current.map(function (it, i) {
      return '<a class="search-result' + (i === 0 ? ' sel' : '') + '" href="' + it.href + '"><span class="k">' + it.kind + '</span><span>' + MB.esc(it.title) + '<small>' + MB.esc(it.sub || '') + '</small></span></a>';
    }).join('');
  }
  function moveSel(d) {
    if (!current.length) return;
    sel = (sel + d + current.length) % current.length;
    $$('.search-result', results).forEach(function (a, i) { a.classList.toggle('sel', i === sel); });
    const el = $$('.search-result', results)[sel];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }
  input.addEventListener('input', function () { showResults(input.value); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); const a = $$('.search-result', results)[sel]; if (a) { location.hash = a.getAttribute('href'); closeSearch(); } }
    else if (e.key === 'Escape') closeSearch();
  });
  results.addEventListener('click', function (e) { if (e.target.closest('a')) closeSearch(); });
  document.getElementById('searchTrigger').addEventListener('click', openSearch);
  document.getElementById('searchClose').addEventListener('click', closeSearch);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeSearch(); });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); openSearch(); }
    else if (e.key === 'Escape') closeSearch();
  });

  /* ---------- formula filter ---------- */
  function initFormulaSearch() {
    const inp = document.getElementById('formulaSearch');
    if (!inp) return;
    inp.addEventListener('input', function () {
      const q = MB.fold(inp.value).trim();
      $$('.formula-item').forEach(function (el) {
        el.style.display = !q || el.dataset.search.indexOf(q) >= 0 ? '' : 'none';
      });
      $$('.formula-cat').forEach(function (cat) {
        const any = $$('.formula-item', cat).some(function (el) { return el.style.display !== 'none'; });
        cat.style.display = any ? '' : 'none';
      });
    });
  }

  /* ---------- views added below by feature modules ---------- */
  MB.renderMath = renderMath;
  MB.app = {
    state: state, save: save, render: render, parseRoute: parseRoute,
    getSection: getSection, getChapter: getChapter, allChapters: allChapters,
    isRead: isRead, markRead: markRead, markDone: markDone, exKey: exKey,
    autoExercises: autoExercises, renderMath: renderMath, chapterKey: chapterKey,
    setCrumbs: setCrumbs, updateNav: updateNav
  };

  /* Placeholders replaced by feature files (defined on MB.app) */
  function viewPractice(cat) { return MB.practiceView ? MB.practiceView(cat) : ''; }
  function viewExam(mode) { return MB.examView ? MB.examView(mode) : ''; }
  function viewTest(s, c) { return MB.testView ? MB.testView(s, c) : ''; }

  render();
})();
