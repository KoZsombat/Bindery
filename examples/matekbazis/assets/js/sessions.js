/* MatekBázis — deliberate sessions.
   Four modes: learn 10, learn 20, review 5, review 10.
   Learn modes pick unknown chapters in the chosen part, teach a short lesson,
   then ask questions. Review modes only use chapters the learner has completed.

   State used:
   MB.app.state.ex / read / fun.log / fun.review / tests
   MB.app.state.coach.sessionSection
*/
(function () {
  const MB = window.MB;
  const esc = MB.esc;
  let interval = null;

  const CATS = {
    alapok: ['algebra', 'equations', 'functions', 'trig'],
    logika: ['logic'], komplex: ['complex'], sorozatok: ['sequences'], hatarertek: ['limits'],
    derivalas: ['derivatives'], integralas: ['integrals'], sorok: ['series'], taylor: ['taylor'],
    tobbvaltozos: ['multivar'], 'diff-fourier': ['sequences', 'series'], linearis: ['linalg'], diszkret: ['discrete']
  };

  function T(hu, en) { return MB.lang === 'en' ? en : hu; }
  function sec(id) { return MB.sections.find(function (s) { return s.id === id; }); }
  function secTitle(id) { const s = sec(id); return s ? MB.sTitle(s) : id; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function save() { if (MB.app && MB.app.save) MB.app.save(); }
  function coach() {
    const st = MB.app.state;
    st.coach = st.coach || {};
    st.coach.sessionSection = st.coach.sessionSection || '';
    return st.coach;
  }
  function markSession() {
    const c = coach(), t = today();
    c.sessions = Array.isArray(c.sessions) ? c.sessions : [];
    if (c.sessions.indexOf(t) < 0) {
      c.sessions.push(t);
      if (c.sessions.length > 120) c.sessions = c.sessions.slice(-120);
      save();
    }
  }
  function weakestSection() {
    const rows = MB.sections.map(function (s) {
      const known = knownChapters(s).length;
      return { s: s, unknown: s.chapters.length - known };
    }).sort(function (a, b) { return b.unknown - a.unknown; });
    return rows[0].s;
  }
  function selectedSection() {
    const c = coach();
    return sec(c.sessionSection) || weakestSection() || MB.sections[0];
  }

  /* ---------- what is known ---------- */
  function checkable(c) {
    return (c.exercises || []).filter(function (q) { return q && q.a != null && q.type !== 'proof' && q.type !== 'open'; });
  }
  function chapterStats(c) {
    const key = MB.app.chapterKey(c.sectionId, c.id);
    let total = 0, done = 0;
    (c.exercises || []).forEach(function (q, i) {
      if (!q || q.a == null || q.type === 'proof' || q.type === 'open') return;
      total++;
      if (MB.app.state.ex[key + '/' + i]) done++;
    });
    return { total: total, done: done, ratio: total ? done / total : 0 };
  }
  function chapterKnown(c) {
    const d = (coach().diag || {})[c.sectionId];
    if (d && d.passed) return true;
    if (!MB.app.isRead(c)) return false;
    const st = chapterStats(c);
    return st.total === 0 || st.done >= Math.min(2, st.total) || st.ratio >= 0.5;
  }
  function unknownChapters(s) { return s.chapters.filter(function (c) { return !chapterKnown(c); }); }
  function knownChapters(s) { return s.chapters.filter(chapterKnown); }

  /* ---------- lesson blocks ---------- */
  function theoryBlock(t) {
    const type = t.t || 'p';
    if (type === 'p') return '<p>' + (t.body || '') + '</p>';
    if (type === 'list') {
      return '<div class="callout note"><div class="ct">' + esc(t.title || T('Lista', 'List')) + '</div><ul>' +
        (t.items || []).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';
    }
    if (type === 'formula') {
      return '<div class="callout formula"><div class="ct">' + T('Képlet', 'Formula') + (t.title ? ' · ' + esc(t.title) : '') + '</div>' +
        '<div class="fx">$$' + (t.latex || '') + '$$</div>' + (t.note ? '<p class="muted">' + t.note + '</p>' : '') + '</div>';
    }
    const labels = { def: T('Definíció', 'Definition'), thm: T('Tétel', 'Theorem'), note: T('Megjegyzés', 'Note'), warn: T('Vigyázat', 'Warning') };
    const cls = type === 'warn' ? 'warn' : type === 'thm' ? 'thm' : type === 'def' ? 'def' : 'note';
    return '<div class="callout ' + cls + '"><div class="ct">' + (labels[type] || labels.note) + (t.title ? ' · ' + esc(t.title) : '') + '</div><p>' + (t.body || '') + '</p></div>';
  }
  function exampleBlock(ex, i) {
    if (!ex) return '';
    return '<div class="example"><div class="ex-title"><span class="pill">' + T('PÉLDA ', 'EXAMPLE ') + (i + 1) + '</span><h3>' + esc(ex.title || '') + '</h3></div>' +
      '<p>' + (ex.problem || '') + '</p><ol>' + (ex.steps || []).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>' +
      (ex.answer ? '<p class="answer-line"><b>' + T('Eredmény:', 'Answer:') + '</b> ' + ex.answer + '</p>' : '') + '</div>';
  }
  function lessonHTML(c, s, deep) {
    const ch = MB.pickChapter(c);
    const theory = (ch.theory || []).slice(0, deep ? 4 : 2);
    const examples = (ch.examples || []).slice(0, deep ? 2 : 1);
    let h = '<section class="session-lesson">';
    h += '<div class="session-lesson-head"><span class="session-lesson-num">' + esc(ch.num) + '</span><div><div class="kicker">' + esc(MB.sTitle(s)) + ' · ' + T('elmélet', 'theory') + '</div>' +
      '<h2>' + esc(MB.cTitle(ch)) + '</h2><p class="lead">' + MB.cLead(ch) + '</p></div></div>';
    if (ch.why) {
      h += '<div class="callout why"><div class="ct">' + T('Miért?', 'Why?') + '</div>' +
        (Array.isArray(ch.why) ? ch.why.map(function (p) { return '<p>' + p + '</p>'; }).join('') : '<p>' + ch.why + '</p>') + '</div>';
    }
    if (ch.when) h += '<div class="callout when"><div class="ct">' + T('Mikor használd?', 'When to use it') + '</div><p>' + ch.when + '</p></div>';
    theory.forEach(function (t) { h += theoryBlock(t); });
    if (examples.length) {
      h += '<h3 class="session-label">' + T('Kidolgozott példa', 'Worked example') + '</h3>';
      examples.forEach(function (ex, i) { h += exampleBlock(ex, i); });
    }
    if (ch.mistakes && ch.mistakes.length && deep) {
      h += '<div class="callout warn"><div class="ct">' + T('Tipikus hiba', 'Common mistake') + '</div><ul>' +
        ch.mistakes.slice(0, 2).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';
    }
    h += '<p class="session-next">' + T('Most próbáld ki magad. A feladatok ehhez a fejezethez tartoznak.', 'Now try it yourself. The tasks below belong to this chapter.') + '</p>';
    h += '</section>';
    return h;
  }

  /* ---------- task selection ---------- */
  function chapterPool(s, chapters, learn) {
    const out = [];
    chapters.forEach(function (c) {
      (c.exercises || []).forEach(function (q, i) {
        if (!q || q.a == null || q.type === 'proof' || q.type === 'open') return;
        const key = MB.app.chapterKey(s.id, c.id) + '/' + i;
        if (learn && MB.app.state.ex[key]) return;
        out.push({ it: q, c: c, i: i, key: key });
      });
    });
    return out;
  }
  function shuffled(arr, seed) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((hash(seed + ':' + i) / 4294967296) * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function generated(s, level, seed) {
    const cats = CATS[s.id] || ['algebra'];
    const cat = cats[seed % cats.length];
    const it = MB.generateOne(cat, level, seed);
    it.cat = cat; it.topic = s.id; it.level = level;
    return it;
  }
  function taskSet(s, chapters, count, learn, minutes) {
    const key = (learn ? 'learn' : 'review') + ':' + minutes + ':' + today() + ':' + s.id;
    let pool = shuffled(chapterPool(s, chapters, learn), key);
    const out = pool.slice(0, count).map(function (x, i) {
      x.it.topic = s.id;
      return {
        it: x.it,
        attrs: x.key ? ' data-learn-key="' + esc(x.key) + '"' : '',
        idx: i
      };
    });
    if (learn && out.length < count) {
      for (let i = out.length; i < count; i++) {
        const it = generated(s, i === count - 1 && count > 2 ? 3 : 2, hash(key + ':g:' + i));
        out.push({ it: it, attrs: '', idx: i });
      }
    }
    return out;
  }

  /* ---------- pages ---------- */
  function pageHead(kicker, title, lead) {
    return '<div class="page-head"><div class="kicker">' + esc(kicker) + '</div><h1>' + esc(title) + '</h1><p class="lead">' + lead + '</p></div>';
  }
  function sessionCard(kind, minutes, title, desc, href, disabled) {
    return '<a class="session-card' + (disabled ? ' is-empty' : '') + '" href="' + href + '">' +
      '<div class="session-top"><span class="session-time">' + minutes + ' ' + T('perc', 'min') + '</span><span class="session-kind">' + kind + '</span></div>' +
      '<h3>' + title + '</h3><p>' + desc + '</p><span class="session-go">' + T('Indítás', 'Start') + ' →</span></a>';
  }

  MB.sessionsView = function () {
    const s = selectedSection();
    const known = knownChapters(s).length, unknown = s.chapters.length - known;
    const c = coach();
    let h = pageHead(T('Tanulás', 'Learn'), T('Tanulás vagy ismétlés — te választod', 'Learn or review — you choose'),
      T('A tanulás elmélettel és példával kezd, majd csak az adott rész még nem ismert fejezeteiből kérdez. Az ismétlés csak olyan fejezetekből kérdez, amelyeket már teljesítettél.', 'Learn starts with theory and a worked example, then asks only from chapters of the chosen part you have not yet mastered. Review asks only from chapters you have already completed.'));
    h += '<div class="session-controls"><label for="sessionSection">' + T('Rész', 'Part') + '</label>' +
      '<select id="sessionSection" data-session-section>' + MB.sections.map(function (x) {
        return '<option value="' + x.id + '"' + (x.id === s.id ? ' selected' : '') + '>' + esc(x.num + ' · ' + MB.sTitle(x)) + '</option>';
      }).join('') + '</select>' +
      '<a class="btn sm" href="#/map">' + T('Tudástérkép', 'Knowledge map') + '</a></div>';
    h += '<div class="session-known"><div><b>' + known + '</b><span>' + T('ismert fejezet', 'known chapters') + '</span></div>' +
      '<div><b>' + unknown + '</b><span>' + T('tanulnivaló', 'to learn') + '</span></div>' +
      '<div><b>' + (c.diag && c.diag[s.id] && c.diag[s.id].passed ? T('igen', 'yes') : T('még nem', 'not yet')) + '</b><span>' + T('felmérés kész', 'diagnostic passed') + '</span></div></div>';
    h += '<div class="session-grid">' +
      sessionCard(T('tanulás', 'learn'), 10, T('10 perces tanulás', '10-minute learn'),
        T('Egy új fejezet: rövid elmélet, egy példa, majd 2 feladat.', 'One new chapter: short theory, one example, then 2 tasks.'), '#/learn/10/' + s.id, unknown === 0) +
      sessionCard(T('tanulás', 'learn'), 20, T('20 perces tanulás', '20-minute learn'),
        T('Két új fejezet: elmélet, példák, majd 4 feladat.', 'Two new chapters: theory, examples, then 4 tasks.'), '#/learn/20/' + s.id, unknown === 0) +
      sessionCard(T('ismétlés', 'review'), 5, T('5 perces ismétlés', '5-minute review'),
        T('Három kérdés csak ismert, befejezett fejezetekből.', 'Three questions only from known, completed chapters.'), '#/review/5/' + s.id, known === 0) +
      sessionCard(T('ismétlés', 'review'), 10, T('10 perces ismétlés', '10-minute review'),
        T('Hat kérdés ismert fejezetekből, vegyesen.', 'Six questions from known chapters, mixed.'), '#/review/10/' + s.id, known === 0) +
      '</div>';
    h += '<div class="note-box"><h4>' + T('Miért ez a négy?', 'Why these four?') + '</h4><p style="margin:0">' +
      T('A tanuláshoz elmélet kell, az ismétléshez csak előhívás. A 10 és 20 perc a mélységet, az 5 és 10 perc a frissítést szolgálja. A gombok nem keverik a kettőt.', 'Learning needs theory; review needs retrieval. 10 and 20 minutes set depth; 5 and 10 minutes refresh. The buttons do not mix the two.') + '</p></div>';
    return h;
  };

  MB.sessionView = function (mode, minutes, sectionId) {
    const isLearn = mode === 'learn';
    const mins = isLearn ? (minutes === 20 ? 20 : 10) : (minutes === 10 ? 10 : 5);
    const s = sec(sectionId) || selectedSection();
    const c = coach();
    c.sessionSection = s.id;
    const chapters = isLearn ? unknownChapters(s) : knownChapters(s);
    const lessonCount = isLearn ? (mins === 20 ? 2 : 1) : 0;
    const lessons = isLearn ? chapters.slice(0, lessonCount) : [];
    const taskChapters = isLearn ? lessons : chapters;
    const count = isLearn ? (mins === 20 ? 4 : 2) : (mins === 5 ? 3 : 6);
    const tasks = taskSet(s, taskChapters, count, isLearn, mins);

    let h = pageHead(
      T('Tanulás', 'Learn') + ' · ' + s.num + '. ' + MB.sTitle(s),
      isLearn ? (mins + ' ' + T('perces tanulás', 'minute learn')) : (mins + ' ' + T('perces ismétlés', 'minute review')),
      isLearn
        ? T('Előbb a magyarázat és egy példa, utána a feladatok. Csak ebből a részből, csak a még nem ismert fejezetekből.', 'First the explanation and an example, then the tasks. Only from this part, only from chapters you have not mastered yet.')
        : T('Csak olyan fejezetekből kérdez, amelyeket már befejeztél. Nincs új elmélet — ez előhívás.', 'Only asks from chapters you have already completed. No new theory — this is retrieval.')
    );
    h += '<div class="session-bar"><div><b id="sessionTimer">' + mins + ':00</b><span>' + T('időkeret', 'time box') + '</span></div>' +
      '<button class="btn sm navy" data-session-start>' + T('Időzítő indítása', 'Start timer') + '</button>' +
      '<a class="btn sm" href="#/sessions">' + T('Másik rész / mód', 'Other part / mode') + '</a>' +
      '<a class="btn sm" href="#/map">' + T('Térkép', 'Map') + '</a></div>';

    if (!chapters.length) {
      return h + '<div class="session-empty"><div class="session-empty-icon">' + MB.icon('check') + '</div><h2>' +
        (isLearn ? T('Ebben a részben nincs tanulnivaló', 'Nothing new in this part') : T('Ebből a részből még nincs ismert fejezet', 'No completed chapters in this part yet')) + '</h2><p>' +
        (isLearn ? T('Minden fejezet ismertnek látszik. Válts ismétlésre, vagy mérj fel egy másik részt.', 'Every chapter looks known. Switch to review, or test another part.') :
          T('Előbb fejezz be egy tanuló blokkot. Utána ez a mód csak azt kérdezi, amit már tudsz.', 'Finish a learning block first. Then this mode only asks what you already know.')) + '</p>' +
        '<div class="session-empty-actions"><a class="btn navy" href="#/sessions">' + T('Vissza a tanuláshoz', 'Back to learn') + '</a>' +
        (isLearn ? '<a class="btn" href="#/review/5/' + s.id + '">' + T('5 perces ismétlés', '5-minute review') + '</a>' : '<a class="btn" href="#/learn/10/' + s.id + '">' + T('10 perces tanulás', '10-minute learn') + '</a>') + '</div></div>';
    }

    if (isLearn) {
      h += '<div class="session-context"><b>' + lessons.length + '</b> ' + T('fejezet most', 'chapters now') + ' · <b>' + chapters.length + '</b> ' + T('még ismeretlen ebben a részben', 'still unknown in this part') + '</div>';
      lessons.forEach(function (ch) { h += lessonHTML(ch, s, mins === 20); });
    } else {
      h += '<div class="session-context"><b>' + knownChapters(s).length + '</b> ' + T('ismert fejezet', 'known chapters') + ' · ' + T('csak ezekből kérdez', 'asks only from these') + '</div>';
    }

    h += '<section class="session-tasks"><div class="session-task-head"><div><div class="kicker">' + T('Gyakorlás', 'Practice') + '</div><h2>' + T('Most te jössz', 'Your turn') + '</h2></div>' +
      '<span class="session-task-count">' + tasks.length + ' ' + T('feladat', 'tasks') + '</span></div>';
    if (!tasks.length) {
      h += '<div class="session-empty"><p>' + T('Nincs ehhez elég feladat. Nyisd meg a fejezetet, vagy válassz másik részt.', 'Not enough tasks here. Open the chapter or choose another part.') + '</p></div>';
    } else {
      h += '<div class="gen-list">';
      tasks.forEach(function (t, i) {
        h += MB.fun.itemHTML(t.it, { kind: isLearn ? 'learn' : 'review-session', funid: 'ses:' + mode + ':' + mins + ':' + s.id + ':' + i, idx: i, showTopic: false, attrs: t.attrs });
      });
      h += '</div>';
    }
    h += '</section>';
    h += '<div class="coach-foot"><a class="btn" href="#/sessions">' + T('Vissza a tanuláshoz', 'Back to learn') + '</a>' +
      '<a class="btn" href="#/section/' + s.id + '">' + T('Rész megnyitása', 'Open part') + '</a></div>';
    return h;
  };

  /* ---------- timer + session bookkeeping ---------- */
  function startTimer(seconds, id) {
    clearInterval(interval);
    let left = seconds;
    function tick() {
      const el = document.getElementById(id);
      if (!el) { clearInterval(interval); interval = null; return; }
      el.textContent = Math.floor(left / 60) + ':' + pad(left % 60);
      if (left <= 0) {
        clearInterval(interval); interval = null;
        el.textContent = T('Lejárt', 'Time');
        MB.toast(T('Az idő lejárt. Állj meg — a következő lépés jöhet később.', 'Time is up. Stop — the next step can wait.'));
        return;
      }
      left--;
    }
    tick();
    interval = setInterval(tick, 1000);
  }
  window.addEventListener('hashchange', function () { clearInterval(interval); interval = null; });

  document.addEventListener('change', function (e) {
    const t = e.target;
    if (!t || !t.matches || !t.matches('[data-session-section]')) return;
    const c = coach();
    c.sessionSection = t.value;
    save();
    MB.app.render();
  });
  document.addEventListener('click', function (e) {
    const t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('[data-session-start]')) {
      const route = MB.app.parseRoute();
      const minutes = route.name === 'learn' ? (route.minutes === 20 ? 20 : 10) : (route.minutes === 10 ? 10 : 5);
      const s = sec(route.section) || selectedSection();
      if (route.name === 'learn') {
        unknownChapters(s).slice(0, minutes === 20 ? 2 : 1).forEach(function (c) { MB.app.markRead(c, true); });
        save();
      }
      startTimer(minutes * 60, 'sessionTimer');
      markSession();
      return;
    }
  });

  /* Wrap the coach hook rather than replacing it. */
  const previous = MB.fun.onAnswer;
  MB.fun.onAnswer = function (ex, d, kind, first) {
    if (previous) previous(ex, d, kind, first);
    if (!first) return;
    if (kind === 'learn' || kind === 'review-session') {
      markSession();
      if (kind === 'learn' && ex.dataset.learnKey) {
        const p = ex.dataset.learnKey.split('/');
        const sid = p[0], cid = p[1], idx = Number(p[2]);
        const ch = MB.app.getChapter(sid, cid);
        if (ch) {
          MB.app.markRead(ch, true);
          if (d.ok && Number.isFinite(idx)) MB.app.markDone(ch, idx, true);
          save();
        }
      }
      if (d.ok) {
        ex.classList.add('done');
        ex.querySelectorAll('input, button[data-check], button[data-choice], button[data-hint]').forEach(function (b) { b.disabled = true; });
      }
    }
  };
})();
