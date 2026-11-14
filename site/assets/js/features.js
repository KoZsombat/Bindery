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

  function catTitle(c) { return MB.lang === 'en' && c.titleEn ? c.titleEn : c.title; }
  function catDesc(c) { return MB.lang === 'en' && c.descEn ? c.descEn : c.desc; }

  function bank(catId) {
    const seed = MB.practiceSeeds[catId] || (MB.practiceSeeds[catId] = 1);
    const key = catId + ':' + seed;
    if (!bankCache[key]) bankCache[key] = MB.generateBank(catId, seed * 7919 + 13);
    return bankCache[key];
  }

  function genItemHTML(it, idx, catId) {
    it = MB.pickItem(it);
    const type = it.type || 'expr';
    let controls = '';
    if (type === 'choice') {
      controls = '<div class="answer-row">' + (it.choices || []).map(function (ch, j) {
        return '<button class="btn sm" data-choice="' + j + '">' + ch + '</button>';
      }).join('') + '</div>';
    } else if (type === 'proof' || type === 'open') {
      controls = '<div class="self-check"><button class="btn sm" data-self="1">' + MB.T('Megvan', 'Got it') + '</button></div>';
    } else {
      controls = '<div class="answer-row"><input class="answer-input" type="text" placeholder="' + MB.T('Eredmény…', 'Result…') + '" aria-label="' + MB.T('Válasz', 'Answer') + '">' +
        '<button class="btn sm check" data-check>' + MB.T('Ellenőrzés', 'Check') + '</button>' +
        (it.hint ? '<button class="btn sm hint-btn" data-hint>' + MB.T('Segítség', 'Hint') + '</button>' : '') + '</div>';
    }
    const ans = it.a == null ? '' : esc(typeof it.a === 'object' ? JSON.stringify(it.a) : it.a);
    const alt = it.alt ? esc(JSON.stringify(it.alt)) : '';
    const choices = it.choices ? esc(JSON.stringify(it.choices)) : '';
    const topic = MB.fun && MB.fun.secOfCat ? MB.fun.secOfCat(catId) : catId;
    return '<div class="ex gen-item" data-gencat="' + catId + '" data-genidx="' + idx + '" data-level="' + it.level + '" data-ans="' + ans + '" data-type="' + type + '" data-alt="' + alt + '"' +
      ' data-kind="practice" data-topic="' + esc(topic) + '" data-cat="' + esc(catId) + '" data-funid="p:' + esc(catId) + ':' + idx + '"' +
      ' data-q="' + esc(it.q) + '" data-solution="' + esc(it.sol || '') + '" data-exhint="' + esc(it.hint || '') + '" data-choices="' + choices + '">' +
      '<div class="ex-top"><div class="ex-idx">' + String(idx + 1).padStart(3, '0') + '</div><div class="ex-body"><div class="ex-q">' + it.q +
      '<span class="ex-level" title="' + MB.T('Nehézség', 'Difficulty') + '">' + [1, 2, 3].map(function (n) { return '<i class="' + (n <= it.level ? 'on' : '') + '"></i>'; }).join('') + '</span></div></div>' +
      '<button class="icon-btn reroll" data-reroll="' + catId + ':' + idx + '" title="' + MB.T('Új feladat', 'New exercise') + '" aria-label="' + MB.T('Új feladat', 'New exercise') + '">' + MB.icon('refresh') + '</button></div>' +
      '<div class="ex-bottom">' + controls +
      (it.hint ? '<div class="hint-text">' + MB.icon('bulb') + ' ' + it.hint + '</div>' : '') +
      '<div class="feedback"></div>' +
      (it.sol ? '<div style="margin-top:8px"><button class="btn sm sol-btn" data-sol>' + MB.T('Megoldás', 'Solution') + '</button></div><div class="solution"><b>' + MB.T('Megoldás.', 'Solution.') + '</b> ' + it.sol + '</div>' : '') +
      '</div></div>';
  }

  MB.practiceView = function (catId) {
    const cats = MB.genCats;
    if (!catId) {
      let h = '<div class="page-head"><div class="kicker">' + MB.T('Feladatbank', 'Practice bank') + '</div><h1>' + MB.T('Gyakorlás, végtelen utánpótlással', 'Practice, with endless supply') + '</h1><p class="lead">' +
        MB.T('Minden kategóriában <b>50 feladat</b> van: <b>10 könnyű, 10 közepes, 30 nehéz</b> — arányuk <b>1 : 1 : 3</b>. Az „Új feladatsor” gomb új változatokat generál ugyanabból a témából.',
          'Every category has <b>50 exercises</b>: <b>10 easy, 10 medium, 30 hard</b> — a <b>1 : 1 : 3</b> ratio. “New set” generates fresh variants from the same topic.') + '</p></div>';
      h += '<div class="practice-grid">';
      cats.forEach(function (c) {
        h += '<a class="practice-card" href="#/practice/' + c.id + '"><span class="kind">' + MB.icon(c.icon) + ' ' + MB.T('50 FELADAT', '50 EXERCISES') + '</span><h3>' + esc(catTitle(c)) + '</h3><p>' + esc(catDesc(c)) + '</p>' +
          '<div class="gen-meta"><span class="diff-badge">1 : 1 : 3</span><span>10 / 10 / 30</span><span class="go">' + MB.T('Gyakorlás →', 'Practice →') + '</span></div></a>';
      });
      h += '</div>';
      h += '<div class="note-box" style="margin-top:22px"><h4>' + MB.T('Hogyan működik a generálás?', 'How does generation work?') + '</h4><p style="margin:0">' +
        MB.T('A feladatok nem véletlenszerű tippek: minden kategóriában valódi számítási sablonokból készülnek, és a nehézségi szinthez igazodnak. Az „Új feladatsor” új magot használ, így ugyanaz a téma más számokkal jön elő. Az egyes feladatok mellett is van újragenerálás.',
          'Exercises are not random guesses: every category is built from real computational templates and matched to its difficulty level. “New set” uses a new seed, so the same topic appears with different numbers. Each individual exercise can also be regenerated.') + '</p></div>';
      return h;
    }
    const cat = cats.find(function (c) { return c.id === catId; });
    if (!cat) { location.hash = '#/practice'; return ''; }
    const items = bank(catId);
    const seed = MB.practiceSeeds[catId];
    let h = '<div class="page-head"><div class="kicker">' + MB.T('Feladatbank', 'Practice bank') + ' · ' + esc(catTitle(cat)) + '</div><h1>' + esc(catTitle(cat)) + '</h1><p class="lead">' + esc(catDesc(cat)) + '</p>' +
      '<div class="chapter-meta"><span class="meta-pill"><b>50</b> ' + MB.T('feladat', 'exercises') + '</span><span class="meta-pill"><b>10</b> ' + MB.T('könnyű', 'easy') + '</span><span class="meta-pill"><b>10</b> ' + MB.T('közepes', 'medium') + '</span><span class="meta-pill"><b>30</b> ' + MB.T('nehéz', 'hard') + '</span><span class="meta-pill">' + MB.T('arány', 'ratio') + ' <b>1 : 1 : 3</b></span><span class="meta-pill">' + MB.T('mag', 'seed') + ' <b>#' + seed + '</b></span></div></div>';
    h += '<div class="toolbar"><div class="seg" id="diffFilter">' +
      '<button data-filter="0" class="' + (MB.practiceFilter === '0' ? 'active' : '') + '">' + MB.T('Mind (50)', 'All (50)') + '</button>' +
      '<button data-filter="1" class="' + (MB.practiceFilter === '1' ? 'active' : '') + '">' + MB.T('Könnyű (10)', 'Easy (10)') + '</button>' +
      '<button data-filter="2" class="' + (MB.practiceFilter === '2' ? 'active' : '') + '">' + MB.T('Közepes (10)', 'Medium (10)') + '</button>' +
      '<button data-filter="3" class="' + (MB.practiceFilter === '3' ? 'active' : '') + '">' + MB.T('Nehéz (30)', 'Hard (30)') + '</button></div>' +
      '<button class="btn navy" data-reroll-all="' + catId + '">' + MB.icon('refresh') + ' ' + MB.T('Új feladatsor', 'New set') + '</button>' +
      '<a class="btn" href="#/practice">← ' + MB.T('Kategóriák', 'Categories') + '</a></div>';
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
      input = '<div class="answer-row"><input class="answer-input" id="runAnswer" type="text" placeholder="' + MB.T('Írd be a választ…', 'Type your answer…') + '" value="' + esc(ans || '') + '">' +
        '<button class="btn sm" data-run-save>' + MB.T('Mentés', 'Save') + '</button></div>';
    }
    let nav = '<div class="exam-nav">';
    R.items.forEach(function (_, i) {
      nav += '<button data-run-go="' + i + '" class="' + (i === R.idx ? 'cur' : '') + (R.answers[i] != null && R.answers[i] !== '' ? ' ans' : '') + '">' + (i + 1) + '</button>';
    });
    nav += '</div>';
    body.innerHTML = MB.protectMath('<div style="font-family:var(--font-ui);font-size:.7rem;color:var(--muted);margin-bottom:8px">' + (R.idx + 1) + ' / ' + R.items.length + ' ' + MB.T('kérdés', 'question') + ' · ' + (it.level === 1 ? MB.T('könnyű', 'easy') : it.level === 2 ? MB.T('közepes', 'medium') : MB.T('nehéz', 'hard')) + '</div>' +
      '<div class="exam-q">' + it.q + '</div>' + input +
      '<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap"><button class="btn" data-run-prev' + (R.idx === 0 ? ' disabled' : '') + '>← ' + MB.T('Előző', 'Previous') + '</button>' +
      '<button class="btn navy" data-run-next' + (R.idx === R.items.length - 1 ? ' disabled' : '') + '>' + MB.T('Következő', 'Next') + ' →</button>' +
      '<button class="btn primary" data-run-submit style="margin-left:auto">' + MB.T('Beadás', 'Submit') + '</button></div>' + nav);
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
      '<h2 style="text-align:center;margin:0 0 4px">' + correct + ' / ' + R.items.length + ' ' + MB.T('helyes', 'correct') + '</h2>' +
      '<p style="text-align:center;color:var(--muted);margin-bottom:18px">' + esc(R.title) + '</p>';
    if (R.kind === 'exam') {
      const grade = pct >= 80 ? MB.T('jeles (5)', 'excellent (5)') : pct >= 65 ? MB.T('jó (4)', 'good (4)') : pct >= 55 ? MB.T('közepes (3)', 'satisfactory (3)') : pct >= 40 ? MB.T('elégséges (2)', 'pass (2)') : MB.T('elégtelen (1)', 'fail (1)');
      h += '<p style="text-align:center;font-family:var(--font-ui);font-size:.85rem">' + MB.T('Jegyhatárok (40 / 55 / 65 / 80%): ', 'Grade thresholds (40 / 55 / 65 / 80%): ') + '<b>' + grade + '</b></p>';
    }
    h += '<div style="margin:20px 0 8px;font-family:var(--font-ui);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">' + MB.T('Kiértékelés', 'Review') + '</div>';
    review.forEach(function (r, i) {
      h += '<div class="review-row"><span class="' + (r.ok ? 'ok' : 'no') + '">' + (r.ok ? '✓' : '✗') + '</span><div><div>' + (i + 1) + '. ' + r.it.q + '</div>' +
        '<div style="font-family:var(--font-ui);font-size:.76rem;color:var(--muted);margin-top:4px">' + MB.T('Helyes: ', 'Correct: ') + '<b style="color:var(--ok)">' + esc(String(r.it.a)) + '</b>' + (r.ok ? '' : ' · ' + MB.T('A te válaszod: ', 'Your answer: ') + esc(String(r.user || '—'))) + '</div>' +
        (r.it.sol ? '<details style="margin-top:4px"><summary style="cursor:pointer;font-size:.76rem;color:var(--bme-blue)">' + MB.T('Megoldás', 'Solution') + '</summary><div style="font-size:.8rem;color:var(--ink-2);margin-top:4px">' + r.it.sol + '</div></details>' : '') + '</div></div>';
    });
    h += '<div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap"><button class="btn navy" data-run-again>' + MB.T('Újra', 'Retry') + '</button><a class="btn" href="#/">' + MB.T('Kezdőlap', 'Home') + '</a></div></div>';
    body.innerHTML = MB.protectMath(h);
    MB.renderMath(body);
    const tests = MB.app.state.tests;
    if (MB.fun && MB.fun.batch) MB.fun.batch(review, R.kind, R.section);
    tests[R.title + '@' + Date.now()] = { pct: pct, correct: correct, total: R.items.length, date: new Date().toISOString(), section: R.section || null, tag: R.tag || null };
    MB.app.save();
  }

  /* runner controls */
  document.addEventListener('click', function (e) {
    const t = e.target;
    const goBtn = t.closest('[data-run-go]');
    if (goBtn) { go(+goBtn.dataset.runGo); return; }
    if (t.closest('[data-run-prev]')) { go((MB.runner ? MB.runner.idx : 0) - 1); return; }
    if (t.closest('[data-run-next]')) { go((MB.runner ? MB.runner.idx : 0) + 1); return; }
    if (t.closest('[data-run-save]')) { saveCurrent(); MB.toast(MB.T('Válasz mentve.', 'Answer saved.')); renderRunnerQuestion(); return; }
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
    c = MB.pickChapter(c);
    const items = [];
    const own = (c.exercises || []).filter(function (q) { return q.type !== 'proof' && q.type !== 'open' && q.a != null; });
    own.forEach(function (q) { items.push({ q: q.q, a: q.a, type: q.type || 'expr', alt: q.alt, sol: q.sol, choices: q.choices, level: q.level || 1, topic: s.id, source: c }); });
    const map = {
      alapok: ['algebra', 'equations', 'functions', 'trig'],
      logika: ['logic'], komplex: ['complex'], sorozatok: ['sequences'], hatarertek: ['limits'],
      derivalas: ['derivatives'], integralas: ['integrals'], sorok: ['series'], taylor: ['taylor'],
      tobbvaltozos: ['multivar'], 'diff-fourier': ['sequences', 'series'], linearis: ['linalg'], diszkret: ['discrete']
    };
    const cats = map[s.id] || [MB.genCats[0].id];
    let guard = 0;
    while (items.length < 8 && guard++ < 20) {
      const cid = cats[items.length % cats.length];
      const cat = MB.pickItem(MB.generateOne(cid, items.length < 3 ? 1 : items.length < 5 ? 2 : 3, Date.now() + items.length * 17 + guard));
      items.push({ q: cat.q, a: cat.a, type: cat.type, alt: cat.alt, sol: cat.sol, choices: cat.choices, level: cat.level, cat: cid, topic: MB.fun && MB.fun.secOfCat ? MB.fun.secOfCat(cid) : cid });
    }
    MB.runner = { items: items.slice(0, 8), idx: 0, answers: {}, left: 10 * 60, kind: 'test', title: MB.T('Fejezet teszt', 'Chapter test') + ' · ' + c.num + '. ' + c.title, chapter: c, section: s.id, tag: 'test' };
    setTimeout(function () { MB.initRunner(); }, 0);
    return '<div class="page-head"><div class="kicker">' + MB.T('Fejezet teszt', 'Chapter test') + ' · ' + esc(c.num) + '</div><h1>' + esc(c.title) + '</h1><p class="lead">' +
      MB.T('8 kérdés · 10 perc · a fejezet könnyű, közepes és nehéz feladataiból. A végén pontszám és részletes megoldás.',
        '8 questions · 10 minutes · drawn from the chapter’s easy, medium and hard exercises. Score and detailed solutions at the end.') + '</p></div>' +
      runnerHTML(MB.T('Fejezet teszt', 'Chapter test') + ' · ' + c.title, c.num + '. ' + c.title + ' · ' + MB.T('8 kérdés · 10 perc', '8 questions · 10 minutes'), 10);
  };

  /* =========================================================
     ZH / VIZSGA SIMULATOR
     ========================================================= */
  MB.examView = function (mode) {
    if (!mode) {
      let h = '<div class="page-head"><div class="kicker">' + MB.T('Számonkérés', 'Assessment') + '</div><h1>' + MB.T('ZH- és vizsgaszimulátor', 'Midterm and exam simulator') + '</h1><p class="lead">' +
        MB.T('Időlimites, vegyes nehézségű feladatsorok a 2025–2026-os követelmények szerint. A pontszám után jegybecslést és teljes megoldást kapsz.',
          'Timed, mixed-difficulty papers modelled on the 2025–2026 requirements. After submitting you get a score, a grade estimate and full solutions.') + '</p></div>';
      h += '<div class="exam-strip">' +
        examCard('ZH1', MB.T('Komplex számok, sorozatok, határérték, folytonosság', 'Complex numbers, sequences, limits, continuity'), MB.T('10 kérdés · 75 perc · 3 könnyű / 3 közepes / 4 nehéz', '10 questions · 75 minutes · 3 easy / 3 medium / 4 hard'), 'zh1') +
        examCard('ZH2', MB.T('Deriválás és alkalmazásai', 'Differentiation and its applications'), MB.T('10 kérdés · 75 perc · 3 könnyű / 3 közepes / 4 nehéz', '10 questions · 75 minutes · 3 easy / 3 medium / 4 hard'), 'zh2') +
        examCard(MB.T('Vizsga', 'Final exam'), MB.T('A teljes félév, kiemelt integrálszámítás', 'The whole semester, with emphasis on integration'), MB.T('12 kérdés · 90 perc · 3 könnyű / 3 közepes / 6 nehéz', '12 questions · 90 minutes · 3 easy / 3 medium / 6 hard'), 'vizsga') +
        examCard(MB.T('Gyors', 'Quick'), MB.T('5 perces bemelegítés', '5-minute warm-up'), MB.T('6 kérdés · 5 perc · vegyes', '6 questions · 5 minutes · mixed'), 'quick') + '</div>';
      h += '<div class="note-box" style="margin-top:20px"><h4>' + MB.T('Fontos a valódi ZH-hoz', 'For the real midterm') + '</h4><p style="margin:0">' +
        MB.T('A szimulátor a feladattípusokat és az időnyomást gyakoroltatja, nem helyettesíti az eredeti feladatsorokat. A ZH1-en definíció és ε–N bizonyítás is szerepel; a vizsgán az integrálás külön 40%-ot ér. A 2025–2026-os eredeti feladatsorok a ',
          'The simulator trains exercise types and time pressure; it does not replace the original papers. ZH1 includes a definition and an ε–N proof; on the final exam integration is worth a separate 40%. The 2025–2026 original papers are on the ') +
        '<a href="#/resources">' + MB.T('Forrásanyagok', 'Resources') + '</a> ' + MB.T('oldalon vannak.', 'page.') + '</p></div>';
      return h;
    }
    const cfg = {
      zh1: { title: MB.T('ZH1 szimulátor', 'ZH1 simulator'), cats: ['complex', 'sequences', 'limits'], n: 10, min: 75 },
      zh2: { title: MB.T('ZH2 szimulátor', 'ZH2 simulator'), cats: ['derivatives', 'functions', 'limits'], n: 10, min: 75 },
      vizsga: { title: MB.T('Vizsga szimulátor', 'Final exam simulator'), cats: ['complex', 'sequences', 'limits', 'derivatives', 'integrals', 'series'], n: 12, min: 90 },
      quick: { title: MB.T('Gyors gyakorlás', 'Quick practice'), cats: ['algebra', 'trig', 'complex', 'limits', 'derivatives', 'integrals'], n: 6, min: 5 }
    }[mode];
    if (!cfg) { location.hash = '#/exam'; return ''; }
    const items = [];
    for (let i = 0; i < cfg.n; i++) {
      const level = i < 3 ? 1 : i < 6 ? 2 : 3;
      const cid = cfg.cats[i % cfg.cats.length];
      const cat = MB.pickItem(MB.generateOne(cid, level, Date.now() + i * 104729 + mode.length));
      items.push({ q: cat.q, a: cat.a, type: cat.type, alt: cat.alt, sol: cat.sol, choices: cat.choices, level: level, cat: cid, topic: MB.fun && MB.fun.secOfCat ? MB.fun.secOfCat(cid) : cid });
    }
    MB.runner = { items: items, idx: 0, answers: {}, left: cfg.min * 60, kind: 'exam', title: cfg.title, tag: mode };
    setTimeout(function () { MB.initRunner(); }, 0);
    return '<div class="page-head"><div class="kicker">' + MB.T('Számonkérés · szimulátor', 'Assessment · simulator') + '</div><h1>' + cfg.title + '</h1><p class="lead">' +
      cfg.n + MB.T(' kérdés · ', ' questions · ') + cfg.min + MB.T(' perc. A válaszokat a „Mentés” gombbal vagy a kérdésváltással rögzítheted. Lejáratkor automatikus beadás.',
        ' minutes. Answers are saved with the “Save” button or when you switch questions. The paper is submitted automatically when time runs out.') + '</p></div>' +
      runnerHTML(cfg.title, cfg.n + MB.T(' kérdés · ', ' questions · ') + cfg.min + MB.T(' perc · jegyhatárok 40/55/65/80%', ' minutes · grade thresholds 40/55/65/80%'), cfg.min);
  };

  function examCard(tag, title, desc, mode) {
    return '<div class="exam-card"><span class="tag">' + esc(tag) + '</span><h3>' + esc(title) + '</h3><p>' + esc(desc) + '</p><a class="btn sm navy" href="#/exam/' + mode + '">' + MB.T('Indítás', 'Start') + '</a></div>';
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
      MB.toast(MB.T('Új feladatsor generálva.', 'New set generated.'));
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
