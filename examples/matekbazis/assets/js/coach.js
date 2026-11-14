/* MatekBázis — motivation-aware launchpad.
   Adds a five-minute launch, a mastery map, section diagnostics, ten-minute
   sprints, an exam countdown, a weekly commitment and calm mode. */
(function () {
  const MB = window.MB;
  const esc = MB.esc;
  const CORE_IDS = ['alapok', 'logika', 'komplex', 'sorozatok', 'hatarertek', 'derivalas', 'integralas'];
  const CATS = {
    alapok: ['algebra', 'equations', 'functions', 'trig'],
    logika: ['logic'], komplex: ['complex'], sorozatok: ['sequences'], hatarertek: ['limits'],
    derivalas: ['derivatives'], integralas: ['integrals'], sorok: ['series'], taylor: ['taylor'],
    tobbvaltozos: ['multivar'], 'diff-fourier': ['sequences', 'series'], linearis: ['linalg'], diszkret: ['discrete']
  };
  let interval = null;

  function T(hu, en) { return MB.lang === 'en' ? en : hu; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function isoWeek(s) {
    const p = String(s).split('-').map(Number);
    const d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const y = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return d.getUTCFullYear() + '-' + Math.ceil(((d - y) / 86400000 + 1) / 7);
  }
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function pct(p) { return p == null ? '—' : Math.round(p * 100) + '%'; }
  function bar(p) {
    const v = Math.max(0, Math.min(100, Math.round(p || 0)));
    return '<div class="bar"><i style="width:' + v + '%"></i></div>';
  }
  function sec(id) { return MB.sections.find(function (s) { return s.id === id; }); }
  function secTitle(id) { const s = sec(id); return s ? MB.sTitle(s) : id; }
  function core() { return MB.sections.filter(function (s) { return CORE_IDS.indexOf(s.id) >= 0; }); }
  function firstChapter(s) { return s.chapters && s.chapters.length ? s.chapters[0] : null; }
  function sectionHref(s) { return firstChapter(s) ? '#/chapter/' + s.id + '/' + firstChapter(s).id : '#/section/' + s.id; }

  function coachState() {
    const st = MB.app.state;
    st.coach = st.coach || {};
    const c = st.coach;
    c.examDate = c.examDate || '';
    c.weeklyGoal = Math.max(1, Math.min(7, Number(c.weeklyGoal) || 3));
    c.sessions = Array.isArray(c.sessions) ? c.sessions.slice(-120) : [];
    c.diag = c.diag || {};
    c.diagDraft = c.diagDraft || {};
    c.launchSeed = c.launchSeed || 1;
    c.sprintSeed = c.sprintSeed || 1;
    c.calm = !!c.calm;
    return c;
  }
  function save() { if (MB.app && MB.app.save) MB.app.save(); }
  function markSession() {
    const c = coachState(), t = today();
    if (c.sessions.indexOf(t) < 0) {
      c.sessions.push(t);
      if (c.sessions.length > 120) c.sessions = c.sessions.slice(-120);
      save();
    }
  }
  function weekSessions() {
    const c = coachState(), wk = isoWeek(today());
    return c.sessions.filter(function (d) { return isoWeek(d) === wk; }).length;
  }
  function examDays() {
    const c = coachState();
    if (!c.examDate) return null;
    const p = String(c.examDate).split('-').map(Number);
    if (p.length !== 3 || !p[0]) return null;
    const exam = Date.UTC(p[0], p[1] - 1, p[2]);
    const now = new Date();
    const base = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((exam - base) / 86400000);
  }

  /* ---------- mastery (recall + tests + reading, not video time) ---------- */
  function sectionMastery(s) {
    let total = 0, solved = 0, read = 0;
    s.chapters.forEach(function (ch) {
      const key = MB.app.chapterKey(s.id, ch.id);
      const exs = ch.exercises || [];
      total += exs.length;
      exs.forEach(function (_, i) { if (MB.app.state.ex[key + '/' + i]) solved++; });
      if (MB.app.isRead(ch)) read++;
    });
    const readRatio = s.chapters.length ? read / s.chapters.length : 0;
    const solvedRatio = total ? solved / total : 0;
    const tests = Object.keys(MB.app.state.tests || {}).map(function (k) { return MB.app.state.tests[k]; })
      .filter(function (t) { return t && t.section === s.id; });
    const testAvg = tests.length ? tests.reduce(function (a, t) { return a + (Number(t.pct) || 0); }, 0) / tests.length / 100 : 0;
    const logs = ((MB.app.state.fun && MB.app.state.fun.log) || []).filter(function (l) { return l.topic === s.id; });
    const logAcc = logs.length ? logs.filter(function (l) { return l.ok; }).length / logs.length : 0;
    let v = solvedRatio * .50 + readRatio * .10 + testAvg * .25 + logAcc * .15;
    const d = coachState().diag[s.id];
    if (d && d.passed) v = Math.max(v, .75);
    return Math.max(0, Math.min(1, v));
  }
  function sectionHasData(s) {
    if (s.chapters.some(function (c) { return MB.app.isRead(c); })) return true;
    for (let i = 0; i < s.chapters.length; i++) {
      const key = MB.app.chapterKey(s.id, s.chapters[i].id);
      const exs = s.chapters[i].exercises || [];
      for (let j = 0; j < exs.length; j++) if (MB.app.state.ex[key + '/' + j]) return true;
    }
    const tests = MB.app.state.tests || {};
    if (Object.keys(tests).some(function (k) { return tests[k] && tests[k].section === s.id; })) return true;
    const logs = (MB.app.state.fun && MB.app.state.fun.log) || [];
    if (logs.some(function (l) { return l.topic === s.id; })) return true;
    return !!coachState().diag[s.id];
  }
  function anyData() { return core().some(sectionHasData); }
  function overallText() { return anyData() ? pct(overallMastery()) : '—'; }
  function overallMastery() {
    const rows = core().map(sectionMastery);
    if (!rows.length) return 0;
    return rows.reduce(function (a, p) { return a + p; }, 0) / rows.length;
  }
  function masteryClass(p) {
    if (p < .35) return 'weak';
    if (p < .55) return 'building';
    if (p < .75) return 'solid';
    return 'ready';
  }
  function masteryLabel(p) {
    if (p < .35) return T('kezdet', 'starting');
    if (p < .55) return T('épül', 'building');
    if (p < .75) return T('stabil', 'solid');
    return T('kész', 'ready');
  }
  function reviewDue() {
    const r = (MB.app.state.fun && MB.app.state.fun.review) || {};
    return Object.keys(r).filter(function (k) {
      const x = r[k];
      return x && !x.mastered && x.due && x.due <= today();
    }).length;
  }

  function nextActions() {
    const actions = [];
    if (reviewDue()) actions.push({ href: '#/review', label: T('Esedékes ismétlés', 'Reviews due'), meta: reviewDue() + ' ' + T('bejegyzés', 'items') });
    const rows = core().map(function (s) { return { s: s, p: sectionMastery(s) }; })
      .filter(function (x) { return x.p < .62; })
      .sort(function (a, b) { return a.p - b.p; });
    rows.forEach(function (x) {
      if (actions.length >= 3) return;
      const d = coachState().diag[x.s.id], has = sectionHasData(x.s);
      actions.push({
        href: d && d.passed ? sectionHref(x.s) : '#/diagnostic/' + x.s.id,
        label: (d && d.passed ? T('Gyakorolj: ', 'Practise: ') : T('Mérd fel: ', 'Check: ')) + MB.sTitle(x.s),
        meta: (has ? pct(x.p) : '—') + ' · ' + (has ? masteryLabel(x.p) : T('nincs adat', 'no data yet'))
      });
    });
    if (!actions.length) actions.push({ href: '#/exam/quick', label: T('Gyors vegyes gyakorlás', 'Quick mixed practice'), meta: T('minden alaprészből', 'across the core parts') });
    return actions.slice(0, 3);
  }

  /* ---------- generated item sets ---------- */
  function generated(s, levels, seed) {
    const cats = CATS[s.id] || ['algebra'];
    return levels.map(function (level, i) {
      const cat = cats[i % cats.length];
      const it = MB.generateOne(cat, level, seed + i * 104729);
      it.cat = cat;
      it.topic = s.id;
      it.level = level;
      return it;
    });
  }
  function bestAndWeak() {
    const rows = core().map(function (s) { return { s: s, p: sectionMastery(s) }; }).sort(function (a, b) { return a.p - b.p; });
    if (!anyData()) return { strong: sec('alapok'), weak: sec('logika') };
    return { weak: rows[0].s, strong: rows[rows.length - 1].s };
  }
  function launchItems() {
    const c = coachState(), pair = bestAndWeak();
    const seed = hash('launch:' + today() + ':' + c.launchSeed);
    return [generated(pair.strong, [1], seed)[0], generated(pair.weak, [2], seed + 1)[0]];
  }
  function sprintSection() {
    const rows = core().map(function (s) { return { s: s, p: sectionMastery(s) }; }).sort(function (a, b) { return a.p - b.p; });
    return rows[0].s;
  }
  function sprintItems(s) {
    const c = coachState();
    return generated(s, [1, 2, 3], hash('sprint:' + today() + ':' + c.sprintSeed + ':' + s.id));
  }
  function item(it, o) {
    return MB.fun.itemHTML(it, o);
  }
  function diagItems(s) {
    return generated(s, [1, 1, 2, 2, 3], hash('diag:' + s.id));
  }

  /* ---------- shared chrome ---------- */
  function pageHead(kicker, title, lead) {
    return '<div class="page-head"><div class="kicker">' + esc(kicker) + '</div><h1>' + esc(title) + '</h1><p class="lead">' + lead + '</p></div>';
  }
  function coachTop() {
    const c = coachState(), d = examDays(), ws = weekSessions();
    return '<div class="coach-hero">' +
      '<div class="coach-hero-main"><div class="eyebrow">' + T('Tanulás · 10 vagy 20 perc', 'Learn · 10 or 20 minutes') + '</div>' +
      '<h2>' + T('A következő tanulóblokk.', 'The next learning block.') + '</h2>' +
      '<p>' + T('Elmélet, példa, majd csak a hiányzó részekből kérdez. Utána jöhet az ismétlés.', 'Theory, an example, then questions only from what is missing. Review comes after that.') + '</p>' +
      '<div class="coach-actions"><a class="btn gold" href="#/sessions">' + MB.icon('play') + ' ' + T('Tanulás indítása', 'Start learning') + '</a>' +
      '<a class="btn ghost" href="#/review/5">' + T('5 perces ismétlés', 'Five-minute review') + '</a>' +
      '<a class="btn ghost" href="#/map">' + T('Tudástérkép', 'Knowledge map') + '</a></div></div>' +
      '<div class="coach-stats">' +
      '<div class="stat"><b>' + (d == null || d < 0 ? '—' : d) + '</b><span>' + (d == null ? T('állítsd be a vizsgát', 'set the exam date') : d < 0 ? T('vizsga lejárt', 'exam date passed') : T('nap a vizsgáig', 'days to exam')) + '</span></div>' +
      '<div class="stat"><b>' + ws + ' / ' + c.weeklyGoal + '</b><span>' + T('ülés ezen a héten', 'sessions this week') + '</span></div>' +
      '<div class="stat"><b>' + overallText() + '</b><span>' + T('becsült tudás', 'estimated mastery') + '</span></div>' +
      '</div></div>';
  }

  /* ---------- home card ---------- */
  MB.coach = {};
  MB.coach.homeHTML = function () {
    const c = coachState(), d = examDays(), actions = nextActions();
    return '<div class="coach-strip">' +
      '<a class="coach-card coach-primary" href="#/sessions">' +
      '<span class="coach-kicker">' + T('Tanulás', 'Learn') + '</span>' +
      '<b>' + T('10 / 20 perc tanulás · 5 / 10 perc ismétlés', '10 / 20 min learn · 5 / 10 min review') + '</b>' +
      '<span>' + T('Elmélet és példa a tanuláshoz; ismétlés csak abból, amit már teljesítettél.', 'Theory and examples for learning; review only from what you have completed.') + '</span>' +
      '<span class="coach-go">' + T('Válassz', 'Choose') + ' →</span></a>' +
      '<a class="coach-card" href="#/map">' +
      '<span class="coach-kicker">' + T('Tudástérkép', 'Knowledge map') + '</span>' +
      '<b>' + overallText() + ' ' + T('becsült tudás', 'estimated mastery') + '</b>' +
      '<span>' + T('Előfeltételek, gyenge pontok és a következő három lépés.', 'Prerequisites, weak spots and the next three actions.') + '</span>' +
      '<span class="coach-go">' + T('Térkép', 'Map') + ' →</span></a>' +
      '<a class="coach-card" href="#/coach">' +
      '<span class="coach-kicker">' + T('Fókusz', 'Focus') + '</span>' +
      '<b>' + (d == null ? T('Nincs vizsgadátum', 'No exam date yet') : d >= 0 ? d + ' ' + T('nap a vizsgáig', 'days to exam') : T('Vizsga lejárt', 'Exam date passed')) + '</b>' +
      '<span>' + T('Heti vállalás: ', 'Weekly commitment: ') + c.weeklyGoal + ' · ' + weekSessions() + ' ' + T('teljesítve', 'done') + '</span>' +
      '<span class="coach-go">' + (actions[0] ? T('Következő lépés', 'Next action') : T('Beállítás', 'Set up')) + ' →</span></a>' +
      '</div>';
  };

  /* ---------- focus view ---------- */
  MB.coachView = function () {
    const c = coachState(), d = examDays(), ws = weekSessions(), actions = nextActions();
    let h = pageHead(T('Fókusz', 'Focus'), T('A következő lépés, nem a teljes tananyag', 'The next step, not the whole syllabus'),
      T('Rövid indulás, látható tudás, valódi határidő. A cél nem a streak, hanem hogy tudd, mi következik.', 'A short start, visible mastery, a real deadline. The goal is not a streak; it is knowing what comes next.'));
    h += coachTop();
    h += '<div class="coach-grid">' +
      '<div class="coach-panel"><h3>' + T('Vizsga és heti vállalás', 'Exam and weekly commitment') + '</h3>' +
      '<label class="coach-label">' + T('Vizsga dátuma', 'Exam date') + '</label>' +
      '<input type="date" data-coach-exam value="' + esc(c.examDate) + '">' +
      '<label class="coach-label">' + T('Heti ülések vállalása', 'Weekly session commitment') + '</label>' +
      '<select data-coach-goal>' + [1, 2, 3, 4, 5, 6, 7].map(function (n) { return '<option value="' + n + '"' + (n === c.weeklyGoal ? ' selected' : '') + '>' + n + ' ' + T('ülés / hét', 'sessions / week') + '</option>'; }).join('') + '</select>' +
      '<div class="coach-measure"><div class="cm-top"><span>' + T('Ezen a héten', 'This week') + '</span><b>' + ws + ' / ' + c.weeklyGoal + '</b></div>' + bar(ws / c.weeklyGoal * 100) + '</div>' +
      '<p class="coach-note">' + T('A vállalás nem büntetés: ha kimarad egy hét, egyszerűen újra beállítod. A napi streak elrejthető.', 'The commitment is not a punishment: if a week slips, simply reset it. The daily streak can be hidden.') + '</p>' +
      '<button class="btn sm ' + (c.calm ? 'navy' : '') + '" data-coach-calm>' + T('Nyugodt mód', 'Calm mode') + ': ' + (c.calm ? T('be', 'on') : T('ki', 'off')) + '</button></div>' +
      '<div class="coach-panel"><h3>' + T('Következő három lépés', 'Next three actions') + '</h3>' +
      '<div class="coach-actions-list">' + actions.map(function (a) { return '<a class="coach-action" href="' + a.href + '"><span>' + esc(a.label) + '</span><small>' + esc(a.meta) + '</small><b>→</b></a>'; }).join('') + '</div>' +
      '<p class="coach-note">' + T('A sorrend a legkisebb ellenállás elve: ismétlés, majd a leggyengébb téma, majd egy vegyes kérdés.', 'The order follows least resistance: review, then the weakest topic, then one mixed question.') + '</p></div>' +
      '</div>';
    h += '<div class="coach-panel"><h3>' + T('Miért ez a sorrend?', 'Why this order?') + '</h3><p class="coach-note">' +
      T('A kutatás szerint a kompetencia, az autonómia és a kapcsolódás hajtja a belső motivációt; a halogatás gyakran érzelemszabályozás, nem lustaság. Ezért kezdünk ismert anyaggal, adunk látható haladást, és nem büntetünk hibáért.', 'Research links intrinsic motivation to competence, autonomy and relatedness; procrastination is often emotion regulation, not laziness. So we start with known material, show visible progress, and do not punish errors.') + '</p>' +
      '<div class="coach-legend"><span><i class="dot weak"></i>' + T('kezdet', 'starting') + '</span><span><i class="dot building"></i>' + T('épül', 'building') + '</span><span><i class="dot solid"></i>' + T('stabil', 'solid') + '</span><span><i class="dot ready"></i>' + T('kész', 'ready') + '</span></div></div>';
    return h;
  };

  /* ---------- map ---------- */
  MB.mapView = function () {
    const actions = nextActions();
    let h = pageHead(T('Tudástérkép', 'Knowledge map'), T('Látod, mi hova tartozik', 'See how it fits together'),
      T('A színek a becsült tudást mutatják: olvasás, megoldott feladatok, tesztek és ismétlési pontosság. Nem a videónézés ideje.', 'Colours show estimated mastery: reading, solved exercises, tests and recall accuracy. Not video watch time.'));
    h += '<div class="map-legend"><span><i class="dot new"></i>' + T('nincs adat', 'no data yet') + '</span><span><i class="dot weak"></i>' + T('kezdet', 'starting') + '</span><span><i class="dot building"></i>' + T('épül', 'building') + '</span><span><i class="dot solid"></i>' + T('stabil', 'solid') + '</span><span><i class="dot ready"></i>' + T('kész', 'ready') + '</span></div>';
    h += '<div class="coach-actions-list map-next">' + actions.map(function (a) { return '<a class="coach-action" href="' + a.href + '"><span>' + esc(a.label) + '</span><small>' + esc(a.meta) + '</small><b>→</b></a>'; }).join('') + '</div>';
    h += '<div class="map-board">';
    MB.sections.forEach(function (s) {
      const has = sectionHasData(s), p = sectionMastery(s), cls = has ? masteryClass(p) : 'new', d = coachState().diag[s.id];
      const prereq = s.prereq && s.prereq.length
        ? s.prereq.map(function (id) { const q = sec(id); return q ? '<a href="#/section/' + q.id + '">' + esc(MB.sTitle(q)) + '</a>' : esc(id); }).join(', ')
        : T('nincs előfeltétel', 'no prerequisite');
      h += '<article class="map-node ' + cls + '">' +
        '<div class="map-top"><span class="map-num">' + esc(s.num) + '</span><span class="map-pct">' + (has ? pct(p) : '—') + '</span></div>' +
        '<a class="map-link" href="#/section/' + s.id + '"><h3>' + esc(MB.sTitle(s)) + '</h3><p>' + esc(MB.sSub(s)) + '</p></a>' +
        bar(p * 100) +
        '<div class="map-prereq"><b>' + T('Előfeltétel:', 'Prerequisite:') + '</b> ' + prereq + '</div>' +
        '<div class="map-actions"><a href="#/learn/10/' + s.id + '">' + T('Tanulás', 'Learn') + '</a>' +
        '<a href="#/review/5/' + s.id + '">' + T('Ismétlés', 'Review') + '</a>' +
        '<a href="#/diagnostic/' + s.id + '">' + (d && d.passed ? T('Újramérés', 'Retest') : T('Felmérés', 'Test out')) + '</a></div></article>';
    });
    h += '</div>';
    return h;
  };

  MB.coach.sectionCTA = function (s) {
    const has = sectionHasData(s), p = sectionMastery(s), d = coachState().diag[s.id];
    return '<div class="coach-inline"><div><b>' + T('Becsült tudás:', 'Estimated mastery:') + ' ' + (has ? pct(p) : '—') + '</b>' +
      '<span>' + (has ? masteryLabel(p) : T('nincs adat', 'no data yet')) + ' · ' + (d && d.passed ? T('felmérés kész', 'tested out') : T('még nincs felmérés', 'not tested yet')) + '</span></div>' +
      '<div class="coach-inline-actions"><a class="btn sm navy" href="#/learn/10/' + s.id + '">' + T('10 perces tanulás', '10-minute learn') + '</a>' +
      '<a class="btn sm" href="#/review/5/' + s.id + '">' + T('5 perces ismétlés', '5-minute review') + '</a>' +
      '<a class="btn sm" href="#/diagnostic/' + s.id + '">' + (d && d.passed ? T('Újramérés', 'Retest') : T('Felmérés', 'Test out')) + '</a></div></div>';
  };

  /* ---------- five-minute launch ---------- */
  MB.launchView = function () {
    const c = coachState();
    if (c.launchDate !== today()) { c.launchDate = today(); c.launchSeed = (c.launchSeed || 1) + 1; save(); }
    const items = launchItems();
    let h = pageHead(T('5 perces indítás', 'Five-minute launch'), T('Kezdd azzal, amit tudsz', 'Start with what you know'),
      T('Az első kérdés ismert anyagból jön, hogy legyen sikerélmény. A második egy gyenge pont. Öt perc után megállhatsz.', 'The first question comes from known material, so you get a win. The second is a weak spot. After five minutes you may stop.'));
    h += '<div class="launch-bar"><div><b id="launchTimer">5:00</b><span>' + T('önkéntes időkeret', 'optional timer') + '</span></div>' +
      '<button class="btn sm" data-launch-timer>' + T('Időzítő indítása', 'Start timer') + '</button>' +
      '<button class="btn sm" data-launch-reset>' + T('Új pár', 'New pair') + '</button>' +
      '<a class="btn sm" href="#/coach" data-launch-stop>' + T('Megállok itt', 'Stop here') + '</a></div>';
    h += '<div class="gen-list">';
    items.forEach(function (it, i) {
      h += item(it, { kind: 'launch', funid: 'l:' + today() + ':' + i, idx: i, showTopic: i === 1 });
    });
    h += '</div><div class="coach-foot"><a class="btn" href="#/coach">' + T('Vissza a fókuszhoz', 'Back to focus') + '</a></div>';
    return h;
  };

  /* ---------- diagnostic ---------- */
  MB.diagView = function (sid) {
    const s = sec(sid) || sec('alapok');
    const c = coachState(), done = c.diag[s.id];
    let h = pageHead(T('Felmérés', 'Diagnostic'), T('Mérd fel: ', 'Check: ') + MB.sTitle(s),
      T('Öt kérdés. Ha legalább négy megy, kihagyhatod az ismétlést és mehetsz a ZH-szintű gyakorlásra. Ha nem, a gyenge pontokhoz irányítunk — szégyen nélkül.', 'Five questions. If you get at least four, you can skip the revision and move to exam-level practice. If not, we route you to the weak spots — without shame.'));
    if (done) {
      h += '<div class="diag-result ' + (done.passed ? 'pass' : 'work') + '"><div class="diag-score"><b>' + done.correct + ' / ' + done.total + '</b><span>' + (done.passed ? T('kihagyhatod az ismétlést', 'you can skip the revision') : T('kezdd a gyakorlást', 'start with practice')) + '</span></div>' +
        '<p>' + (done.passed
          ? T('Ez a rész már megy. Menj egy ZH-szintű feladatsorra, vagy erősítsd meg egy teszttel.', 'This part is already solid. Move to an exam-level paper, or reinforce it with a test.')
          : T('Nem baj. Ez nem osztályzat: csak azt mutatja, hol kezdd. A következő lépés a leggyengébb fejezet.', 'No problem. This is not a grade: it only shows where to start. The next step is the weakest chapter.')) + '</p>' +
        '<div class="coach-actions"><a class="btn navy" href="' + (done.passed ? '#/exam/quick' : sectionHref(s)) + '">' + (done.passed ? T('ZH-gyakorlás', 'Exam practice') : T('Fejezet megnyitása', 'Open chapter')) + '</a>' +
        '<button class="btn" data-diag-reset="' + s.id + '">' + T('Újramérés', 'Retest') + '</button></div></div>';
      return h;
    }
    c.diagDraft[s.id] = c.diagDraft[s.id] || {};
    const draft = c.diagDraft[s.id], items = diagItems(s);
    const answered = Object.keys(draft).filter(function (k) { return draft[k] != null; }).length;
    h += '<div class="diag-status"><span>' + T('Első próbálkozás számít.', 'First attempt counts.') + '</span><b data-diag-count>' + answered + ' / 5</b></div>';
    h += '<div class="gen-list" id="diagList">';
    items.forEach(function (it, i) {
      h += item(it, { kind: 'diagnostic', funid: 'g:' + s.id + ':' + i, idx: i, done: !!draft[i], showTopic: false, attrs: ' data-diag="' + esc(s.id) + '" data-diag-idx="' + i + '"' });
    });
    h += '</div><div class="coach-foot"><button class="btn navy" data-diag-finish="' + s.id + '">' + T('Felmérés kiértékelése', 'Finish diagnostic') + '</button>' +
      '<a class="btn" href="#/map">' + T('Vissza a térképhez', 'Back to map') + '</a></div>';
    return h;
  };

  /* ---------- sprint ---------- */
  MB.sprintView = function (sid) {
    const s = sec(sid) || sprintSection();
    const c = coachState();
    const items = sprintItems(s);
    let h = pageHead(T('10 perces sprint', 'Ten-minute sprint'), T('Egy témára fókuszálva', 'Focused on one topic'),
      T('Három kérdés: egy bemelegítés, egy közepes, egy húzós. Indítsd az időzítőt, és tíz perc után állj meg — akkor is, ha nem végeztél.', 'Three questions: a warm-up, a medium and a hard one. Start the timer and stop after ten minutes — even if you are not finished.'));
    h += '<div class="sprint-bar"><div><b id="sprintTimer">10:00</b><span>' + T('tíz perc, aztán stop', 'ten minutes, then stop') + '</span></div>' +
      '<button class="btn sm navy" data-sprint-start>' + T('Sprint indítása', 'Start sprint') + '</button>' +
      '<button class="btn sm" data-sprint-reset>' + T('Új hármas', 'New set') + '</button>' +
      '<a class="btn sm" href="#/section/' + s.id + '">' + T('Rész megnyitása', 'Open part') + '</a></div>';
    h += '<div class="gen-list">';
    items.forEach(function (it, i) {
      h += item(it, { kind: 'sprint', funid: 's:' + s.id + ':' + i + ':' + today(), idx: i, showTopic: true });
    });
    h += '</div><div class="coach-note">' + T('A harmadik kérdés szándékosan nehezebb. Ha elakadsz, használd a segítséget; a cél a tanulás, nem a pontszám.', 'The third question is intentionally harder. If you get stuck, use the hint; the goal is learning, not a score.') + '</div>';
    return h;
  };

  /* ---------- answer hook ---------- */
  MB.fun.onAnswer = function (ex, d, kind, first) {
    if (!first) return;
    if (kind === 'diagnostic') {
      const sid = ex.dataset.diag, idx = ex.dataset.diagIdx;
      if (!sid || idx == null) return;
      const c = coachState();
      c.diagDraft[sid] = c.diagDraft[sid] || {};
      c.diagDraft[sid][idx] = !!d.ok;
      markSession();
      save();
      const count = Object.keys(c.diagDraft[sid]).filter(function (k) { return c.diagDraft[sid][k] != null; }).length;
      const el = document.querySelector('[data-diag-count]');
      if (el) el.textContent = count + ' / 5';
      if (d.ok) {
        ex.classList.add('done');
        ex.querySelectorAll('input, button[data-check], button[data-choice], button[data-hint]').forEach(function (b) { b.disabled = true; });
      }
      return;
    }
    if (kind === 'launch' || kind === 'sprint') {
      markSession();
      if (d.ok) {
        ex.classList.add('done');
        ex.querySelectorAll('input, button[data-check], button[data-choice], button[data-hint]').forEach(function (b) { b.disabled = true; });
        const lab = ex.querySelector('.fun-topic-label');
        if (lab) lab.classList.add('show');
      }
    }
  };

  /* ---------- events ---------- */
  document.addEventListener('change', function (e) {
    const t = e.target;
    if (!t || !t.matches) return;
    if (t.matches('[data-coach-exam]')) { coachState().examDate = t.value; save(); MB.app.render(); }
    if (t.matches('[data-coach-goal]')) { coachState().weeklyGoal = Number(t.value) || 3; save(); MB.app.render(); }
  });

  document.addEventListener('click', function (e) {
    const t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('[data-coach-calm]')) {
      const c = coachState(); c.calm = !c.calm; save(); applyCalm(); MB.app.render();
      return;
    }
    if (t.closest('[data-launch-timer]')) { startTimer(300, 'launchTimer'); return; }
    if (t.closest('[data-launch-reset]')) { coachState().launchSeed = (coachState().launchSeed || 1) + 1; save(); MB.app.render(); return; }
    if (t.closest('[data-launch-stop]')) { markSession(); MB.toast(T('Rövid ülés rögzítve.', 'Short session recorded.')); return; }
    if (t.closest('[data-diag-finish]')) {
      const sid = t.closest('[data-diag-finish]').dataset.diagFinish;
      const c = coachState(), draft = c.diagDraft[sid] || {};
      const answered = Object.keys(draft).filter(function (k) { return draft[k] != null; }).length;
      if (answered < 5) { MB.toast(T('Válaszolj mind az öt kérdésre.', 'Answer all five questions.')); return; }
      const correct = Object.keys(draft).filter(function (k) { return draft[k]; }).length;
      c.diag[sid] = { done: true, correct: correct, total: 5, passed: correct >= 4, date: today() };
      delete c.diagDraft[sid];
      save(); MB.app.render();
      MB.toast(correct >= 4 ? T('Kihagyhatod az ismétlést.', 'You can skip the revision.') : T('Irány a gyakorlás.', 'Time to practise.'));
      return;
    }
    if (t.closest('[data-diag-reset]')) {
      const sid = t.closest('[data-diag-reset]').dataset.diagReset;
      const c = coachState(); delete c.diag[sid]; delete c.diagDraft[sid]; save(); MB.app.render();
      return;
    }
    if (t.closest('[data-sprint-start]')) { startTimer(600, 'sprintTimer'); markSession(); return; }
    if (t.closest('[data-sprint-reset]')) { coachState().sprintSeed = (coachState().sprintSeed || 1) + 1; save(); MB.app.render(); return; }
  });

  function startTimer(seconds, id) {
    clearInterval(interval);
    let left = seconds;
    const el = document.getElementById(id);
    function tick() {
      const target = document.getElementById(id);
      if (!target) { clearInterval(interval); interval = null; return; }
      target.textContent = Math.floor(left / 60) + ':' + pad(left % 60);
      if (left <= 0) {
        clearInterval(interval); interval = null;
        target.textContent = T('Lejárt', 'Time');
        MB.toast(T('Az idő lejárt. Állj meg — a következő lépés holnap jön.', 'Time is up. Stop — the next step comes tomorrow.'));
        return;
      }
      left--;
    }
    if (el) { tick(); interval = setInterval(tick, 1000); }
  }

  function applyCalm() {
    document.body.classList.toggle('calm-mode', !!coachState().calm);
  }
  MB.coach.afterRender = function () { applyCalm(); };
  window.addEventListener('hashchange', function () { clearInterval(interval); interval = null; });
})();
