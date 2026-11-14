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
  state.lang = state.lang || 'hu';
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
        h += '<div class="nav-group-label nav-extra-label">' + MB.t('Előretekintés · opcionális') + '</div>';
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
  function theoryHTML(t) {
    if (t.t === 'p') return '<p>' + t.body + '</p>';
    if (t.t === 'list') {
      return '<div class="callout ' + (t.tone || 'note') + '"><div class="ct">' + MB.icon('layers') + MB.esc(t.title) + '</div><div class="body"><ul>' +
        t.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul></div></div>';
    }
    const label = MB.t({ def: 'Definíció', thm: 'Tétel', note: 'Megjegyzés', warn: 'Vigyázat', formula: 'Képlet' }[t.t] || 'Megjegyzés');
    const icon = t.t === 'warn' ? 'alert' : t.t === 'thm' ? 'target' : t.t === 'def' ? 'book' : t.t === 'formula' ? 'sigma' : 'info';
    let body = '';
    if (t.t === 'formula') {
      body = '<div class="fx">$$' + t.latex + '$$</div>' + (t.note ? '<p class="muted" style="font-size:.82rem;margin:.3rem 0 0">' + t.note + '</p>' : '');
    } else {
      body = t.body;
    }
    return '<div class="callout ' + t.t + '"><div class="ct">' + MB.icon(icon) + label + (t.title ? ' · ' + MB.esc(t.title) : '') + '</div><div class="body">' + body + '</div></div>';
  }

  function exampleHTML(ex, i) {
    return '<div class="example"><div class="example-head"><span class="badge">PÉLDA ' + (i + 1) + '</span><h3>' + MB.esc(ex.title) + '</h3></div>' +
      '<div class="example-body"><div class="problem">' + ex.problem + '</div>' +
      (ex.steps ? '<ol class="steps">' + ex.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' : '') +
      (ex.answer ? '<div class="answer-line"><b>Eredmény:</b> ' + ex.answer + '</div>' : '') +
      '</div></div>';
  }

  function videoHTML(v, c) {
    if (!v) return '';
    const search = v.search || (c.title + ' ' + c.sectionTitle + ' magyar matematika');
    const yt = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(search);
    const embed = v.id ? ' data-embed="' + v.id + '"' : v.list ? ' data-embed-list="' + v.list + '"' : '';
    const opener = (v.id || v.list)
      ? '<button class="video-play" data-action="embed"' + embed + '><span class="circle">' + MB.icon('play') + '</span><span>Videó megnyitása</span></button>'
      : '<a class="video-play" href="' + yt + '" target="_blank" rel="noopener"><span class="circle">' + MB.icon('play') + '</span><span>Videók a témában</span></a>';
    return '<div class="video-block"><div class="video-frame">' + opener + '</div>' +
      '<div class="video-meta"><div><h3>' + MB.esc(v.title) + '</h3><p>' + MB.esc(v.channel || 'Ajánlott videó') + '</p></div>' +
      '<div style="display:flex;gap:10px;align-items:center"><span class="src">' + MB.esc(v.kind || 'VIDEÓ') + '</span>' +
      '<a class="btn sm" href="' + yt + '" target="_blank" rel="noopener">Több videó ' + MB.icon('external') + '</a></div></div></div>';
  }

  function exerciseHTML(q, i, c) {
    const key = chapterKey(c.sectionId, c.id);
    const done = !!state.ex[key + '/' + i];
    const type = q.type || 'expr';
    let controls = '';
    if (type === 'proof' || type === 'open') {
      controls = '<div class="self-check"><button class="btn sm" data-self="1">Megvan, kész</button><button class="btn sm" data-self="0">Nem ment</button></div>';
    } else if (type === 'choice') {
      controls = '<div class="answer-row">' + (q.choices || []).map(function (ch, j) {
        return '<button class="btn sm" data-choice="' + j + '">' + ch + '</button>';
      }).join('') + '</div>';
    } else {
      controls = '<div class="answer-row"><input class="answer-input" type="text" inputmode="text" placeholder="Írd be az eredményt…" aria-label="Válasz">' +
        '<button class="btn sm check" data-check>Ellenőrzés</button>' +
        '<button class="btn sm hint-btn" data-hint>Segítség</button></div>';
    }
    const dataAns = q.a == null ? '' : MB.esc(typeof q.a === 'object' ? JSON.stringify(q.a) : q.a);
    const dataAlt = q.alt ? MB.esc(JSON.stringify(q.alt)) : '';
    return '<div class="ex' + (done ? ' done' : '') + '" data-ex="' + i + '" data-ans="' + dataAns + '" data-type="' + type + '" data-alt="' + dataAlt + '">' +
      '<div class="ex-top"><div class="ex-idx">' + String(i + 1).padStart(2, '0') + '</div><div class="ex-body"><div class="ex-q">' + q.q +
      '<span class="ex-level" title="Nehézség">' + [1, 2, 3].map(function (n) { return '<i class="' + (n <= (q.level || 1) ? 'on' : '') + '"></i>'; }).join('') + '</span></div></div></div>' +
      '<div class="ex-bottom">' + controls +
      (q.hint ? '<div class="hint-text">' + MB.icon('bulb') + ' ' + q.hint + '</div>' : '') +
      '<div class="feedback"></div>' +
      (q.sol ? '<div style="margin-top:8px"><button class="btn sm sol-btn" data-sol>Megoldás mutatása</button></div><div class="solution"><b>Megoldás.</b> ' + q.sol + '</div>' : '') +
      '</div></div>';
  }

  function chapterView(s, c) {
    const idx = allChapters.indexOf(c);
    const prev = allChapters[idx - 1], next = allChapters[idx + 1];
    const read = isRead(c);
    const exs = c.exercises || [];
    const nAuto = autoExercises(c).length;
    const hasVideo = !!c.video;
    document.title = MB.cTitle(c) + ' — MatekBázis';

    let h = '<article class="book">';
    h += '<header class="chapter-head">';
    h += '<div class="running-head"><span class="gold">' + s.num + '. rész</span><span class="line"></span><span>' + MB.esc(s.title) + (s.role === 'extra' ? ' · opcionális' : '') + '</span><span class="line"></span><span>' + c.num + '. fejezet</span></div>';
    h += '<div class="chapter-opener"><div class="chapter-num">' + c.num + '</div><div class="chapter-title-wrap"><h1>' + MB.esc(MB.cTitle(c)) + '</h1><p class="lead">' + MB.cLead(c) + '</p></div></div>';
    h += '<div class="chapter-meta">' +
      '<span class="meta-pill">' + MB.icon('clock') + '<b>' + (c.minutes || 20) + ' ' + MB.t('perc') + '</b> ' + MB.t('olvasás') + '</span>' +
      '<span class="meta-pill">' + MB.icon('dumbbell') + '<b>' + exs.length + '</b> ' + MB.t('feladat') + '</span>' +
      (hasVideo ? '<span class="meta-pill">' + MB.icon('video') + MB.t('videó') + '</span>' : '') +
      '<span class="meta-pill">' + MB.icon('target') + MB.t('ZH-témakör:') + ' <b>' + MB.esc(MB.tag(c.examTag || s.examTag || 'alapozás')) + '</b></span>' +
      (s.role === 'extra' ? '<span class="meta-pill">' + MB.t('opcionális előretekintés') + '</span>' : '') +
      (s.prereq.length ? '<span class="meta-pill">' + MB.t('előfeltétel:') + ' <b>' + s.prereq.map(function (pid) { const p = getSection(pid); return p ? MB.esc(MB.sTitle(p)) : pid; }).join(', ') + '</b></span>' : '') +
      (read ? '<span class="meta-pill" style="color:var(--ok);border-color:var(--ok)">' + MB.icon('check') + MB.t('elolvasva') + '</span>' : '') +
      '</div></header>';

    if (MB.lang === 'en' && MB.cSummary(c)) {
      h += '<div class="callout why" data-no-translate><div class="ct">' + MB.icon('book') + 'Chapter overview</div><div class="body"><p>' + MB.cSummary(c) + '</p><p style="font-size:.82rem;color:var(--muted);margin-bottom:0">The detailed theory, examples and exercises below are in Hungarian. The formulas are language-independent.</p></div></div>';
    }

    /* 1 — theory */
    h += '<section class="book-section" id="elmelet"><h2 class="section-label">Elmélet <span class="sub">a miért, a hogyan és a mikor</span></h2>';
    if (c.why) {
      h += '<div class="callout why"><div class="ct">' + MB.icon('bulb') + 'Miért van ez így?</div><div class="body">' +
        (Array.isArray(c.why) ? c.why.map(function (p) { return '<p>' + p + '</p>'; }).join('') : '<p>' + c.why + '</p>') + '</div></div>';
    }
    if (c.when) {
      h += '<div class="callout when"><div class="ct">' + MB.icon('target') + 'Mikor használd?</div><div class="body">' + c.when + '</div></div>';
    }
    (c.theory || []).forEach(function (t) { h += theoryHTML(t); });
    if (c.demo) h += '<div data-demo="' + c.demo + '"></div>';
    h += '</section>';

    /* 2 — video */
    if (hasVideo) {
      h += '<section class="book-section" id="video"><h2 class="section-label">Videó <span class="sub">nézd meg, majd olvasd újra</span></h2>' + videoHTML(c.video, c) + '</section>';
    }

    /* 3 — examples */
    if (c.examples && c.examples.length) {
      h += '<section class="book-section" id="peldak"><h2 class="section-label">Kidolgozott példák <span class="sub">lépésről lépésre</span></h2>';
      c.examples.forEach(function (ex, i) { h += exampleHTML(ex, i); });
      h += '</section>';
    }

    /* 4 — mistakes */
    if (c.mistakes && c.mistakes.length) {
      h += '<section class="book-section" id="hibak"><div class="mistakes"><h3>' + MB.icon('alert') + ' Tipikus hibák</h3><ul>' +
        c.mistakes.map(function (m) { return '<li>' + m + '</li>'; }).join('') + '</ul></div></section>';
    }

    /* 5 — exercises */
    h += '<section class="book-section" id="feladatok"><h2 class="section-label">Gyakorló feladatok <span class="sub">' + exs.length + ' feladat · ellenőrizhető válaszok</span></h2>';
    if (MB.lang === 'en') {
      h += '<div class="note-box" data-no-translate style="margin-bottom:10px"><h4>Exercise language</h4><p style="margin:0">Exercise texts are in Hungarian. The formulas and worked examples still help; the checker works the same way. The correct answer is only revealed after you click “Show answer”.</p></div>';
    }
    h += '<div class="ex-wrap"><div class="ex-head"><span class="hint">' + (MB.lang === 'en' ? 'Type the result, then click Check. The solution is only a guide.' : 'Írd be az eredményt, majd kattints az ellenőrzésre. A megoldás csak útmutató.') + '</span></div>';
    exs.forEach(function (q, i) { h += exerciseHTML(q, i, c); });
    h += '</div></section>';

    /* 6 — test CTA */
    if (nAuto > 0) {
      h += '<div class="test-cta"><div><h3>Készen állsz a fejezet tesztre?</h3><p>' + nAuto + ' automatikusan ellenőrizhető feladat · időlimit 10 perc · pontszám és részletes kiértékelés a végén.</p></div>' +
        '<a class="btn primary" href="#/test/' + s.id + '/' + c.id + '">' + MB.icon('trophy') + ' Teszt indítása</a></div>';
    }

    /* 7 — done + nav */
    h += '<div class="done-banner"><p>' + (read ? 'Ezt a fejezetet már elolvasottnak jelölted.' : 'Ha végigmentél a fejezeten, jelöld elolvasottnak — ez számít bele a haladásba.') + '</p>' +
      '<button class="btn ' + (read ? '' : 'navy') + '" data-read="' + (read ? '0' : '1') + '">' + MB.icon(read ? 'refresh' : 'check') + (read ? 'Visszavonás' : 'Fejezet kész') + '</button></div>';

    if (prev || next) {
      h += '<nav class="chapter-nav" aria-label="Fejezetnavigáció">';
      h += prev ? '<a href="#/chapter/' + prev.sectionId + '/' + prev.id + '"><small>' + MB.icon('arrowLeft') + ' Előző</small><b>' + prev.num + ' · ' + MB.esc(prev.title) + '</b></a>' : '<span></span>';
      h += next ? '<a class="next" href="#/chapter/' + next.sectionId + '/' + next.id + '"><small>Következő ' + MB.icon('arrowRight') + '</small><b>' + next.num + ' · ' + MB.esc(next.title) + '</b></a>' : '<span></span>';
      h += '</nav>';
    }
    h += '</article>';
    return h;
  }

  /* ---------- views ---------- */
  function viewHome() {
    const en = MB.lang === 'en';
    document.title = en ? 'MatekBázis — the basics of the first semester' : 'MatekBázis — az első félév alapjai';
    const totalEx = totalExercises();
    const readCount = allChapters.filter(isRead).length;
    const pct = allChapters.length ? Math.round(readCount / allChapters.length * 100) : 0;
    const H = MB.en && MB.en.home;
    const core = MB.sections.filter(function (x) { return x.role === 'core'; });
    const extra = MB.sections.filter(function (x) { return x.role === 'extra'; });
    let h = '<div class="hero">';
    h += '<div class="eyebrow">' + (en ? H.eyebrow : 'BME VIK · Mérnökinformatikus · Felkészítő') + '</div>';
    h += '<h1>' + (en ? H.h1a + '<br>' + H.h1b : 'Az első félév alapjai.<br>Könyvformában.') + '</h1>';
    h += '<p class="lead">' + (en ? H.lead : 'Nem a teljes tananyag. Az a biztos alap, amivel az első hetek nem az alapok pótlásáról szólnak: algebra, logika, komplex számok, sorozatok, határérték, deriválás, integrálás. A haladóbb részek külön, opcionális előretekintésként szerepelnek.') + '</p>';
    h += '<div class="hero-actions"><a class="btn primary" href="#/chapter/alapok/algebra">Kezdd az alapoknál ' + MB.icon('arrowRight') + '</a>' +
      '<a class="btn ghost" href="#/section/alapok">Mit hozz magaddal?</a>' +
      '<a class="btn ghost" href="#/exam">ZH-szimulátor</a></div>';
    h += '<div class="hero-foot"><span><b>' + core.length + '</b> ' + (en ? H.coreLabel : 'alaprész') + '</span><span><b>' + extra.length + '</b> ' + (en ? H.extraLabel : 'előretekintés') + '</span><span><b>' + allChapters.length + '</b> ' + (en ? H.chapters : 'fejezet') + '</span><span><b>' + totalEx + '</b> ' + (en ? H.exercises : 'feladat') + '</span><span><b>' + pct + '%</b> ' + (en ? H.doneLabel : 'kész') + '</span></div>';
    h += '</div>';

    h += '<div class="stat-grid">' +
      '<div class="stat"><b>' + readCount + '/' + allChapters.length + '</b><span>' + (en ? H.readChapters : 'Elolvasott fejezet') + '</span></div>' +
      '<div class="stat"><b>' + Object.keys(state.ex).length + '</b><span>' + (en ? H.solved : 'Megoldott feladat') + '</span></div>' +
      '<div class="stat"><b>' + MB.videos.length + '</b><span>' + (en ? H.videos : 'Ajánlott videó') + '</span></div>' +
      '<div class="stat"><b>' + Object.keys(state.tests).length + '</b><span>' + (en ? H.tests : 'Kitöltött teszt') + '</span></div>' +
      '</div>';
    h += '<div class="note-box" style="margin:0 0 12px"><h4>' + (en ? H.assumeTitle : 'Miből indulunk ki?') + '</h4><p style="margin:0 0 8px">' + (en ? H.assumeBody : 'Feltételezem, hogy <b>középszintű érettségi</b> szinten tanultál matematikát, de sok mindent elfelejtettél. Az <b>1. rész</b> ezért ismétlés, nem nulláról kezdés: a „Miért?” blokkok a régi szabályokat elevenítik fel, a feladatok pedig visszamérnek. Ha valami ismerős, ugorj a feladatokra; ha nem, olvasd el a magyarázatot.') + '</p><p style="margin:0">' + (en ? H.assumeBody2 : 'Ez <b>felkészítő</b>, nem a teljes félév anyaga. A 08–13. részek opcionális előretekintések: csak akkor vedd őket elő, ha a magabiztos alap megvan.') + '</p></div>';
    h += '<div class="note-box" style="margin:0 0 32px"><h4>' + (en ? H.installTitle : 'Nem kell telepíteni semmit') + '</h4><p style="margin:0">' + (en ? H.installBody : 'Nyisd meg az <b>index.html</b>-t dupla kattintással, vagy indítsd a <b>start.bat</b>-ot (Windows) / <b>start.command</b>-ot (macOS). Minden helyben fut: a videók kivételével internet sem kell hozzá.') + '</p></div>';

    h += '<div class="home-section"><div class="section-head"><div><h2>' + (en ? H.howTitle : 'Hogyan használd a könyvet') + '</h2><p>' + (en ? H.howSub : 'Nem kell mindent egyszerre. Egy fejezet négy mozdulat.') + '</p></div></div>' +
      '<div class="grid-2">' +
      '<div class="card"><div class="section-label">01 · ' + (en ? H.how1 : 'Olvasd') + '</div><p style="margin:0;font-size:.9rem">' + (en ? H.how1Body : 'Kezdd a <b>Miért?</b> blokkal. A definíció csak utána jön — előbb kép legyen arról, mit csinálunk.') + '</p></div>' +
      '<div class="card"><div class="section-label">02 · ' + (en ? H.how2 : 'Nézd meg') + '</div><p style="margin:0;font-size:.9rem">' + (en ? H.how2Body : 'A videó nem helyettesíti a jegyzetet, de egy jó magyarázat után a képletek helyükre kerülnek.') + '</p></div>' +
      '<div class="card"><div class="section-label">03 · ' + (en ? H.how3 : 'Számold') + '</div><p style="margin:0;font-size:.9rem">' + (en ? H.how3Body : 'A kidolgozott példát takard le, próbáld magadtól, aztán hasonlítsd össze a lépésekkel.') + '</p></div>' +
      '<div class="card"><div class="section-label">04 · ' + (en ? H.how4 : 'Teszteld') + '</div><p style="margin:0;font-size:.9rem">' + (en ? H.how4Body : 'A fejezet végén ellenőrizhető feladatok és egy időlimites teszt mutatja meg, hol állsz.') + '</p></div>' +
      '</div></div>';

    h += '<div class="home-section"><div class="section-head"><div><h2>' + (en ? H.pathTitle : 'Tanulási útvonal') + '</h2><p>' + (en ? H.pathSub : 'Alapok először, aztán egymásra épülő lépések. Nem kell mindent egyszerre.') + '</p></div></div>';
    h += '<div class="path-row"><span class="path-label">' + (en ? H.pathCore : 'Kötelező mag') + '</span>';
    ['alapok', 'logika', 'komplex', 'sorozatok', 'hatarertek', 'derivalas', 'integralas'].forEach(function (id, i) {
      const sec = getSection(id);
      h += (i ? '<span class="path-arrow">→</span>' : '') + '<a class="path-node" href="#/section/' + id + '"><b>' + sec.num + '</b> ' + MB.esc(MB.sTitle(sec)) + '</a>';
    });
    h += '</div>';
    h += '<div class="path-row"><span class="path-label">' + (en ? H.pathAfter : '07 után') + '</span><span class="path-node extra"><b>07</b> ' + MB.sTitle(getSection('integralas')) + '</span><span class="path-arrow">→</span>';
    ['sorok', 'taylor', 'tobbvaltozos', 'diff-fourier'].forEach(function (id, i) {
      const sec = getSection(id);
      h += (i ? '<span class="path-arrow">→</span>' : '') + '<a class="path-node extra" href="#/section/' + id + '"><b>' + sec.num + '</b> ' + MB.esc(MB.sTitle(sec)) + '</a>';
    });
    h += '</div>';
    h += '<p class="path-note">' + (en ? H.pathNote : 'Külön sáv: <a href="#/section/linearis">12 · Lineáris algebra</a> az Alapokra, <a href="#/section/diszkret">13 · Diszkrét matematika</a> a Logikára épül. Ezek nem előfeltételei az analízisnek, de ugyanígy alapokra épülnek.') + '</p></div>';

    function sectionCard(s) {
      const read = s.chapters.filter(isRead).length;
      const p = Math.round(read / s.chapters.length * 100);
      return '<a class="section-card' + (s.role === 'extra' ? ' is-extra' : '') + '" href="#/section/' + s.id + '"><div class="top"><span class="num">' + s.num + '. RÉSZ</span><span class="meta-pill">' + (s.role === 'extra' ? 'opcionális' : 'alap') + '</span></div>' +
        '<h3>' + MB.esc(MB.sTitle(s)) + '</h3><p>' + MB.esc(MB.sSub(s)) + '</p>' +
        '<div class="meta"><span>' + read + '/' + s.chapters.length + '</span><span class="mini-bar"><i style="width:' + p + '%"></i></span><span>' + p + '%</span></div></a>';
    }
    h += '<div class="home-section"><div class="section-head"><div><h2>' + (en ? H.coreTitle : 'A felkészítő magja') + '</h2><p>' + (en ? H.coreSub : 'Ezt a 7 részt érdemes sorrendben végigvenni. Minden az előzőre épül.') + '</p></div></div><div class="roadmap">' + core.map(sectionCard).join('') + '</div></div>';
    h += '<div class="home-section"><div class="section-head"><div><h2>' + (en ? H.extraTitle : 'Előretekintés') + '</h2><p>' + (en ? H.extraSub : 'Opcionális. Akkor nyúlj hozzá, ha a mag megy — ezek már a félév későbbi vagy más tárgyainak anyagai.') + '</p></div></div><div class="roadmap">' + extra.map(sectionCard).join('') + '</div></div>';

    h += '<div class="home-section"><div class="section-head"><div><h2>' + (en ? H.examTitle : 'A két zárthelyi és a vizsga') + '</h2><p>' + (en ? H.examSub : 'A 2025–2026-os követelmények szerint.') + '</p></div><a href="#/exam">' + (en ? H.allSim : 'Összes szimulátor') + ' ' + MB.icon('arrowRight') + '</a></div><div class="exam-strip">' +
      '<div class="exam-card"><span class="tag">1. zárthelyi · 9. hét</span><h3>Komplex számok, sorozatok, határérték</h3><p>75 perc · 100 pont. Definíció + ε–N bizonyítás, határértékszámítás, komplex műveletek és gyökök, értelmezési tartomány, szakadások.</p><div class="chips"><span class="chip">komplex</span><span class="chip">sorozat</span><span class="chip">határérték</span><span class="chip">folytonosság</span></div><p style="margin-top:12px"><a class="btn sm navy" href="#/exam/zh1">ZH1 szimulátor</a></p></div>' +
      '<div class="exam-card"><span class="tag">2. zárthelyi · 13. hét</span><h3>Deriválás és alkalmazásai</h3><p>75 perc. Inverz függvény, láncszabály, L’Hospital, monotonitás, szélsőérték, konvexitás, inflexió, implicit deriválás.</p><div class="chips"><span class="chip">derivált</span><span class="chip">L’Hospital</span><span class="chip">függvényvizsgálat</span><span class="chip">inverz</span></div><p style="margin-top:12px"><a class="btn sm navy" href="#/exam/zh2">ZH2 szimulátor</a></p></div>' +
      '<div class="exam-card"><span class="tag">Vizsga · 90 perc</span><h3>Az egész félév + integrálás</h3><p>A vizsgán az integrálszámítás hangsúlyos, külön 40% elérése kell belőle. Teszt + kifejtős rész, definíciók és tételek is.</p><div class="chips"><span class="chip">integrál</span><span class="chip">elmélet</span><span class="chip">teszt</span></div><p style="margin-top:12px"><a class="btn sm navy" href="#/exam/vizsga">Vizsga szimulátor</a></p></div>' +
      '<div class="exam-card"><span class="tag">Forrás · 2025–2026</span><h3>Eredeti feladatsorok</h3><p>A ZH-k, pót- és javító ZH-k, valamint a négy 2025-ös vizsga teljes feladatsora és megoldása letölthető.</p><div class="chips"><span class="chip">PDF</span><span class="chip">megoldások</span></div><p style="margin-top:12px"><a class="btn sm" href="#/resources">Feladatsorok ' + MB.icon('arrowRight') + '</a></p></div>' +
      '</div></div>';

    return h;
  }

  function viewSection(s) {
    document.title = MB.sTitle(s) + ' — MatekBázis';
    const read = s.chapters.filter(isRead).length;
    let h = '<div class="page-head"><div class="kicker">' + s.num + '. ' + MB.t('rész') + '</div><h1>' + MB.esc(MB.sTitle(s)) + '</h1><p class="lead">' + MB.sIntro(s) + '</p>' +
      '<div class="chapter-meta"><span class="meta-pill"><b>' + s.chapters.length + '</b> fejezet</span><span class="meta-pill"><b>' + read + '</b> elolvasva</span><span class="meta-pill">' + MB.icon('clock') + '<b>' + s.chapters.reduce(function (n, c) { return n + (c.minutes || 20); }, 0) + '</b> perc</span><span class="meta-pill">ZH: <b>' + MB.esc(MB.tag(s.examTag || 'alapozás')) + '</b></span>' +
      (s.role === 'extra' ? '<span class="meta-pill">' + MB.t('opcionális előretekintés') + '</span>' : '') + '</div></div>';
    const en = MB.lang === 'en';
    if (s.id === 'alapok') {
      h += '<div class="note-box" style="margin-bottom:14px"><h4>' + MB.t('Miből indulunk ki?') + '</h4><p style="margin:0">' +
        (en
          ? 'I assume you studied mathematics at Hungarian <b>középszintű érettségi</b> level but have forgotten much of it. This part is therefore <b>revision</b>, not a from-zero course: the “Why?” boxes rebuild the old rules and the exercises check them. If something is familiar, skip to the exercises.'
          : 'Feltételezem, hogy <b>középszintű érettségi</b> szinten tanultál matematikát, de sok mindent elfelejtettél. Ez a rész ezért <b>ismétlés</b>, nem nulláról kezdés: a „Miért?” blokkok a régi szabályokat elevenítik fel, a feladatok visszamérnek. Ha valami ismerős, ugorj a feladatokra.') + '</p></div>';
    }
    if (s.role === 'extra') {
      h += '<div class="note-box" style="margin-bottom:14px"><h4>' + MB.t('Opcionális előretekintés') + '</h4><p style="margin:0">' +
        (en
          ? 'This part is not required for the first weeks. Open it after the core preparation is solid; otherwise return to the foundations first.'
          : 'Ez a rész nem szükséges az első hetekhez. Akkor vedd elő, ha a felkészítő magja már megy; különben előbb térj vissza az alapokhoz.') + '</p></div>';
    }
    if (s.prereq.length) {
      h += '<div class="note-box" style="margin-bottom:14px"><h4>' + MB.t('Mielőtt elkezded') + '</h4><p style="margin:0">' + MB.t('Ez a rész erre épül:') + ' ' +
        s.prereq.map(function (pid) { const p = getSection(pid); return p ? '<a href="#/section/' + p.id + '">' + p.num + ' · ' + MB.esc(MB.sTitle(p)) + '</a>' : pid; }).join(', ') +
        '. ' + MB.t('Ha valamelyik hiányos, előbb azt vedd át.') + '</p></div>';
    }
    h += '<div class="chapter-list">';
    s.chapters.forEach(function (c) {
      h += '<a class="chapter-row' + (isRead(c) ? ' done' : '') + '" href="#/chapter/' + s.id + '/' + c.id + '">' +
        '<span class="n">' + c.num + '</span><div><h3>' + MB.esc(MB.cTitle(c)) + '</h3><p>' + MB.esc(MB.strip(MB.cLead(c))).slice(0, 118) + '…</p></div>' +
        '<span class="state">' + (isRead(c) ? '✓' : '→') + '</span></a>';
    });
    h += '</div>';
    return h;
  }

  /* ---------- formulas ---------- */
  function viewFormulas() {
    document.title = 'Képletgyűjtemény — MatekBázis';
    const cats = [];
    MB.formulas.forEach(function (f) { if (cats.indexOf(f.cat) < 0) cats.push(f.cat); });
    let h = (MB.lang === 'en' ? '<div class="page-head"><div class="kicker">Appendix A</div><h1>Formula sheet</h1><p class="lead">All formulas of the semester in one place, grouped by topic. Searchable — try “chain”, “Moivre” or “partial”. Formula names and notes are in Hungarian; the mathematics is language-independent.</p></div>' : '<div class="page-head"><div class="kicker">Függelék A</div><h1>Képletgyűjtemény</h1><p class="lead">A félév összes képlete egy helyen, témák szerint. Kereshető — írd be például, hogy „lánc”, „Moivre” vagy „parciális”.</p></div>');
    h += '<div class="formula-search"><input class="input" id="formulaSearch" type="search" placeholder="Keresés a képletekben…" style="width:100%"></div>';
    cats.forEach(function (cat) {
      h += '<section class="formula-cat" data-cat="' + MB.esc(cat) + '"><h2>' + MB.esc(cat) + '</h2>';
      MB.formulas.filter(function (f) { return f.cat === cat; }).forEach(function (f) {
        const ref = f.ref ? getChapter(f.ref[0], f.ref[1]) : null;
        h += '<div class="formula-item" data-search="' + MB.esc(MB.fold(f.name + ' ' + cat + ' ' + (f.note || ''))) + '"><div class="name">' + f.name + '</div><div class="fx">$$' + f.latex + '$$</div>' +
          (f.note ? '<div class="note">' + f.note + '</div>' : '') +
          (ref ? '<div class="ref"><a href="#/chapter/' + f.ref[0] + '/' + f.ref[1] + '">→ ' + ref.num + '. ' + MB.esc(ref.title) + '</a></div>' : '') + '</div>';
      });
      h += '</section>';
    });
    return h;
  }

  /* ---------- videos ---------- */
  function viewVideos() {
    document.title = 'Videók — MatekBázis';
    let h = MB.lang === 'en'
      ? '<div class="page-head"><div class="kicker">Appendix B</div><h1>Videos</h1><p class="lead">Selected Hungarian and English videos for the chapters. The player loads on click, so the page stays fast.</p></div>'
      : '<div class="page-head"><div class="kicker">Függelék B</div><h1>Videók</h1><p class="lead">Válogatott magyar és angol videók a fejezetekhez. A lejátszó kattintásra töltődik be, így az oldal gyors marad.</p></div>';
    const cats = [];
    MB.videos.forEach(function (v) { if (cats.indexOf(v.cat) < 0) cats.push(v.cat); });
    cats.forEach(function (cat) {
      h += '<section class="book-section"><h2 class="section-label">' + MB.esc(cat) + '</h2><div class="video-grid">';
      MB.videos.filter(function (v) { return v.cat === cat; }).forEach(function (v) {
        h += '<div class="video-card"><div class="video-frame"><button class="video-play" data-action="embed"' + (v.id ? ' data-embed="' + v.id + '"' : ' data-embed-list="' + v.list + '"') + '><span class="circle">' + MB.icon('play') + '</span><span>' + MB.esc(v.title) + '</span></button></div>' +
          '<div class="video-info"><span class="tag">' + MB.esc(v.channel) + '</span><h3>' + MB.esc(v.title) + '</h3><p>' + MB.esc(v.note || '') + '</p>' +
          (v.search ? '<p style="margin-top:6px"><a href="https://www.youtube.com/results?search_query=' + encodeURIComponent(v.search) + '" target="_blank" rel="noopener">Több videó a témában →</a></p>' : '') + '</div></div>';
      });
      h += '</div></section>';
    });

    h += '<section class="book-section"><h2 class="section-label">Helyi előadásfelvételek <span class="sub">az Info.zip-ből</span></h2>';
    h += '<div class="note-box" style="margin-bottom:10px"><h4>Analízis 1 · 2020-as félév</h4><p style="margin:0 0 8px">A teljes, kb. 1 GB-os előadásvideók a <code>D:\\[NEW DONLOADS]\\Info.zip → Info/1. félév/Analízis 1/Előadások/2020</code> mappában vannak. A fájlnevek alapján azonosítható, melyik óra melyik téma:</p><div class="archive">' +
      ['2020-09-08 komplex aritmetika', '2020-09-17 R teljessége, sorozat határértéke', '2020-09-22 limesz egyértelműsége, példák', '2020-09-29 rendőr elv, nagyságrend, rekurzív sorozatok', '2020-10-06 (1+x/n)^n, Cauchy sorozat', '2020-10-08 függvények, valósban valós határérték', '2020-10-13 függvény határérték, átviteli elv', '2020-10-15 példák, műveletek határértékkel, folytonosság', '2020-10-20 szakadások, Bolzano, Weierstrass', '2020-10-22 topológiai alapok R-en, derivált', '2020-10-27 lineáris approximáció, deriválási szabályok', '2020-10-29 inverz fgv deriváltja, exp, log, arc függvények', '2020-11-03 hiperbolikus függvények, szélsőérték, Rolle-tétel', '2020-11-05 Lagrange-tétel, integrálszámítás 1. főtétel, L’Hospital', '2020-11-10 függvényvizsgálat, monotonitás, szélsőértékek']
        .map(function (x) { return '<div class="archive-row">' + MB.icon('video') + '<span>' + MB.esc(x) + '.mkv</span></div>'; }).join('') +
      '</div></div>';
    h += '<div class="note-box"><h4>Hogyan nézd?</h4><p style="margin:0">Egy videó akkor hasznos, ha közben papír van előtted. Előbb olvasd el a fejezet „Miért?” blokkját, utána nézd meg a videót, végül oldd meg a fejezet első három feladatát. A passzív videónézés nem hoz eredményt.</p></div></section>';
    return h;
  }

  /* ---------- resources ---------- */
  const RES = [
    { kind: 'Hivatalos jegyzet', title: 'Matematika 1. — elmélet', file: 'matematika1.pdf', desc: 'Fritz–Kónya–Pataki–Tasnádi: definíciók, tételek, bizonyítások.' },
    { kind: 'Hivatalos jegyzet', title: 'Matematika 1. — gyakorlatok', file: 'matematika1_gyakorlat.pdf', desc: 'A gyakorlatanyag és a megoldott példatár.' },
    { kind: 'Bulk jegyzet', title: 'Analízis 1 jegyzet', file: 'Analízis 1 Jegyzet.pdf', desc: 'Sűrített, gyakorlatközpontú jegyzet a ZH-khoz.' },
    { kind: 'Példatár', title: 'Komplex számok példatár', file: 'KomplexSzamokPeldatar.pdf', desc: 'Komplex algebra, trigonometrikus alak, gyökök.' },
    { kind: 'Alapozás', title: 'Kecsap példatár', file: 'kecsap_peldatar.pdf', desc: 'Bevezető matematika (opcionális) feladatai.' },
    { kind: 'Analízis 2', title: 'Analízis 2 jegyzet', file: 'Analízis 2 Jegyzet.pdf', desc: 'Sorok, többváltozós analízis, integrálok.' },
    { kind: 'Analízis 2', title: 'Analízis 2 ZH + vizsga', file: 'Analízis 2 ZH, Vizsga Ultimate.pdf', desc: 'Kidolgozott ZH- és vizsgaanyag.' },
    { kind: 'Saját jegyzet', title: 'Matematika Túlélőcsomag', file: 'BME VIK Matek Felkészítő — Az első félév alapjai.pdf', desc: 'A saját átfogó felkészítő jegyzeted.' },
    { kind: 'Saját jegyzet', title: 'Matematika alapozó (javított)', file: 'Matematika alapozó az első félévhez – BME VIK mérnökinformatikus.pdf', desc: 'Bővített változat, megoldókulccsal.' },
    { kind: 'Saját jegyzet', title: 'Matematika alapozó (bővített)', file: 'Matematika alapozó az első félévhez – BME VIK mérnökinformatikus (1).pdf', desc: 'A legrészletesebb alapozó változat.' }
  ];
  const EXAMS = [
    ['ZH1 2026 A', 'ZH1_2026_A_feladat.pdf'], ['ZH1 2026 B', 'ZH1_2026_B_feladat.pdf'], ['ZH1 2026 megoldás', 'ZH1_2026_megoldas.pdf'],
    ['PZH1 2026 A', 'PZH1_2026_A_feladat.pdf'], ['PZH1 2026 B', 'PZH1_2026_B_feladat.pdf'], ['PZH1 2026 megoldás', 'PZH1_2026_megoldas.pdf'],
    ['ZH2 2026 A', 'ZH2_2026_A_feladat.pdf'], ['ZH2 2026 B', 'ZH2_2026_B_feladat.pdf'], ['ZH2 2026 A megoldás', 'ZH2_2026_A_megoldas.pdf'], ['ZH2 2026 B megoldás', 'ZH2_2026_B_megoldas.pdf'],
    ['PZH2 2026 A', 'PZH2_2026_A_feladat.pdf'], ['PZH2 2026 A megoldás', 'PZH2_2026_A_megoldas.pdf'],
    ['ZH1 2025 A', 'ZH1_2025_A_feladat.pdf'], ['ZH1 2025 B', 'ZH1_2025_B_feladat.pdf'], ['ZH1 2025 megoldás', 'ZH1_2025_megoldas.pdf'],
    ['ZH2 2025 A', 'ZH2_2025_A_feladat.pdf'], ['ZH2 2025 B', 'ZH2_2025_B_feladat.pdf'], ['ZH2 2025 megoldás', 'ZH2_2025_megoldas.pdf'],
    ['Vizsga 2025/1 teszt', 'Vizsga_2025_1_teszt.pdf'], ['Vizsga 2025/1 A kifejtés', 'Vizsga_2025_1_A_kifejt.pdf'], ['Vizsga 2025/1 B kifejtés', 'Vizsga_2025_1_B_kifejt.pdf'],
    ['Vizsga 2025/2 teszt', 'Vizsga_2025_2_teszt.pdf'], ['Vizsga 2025/2 A kifejtés', 'Vizsga_2025_2_A_kifejt.pdf'], ['Vizsga 2025/2 B kifejtés', 'Vizsga_2025_2_B_kifejt.pdf'],
    ['Vizsga 2025/3 teszt', 'Vizsga_2025_3_teszt.pdf'], ['Vizsga 2025/3 A kifejtés', 'Vizsga_2025_3_A_kifejt.pdf'], ['Vizsga 2025/3 B kifejtés', 'Vizsga_2025_3_B_kifejt.pdf'],
    ['Vizsga 2025/4 teszt', 'Vizsga_2025_4_teszt.pdf'], ['Vizsga 2025/4 A kifejtés', 'Vizsga_2025_4_A_kifejt.pdf'], ['Vizsga 2025/4 B kifejtés', 'Vizsga_2025_4_B_kifejt.pdf']
  ];
  function viewResources() {
    document.title = 'Forrásanyagok — MatekBázis';
    let h = MB.lang === 'en'
      ? '<div class="page-head"><div class="kicker">Appendix C</div><h1>Resources</h1><p class="lead">The notes, exercise books and original midterm/exam papers behind this book. The PDFs open locally.</p></div>'
      : '<div class="page-head"><div class="kicker">Függelék C</div><h1>Forrásanyagok</h1><p class="lead">A könyv alapjául szolgáló jegyzetek, példatárak és az eredeti zárthelyi- és vizsgafeladatsorok. A PDF-ek helyben megnyílnak.</p></div>';
    h += '<h2 class="section-label">Jegyzetek és példatárak</h2><div class="res-grid">';
    RES.forEach(function (r) {
      h += '<a class="res-card" href="resources/' + encodeURIComponent(r.file) + '" target="_blank" rel="noopener"><span class="ico">' + MB.icon('file') + '</span><div><span class="kind">' + MB.esc(r.kind) + '</span><h3>' + MB.esc(r.title) + '</h3><p>' + MB.esc(r.desc) + '</p></div></a>';
    });
    h += '</div>';
    h += '<h2 class="section-label" style="margin-top:34px">Zárthelyik és vizsgák <span class="sub">2025–2026</span></h2><div class="res-grid">';
    EXAMS.forEach(function (e) {
      h += '<a class="res-card" href="resources/' + encodeURIComponent(e[1]) + '" target="_blank" rel="noopener"><span class="ico">' + MB.icon('file') + '</span><div><span class="kind">PDF</span><h3>' + MB.esc(e[0]) + '</h3><p>Eredeti feladatsor / megoldás</p></div></a>';
    });
    h += '</div>';
    h += '<div class="note-box" style="margin-top:26px"><h4>Honnan jönnek ezek?</h4><p style="margin:0">A fájlok a <code>D:\\[NEW DONLOADS]\\Info.zip</code> első és második féléves anyagaiból, valamint a saját felkészítő PDF-jeidből származnak. A vizsgák anyaga és a pontozás a 2025–2026-os tanév tanszéki tájékoztatója szerint szerepel — mindig ellenőrizd az aktuális követelményrendszert a tárgy honlapján.</p></div>';
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
      setCrumbs([{ label: s.num + '. ' + MB.sTitle(s) }]);
    } else if (r.name === 'chapter') {
      const s = getSection(r.section), c = s && getChapter(r.section, r.chapter);
      if (!s || !c) { location.hash = '#/'; return; }
      html = chapterView(s, c);
      setCrumbs([{ label: s.num + '. ' + MB.sTitle(s), href: '#/section/' + s.id }, { label: c.num + '. ' + MB.cTitle(c) }]);
    } else if (r.name === 'formulas') {
      html = viewFormulas();
      setCrumbs([{ label: 'Képletgyűjtemény' }]);
    } else if (r.name === 'videos') {
      html = viewVideos();
      setCrumbs([{ label: 'Videók' }]);
    } else if (r.name === 'resources') {
      html = viewResources();
      setCrumbs([{ label: 'Forrásanyagok' }]);
    } else if (r.name === 'practice') {
      html = viewPractice(r.cat);
      setCrumbs([{ label: 'Feladatbank' }]);
    } else if (r.name === 'exam') {
      html = viewExam(r.mode);
      setCrumbs([{ label: 'ZH / vizsga' }]);
    } else if (r.name === 'test') {
      const s = getSection(r.section), c = s && getChapter(r.section, r.chapter);
      if (!s || !c) { location.hash = '#/'; return; }
      html = viewTest(s, c);
      setCrumbs([{ label: s.num + '. ' + MB.sTitle(s), href: '#/section/' + s.id }, { label: c.num + '. ' + MB.cTitle(c), href: '#/chapter/' + s.id + '/' + c.id }, { label: 'Teszt' }]);
    }
    main.innerHTML = MB.protectMath(html);
    updateNav(r);
    if (MB.mountDemos) MB.mountDemos(main);
    renderMath(main);
    MB.translateDOM(main);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    closeSidebar();
    if (r.name === 'formulas') initFormulaSearch();
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
      fb.className = 'feedback show ' + (ok ? 'ok' : 'bad');
      fb.textContent = ok ? (MB.lang === 'en' ? 'Correct. The answer is not shown here — use “Show answer” if you want to compare.' : 'Helyes eredmény. Az eredményt itt nem áruljuk el — használd a „Megoldás mutatása” gombot, ha össze akarod vetni.') : (MB.lang === 'en' ? 'Not correct. Check your transformation, or ask for a hint.' : 'Nem stimmel. Ellenőrizd az átalakítást, vagy kérj segítséget.');
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
      fb.className = 'feedback show ' + (ok ? 'ok' : 'bad');
      fb.textContent = ok ? 'Helyes válasz.' : 'Nem ez a helyes válasz. Gondold végig újra.';
      if (ok && c) { markDone(c, i, true); ex.classList.add('done'); updateNav(parseRoute()); }
      return;
    }
    const self = t.closest('[data-self]');
    if (self) {
      const ex = self.closest('.ex');
      const c = chapterFromEx(ex);
      if (c) { markDone(c, +ex.dataset.ex, self.dataset.self === '1'); updateNav(parseRoute()); }
      self.closest('.self-check').innerHTML = self.dataset.self === '1'
        ? '<span style="color:var(--ok);font-family:var(--font-ui);font-size:.78rem">Elmentve: megvan.</span>'
        : '<span style="color:var(--muted);font-family:var(--font-ui);font-size:.78rem">Rendben, nézd át a megoldást, majd térj vissza rá.</span>';
      return;
    }
    const read = t.closest('[data-read]');
    if (read) {
      const r = parseRoute();
      const c = getChapter(r.section, r.chapter);
      if (c) {
        markRead(c, read.dataset.read === '1');
        render();
        MB.toast(read.dataset.read === '1' ? 'Fejezet elolvasva.' : 'Jelölés visszavonva.');
      }
      return;
    }
    const embed = t.closest('[data-action="embed"]');
    if (embed) {
      const id = embed.dataset.embed;
      const list = embed.dataset.embedList;
      const frame = embed.closest('.video-frame');
      const src = id ? 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0' : 'https://www.youtube-nocookie.com/embed/videoseries?list=' + list + '&autoplay=1&rel=0';
      frame.innerHTML = '<iframe src="' + src + '" title="Videó" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
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
    save(); applyLang(); render();
  });

  window.addEventListener('hashchange', render);

  /* ---------- search ---------- */
  const searchIndex = [];
  MB.sections.forEach(function (s) {
    searchIndex.push({ kind: 'rész', title: s.title, sub: s.subtitle, href: '#/section/' + s.id, text: MB.fold(s.title + ' ' + s.subtitle + ' ' + s.intro) });
    s.chapters.forEach(function (c) {
      searchIndex.push({ kind: 'fejezet', title: c.num + '. ' + c.title, sub: s.title, href: '#/chapter/' + s.id + '/' + c.id, text: MB.fold(c.title + ' ' + MB.strip(c.lead) + ' ' + (c.theory || []).map(function (t) { return MB.strip(t.title || '') + ' ' + MB.strip(t.body || '') + ' ' + (t.note || ''); }).join(' ')) });
    });
  });
  MB.formulas.forEach(function (f) {
    searchIndex.push({ kind: 'képlet', title: f.name, sub: f.cat, href: f.ref ? '#/chapter/' + f.ref[0] + '/' + f.ref[1] : '#/formulas', text: MB.fold(f.name + ' ' + f.cat + ' ' + (f.note || '')) });
  });
  MB.videos.forEach(function (v) {
    searchIndex.push({ kind: 'videó', title: v.title, sub: v.channel, href: '#/videos', text: MB.fold(v.title + ' ' + v.channel + ' ' + (v.note || '') + ' ' + v.cat) });
  });

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
      return terms.every(function (t) { return it.text.indexOf(t) >= 0; });
    }).slice(0, 40);
    sel = 0;
    if (!current.length) {
      results.innerHTML = '<div class="search-empty">Nincs találat. Próbálj rövidebb kulcsszót (pl. „lánc”, „sorozat”, „Moivre”).</div>';
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
