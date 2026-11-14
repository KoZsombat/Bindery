/* Practice bank, chapter tests, ZH/vizsga simulator */
(function () {
  const MB = window.MB;
  const esc = MB.esc;

  /* =========================================================
     PRACTICE — 50 generated exercises per category (10/10/30)
     ========================================================= */
  MB.practiceSeeds = MB.practiceSeeds || {};
  MB.practiceFilter = MB.practiceFilter || '0';
  const bankCache = {};

  function bank(catId) {
    const seed = MB.practiceSeeds[catId] || (MB.practiceSeeds[catId] = 1);
    const key = catId + ':' + seed;
    if (!bankCache[key]) bankCache[key] = MB.generateBank(catId, seed * 7919 + 13);
    return bankCache[key];
  }

  function genItemHTML(it, idx, catId) {
    const type = it.type || 'expr';
    let controls = '';
    if (type === 'choice') {
      controls = '<div class="answer-row">' + (it.choices || []).map(function (ch, j) {
        return '<button class="btn sm" data-choice="' + j + '">' + ch + '</button>';
      }).join('') + '</div>';
    } else if (type === 'proof' || type === 'open') {
      controls = '<div class="self-check"><button class="btn sm" data-self="1">Megvan</button></div>';
    } else {
      controls = '<div class="answer-row"><input class="answer-input" type="text" placeholder="Eredmény…" aria-label="Válasz">' +
        '<button class="btn sm check" data-check>Ellenőrzés</button>' +
        (it.hint ? '<button class="btn sm hint-btn" data-hint>Segítség</button>' : '') + '</div>';
    }
    const ans = it.a == null ? '' : esc(typeof it.a === 'object' ? JSON.stringify(it.a) : it.a);
    const alt = it.alt ? esc(JSON.stringify(it.alt)) : '';
    return '<div class="ex gen-item" data-gencat="' + catId + '" data-genidx="' + idx + '" data-level="' + it.level + '" data-ans="' + ans + '" data-type="' + type + '" data-alt="' + alt + '">' +
      '<div class="ex-top"><div class="ex-idx">' + String(idx + 1).padStart(3, '0') + '</div><div class="ex-body"><div class="ex-q">' + it.q +
      '<span class="ex-level" title="Nehézség">' + [1, 2, 3].map(function (n) { return '<i class="' + (n <= it.level ? 'on' : '') + '"></i>'; }).join('') + '</span></div></div>' +
      '<button class="icon-btn reroll" data-reroll="' + catId + ':' + idx + '" title="Új feladat" aria-label="Új feladat">' + MB.icon('refresh') + '</button></div>' +
      '<div class="ex-bottom">' + controls +
      (it.hint ? '<div class="hint-text">' + MB.icon('bulb') + ' ' + it.hint + '</div>' : '') +
      '<div class="feedback"></div>' +
      (it.sol ? '<div style="margin-top:8px"><button class="btn sm sol-btn" data-sol>Megoldás</button></div><div class="solution"><b>Megoldás.</b> ' + it.sol + '</div>' : '') +
      '</div></div>';
  }

  MB.practiceView = function (catId) {
    const cats = MB.genCats;
    if (!catId) {
      let h = MB.lang === 'en'
        ? '<div class="page-head"><div class="kicker">Practice bank</div><h1>Practice, with endless supply</h1><p class="lead">Every category has <b>50 exercises</b>: <b>10 easy, 10 medium, 30 hard</b> — a <b>1 : 1 : 3</b> ratio. “New set” generates fresh variants from the same topic. Exercise texts are in Hungarian; the formulas and checker are language-independent.</p></div>'
        : '<div class="page-head"><div class="kicker">Feladatbank</div><h1>Gyakorlás, végtelen utánpótlással</h1><p class="lead">Minden kategóriában <b>50 feladat</b> van: <b>10 könnyű, 10 közepes, 30 nehéz</b> — arányuk <b>1 : 1 : 3</b>. Az „Új feladatsor” gomb új változatokat generál ugyanabból a témából.</p></div>';
      h += '<div class="practice-grid">';
      cats.forEach(function (c) {
        h += '<a class="practice-card" href="#/practice/' + c.id + '"><span class="kind">' + MB.icon(c.icon) + ' 50 FELADAT</span><h3>' + esc(c.title) + '</h3><p>' + esc(c.desc) + '</p>' +
          '<div class="gen-meta"><span class="diff-badge">1 : 1 : 3</span><span>10 / 10 / 30</span><span class="go">Gyakorlás →</span></div></a>';
      });
      h += '</div>';
      h += '<div class="note-box" style="margin-top:22px"><h4>Hogyan működik a generálás?</h4><p style="margin:0">A feladatok nem véletlenszerű tippek: minden kategóriában valódi számítási sablonokból készülnek, és a nehézségi szinthez igazodnak. Az „Új feladatsor” új magot használ, így ugyanaz a téma más számokkal jön elő. Az egyes feladatok mellett is van újragenerálás.</p></div>';
      return h;
    }
    const cat = cats.find(function (c) { return c.id === catId; });
    if (!cat) { location.hash = '#/practice'; return ''; }
    const items = bank(catId);
    const seed = MB.practiceSeeds[catId];
    let h = '<div class="page-head"><div class="kicker">Feladatbank · ' + esc(cat.title) + '</div><h1>' + esc(cat.title) + '</h1><p class="lead">' + esc(cat.desc) + '</p>' +
      '<div class="chapter-meta"><span class="meta-pill"><b>50</b> feladat</span><span class="meta-pill"><b>10</b> könnyű</span><span class="meta-pill"><b>10</b> közepes</span><span class="meta-pill"><b>30</b> nehéz</span><span class="meta-pill">arány <b>1 : 1 : 3</b></span><span class="meta-pill">mag <b>#' + seed + '</b></span></div></div>';
    h += '<div class="toolbar"><div class="seg" id="diffFilter">' +
      '<button data-filter="0" class="' + (MB.practiceFilter === '0' ? 'active' : '') + '">Mind (50)</button>' +
      '<button data-filter="1" class="' + (MB.practiceFilter === '1' ? 'active' : '') + '">Könnyű (10)</button>' +
      '<button data-filter="2" class="' + (MB.practiceFilter === '2' ? 'active' : '') + '">Közepes (10)</button>' +
      '<button data-filter="3" class="' + (MB.practiceFilter === '3' ? 'active' : '') + '">Nehéz (30)</button></div>' +
      '<button class="btn navy" data-reroll-all="' + catId + '">' + MB.icon('refresh') + ' Új feladatsor</button>' +
      '<a class="btn" href="#/practice">← Kategóriák</a></div>';
    h += '<div class="gen-list" id="genList">';
    items.forEach(function (it, idx) { h += genItemHTML(it, idx, catId); });
    h += '</div>';
    setTimeout(applyPracticeFilter, 0);
    return h;
  };

  function applyPracticeFilter() {
    const f = MB.practiceFilter;
    MB.qsa('#genList .gen-item').forEach(function (el) {
      el.style.display = f === '0' || el.dataset.level === f ? '' : 'none';
    });
  }
  MB.applyPracticeFilter = applyPracticeFilter;

  /* =========================================================
     RUNNER — shared by chapter tests and exams
     ========================================================= */
  MB.runner = null;

  function runnerHTML(title, subtitle, minutes) {
    return '<div class="exam-shell" id="runnerShell">' +
      '<div class="exam-bar"><div><div class="title">' + esc(title) + '</div><div style="font-size:.7rem;color:#b9c9da">' + esc(subtitle) + '</div></div>' +
      '<div class="exam-progress"><div class="bar"><i id="runBar" style="width:0%"></i></div></div>' +
      '<div class="exam-timer" id="runTimer">' + fmtTime(minutes * 60) + '</div></div>' +
      '<div class="exam-body" id="runBody"></div></div>';
  }

  function fmtTime(s) {
    s = Math.max(0, s | 0);
    const m = Math.floor(s / 60), r = s % 60;
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  }

  MB.initRunner = function () {
    const R = MB.runner;
    if (!R || !document.getElementById('runBody')) return;
    R.idx = 0;
    renderRunnerQuestion();
    clearInterval(R.interval);
    R.interval = setInterval(function () {
      R.left--;
      const t = document.getElementById('runTimer');
      if (t) {
        t.textContent = fmtTime(R.left);
        t.classList.toggle('low', R.left < 300);
      }
      if (R.left <= 0) { clearInterval(R.interval); submitRunner(); }
    }, 1000);
  };

  MB.stopRunner = function () {
    if (MB.runner && MB.runner.interval) clearInterval(MB.runner.interval);
    MB.runner = null;
  };

  function renderRunnerQuestion() {
    const R = MB.runner;
    const it = R.items[R.idx];
    const body = document.getElementById('runBody');
    if (!body || !it) return;
    const ans = R.answers[R.idx];
    let input;
    if ((it.type || 'expr') === 'choice') {
      input = '<div class="answer-row">' + (it.choices || []).map(function (ch, j) {
        return '<button class="btn ' + (String(ans) === String(j) ? 'navy' : '') + '" data-run-choice="' + j + '">' + ch + '</button>';
      }).join('') + '</div>';
    } else {
      input = '<div class="answer-row"><input class="answer-input" id="runAnswer" type="text" placeholder="Írd be a választ…" value="' + esc(ans || '') + '">' +
        '<button class="btn sm" data-run-save>Mentés</button></div>';
    }
    let nav = '<div class="exam-nav">';
    R.items.forEach(function (_, i) {
      nav += '<button data-run-go="' + i + '" class="' + (i === R.idx ? 'cur' : '') + (R.answers[i] != null && R.answers[i] !== '' ? ' ans' : '') + '">' + (i + 1) + '</button>';
    });
    nav += '</div>';
    body.innerHTML = MB.protectMath('<div style="font-family:var(--font-ui);font-size:.7rem;color:var(--muted);margin-bottom:8px">' + (R.idx + 1) + ' / ' + R.items.length + ' kérdés · ' + (it.level === 1 ? 'könnyű' : it.level === 2 ? 'közepes' : 'nehéz') + '</div>' +
      '<div class="exam-q">' + it.q + '</div>' + input +
      '<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap"><button class="btn" data-run-prev' + (R.idx === 0 ? ' disabled' : '') + '>← Előző</button>' +
      '<button class="btn navy" data-run-next' + (R.idx === R.items.length - 1 ? ' disabled' : '') + '>Következő →</button>' +
      '<button class="btn primary" data-run-submit style="margin-left:auto">Beadás</button></div>' + nav);
    const bar = document.getElementById('runBar');
    if (bar) bar.style.width = Math.round((Object.keys(R.answers).filter(function (k) { return R.answers[k] !== '' && R.answers[k] != null; }).length / R.items.length) * 100) + '%';
    MB.renderMath(body);
    const inp = document.getElementById('runAnswer');
    if (inp) {
      inp.focus();
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); saveCurrent(); go(R.idx + 1); }
      });
    }
  }

  function saveCurrent() {
    const R = MB.runner, inp = document.getElementById('runAnswer');
    if (R && inp) R.answers[R.idx] = inp.value;
  }
  function go(i) {
    if (!MB.runner) return;
    saveCurrent();
    if (i < 0 || i >= MB.runner.items.length) return;
    MB.runner.idx = i;
    renderRunnerQuestion();
  }

  function submitRunner() {
    const R = MB.runner;
    if (!R) return;
    saveCurrent();
    clearInterval(R.interval);
    let correct = 0;
    const review = R.items.map(function (it, i) {
      const ok = MB.check(R.answers[i], it.a, it.type || 'expr', it.alt);
      if (ok) correct++;
      return { it: it, ok: ok, user: R.answers[i] };
    });
    const pct = Math.round(correct / R.items.length * 100);
    const body = document.getElementById('runBody');
    if (!body) return;
    let h = '<div class="exam-result"><div class="score-ring" style="--p:' + pct + '"><span>' + pct + '%</span></div>' +
      '<h2 style="text-align:center;margin:0 0 4px">' + correct + ' / ' + R.items.length + ' helyes</h2>' +
      '<p style="text-align:center;color:var(--muted);margin-bottom:18px">' + esc(R.title) + '</p>';
    if (R.kind === 'exam') {
      const grade = pct >= 80 ? 'jeles (5)' : pct >= 65 ? 'jó (4)' : pct >= 55 ? 'közepes (3)' : pct >= 40 ? 'elégséges (2)' : 'elégtelen (1)';
      h += '<p style="text-align:center;font-family:var(--font-ui);font-size:.85rem">Jegyhatárok (40 / 55 / 65 / 80%): <b>' + grade + '</b></p>';
    }
    h += '<div style="margin:20px 0 8px;font-family:var(--font-ui);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">Kiértékelés</div>';
    review.forEach(function (r, i) {
      h += '<div class="review-row"><span class="' + (r.ok ? 'ok' : 'no') + '">' + (r.ok ? '✓' : '✗') + '</span><div><div>' + (i + 1) + '. ' + r.it.q + '</div>' +
        '<div style="font-family:var(--font-ui);font-size:.76rem;color:var(--muted);margin-top:4px">Helyes: <b style="color:var(--ok)">' + esc(String(r.it.a)) + '</b>' + (r.ok ? '' : ' · A te válaszod: ' + esc(String(r.user || '—'))) + '</div>' +
        (r.it.sol ? '<details style="margin-top:4px"><summary style="cursor:pointer;font-size:.76rem;color:var(--bme-blue)">Megoldás</summary><div style="font-size:.8rem;color:var(--ink-2);margin-top:4px">' + r.it.sol + '</div></details>' : '') + '</div></div>';
    });
    h += '<div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap"><button class="btn navy" data-run-again>Újra</button><a class="btn" href="#/">Kezdőlap</a></div></div>';
    body.innerHTML = MB.protectMath(h);
    MB.renderMath(body);
    const tests = MB.app.state.tests;
    tests[R.title + '@' + Date.now()] = { pct: pct, correct: correct, total: R.items.length, date: new Date().toISOString() };
    MB.app.save();
  }

  /* runner controls */
  document.addEventListener('click', function (e) {
    const t = e.target;
    const goBtn = t.closest('[data-run-go]');
    if (goBtn) { go(+goBtn.dataset.runGo); return; }
    if (t.closest('[data-run-prev]')) { go((MB.runner ? MB.runner.idx : 0) - 1); return; }
    if (t.closest('[data-run-next]')) { go((MB.runner ? MB.runner.idx : 0) + 1); return; }
    if (t.closest('[data-run-save]')) { saveCurrent(); MB.toast('Válasz mentve.'); renderRunnerQuestion(); return; }
    if (t.closest('[data-run-submit]')) { submitRunner(); return; }
    if (t.closest('[data-run-again]')) { location.reload(); return; }
    const ch = t.closest('[data-run-choice]');
    if (ch && MB.runner) {
      MB.runner.answers[MB.runner.idx] = ch.dataset.runChoice;
      renderRunnerQuestion();
      return;
    }
  });

  /* =========================================================
     CHAPTER TEST
     ========================================================= */
  MB.testView = function (s, c) {
    const items = [];
    const own = (c.exercises || []).filter(function (q) { return q.type !== 'proof' && q.type !== 'open' && q.a != null; });
    own.forEach(function (q) { items.push({ q: q.q, a: q.a, type: q.type || 'expr', alt: q.alt, sol: q.sol, level: q.level || 1, source: c }); });
    const map = {
      alapok: ['algebra', 'equations', 'functions', 'trig'],
      logika: ['logic'], komplex: ['complex'], sorozatok: ['sequences'], hatarertek: ['limits'],
      derivalas: ['derivatives'], integralas: ['integrals'], sorok: ['series'], taylor: ['taylor'],
      tobbvaltozos: ['multivar'], 'diff-fourier': ['sequences', 'series'], linearis: ['linalg'], diszkret: ['discrete']
    };
    const cats = map[s.id] || [MB.genCats[0].id];
    let guard = 0;
    while (items.length < 8 && guard++ < 20) {
      const cat = MB.generateOne(cats[items.length % cats.length], items.length < 3 ? 1 : items.length < 5 ? 2 : 3, Date.now() + items.length * 17 + guard);
      items.push({ q: cat.q, a: cat.a, type: cat.type, alt: cat.alt, sol: cat.sol, level: cat.level });
    }
    MB.runner = { items: items.slice(0, 8), idx: 0, answers: {}, left: 10 * 60, kind: 'test', title: 'Fejezet teszt · ' + c.num + '. ' + c.title, chapter: c };
    setTimeout(function () { MB.initRunner(); }, 0);
    return '<div class="page-head"><div class="kicker">Fejezet teszt · ' + esc(c.num) + '</div><h1>' + esc(c.title) + '</h1><p class="lead">8 kérdés · 10 perc · a fejezet könnyű, közepes és nehéz feladataiból. A végén pontszám és részletes megoldás.</p></div>' + runnerHTML('Fejezet teszt · ' + c.title, c.num + '. ' + c.title + ' · 8 kérdés · 10 perc', 10);
  };

  /* =========================================================
     ZH / VIZSGA SIMULATOR
     ========================================================= */
  MB.examView = function (mode) {
    if (!mode) {
      let h = MB.lang === 'en'
        ? '<div class="page-head"><div class="kicker">Assessment</div><h1>Midterm and exam simulator</h1><p class="lead">Timed, mixed-difficulty papers modelled on the 2025–2026 requirements. After submitting you get a score, a grade estimate and full solutions. Exercise texts are in Hungarian.</p></div>'
        : '<div class="page-head"><div class="kicker">Számonkérés</div><h1>ZH- és vizsgaszimulátor</h1><p class="lead">Időlimites, vegyes nehézségű feladatsorok a 2025–2026-os követelmények szerint. A pontszám után jegybecslést és teljes megoldást kapsz.</p></div>';
      h += '<div class="exam-strip">' +
        examCard('ZH1', 'Komplex számok, sorozatok, határérték, folytonosság', '10 kérdés · 75 perc · 3 könnyű / 3 közepes / 4 nehéz', 'zh1') +
        examCard('ZH2', 'Deriválás és alkalmazásai', '10 kérdés · 75 perc · 3 könnyű / 3 közepes / 4 nehéz', 'zh2') +
        examCard('Vizsga', 'A teljes félév, kiemelt integrálszámítás', '12 kérdés · 90 perc · 3 könnyű / 3 közepes / 6 nehéz', 'vizsga') +
        examCard('Gyors', '5 perces bemelegítés', '6 kérdés · 5 perc · vegyes', 'quick') + '</div>';
      h += '<div class="note-box" style="margin-top:20px"><h4>Fontos a valódi ZH-hoz</h4><p style="margin:0">A szimulátor a feladattípusokat és az időnyomást gyakoroltatja, nem helyettesíti az eredeti feladatsorokat. A ZH1-en definíció és ε–N bizonyítás is szerepel; a vizsgán az integrálás külön 40%-ot ér. A 2025–2026-os eredeti feladatsorok a <a href="#/resources">Forrásanyagok</a> oldalon vannak.</p></div>';
      return h;
    }
    const cfg = {
      zh1: { title: 'ZH1 szimulátor', cats: ['complex', 'sequences', 'limits'], n: 10, min: 75 },
      zh2: { title: 'ZH2 szimulátor', cats: ['derivatives', 'functions', 'limits'], n: 10, min: 75 },
      vizsga: { title: 'Vizsga szimulátor', cats: ['complex', 'sequences', 'limits', 'derivatives', 'integrals', 'series'], n: 12, min: 90 },
      quick: { title: 'Gyors gyakorlás', cats: ['algebra', 'trig', 'complex', 'limits', 'derivatives', 'integrals'], n: 6, min: 5 }
    }[mode];
    if (!cfg) { location.hash = '#/exam'; return ''; }
    const items = [];
    for (let i = 0; i < cfg.n; i++) {
      const level = i < 3 ? 1 : i < 6 ? 2 : 3;
      const cat = MB.generateOne(cfg.cats[i % cfg.cats.length], level, Date.now() + i * 104729 + mode.length);
      items.push({ q: cat.q, a: cat.a, type: cat.type, alt: cat.alt, sol: cat.sol, level: level });
    }
    MB.runner = { items: items, idx: 0, answers: {}, left: cfg.min * 60, kind: 'exam', title: cfg.title };
    setTimeout(function () { MB.initRunner(); }, 0);
    return '<div class="page-head"><div class="kicker">Számonkérés · szimulátor</div><h1>' + cfg.title + '</h1><p class="lead">' + cfg.n + ' kérdés · ' + cfg.min + ' perc. A válaszokat a „Mentés” gombbal vagy a kérdésváltással rögzítheted. Lejáratkor automatikus beadás.</p></div>' +
      runnerHTML(cfg.title, cfg.n + ' kérdés · ' + cfg.min + ' perc · jegyhatárok 40/55/65/80%', cfg.min);
  };

  function examCard(tag, title, desc, mode) {
    return '<div class="exam-card"><span class="tag">' + esc(tag) + '</span><h3>' + esc(title) + '</h3><p>' + esc(desc) + '</p><a class="btn sm navy" href="#/exam/' + mode + '">Indítás</a></div>';
  }

  /* =========================================================
     PRACTICE interactions
     ========================================================= */
  document.addEventListener('click', function (e) {
    const t = e.target;
    const filter = t.closest('[data-filter]');
    if (filter) {
      MB.practiceFilter = filter.dataset.filter;
      MB.qsa('#diffFilter button').forEach(function (b) { b.classList.toggle('active', b.dataset.filter === MB.practiceFilter); });
      applyPracticeFilter();
      return;
    }
    const all = t.closest('[data-reroll-all]');
    if (all) {
      const cat = all.dataset.rerollAll;
      MB.practiceSeeds[cat] = (MB.practiceSeeds[cat] || 1) + 1;
      for (const k in bankCache) if (k.indexOf(cat + ':') === 0) delete bankCache[k];
      if (MB.app && MB.app.render) MB.app.render();
      MB.toast('Új feladatsor generálva.');
      return;
    }
    const re = t.closest('[data-reroll]');
    if (re) {
      const parts = re.dataset.reroll.split(':');
      const cat = parts[0], idx = +parts[1];
      const level = idx < 10 ? 1 : idx < 20 ? 2 : 3;
      const it = MB.generateOne(cat, level, Date.now() + idx * 31);
      it.level = level;
      const wrapper = re.closest('.gen-item');
      if (wrapper) wrapper.outerHTML = MB.protectMath(genItemHTML(it, idx, cat));
      return;
    }
  });

  /* clear runner interval on internal navigation */
  window.addEventListener('hashchange', function () { if (MB.stopRunner) MB.stopRunner(); });
})();
