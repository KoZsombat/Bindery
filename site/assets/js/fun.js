/* MatekBázis — daily quest, error notebook, mixed run, error hunt,
   exam readiness and teach-back. All state lives in localStorage under
   MB.app.state.fun; this file only adds views and answer bookkeeping. */
(function () {
  const MB = window.MB;
  const esc = MB.esc;

  const CORE_CATS = ['algebra', 'trig', 'logic', 'complex', 'sequences', 'limits', 'derivatives', 'integrals'];
  const CAT2SEC = {
    algebra: 'alapok', trig: 'alapok', functions: 'alapok', equations: 'alapok',
    logic: 'logika', complex: 'komplex', sequences: 'sorozatok', limits: 'hatarertek',
    derivatives: 'derivalas', integrals: 'integralas', series: 'sorok', taylor: 'taylor',
    multivar: 'tobbvaltozos', linalg: 'linearis', discrete: 'diszkret'
  };
  const SEC2CAT = {
    alapok: 'algebra', logika: 'logic', komplex: 'complex', sorozatok: 'sequences',
    hatarertek: 'limits', derivalas: 'derivatives', integralas: 'integrals',
    sorok: 'series', taylor: 'taylor', tobbvaltozos: 'multivar', linearis: 'linalg', diszkret: 'discrete'
  };
  const LEITNER = [1, 3, 7, 21];
  const CORE_IDS = ['alapok', 'logika', 'komplex', 'sorozatok', 'hatarertek', 'derivalas', 'integralas'];

  function T(hu, en) { return MB.lang === 'en' ? en : hu; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function dayNum(s) {
    const p = String(s).split('-').map(Number);
    return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 86400000);
  }
  function addDays(s, n) {
    const p = String(s).split('-').map(Number);
    const d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n));
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
  }
  function isoWeek(s) {
    const p = String(s).split('-').map(Number);
    const d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const y = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return d.getUTCFullYear() + '-' + Math.ceil(((d - y) / 86400000 + 1) / 7);
  }
  function hash32(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function shuffled(arr, r) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sec(id) { return MB.sections.find(function (s) { return s.id === id; }); }
  function secTitle(id) { const s = sec(id); return s ? s.title : id; }
  function catTitle(id) { const c = MB.genCats.find(function (x) { return x.id === id; }); return c ? c.title : id; }
  function secOfCat(id) { return CAT2SEC[id] || 'alapok'; }
  function bar(pct, cls) {
    const v = pct == null || isNaN(pct) ? 0 : Math.max(0, Math.min(100, Math.round(pct)));
    return '<div class="bar' + (cls ? ' ' + cls : '') + '"><i style="width:' + v + '%"></i></div>';
  }
  function pctText(p) { return p == null ? '—' : Math.round(p * 100) + '%'; }
  function readinessLabel(p) {
    if (p == null) return T('nincs adat', 'no data yet');
    if (p < .35) return T('kezdet', 'starting');
    if (p < .55) return T('épül', 'building');
    if (p < .75) return T('stabil', 'solid');
    return T('ZH-kész', 'exam-ready');
  }

  /* ---------- state ---------- */
  function funState() {
    const st = MB.app.state;
    st.fun = st.fun || {};
    const f = st.fun;
    f.review = f.review || {};
    f.log = f.log || [];
    f.hunts = f.hunts || {};
    f.teach = f.teach || {};
    f.dailyDone = f.dailyDone || [];
    f.streak = f.streak || { count: 0, best: 0, last: null, freezeWeek: null, freezes: 1 };
    f.daily = f.daily || { date: null, answers: {}, done: false };
    f.mixed = f.mixed || { seed: 1, answers: {} };
    return f;
  }
  function save() { if (MB.app && MB.app.save) MB.app.save(); }

  /* ---------- streak ---------- */
  function markActive() {
    const f = funState(), s = f.streak, t = today();
    const wk = isoWeek(t);
    if (s.freezeWeek !== wk) { s.freezeWeek = wk; s.freezes = 1; }
    if (s.last === t) return { changed: false, count: s.count, freeze: false };
    const diff = s.last ? dayNum(t) - dayNum(s.last) : null;
    let freeze = false;
    if (s.last === null || diff > 2) s.count = 1;
    else if (diff === 1) s.count += 1;
    else if (diff === 2 && s.freezes > 0) { s.freezes -= 1; s.count += 1; freeze = true; }
    else s.count = 1;
    s.last = t;
    s.best = Math.max(s.best || 0, s.count);
    return { changed: true, count: s.count, freeze: freeze };
  }

  function logAnswer(topic, ok, kind) {
    const f = funState();
    f.log.push({ d: today(), ts: Date.now(), topic: topic || '', ok: !!ok, kind: kind || '' });
    if (f.log.length > 800) f.log.splice(0, f.log.length - 800);
  }

  /* ---------- error notebook (Leitner) ---------- */
  function reviewKey(d) {
    return String(hash32((d.topic || '') + '|' + String(d.q || '')));
  }
  function affectsNotebook(d) {
    return d && d.q && d.a != null && d.a !== '' && d.type !== 'proof' && d.type !== 'open';
  }
  function addMiss(d) {
    if (!affectsNotebook(d)) return;
    const f = funState(), k = reviewKey(d), prev = f.review[k];
    f.review[k] = {
      id: k, q: d.q, a: String(d.a), type: d.type || 'expr', alt: d.alt || null,
      sol: d.sol || '', hint: d.hint || '', choices: d.choices || null, topic: d.topic || '', src: d.kind || '',
      box: 0, due: addDays(today(), 1), added: prev ? prev.added : today(),
      lapses: prev ? (prev.lapses || 1) + 1 : 1, last: today(), mastered: false
    };
    trimNotebook(f);
  }
  function scheduleOnCorrect(d) {
    if (!affectsNotebook(d)) return;
    const f = funState(), it = f.review[reviewKey(d)];
    if (!it || it.mastered) return;
    it.box = Math.min(4, (it.box || 0) + 1);
    it.last = today();
    if (it.box >= 4) { it.mastered = true; it.due = null; }
    else it.due = addDays(today(), LEITNER[it.box]);
  }
  function trimNotebook(f) {
    const keys = Object.keys(f.review);
    if (keys.length <= 300) return;
    keys.sort(function (a, b) {
      const x = f.review[a], y = f.review[b];
      const xm = x.mastered ? 1 : 0, ym = y.mastered ? 1 : 0;
      if (xm !== ym) return ym - xm; /* mastered first, so shift() removes them */
      return String(x.due || '9999').localeCompare(String(y.due || '9999'));
    });
    while (keys.length > 300) delete f.review[keys.shift()];
  }
  function dueItems() {
    const f = funState(), t = today();
    return Object.keys(f.review).map(function (k) { return f.review[k]; })
      .filter(function (x) { return !x.mastered && x.due && x.due <= t; })
      .sort(function (a, b) { return (a.due || '').localeCompare(b.due || '') || (a.added || '').localeCompare(b.added || ''); });
  }
  function notebookStats() {
    const f = funState(), out = { total: 0, mastered: 0, boxes: [0, 0, 0, 0], due: 0 };
    Object.keys(f.review).forEach(function (k) {
      const x = f.review[k];
      out.total++;
      if (x.mastered) { out.mastered++; return; }
      out.boxes[Math.min(3, x.box || 0)]++;
      if (x.due && x.due <= today()) out.due++;
    });
    return out;
  }

  /* ---------- daily quest ---------- */
  function dailyItems(date) {
    const seed = hash32('daily:' + date);
    const r = rng(seed);
    const cats = shuffled(CORE_CATS, r).slice(0, 5);
    const levels = [1, 1, 2, 2, 3];
    return cats.map(function (c, i) {
      const it = MB.generateOne(c, levels[i], seed + i * 104729);
      it.cat = c; it.topic = secOfCat(c); it.level = levels[i]; it.idx = i;
      return it;
    });
  }
  function dailyDoneCount() {
    const f = funState(), d = f.daily;
    if (d.date !== today()) return 0;
    let n = 0;
    Object.keys(d.answers || {}).forEach(function (k) { if (d.answers[k] && d.answers[k].ok) n++; });
    return n;
  }
  function ensureDaily() {
    const f = funState(), t = today();
    if (f.daily.date !== t) { f.daily = { date: t, answers: {}, done: false }; save(); }
    return f.daily;
  }

  /* ---------- interleaved run ---------- */
  function mixedItems() {
    const f = funState();
    const seed = hash32('mixed:' + f.mixed.seed);
    const r = rng(seed);
    const cats = shuffled(CORE_CATS, r);
    const levels = [1, 1, 1, 2, 2, 2, 2, 3, 3, 3];
    const out = [];
    for (let i = 0; i < 10; i++) {
      const c = cats[i % cats.length];
      const it = MB.generateOne(c, levels[i], seed + i * 7919);
      it.cat = c; it.topic = secOfCat(c); it.level = levels[i]; it.idx = i;
      out.push(it);
    }
    return out;
  }
  function mixedScore() {
    const f = funState(), items = mixedItems();
    let n = 0;
    items.forEach(function (_, i) { if (f.mixed.answers[i] && f.mixed.answers[i].ok) n++; });
    return n;
  }

  /* ---------- generic exercise item ---------- */
  function itemHTML(it, o) {
    o = o || {};
    const type = it.type || 'expr';
    const done = !!o.done;
    const topic = it.topic || secOfCat(it.cat) || '';
    const ans = it.a == null ? '' : esc(typeof it.a === 'object' ? JSON.stringify(it.a) : String(it.a));
    const alt = it.alt ? esc(JSON.stringify(it.alt)) : '';
    let controls = '';
    if (done) {
      controls = '<span class="fun-done">' + MB.icon('check') + T('Megoldva', 'Solved') + '</span>';
    } else if (type === 'choice') {
      controls = '<div class="answer-row">' + (it.choices || []).map(function (ch, j) {
        return '<button class="btn sm" data-choice="' + j + '">' + ch + '</button>';
      }).join('') + '</div>';
    } else if (type === 'proof' || type === 'open') {
      controls = '<div class="self-check"><button class="btn sm" data-self="1">' + T('Megvan', 'Done') + '</button></div>';
    } else {
      controls = '<div class="answer-row"><input class="answer-input" type="text" inputmode="text" placeholder="' + T('Írd be az eredményt…', 'Type the result…') + '" aria-label="' + T('Válasz', 'Answer') + '">' +
        '<button class="btn sm check" data-check>' + T('Ellenőrzés', 'Check') + '</button>' +
        (it.hint ? '<button class="btn sm hint-btn" data-hint>' + T('Segítség', 'Hint') + '</button>' : '') + '</div>';
    }
    return '<div class="ex fun-item' + (done ? ' done' : '') + '"' +
      ' data-kind="' + esc(o.kind || 'extra') + '"' +
      ' data-funid="' + esc(o.funid || '') + '"' +
      ' data-idx="' + (o.idx == null ? '' : o.idx) + '"' +
      ' data-topic="' + esc(topic) + '"' +
      ' data-cat="' + esc(it.cat || '') + '"' +
      ' data-level="' + (it.level || 1) + '"' +
      ' data-type="' + esc(type) + '"' +
      ' data-ans="' + ans + '"' +
      ' data-alt="' + alt + '"' +
      ' data-choices="' + esc(it.choices ? JSON.stringify(it.choices) : '') + '"' +
      ' data-q="' + esc(it.q || '') + '"' +
      ' data-solution="' + esc(it.sol || '') + '"' +
      ' data-exhint="' + esc(it.hint || '') + '"' +
      (o.reviewId ? ' data-review-id="' + esc(o.reviewId) + '"' : '') + '>' +
      '<div class="ex-top"><div class="ex-idx">' + String((o.idx || 0) + 1).padStart(2, '0') + '</div>' +
      '<div class="ex-body"><div class="ex-q">' + it.q +
      '<span class="ex-level" title="' + T('Nehézség', 'Difficulty') + '">' + [1, 2, 3].map(function (n) { return '<i class="' + (n <= (it.level || 1) ? 'on' : '') + '"></i>'; }).join('') + '</span></div>' +
      '<div class="fun-topic-label' + (done || o.showTopic ? ' show' : '') + '">' + esc(secTitle(topic)) + '</div></div></div>' +
      '<div class="ex-bottom">' + controls +
      (it.hint ? '<div class="hint-text">' + MB.icon('bulb') + ' ' + it.hint + '</div>' : '') +
      '<div class="feedback"></div>' +
      (it.sol ? '<div style="margin-top:8px"><button class="btn sm sol-btn" data-sol>' + T('Megoldás', 'Solution') + '</button></div><div class="solution"><b>' + T('Megoldás.', 'Solution.') + '</b> ' + it.sol + '</div>' : '') +
      '</div></div>';
  }
  function pageHead(kicker, title, lead) {
    return '<div class="page-head"><div class="kicker">' + esc(kicker) + '</div><h1>' + esc(title) + '</h1><p class="lead">' + lead + '</p></div>';
  }
  function streakCard() {
    const f = funState(), s = f.streak;
    return '<div class="streak-box"><div class="streak-flame">' + MB.icon('flame') + '</div>' +
      '<div><b id="streakCount">' + (s.count || 0) + '</b><span>' + T('napos sorozat', 'day streak') + '</span>' +
      '<small id="streakMeta">' + T('Legjobb', 'Best') + ': ' + (s.best || 0) + ' · ' + T('fagyasztó', 'freeze') + ': ' + (s.freezes || 0) + '/' + T('hét', 'week') + '</small></div></div>';
  }

  /* ---------- view: daily ---------- */
  MB.dailyView = function () {
    document.title = T('Napi küldetés', 'Daily quest') + ' — MatekBázis';
    const f = funState(), d = ensureDaily();
    const items = dailyItems(d.date);
    const done = dailyDoneCount();
    let h = pageHead(T('Napi gyakorlás', 'Daily practice'), T('Napi küldetés', 'Daily quest'),
      T('Öt vegyes feladat, körülbelül öt perc. Nem kell kiválasztanod a témát — pont ez a lényeg. A válasz után megmutatjuk, melyik területről jött.',
        'Five mixed exercises, about five minutes. You do not pick the topic — that is the point. After answering, we reveal which area it came from.'));
    h += '<div class="fun-hero">' + streakCard() +
      '<div class="quest-progress"><div class="qp-top"><span>' + T('Mai küldetés', 'Today’s quest') + '</span><b id="dailyCount">' + done + ' / 5</b></div>' +
      bar(done / 5 * 100) +
      '<small>' + (d.done ? T('Teljesítve. Holnap új ötös jön.', 'Complete. A new set arrives tomorrow.') : T('Mind az ötöt oldd meg a sorozatért.', 'Solve all five to keep the streak.')) + '</small></div></div>';
    if (d.done) {
      h += '<div class="callout ok-callout"><div class="ct">' + MB.icon('trophy') + T('Küldetés teljesítve', 'Quest complete') + '</div><div class="body"><p>' +
        T('Ma megvan. A sorozatod: ', 'Done for today. Your streak: ') + '<b>' + (f.streak.count || 0) + '</b> ' + T('nap.', 'days.') + '</p></div></div>';
    }
    h += '<div class="gen-list" id="dailyList">';
    items.forEach(function (it, i) {
      const a = (d.answers || {})[i];
      h += itemHTML(it, { kind: 'daily', funid: 'd:' + d.date + ':' + i, idx: i, done: !!(a && a.ok), showTopic: false });
    });
    h += '</div>';
    h += '<div class="fun-foot"><a class="btn navy" href="#/practice">' + MB.icon('dumbbell') + ' ' + T('Több gyakorlás a feladatbankból', 'More practice in the bank') + '</a>' +
      '<a class="btn" href="#/review">' + MB.icon('notebook') + ' ' + T('Hibafüzet', 'Error notebook') + '</a></div>';
    return h;
  };

  /* ---------- view: review ---------- */
  MB.reviewView = function () {
    document.title = T('Hibafüzet', 'Error notebook') + ' — MatekBázis';
    const f = funState(), st = notebookStats(), due = dueItems();
    let h = pageHead(T('Ismétlés', 'Review'), T('Hibafüzet', 'Error notebook'),
      T('Minden hibás válasz ide kerül. A nehézség nem eltűnik: 1, 3, 7, majd 21 nap múlva újra előjön. Ha megoldod, feljebb lép.',
        'Every wrong answer lands here. The difficulty does not disappear: it returns after 1, 3, 7, then 21 days. Solve it and it moves up.'));
    h += '<div class="review-stats">' +
      '<div class="rs"><b id="reviewCount">' + st.due + '</b><span>' + T('ma esedékes', 'due today') + '</span></div>' +
      '<div class="rs"><b>' + st.total + '</b><span>' + T('összes bejegyzés', 'total entries') + '</span></div>' +
      '<div class="rs"><b>' + st.mastered + '</b><span>' + T('megtanulva', 'mastered') + '</span></div>' +
      '<div class="rs boxes"><b>' + st.boxes.join(' / ') + '</b><span>' + T('dobozok (1 / 3 / 7 / 21 nap)', 'boxes (1 / 3 / 7 / 21 days)') + '</span></div>' +
      '</div>';
    if (!due.length) {
      h += '<div class="empty-fun"><div class="ef-icon">' + MB.icon('check') + '</div><h3>' + T('Nincs esedékes ismétlés', 'No reviews due') + '</h3>' +
        '<p>' + T('Ha ma hibáztál valamit, az holnap jelenik meg itt. Addig menj a napi küldetésre vagy a vegyes menetre.',
          'Anything you miss today appears here tomorrow. Until then, do the daily quest or a mixed run.') + '</p>' +
        '<div class="fun-foot"><a class="btn navy" href="#/daily">' + T('Napi küldetés', 'Daily quest') + '</a><a class="btn" href="#/mixed">' + T('Vegyes menet', 'Mixed run') + '</a></div></div>';
      return h;
    }
    h += '<div class="review-note">' + T('Az első próbálkozás számít. Ha elrontod, holnap újra előjön — nem kell azonnal újra megpróbálni.',
      'The first attempt counts. If you miss it, it returns tomorrow — no need to retry immediately.') + '</div>';
    h += '<div class="gen-list" id="reviewList">';
    due.slice(0, 25).forEach(function (it, i) {
      h += '<div class="review-item">' +
        '<div class="review-meta"><span class="tag-topic">' + esc(secTitle(it.topic)) + '</span>' +
        '<span>' + T('doboz', 'box') + ' ' + ((it.box || 0) + 1) + ' / 4</span>' +
        '<span>' + T('első hiba', 'first miss') + ': ' + esc(it.added || '') + '</span>' +
        '<span>' + (it.lapses || 1) + '×</span>' +
        '<button class="icon-btn review-remove" data-review-remove="' + esc(it.id) + '" title="' + T('Törlés', 'Remove') + '" aria-label="' + T('Törlés', 'Remove') + '">' + MB.icon('x') + '</button></div>' +
        itemHTML(it, { kind: 'review', funid: 'r:' + it.id, reviewId: it.id, idx: i, showTopic: true }) +
        '</div>';
    });
    if (due.length > 25) h += '<p class="muted" style="font-family:var(--font-ui);font-size:.78rem">' + T('Az első 25 esedékes látható. A többi a következő körben jön.', 'Showing the first 25 due items. The rest come next round.') + '</p>';
    h += '</div>';
    return h;
  };

  /* ---------- view: mixed run ---------- */
  MB.mixedView = function () {
    document.title = T('Vegyes menet', 'Mixed run') + ' — MatekBázis';
    const f = funState(), items = mixedItems(), score = mixedScore();
    let h = pageHead(T('Vegyes menet', 'Mixed run'), T('Vegyes menet', 'Mixed run'),
      T('Tíz feladat, három-négy témából, témacímkék nélkül. A vizsgán nem az a nehéz, hogy megoldasz egy deriváltat — hanem hogy felismered, deriválni kell. A témát csak a válasz után áruljuk el.',
        'Ten exercises from three or four topics, with no topic labels. The exam is not hard because a derivative is hard — it is hard because you must recognise that it is a derivative. We reveal the topic only after you answer.'));
    h += '<div class="fun-hero"><div class="quest-progress"><div class="qp-top"><span>' + T('Pontszám', 'Score') + '</span><b id="mixedScore">' + score + ' / 10</b></div>' +
      bar(score / 10 * 100) + '<small>' + T('Az első próbálkozás számít a pontszámba.', 'The first attempt counts toward the score.') + '</small></div>' +
      '<button class="btn navy" data-mixed-new>' + MB.icon('refresh') + ' ' + T('Új menet', 'New run') + '</button></div>';
    h += '<div class="gen-list" id="mixedList">';
    items.forEach(function (it, i) {
      const a = f.mixed.answers[i];
      h += itemHTML(it, { kind: 'mixed', funid: 'm:' + f.mixed.seed + ':' + i, idx: i, done: !!(a && a.ok), showTopic: false });
    });
    h += '</div>';
    return h;
  };

  /* ---------- error hunt ---------- */
  const HUNTS = [
    {
      id: 'log-sum', topic: 'alapok', title: T('Logaritmus összegre', 'Log of a sum'),
      problem: String.raw`Egyszerűsítés: $\ln(a+b)$.`,
      steps: [String.raw`$\ln(ab)=\ln a+\ln b$`, String.raw`$\ln(a+b)=\ln a+\ln b$`, String.raw`$\ln(a/b)=\ln a-\ln b$`], wrong: 1,
      why: String.raw`A logaritmus csak szorzatra bont szét: $\ln(ab)=\ln a+\ln b$. Összeg logaritmusára nincs ilyen szabály. Ellenpélda: $\ln(2+2)=\ln4$, de $\ln2+\ln2=\ln4$ — ez még éppen egyezik; $\ln(1+1)=\ln2$, viszont $\ln1+\ln1=0$.`
    },
    {
      id: 'sqrt-sum', topic: 'alapok', title: T('Gyök összegre', 'Square root of a sum'),
      problem: String.raw`Egyszerűsítés: $\sqrt{a^2+b^2}$.`,
      steps: [String.raw`$\sqrt{ab}=\sqrt a\sqrt b$`, String.raw`$\sqrt{a^2+b^2}=a+b$`, String.raw`$\sqrt{a^2}=|a|$`], wrong: 1,
      why: String.raw`A gyök csak szorzatra bont: $\sqrt{ab}=\sqrt a\sqrt b$. Ellenpélda: $a=3$, $b=4$ esetén $\sqrt{9+16}=5$, nem $7$. Ez a hiba a Pitagorasz-tételnél a leggyakoribb.`
    },
    {
      id: 'square-sum', topic: 'alapok', title: T('Nevezetes szorzat', 'Binomial square'),
      problem: String.raw`$(a+b)^2$ kifejtése.`,
      steps: [String.raw`$(a+b)^2=a^2+2ab+b^2$`, String.raw`$(a-b)^2=a^2-2ab+b^2$`, String.raw`$(a+b)^2=a^2+b^2$`], wrong: 2,
      why: String.raw`Hiányzik a kereszttag: $(a+b)^2=a^2+2ab+b^2$. A harmadik állítás hamis; a helyes kifejtésben ott van a $2ab$.`
    },
    {
      id: 'quantifier', topic: 'logika', title: T('Kvantorok sorrendje', 'Quantifier order'),
      problem: String.raw`Minden valós $x$-hez van olyan $y$, hogy $y>x$.`,
      steps: [String.raw`$\forall x\,\exists y:\ y>x$`, String.raw`$\exists y\,\forall x:\ y>x$`, String.raw`$\forall x\,\exists y:\ y\ge x$`], wrong: 1,
      why: String.raw`A sorrend nem cserélhető. Az első igaz (mindig választható nagyobb $y$); a második azt állítaná, hogy van egyetlen $y$, amely minden valós $x$-nél nagyobb — ilyen nincs.`
    },
    {
      id: 'induction', topic: 'logika', title: T('Teljes indukció', 'Mathematical induction'),
      problem: String.raw`$1+2+\dots+n=\frac{n(n+1)}2$ bizonyítása teljes indukcióval.`,
      steps: [T('Bázis: $n=1$-re $1=\\frac{1\cdot2}2$, kész.', 'Base: for $n=1$, $1=\\frac{1\cdot2}2$, done.'), T('Indukciós lépés: feltesszük $n=k$-ra, és belátjuk $n=k+1$-re.', 'Inductive step: assume for $n=k$ and prove for $n=k+1$.'), T('A bázis elhagyható, mert az indukciós lépés úgyis minden $n$-re működik.', 'The base case can be omitted, because the inductive step works for every $n$.')], wrong: 2,
      why: T('Az indukciós lépés csak $P(k)\Rightarrow P(k+1)$-et adja. Bázis nélkül nem tudjuk, hogy bármelyik $P(k)$ igaz. A bázis nem formalitás: az indukció első dominója.', 'The inductive step only gives $P(k)\\Rightarrow P(k+1)$. Without a base, we do not know that any $P(k)$ is true. The base is not a formality: it is the first domino.')
    },
    {
      id: 'complex-modulus', topic: 'komplex', title: T('Komplex modulus', 'Complex modulus'),
      problem: String.raw`$|3+4i|=?$`,
      steps: [String.raw`$|a+bi|=\sqrt{a^2+b^2}$`, String.raw`$|3+4i|=5$`, String.raw`$|3+4i|=7$`], wrong: 2,
      why: String.raw`A modulus a síkban mért távolság: $|a+bi|=\sqrt{a^2+b^2}=\sqrt{9+16}=5$. A valós és képzetes rész nem összeadható.`
    },
    {
      id: 'complex-i2', topic: 'komplex', title: T('Az imaginárius egység', 'The imaginary unit'),
      problem: String.raw`$i^2=?$`,
      steps: [String.raw`$i^2=-1$`, String.raw`$i^4=1$`, String.raw`$i^2=1$`], wrong: 2,
      why: String.raw`Definíció szerint $i^2=-1$. Ebből jön, hogy a komplex számokkal ugyanúgy számolunk, mint a valósokkal, csak $i^2$ helyére $-1$-et írunk.`
    },
    {
      id: 'complex-square', topic: 'komplex', title: T('Komplex négyzet', 'Squaring a complex number'),
      problem: String.raw`$(1+i)^2=?$`,
      steps: [String.raw`$(1+i)^2=2i$`, String.raw`$(1+i)^2=1^2+i^2=0$`, String.raw`$(1+i)(1-i)=2$`], wrong: 1,
      why: String.raw`A négyzetes azonosság itt is érvényes: $(1+i)^2=1+2i+i^2=1+2i-1=2i$. A kereszttag nem hagyható el.`
    },
    {
      id: 'seq-e', topic: 'sorozatok', title: T('Az $e$ határérték', 'The limit defining $e$'),
      problem: String.raw`$\lim_{n\to\infty}\left(1+\frac1n\right)^n=?$`,
      steps: [String.raw`$\lim(1+1/n)^n=e$`, String.raw`$\lim(1+1/n)^n=1$`, String.raw`$\lim(1+1/n)=1$`], wrong: 1,
      why: String.raw`$1^\infty$ nem határozott érték: a bázis is, a kitevő is változik. A határérték $e\approx2{,}718$. Ez az $e$ egyik lehetséges definíciója.`
    },
    {
      id: 'seq-inf', topic: 'sorozatok', title: T('Végtelen per végtelen', 'Infinity over infinity'),
      problem: String.raw`$\lim_{n\to\infty}\frac{n+1}{n}=?$`,
      steps: [String.raw`$\lim\frac{n+1}{n}=1$`, String.raw`$\lim\frac{n+1}{n}=\infty$`, String.raw`$\lim\frac1n=0$`], wrong: 1,
      why: String.raw`Nem „nincs”, csak még nem látszik. Ossz el $n$-nel: $\frac{1+1/n}{1}\to1$. A végtelen per végtelen alakot át kell alakítani.`
    },
    {
      id: 'lim-sin', topic: 'hatarertek', title: T('Nevezetes határérték', 'A standard limit'),
      problem: String.raw`$\lim_{x\to0}\frac{\sin x}{x}=?$`,
      steps: [String.raw`$\lim_{x\to0}\frac{\sin x}{x}=1$`, String.raw`$\lim_{x\to0}\frac{\sin x}{x}=0$`, String.raw`$\lim_{x\to0}\sin x=0$`], wrong: 1,
      why: String.raw`A $\frac00$ határozatlan forma, nem nulla. A nevezetes határérték $1$; geometriailag az ív és a húr aránya tart $1$-hez.`
    },
    {
      id: 'lim-cancel', topic: 'hatarertek', title: T('Kiejtés a határértéknél', 'Cancelling before the limit'),
      problem: String.raw`$\lim_{x\to1}\frac{x^2-1}{x-1}=?$`,
      steps: [String.raw`$\lim_{x\to1}\frac{x^2-1}{x-1}=2$`, String.raw`$\lim_{x\to1}\frac{x^2-1}{x-1}=0$`, String.raw`$\frac{x^2-1}{x-1}=x+1\ (x\ne1)$`], wrong: 1,
      why: String.raw`Előbb alakíts: $\frac{(x-1)(x+1)}{x-1}=x+1$ (ha $x\ne1$), ezért a határérték $2$. A $\frac00$ csak jelzés, hogy számolni kell.`
    },
    {
      id: 'der-chain', topic: 'derivalas', title: T('Láncszabály', 'Chain rule'),
      problem: String.raw`$f(x)=\sin(x^2)$ deriváltja.`,
      steps: [String.raw`$(\sin x)'=\cos x$`, String.raw`$(\sin(x^2))'=\cos(x^2)$`, String.raw`$(\cos x)'=-\sin x$`], wrong: 1,
      why: String.raw`A külső függvény deriváltja után a belső függvény deriváltjával is szorozni kell: $f'(x)=\cos(x^2)\cdot2x$. A láncszabály a legtöbb pontot vesztő hiba a ZH-n.`
    },
    {
      id: 'der-product', topic: 'derivalas', title: T('Szorzat deriváltja', 'Product rule'),
      problem: String.raw`$(x^2e^x)'=?$`,
      steps: [String.raw`$(x^2e^x)'=2xe^x+x^2e^x$`, String.raw`$(x^2e^x)'=2xe^x$`, String.raw`$(e^x)'=e^x$`], wrong: 1,
      why: String.raw`Szorzatnál mindkét tényezőt deriválni kell: $(uv)'=u'v+uv'$, tehát $2xe^x+x^2e^x$. Az első tag önmagában csak az egyik fele.`
    },
    {
      id: 'der-ln-square', topic: 'derivalas', title: T('Összetett logaritmus', 'Composite logarithm'),
      problem: String.raw`$(\ln(x^2))'=?$`,
      steps: [String.raw`$(\ln(x^2))'=\frac2x$`, String.raw`$(\ln(x^2))'=\frac1{x^2}$`, String.raw`$(\ln x)'=\frac1x$`], wrong: 1,
      why: String.raw`Láncszabállyal: $\frac1{x^2}\cdot2x=\frac2x$. Ugyanez jön abból is, hogy $\ln(x^2)=2\ln|x|$ (ahol értelmezett).`
    },
    {
      id: 'int-one-over-x', topic: 'integralas', title: T('$1/x$ integrálja', 'The integral of $1/x$'),
      problem: String.raw`$\int\frac1x\,dx=?$`,
      steps: [String.raw`$\int x^2\,dx=\frac{x^3}{3}+C$`, String.raw`$\int\frac1x\,dx=\ln|x|+C$`, String.raw`$\int x^{-1}\,dx=\frac{x^0}{0}$`], wrong: 2,
      why: String.raw`A hatványszabály $n=-1$-re nem működik (nullával osztanánk). Az antiderivált $\ln|x|+C$. Ez az egyetlen kivétel a hatványszabály alól.`
    },
    {
      id: 'int-substitution', topic: 'integralas', title: T('Helyettesítés', 'Substitution'),
      problem: String.raw`$\int2x\cos(x^2)\,dx=?$`,
      steps: [String.raw`$\int2x\cos(x^2)\,dx=\sin(x^2)+C$`, String.raw`$\int2x\cos(x^2)\,dx=\int\cos(x^2)\,dx$`, String.raw`$u=x^2\Rightarrow du=2x\,dx$`], wrong: 1,
      why: String.raw`A $2x$ nem dísz: ez pont $du$, ha $u=x^2$. Így $\int\cos u\,du=\sin u+C=\sin(x^2)+C$. A közbülső sor hamis, még ha a végeredmény véletlenül jó is.`
    },
    {
      id: 'series-geometric', topic: 'sorok', title: T('Geometriai sor', 'Geometric series'),
      problem: String.raw`$1+\frac12+\frac14+\cdots=?$`,
      steps: [String.raw`$1+\frac12+\frac14+\cdots=2$`, String.raw`$1+\frac12+\frac14+\cdots$ divergens`, String.raw`$\sum q^n=\frac1{1-q}\ (|q|<1)$`], wrong: 1,
      why: String.raw`A végtelen sok tag nem jelent divergenciát. Itt $q=\frac12$, és $|q|<1$, ezért az összeg $\frac1{1-q}=2$.`
    },
    {
      id: 'series-harmonic', topic: 'sorok', title: T('Harmonikus sor', 'Harmonic series'),
      problem: String.raw`$\sum_{n=1}^{\infty}\frac1n$ konvergens?`,
      steps: [String.raw`$\sum\frac1n$ divergens`, String.raw`$\sum\frac1{n^2}$ konvergens`, String.raw`$\sum\frac1n$ konvergens, mert $\frac1n\to0$`], wrong: 2,
      why: String.raw`A tagok nullához tartása szükséges, de nem elégséges feltétel. A harmonikus sor divergál; a részletösszegek lassan, de végtelenhez tartanak.`
    },
    {
      id: 'taylor-exp', topic: 'taylor', title: T('Taylor-polinom', 'Taylor polynomial'),
      problem: String.raw`$e^x$ másodfokú Taylor-polinomja $0$ körül.`,
      steps: [String.raw`$e^x=1+x+\frac{x^2}{2}+\cdots$`, String.raw`$e^x=1+x+x^2+\cdots$`, String.raw`$\sin x=x-\frac{x^3}{6}+\cdots$`], wrong: 1,
      why: String.raw`A Taylor-együttható $\frac{f^{(k)}(0)}{k!}$. Itt $f^{(2)}(0)=1$, ezért a tag $\frac{x^2}{2!}=\frac{x^2}2$, nem $x^2$.`
    },
    {
      id: 'linalg-det', topic: 'linearis', title: T('Determináns', 'Determinant'),
      problem: String.raw`$\det\begin{pmatrix}a&b\\c&d\end{pmatrix}=?$`,
      steps: [String.raw`$\det\begin{pmatrix}a&b\\c&d\end{pmatrix}=ad-bc$`, String.raw`$\det\begin{pmatrix}a&b\\c&d\end{pmatrix}=ab-cd$`, String.raw`$\det I=1$`], wrong: 1,
      why: String.raw`A $2\times2$ determináns átlós szorzatok különbsége: $ad-bc$. A képletet érdemes a mátrix elemein végigolvasni, nem betűpárokat memorizálni.`
    },
    {
      id: 'discrete-subsets', topic: 'diszkret', title: T('Részhalmazok száma', 'Number of subsets'),
      problem: String.raw`Hány részhalmaza van egy $n$ elemű halmaznak?`,
      steps: [T('Egy $n$ elemű halmaznak $2^n$ részhalmaza van.', 'An $n$-element set has $2^n$ subsets.'), T('Egy 3 elemű halmaznak 8 részhalmaza van.', 'A 3-element set has 8 subsets.'), T('Egy $n$ elemű halmaznak $2n$ részhalmaza van.', 'An $n$-element set has $2n$ subsets.')], wrong: 2,
      why: String.raw`A gondolatmenet jó, a képlet nem: minden elemre $2$ döntés, tehát $2^n$. Például $n=3$-ra $8$ részhalmaz van, nem $6$.`
    }
  ];
  const HUNT_TOPICS = ['alapok', 'logika', 'komplex', 'sorozatok', 'hatarertek', 'derivalas', 'integralas', 'sorok', 'taylor', 'linearis', 'diszkret'];

  MB.huntView = function (id) {
    if (!id) {
      document.title = T('Hibavadászat', 'Error hunt') + ' — MatekBázis';
      let h = pageHead(T('Hibavadászat', 'Error hunt'), T('Hibavadászat', 'Error hunt'),
        T('Minden feladatban három állítás van, és pontosan egy hamis. Kattints a hamisra. Nem kell megoldanod — csak megtalálnod.',
          'Each problem has three statements, and exactly one is false. Click the false one. You do not have to solve it — only find it.'));
      const doneCount = Object.keys(funState().hunts).length;
      h += '<div class="hunt-summary"><b>' + doneCount + ' / ' + HUNTS.length + '</b> ' + T('megoldva', 'solved') + '</div>';
      HUNT_TOPICS.forEach(function (topic) {
        const list = HUNTS.filter(function (x) { return x.topic === topic; });
        if (!list.length) return;
        h += '<div class="hunt-group"><h3>' + esc(secTitle(topic)) + '</h3><div class="hunt-grid">';
        list.forEach(function (x) {
          const done = !!funState().hunts[x.id];
          h += '<a class="hunt-card' + (done ? ' done' : '') + '" href="#/hunt/' + esc(x.id) + '">' +
            '<span class="hunt-status">' + (done ? MB.icon('check') + T('Megoldva', 'Solved') : T('Keresd a hibát', 'Find the error')) + '</span>' +
            '<h4>' + esc(x.title) + '</h4>' +
            '<p>' + T('Három állítás, egy hamis.', 'Three statements, one false.') + '</p></a>';
        });
        h += '</div></div>';
      });
      return h;
    }
    const h0 = HUNTS.find(function (x) { return x.id === id; });
    if (!h0) { location.hash = '#/hunt'; return ''; }
    document.title = h0.title + ' — MatekBázis';
    const solved = !!funState().hunts[h0.id];
    let h = pageHead(T('Hibavadászat', 'Error hunt'), h0.title, T('Kattints a hamis állításra.', 'Click the false statement.'));
    h += '<div class="hunt-box' + (solved ? ' solved' : '') + '" data-hunt="' + esc(h0.id) + '">' +
      '<div class="hunt-problem">' + h0.problem + '</div>' +
      '<div class="hunt-steps">';
    h0.steps.forEach(function (s, i) {
      h += '<button class="hunt-step' + (solved && i === h0.wrong ? ' bad' : '') + '" data-hunt-step="' + i + '">' +
        '<span class="ln">' + String(i + 1).padStart(2, '0') + '</span><span class="st">' + s + '</span></button>';
    });
    h += '</div><div class="hunt-feedback" data-hunt-feedback>' + (solved ? T('Megtaláltad a hibát.', 'You found the error.') : '') + '</div>' +
      '<div class="hunt-why' + (solved ? ' show' : '') + '"><b>' + T('Mi a hiba?', 'What is wrong?') + '</b> ' + h0.why + '</div></div>';
    h += '<div class="fun-foot"><a class="btn" href="#/hunt">← ' + T('Vissza a listához', 'Back to the list') + '</a>' +
      '<a class="btn" href="#/practice/' + (SEC2CAT[h0.topic] || 'algebra') + '">' + T('Gyakorlás erre a témára', 'Practise this topic') + '</a></div>';
    return h;
  };

  /* ---------- teach-back ---------- */
  MB.teachHTML = function (c, s) {
    const f = funState(), key = s.id + '/' + c.id, saved = f.teach[key] || {};
    const checks = saved.checks || [false, false, false];
    const formulas = MB.formulas.filter(function (x) { return x.ref && x.ref[0] === s.id && x.ref[1] === c.id; }).map(function (x) { return x.name; });
    const why = c.why ? (Array.isArray(c.why) ? c.why[0] : c.why) : '';
    const model = '<p>' + c.lead + '</p>' + (why ? '<p>' + why + '</p>' : '') + (c.when ? '<p>' + c.when + '</p>' : '');
    const chips = formulas.length ? '<div class="teach-chips">' + formulas.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '';
    return '<section class="book-section" id="magyarazd"><h2 class="section-label">' + T('Magyarázd el', 'Explain it') + ' <span class="sub">' + T('két-három mondat, a saját szavaiddal', 'two or three sentences, in your own words') + '</span></h2>' +
      '<div class="teach-box" data-teach-key="' + esc(key) + '">' +
      '<p class="teach-prompt">' + T('Képzeld el, hogy egy évfolyamtársadnak magyarázod el a fejezet fő ötletét. Ha nem megy két mondatban, valószínűleg még nem érted eléggé — ez a legjobb jelzés, amit kaphatsz.',
        'Imagine explaining the main idea of this chapter to a classmate. If it does not fit in two sentences, you probably do not own it yet — that is the best signal you can get.') + '</p>' +
      '<textarea id="teachText" rows="5" placeholder="' + T('A fő ötlet: …', 'The main idea: …') + '">' + esc(saved.text || '') + '</textarea>' +
      '<div class="teach-row"><span data-teach-count>' + (saved.text ? saved.text.trim().split(/\s+/).filter(Boolean).length : 0) + ' ' + T('szó', 'words') + '</span><span data-teach-state>' + (saved.text ? T('Mentve', 'Saved') + ' · ' + esc(saved.date || '') : T('Nincs mentve', 'Not saved')) + '</span><button class="btn sm navy" data-teach-save>' + T('Mentés', 'Save') + '</button></div>' +
      '<div class="teach-checks">' +
      '<label><input type="checkbox" data-teach-check="0"' + (checks[0] ? ' checked' : '') + '> ' + T('Megneveztem a definíciót', 'I named the definition') + '</label>' +
      '<label><input type="checkbox" data-teach-check="1"' + (checks[1] ? ' checked' : '') + '> ' + T('Mondtam feltételt vagy kivételt', 'I stated a condition or exception') + '</label>' +
      '<label><input type="checkbox" data-teach-check="2"' + (checks[2] ? ' checked' : '') + '> ' + T('Adtam példát vagy ellenpéldát', 'I gave an example or counterexample') + '</label>' +
      '</div>' +
      '<details class="teach-model"><summary>' + T('Minta és kulcsfogalmak', 'Model answer and key terms') + '</summary><div class="teach-model-body">' + model + chips + '</div></details>' +
      '</div></section>';
  };

  /* ---------- readiness ---------- */
  function sectionStats() {
    const st = MB.app.state, f = funState(), t = today();
    return MB.sections.map(function (s) {
      let total = 0, solved = 0;
      s.chapters.forEach(function (c) {
        (c.exercises || []).forEach(function (q, j) {
          if (q.type === 'proof' || q.type === 'open') return;
          total++;
          if (st.ex[s.id + '/' + c.id + '/' + j]) solved++;
        });
      });
      const logs = f.log.filter(function (x) { return x.topic === s.id; });
      const acc = logs.length ? logs.filter(function (x) { return x.ok; }).length / logs.length : null;
      const nb = Object.keys(f.review).map(function (k) { return f.review[k]; }).filter(function (x) { return x.topic === s.id && !x.mastered; });
      const overdue = nb.filter(function (x) { return x.due && x.due <= t; }).length;
      const health = nb.length ? 1 - overdue / nb.length : null;
      let test = null;
      Object.keys(st.tests || {}).forEach(function (k) {
        const r = st.tests[k];
        if (r && r.section === s.id && typeof r.pct === 'number') test = Math.max(test == null ? 0 : test, r.pct);
      });
      const parts = [];
      if (total > 0) parts.push([solved / total, 0.45]);
      if (logs.length >= 3) parts.push([acc, 0.30]);
      if (nb.length > 0) parts.push([health, 0.15]);
      if (test != null) parts.push([test / 100, 0.30]);
      const wsum = parts.reduce(function (a, p) { return a + p[1]; }, 0);
      const readiness = wsum ? parts.reduce(function (a, p) { return a + p[0] * p[1]; }, 0) / wsum : null;
      return { s: s, total: total, solved: solved, coverage: total ? solved / total : null, acc: acc, answers: logs.length, nb: nb.length, overdue: overdue, health: health, test: test, readiness: readiness };
    });
  }
  function overallReadiness(stats) {
    const rows = stats.filter(function (x) { return CORE_IDS.indexOf(x.s.id) >= 0 && x.readiness != null; });
    if (!rows.length) return null;
    return rows.reduce(function (a, x) { return a + x.readiness; }, 0) / rows.length;
  }
  function groupReadiness(stats, ids) {
    const rows = stats.filter(function (x) { return ids.indexOf(x.s.id) >= 0 && x.readiness != null; });
    if (!rows.length) return null;
    return rows.reduce(function (a, x) { return a + x.readiness; }, 0) / rows.length;
  }
  function weeklyStats() {
    const f = funState(), from = addDays(today(), -6);
    const log = f.log.filter(function (x) { return x.d >= from; });
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(today(), -i);
      const rows = log.filter(function (x) { return x.d === d; });
      days.push({ d: d, n: rows.length, ok: rows.filter(function (x) { return x.ok; }).length });
    }
    const byTopic = {};
    log.forEach(function (x) {
      if (!x.topic) return;
      byTopic[x.topic] = byTopic[x.topic] || { n: 0, ok: 0 };
      byTopic[x.topic].n++;
      if (x.ok) byTopic[x.topic].ok++;
    });
    let weak = null;
    Object.keys(byTopic).forEach(function (k) {
      const v = byTopic[k];
      if (v.n < 3) return;
      const acc = v.ok / v.n;
      if (!weak || acc < weak.acc) weak = { topic: k, acc: acc, n: v.n };
    });
    return {
      days: days, n: log.length, ok: log.filter(function (x) { return x.ok; }).length,
      activeDays: days.filter(function (x) { return x.n > 0; }).length,
      reviews: log.filter(function (x) { return x.kind === 'review' && x.ok; }).length,
      dailyQuests: f.dailyDone.filter(function (d) { return d >= from; }).length,
      teach: Object.keys(f.teach).map(function (k) { return f.teach[k]; }).filter(function (x) { return x.date >= from; }).length,
      hunts: Object.keys(f.hunts).map(function (k) { return f.hunts[k]; }).filter(function (d) { return d >= from; }).length,
      weak: weak
    };
  }

  MB.progressView = function () {
    document.title = T('Haladás', 'Progress') + ' — MatekBázis';
    const f = funState(), stats = sectionStats(), overall = overallReadiness(stats), w = weeklyStats();
    const groups = [
      { title: T('Alapok', 'Foundations'), ids: ['alapok', 'logika'] },
      { title: 'ZH1', ids: ['komplex', 'sorozatok', 'hatarertek'] },
      { title: 'ZH2', ids: ['derivalas'] },
      { title: T('Vizsga', 'Exam'), ids: CORE_IDS }
    ];
    let h = pageHead(T('Haladás', 'Progress'), T('ZH-felkészültség és heti riport', 'Exam readiness and weekly recap'),
      T('Ez nem jegy, hanem iránytű: feladatlefedettség, friss pontosság, ismétlésállapot és tesztpontszám egy számmá gyúrva. A cél az, hogy lásd, melyik rész húzza le a többit.',
        'This is not a grade, but a compass: exercise coverage, recent accuracy, review health and test scores folded into one number. The point is to see which part is dragging the rest down.'));
    h += '<div class="ready-grid">';
    groups.forEach(function (g) {
      const p = groupReadiness(stats, g.ids);
      h += '<div class="ready-card"><span class="rc-title">' + esc(g.title) + '</span><div class="rc-pct">' + pctText(p) + '</div>' +
        bar(p == null ? 0 : p * 100) + '<span class="rc-label">' + readinessLabel(p) + '</span></div>';
    });
    h += '</div>';

    h += '<div class="home-section"><div class="section-head"><div><h2>' + T('Részenként', 'By part') + '</h2><p>' + T('Ahol a készültség legalacsonyabb, ott érdemes legközelebb dolgozni.', 'Work next where readiness is lowest.') + '</p></div></div>' +
      '<div class="ready-table">';
    stats.forEach(function (x) {
      const cat = SEC2CAT[x.s.id] || 'algebra';
      const detail = [];
      if (x.total) detail.push(x.solved + '/' + x.total + ' ' + T('feladat', 'exercises'));
      if (x.acc != null) detail.push(T('pontosság', 'accuracy') + ' ' + Math.round(x.acc * 100) + '%');
      if (x.nb) detail.push(x.nb + ' ' + T('ismétlés', 'review'));
      if (x.test != null) detail.push(T('teszt', 'test') + ' ' + x.test + '%');
      h += '<div class="ready-row"><div class="rr-name"><a href="#/section/' + x.s.id + '">' + x.s.num + '. ' + esc(x.s.title) + '</a>' +
        '<small>' + (detail.join(' · ') || T('még nincs adat', 'no data yet')) + '</small></div>' +
        '<div class="rr-bar">' + bar(x.readiness == null ? 0 : x.readiness * 100) + '</div>' +
        '<div class="rr-pct">' + pctText(x.readiness) + '</div>' +
        '<a class="icon-btn" href="#/practice/' + cat + '" title="' + T('Gyakorlás', 'Practise') + '" aria-label="' + T('Gyakorlás', 'Practise') + '">' + MB.icon('dumbbell') + '</a></div>';
    });
    h += '</div></div>';

    h += '<div class="home-section"><div class="section-head"><div><h2>' + T('Heti riport', 'Weekly recap') + '</h2><p>' + T('Az utolsó hét nap. Nem a látogatásokat számoljuk, hanem a megoldott feladatokat.', 'The last seven days. We count solved exercises, not visits.') + '</p></div></div>' +
      '<div class="week-card"><div class="week-bars">';
    const max = Math.max(1, Math.max.apply(null, w.days.map(function (d) { return d.n; })));
    w.days.forEach(function (d) {
      const p = new Date(d.d + 'T00:00:00');
      const names = MB.lang === 'en' ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'];
      h += '<div class="week-bar"><i style="height:' + (8 + Math.round(d.n / max * 72)) + 'px"></i><span>' + names[p.getDay()] + '</span><small>' + d.n + '</small></div>';
    });
    h += '</div><div class="week-stats">' +
      '<div><b>' + w.n + '</b><span>' + T('válasz', 'answers') + '</span></div>' +
      '<div><b>' + (w.n ? Math.round(w.ok / w.n * 100) : 0) + '%</b><span>' + T('pontosság', 'accuracy') + '</span></div>' +
      '<div><b>' + w.activeDays + '/7</b><span>' + T('aktív nap', 'active days') + '</span></div>' +
      '<div><b>' + w.reviews + '</b><span>' + T('ismétlés', 'reviews') + '</span></div>' +
      '<div><b>' + w.dailyQuests + '</b><span>' + T('napi küldetés', 'daily quests') + '</span></div>' +
      '<div><b>' + w.teach + '</b><span>' + T('magyarázat', 'explanations') + '</span></div>' +
      '<div><b>' + w.hunts + '</b><span>' + T('hibavadászat', 'error hunts') + '</span></div>' +
      '</div></div>';
    const actions = [];
    if (!f.daily.done || f.daily.date !== today()) actions.push({ href: '#/daily', label: T('Napi küldetés', 'Daily quest') });
    if (notebookStats().due) actions.push({ href: '#/review', label: T('Hibafüzet: ', 'Error notebook: ') + notebookStats().due + ' ' + T('esedékes', 'due') });
    if (w.weak) actions.push({ href: '#/practice/' + (SEC2CAT[w.weak.topic] || 'algebra'), label: T('Gyengébb téma: ', 'Weaker topic: ') + secTitle(w.weak.topic) });
    if (!actions.length) actions.push({ href: '#/mixed', label: T('Vegyes menet', 'Mixed run') });
    h += '<div class="next-actions">' + actions.map(function (a) { return '<a class="action-chip" href="' + a.href + '">' + MB.icon('arrowRight') + esc(a.label) + '</a>'; }).join('') + '</div>';
    h += '</div>';

    const teachTotal = Object.keys(f.teach).length;
    const missing = [];
    CORE_IDS.forEach(function (id) {
      const s = sec(id); if (!s) return;
      s.chapters.forEach(function (c) { if (!f.teach[id + '/' + c.id]) missing.push({ s: s, c: c }); });
    });
    h += '<div class="home-section"><div class="section-head"><div><h2>' + T('Magyarázd el', 'Explain it') + '</h2><p>' + T('A Feynman-teszt: ha el tudod mondani, tudod. ', 'The Feynman test: if you can explain it, you know it. ') + '<b>' + teachTotal + '</b> ' + T('mentett magyarázat.', 'saved explanations.') + '</p></div></div>';
    if (missing.length) {
      h += '<div class="teach-missing">';
      missing.slice(0, 6).forEach(function (m) {
        h += '<a href="#/chapter/' + m.s.id + '/' + m.c.id + '"><span>' + esc(m.s.title) + '</span><b>' + esc(m.c.title) + '</b></a>';
      });
      h += '</div>';
    } else {
      h += '<div class="callout ok-callout"><div class="ct">' + MB.icon('check') + T('Minden alapfejezethez van magyarázatod.', 'Every core chapter has an explanation.') + '</div></div>';
    }
    h += '</div>';
    h += '<div class="note-box" style="margin-top:22px"><h4>' + T('Hogyan számolom?', 'How is this calculated?') + '</h4><p style="margin:0">' +
      T('Készültség = 45% feladatlefedettség + 30% friss pontosság + 15% ismétlésállapot + 30% legjobb teszt, a rendelkezésre álló elemekre újranormalizálva. A heti riport csak az utolsó hét nap válaszait számolja.',
        'Readiness = 45% exercise coverage + 30% recent accuracy + 15% review health + 30% best test, renormalised over the components that exist. The weekly recap counts only the last seven days of answers.') + '</p></div>';
    return h;
  };

  /* ---------- home widget ---------- */
  MB.fun = MB.fun || {};
  MB.fun.homeHTML = function () {
    const f = funState(), stats = sectionStats(), overall = overallReadiness(stats), due = notebookStats().due;
    const done = f.daily.date === today() ? dailyDoneCount() : 0;
    const ready = overall == null ? null : Math.round(overall * 100);
    return '<div class="fun-strip">' +
      '<a class="fun-card' + (done >= 5 ? ' done' : '') + '" href="#/daily">' +
      '<div class="fc-top"><span class="fc-kicker">' + T('Napi küldetés', 'Daily quest') + '</span><span class="fc-streak">' + MB.icon('flame') + (f.streak.count || 0) + '</span></div>' +
      '<div class="fc-main"><b>' + done + ' / 5</b><span>' + T('feladat ma', 'exercises today') + '</span></div>' + bar(done / 5 * 100) +
      '<span class="fc-go">' + (done >= 5 ? T('Kész', 'Done') : T('Indul', 'Start')) + ' →</span></a>' +
      '<a class="fun-card" href="#/review">' +
      '<div class="fc-top"><span class="fc-kicker">' + T('Hibafüzet', 'Error notebook') + '</span><span class="fc-count">' + due + '</span></div>' +
      '<div class="fc-main"><b>' + due + '</b><span>' + T('esedékes ismétlés', 'reviews due') + '</span></div>' +
      '<span class="fc-go">' + (due ? T('Ismétlés', 'Review') : T('Tiszta', 'Clear')) + ' →</span></a>' +
      '<a class="fun-card" href="#/progress">' +
      '<div class="fc-top"><span class="fc-kicker">' + T('ZH-felkészültség', 'Exam readiness') + '</span><span class="fc-count">' + (ready == null ? '—' : ready + '%') + '</span></div>' +
      '<div class="fc-main"><b>' + (ready == null ? '—' : ready + '%') + '</b><span>' + T('az alaprészekben', 'across the core parts') + '</span></div>' + bar(ready || 0) +
      '<span class="fc-go">' + T('Részletek', 'Details') + ' →</span></a>' +
      '</div>';
  };

  /* ---------- answer bookkeeping ---------- */
  MB.fun.answer = function (ex, ok, user) {
    if (!ex) return;
    let alt = null, choices = null;
    try { alt = ex.dataset.alt ? JSON.parse(ex.dataset.alt) : null; } catch (e) { alt = null; }
    try { choices = ex.dataset.choices ? JSON.parse(ex.dataset.choices) : null; } catch (e) { choices = null; }
    const d = {
      ok: !!ok,
      q: ex.dataset.q || '',
      a: ex.dataset.ans == null ? '' : ex.dataset.ans,
      type: ex.dataset.type || 'expr',
      alt: alt,
      choices: choices,
      sol: ex.dataset.solution || '',
      hint: ex.dataset.exhint || '',
      topic: ex.dataset.topic || '',
      kind: ex.dataset.kind || 'chapter'
    };
    const kind = d.kind;
    if (!affectsNotebook(d)) {
      // proof/open self-check: nothing to grade or schedule
      return;
    }
    const first = ex.dataset.logged !== '1';
    let active = null;
    if (first) {
      ex.dataset.logged = '1';
      logAnswer(d.topic, d.ok, kind);
      if (!d.ok) addMiss(d);
    }
    if (d.ok && ex.dataset.solved !== '1') {
      ex.dataset.solved = '1';
      active = markActive();
      scheduleOnCorrect(d);
    }
    save();
    if (kind === 'daily') dailySolved(ex, d, first);
    if (kind === 'mixed') mixedSolved(ex, d, first);
    if (kind === 'review') reviewSolved(ex, d, first);
    if (active && active.changed) {
      if (active.freeze) MB.toast(T('Fagyasztót használtunk — a sorozat megmaradt.', 'Freeze used — your streak survived.'));
      else MB.toast(active.count + ' ' + T('napos sorozat.', 'day streak.'));
    }
    updateChrome();
  };

  MB.fun.batch = function (results, kind, section) {
    if (!results || !results.length) return;
    let any = false;
    results.forEach(function (r) {
      const it = r.it || {};
      const d = {
        ok: !!r.ok, q: it.q || '', a: it.a == null ? '' : String(it.a), type: it.type || 'expr',
        alt: it.alt || null, sol: it.sol || '', hint: it.hint || '', choices: it.choices || null,
        topic: it.topic || section || (it.cat ? secOfCat(it.cat) : ''), kind: kind || 'test'
      };
      logAnswer(d.topic, d.ok, d.kind);
      if (d.ok) { any = true; scheduleOnCorrect(d); } else addMiss(d);
    });
    if (any) markActive();
    save();
    updateChrome();
  };

  function lockItem(ex) {
    const inp = ex.querySelector('.answer-input'); if (inp) inp.disabled = true;
    MB.qsa('[data-check], [data-choice], [data-hint]', ex).forEach(function (b) { b.disabled = true; });
  }
  function dailySolved(ex, d, first) {
    if (d.ok) {
      lockItem(ex);
      const f = funState();
      if (f.daily.date !== today()) f.daily = { date: today(), answers: {}, done: false };
      f.daily.answers[ex.dataset.idx] = { ok: true, at: Date.now() };
      ex.classList.add('done');
      ex.dataset.answered = '1';
      const lab = ex.querySelector('.fun-topic-label'); if (lab) lab.classList.add('show');
      const n = dailyDoneCount();
      const el = document.getElementById('dailyCount'); if (el) el.textContent = n + ' / 5';
      const barEl = document.querySelector('.quest-progress .bar > i'); if (barEl) barEl.style.width = (n / 5 * 100) + '%';
      if (n >= 5 && !f.daily.done) {
        f.daily.done = true;
        if (f.dailyDone.indexOf(today()) < 0) f.dailyDone.push(today());
        if (f.dailyDone.length > 120) f.dailyDone = f.dailyDone.slice(-120);
        MB.toast(T('Napi küldetés teljesítve.', 'Daily quest complete.'));
      }
      save();
    }
  }
  function mixedSolved(ex, d, first) {
    if (d.ok) {
      lockItem(ex);
      const f = funState();
      f.mixed.answers[ex.dataset.idx] = { ok: true, at: Date.now() };
      ex.classList.add('done');
      const lab = ex.querySelector('.fun-topic-label'); if (lab) lab.classList.add('show');
      const el = document.getElementById('mixedScore'); if (el) el.textContent = mixedScore() + ' / 10';
      const barEl = document.querySelector('.fun-hero .quest-progress .bar > i'); if (barEl) barEl.style.width = (mixedScore() / 10 * 100) + '%';
      save();
    }
  }
  function reviewSolved(ex, d, first) {
    const f = funState(), it = f.review[ex.dataset.reviewId];
    if (!first) return;
    const fb = ex.querySelector('.feedback');
    if (d.ok) {
      const next = it && it.mastered ? T('Megtanulva — többé nem jön elő.', 'Mastered — it will not return.') : T('Következő ismétlés: ', 'Next review: ') + (it ? it.due : '—');
      if (fb) { fb.className = 'feedback show ok'; fb.textContent = next; }
      ex.classList.add('done');
      lockItem(ex);
    } else {
      if (fb) { fb.className = 'feedback show bad'; fb.textContent = T('Holnap újra előjön. Nem kell azonnal ismételni.', 'It returns tomorrow. No need to retry now.'); }
      lockItem(ex);
    }
    const due = dueItems().length;
    const el = document.getElementById('reviewCount'); if (el) el.textContent = due;
    save();
  }

  function updateChrome() {
    const f = funState(), due = notebookStats().due, count = f.streak.count || 0;
    const chip = document.getElementById('streakChip');
    if (chip) {
      chip.innerHTML = MB.icon('flame') + '<b>' + count + '</b>';
      chip.classList.toggle('hot', count > 0);
      chip.title = count + ' ' + T('napos sorozat', 'day streak');
    }
    const badge = document.getElementById('dueBadge');
    if (badge) { badge.textContent = due; badge.style.display = due ? '' : 'none'; }
    const sb = document.getElementById('streakBadge');
    if (sb) { sb.textContent = count > 0 ? count : ''; sb.style.display = count > 0 ? '' : 'none'; }
    const sc = document.getElementById('streakCount'); if (sc) sc.textContent = count;
    const sm = document.getElementById('streakMeta');
    if (sm) sm.textContent = T('Legjobb', 'Best') + ': ' + (f.streak.best || 0) + ' · ' + T('fagyasztó', 'freeze') + ': ' + (f.streak.freezes || 0) + '/' + T('hét', 'week');
  }
  MB.fun.afterRender = function () { updateChrome(); };

  /* ---------- interactions ---------- */
  let teachTimer = null;
  function teachCount(box) {
    const ta = box.querySelector('#teachText');
    const n = ta ? ta.value.trim().split(/\s+/).filter(Boolean).length : 0;
    const el = box.querySelector('[data-teach-count]'); if (el) el.textContent = n + ' ' + T('szó', 'words');
  }
  function saveTeach(box) {
    if (!box) return;
    const key = box.dataset.teachKey, ta = box.querySelector('#teachText');
    const text = ta ? ta.value : '';
    const checks = MB.qsa('[data-teach-check]', box).map(function (x) { return !!x.checked; });
    const f = funState();
    if (text.trim()) f.teach[key] = { text: text, checks: checks, date: today() };
    else delete f.teach[key];
    save();
    const st = box.querySelector('[data-teach-state]');
    if (st) st.textContent = text.trim() ? T('Mentve', 'Saved') + ' · ' + today() : T('Nincs mentve', 'Not saved');
  }

  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'teachText') {
      const box = e.target.closest('.teach-box');
      if (!box) return;
      teachCount(box);
      const st = box.querySelector('[data-teach-state]'); if (st) st.textContent = T('Mentés…', 'Saving…');
      clearTimeout(teachTimer);
      teachTimer = setTimeout(function () { saveTeach(box); }, 700);
    }
  });
  document.addEventListener('change', function (e) {
    const cb = e.target && e.target.closest && e.target.closest('[data-teach-check]');
    if (cb) { const box = cb.closest('.teach-box'); if (box) saveTeach(box); }
  });
  document.addEventListener('click', function (e) {
    const t = e.target;
    if (!t || !t.closest) return;
    const saveBtn = t.closest('[data-teach-save]');
    if (saveBtn) { e.preventDefault(); saveTeach(saveBtn.closest('.teach-box')); MB.toast(T('Magyarázat mentve.', 'Explanation saved.')); return; }

    const rm = t.closest('[data-review-remove]');
    if (rm) {
      e.preventDefault();
      const id = rm.dataset.reviewRemove, f = funState();
      delete f.review[id];
      save(); updateChrome(); MB.app.render();
      MB.toast(T('Bejegyzés törölve.', 'Entry removed.'));
      return;
    }

    const newMixed = t.closest('[data-mixed-new]');
    if (newMixed) {
      const f = funState();
      f.mixed.seed = (f.mixed.seed || 1) + 1;
      f.mixed.answers = {};
      save();
      MB.app.render();
      MB.toast(T('Új vegyes menet.', 'New mixed run.'));
      return;
    }

    const step = t.closest('[data-hunt-step]');
    if (step) {
      const box = step.closest('.hunt-box');
      if (!box || box.classList.contains('solved')) return;
      const h = HUNTS.find(function (x) { return x.id === box.dataset.hunt; });
      if (!h) return;
      const i = +step.dataset.huntStep;
      const fb = box.querySelector('[data-hunt-feedback]');
      if (i === h.wrong) {
        step.classList.add('bad');
        box.classList.add('solved');
        if (fb) fb.textContent = T('Megtaláltad a hibát.', 'You found the error.');
        const why = box.querySelector('.hunt-why'); if (why) why.classList.add('show');
        const f = funState();
        f.hunts[h.id] = today();
        logAnswer(h.topic, true, 'hunt');
        markActive();
        save(); updateChrome();
        MB.toast(T('Hibavadászat megoldva.', 'Error hunt solved.'));
      } else {
        step.classList.add('good');
        if (fb) fb.textContent = T('Ez az állítás helyes.', 'This statement is true.');
      }
      return;
    }
  });

  /* Exported helpers used by app.js / features.js */
  MB.fun.secOfCat = secOfCat;
  MB.fun.secTitle = secTitle;
  MB.fun.today = today;
})();
