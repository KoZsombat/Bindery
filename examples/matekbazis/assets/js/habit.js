/* MatekBázis — habit layer.
   A daily plan, real active minutes, a ramp-up target, a minimum day, an .ics
   reminder, a stuck timer, miss reasons, a pace planner, a welcome-back screen
   and a local buddy summary. Everything is local; no network, no accounts.

   State lives in MB.app.state.coach (minutes, plan, target, tags, stuck) and
   MB.app.state.fun (notebook). Every call is guarded so the module can be
   removed without breaking the book. */
(function () {
  const MB = window.MB;
  const esc = MB.esc;
  const MIN_DAY = 5;

  function T(hu, en) { return MB.lang === 'en' ? en : hu; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function parseDay(s) {
    const p = String(s || '').split('-').map(Number);
    return p.length === 3 && p[0] ? new Date(p[0], p[1] - 1, p[2]) : null;
  }
  function addDays(day, n) {
    const d = parseDay(day) || new Date();
    d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function gap(a, b) {
    const x = parseDay(a), y = parseDay(b);
    return x && y ? Math.round((y - x) / 86400000) : 0;
  }
  function save() { if (MB.app && MB.app.save) MB.app.save(); }
  function coach() {
    const st = MB.app.state;
    st.coach = st.coach || {};
    const c = st.coach;
    c.minutes = c.minutes || {};
    c.target = c.target == null ? null : Number(c.target);
    c.plan = c.plan || null;
    c.tags = c.tags || {};
    c.stuck = c.stuck || {};
    c.intention = c.intention || T('Ha 18:30 van és az asztalnál ülök, akkor megnyitom a mai tervet.', 'If it is 18:30 and I am at my desk, then I open today’s plan.');
    c.calm = !!c.calm;
    return c;
  }
  function minutesOn(day) { return Math.round((Number(coach().minutes[day]) || 0) * 10) / 10; }
  function addMinutes(m) {
    const c = coach(), d = today();
    c.minutes[d] = Math.round(((Number(c.minutes[d]) || 0) + m) * 100) / 100;
    if (!c.firstDay) c.firstDay = d;
    c.lastActive = d;
    save();
  }
  function weekStart(day) {
    const d = parseDay(day); if (!d) return day;
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function weeklyMinutes() {
    const start = weekStart(today());
    let n = 0;
    for (let i = 0; i < 7; i++) n += minutesOn(addDays(start, i));
    return Math.round(n);
  }
  function weeklyDays() {
    const start = weekStart(today());
    let n = 0;
    for (let i = 0; i < 7; i++) if (minutesOn(addDays(start, i)) > 0) n++;
    return n;
  }
  function target() {
    const c = coach();
    if (c.target) return c.target;
    if (!c.firstDay) return 30;
    const weeks = Math.max(0, Math.floor(gap(c.firstDay, today()) / 7));
    return Math.min(120, 30 + weeks * 15);
  }

  /* ---------- notebook + plan ---------- */
  function dueCount() {
    const r = (MB.app.state.fun && MB.app.state.fun.review) || {};
    return Object.keys(r).filter(function (k) {
      const x = r[k];
      return x && !x.mastered && x.due && x.due <= today();
    }).length;
  }
  function nextUnknown() {
    const st = MB.app.state;
    for (let i = 0; i < MB.allChapters.length; i++) {
      const c = MB.allChapters[i];
      if (!MB.app.isRead(c)) return c;
    }
    return null;
  }
  function planFor(minutes) {
    const due = dueCount(), next = nextUnknown();
    const share = function (r) { return Math.max(MIN_DAY, Math.round(minutes * r)); };
    const steps = [];
    if (due) steps.push({ kind: 'recall', href: '#/review', minutes: share(0.25), startWrong: due, label: T('Hibafüzet: előhívás', 'Error notebook: recall first'), detail: due + ' ' + T('esedékes bejegyzés', 'due entries') });
    else steps.push({ kind: 'warmup', href: next ? '#/chapter/' + next.sectionId + '/' + next.id : '#/daily', minutes: share(0.15), label: T('Bemelegítés ismert anyaggal', 'Warm up with known material'), detail: T('Nincs esedékes ismétlés — ez jó hír.', 'Nothing due — that is good news.') });
    steps.push(next
      ? { kind: 'learn', href: '#/chapter/' + next.sectionId + '/' + next.id, minutes: share(0.4), key: next.sectionId + '/' + next.id, label: T('Tanulás: ', 'Learn: ') + MB.cTitle(next), detail: T('Egy fejezet, elmélettel és példával. Az ismétlés külön lépés.', 'One chapter with theory and an example. Review is a separate step.') }
      : { kind: 'learn', href: '#/sessions', minutes: share(0.35), label: T('Minden fejezet elolvasva', 'Every chapter read'), detail: T('Válassz ismétlést vagy vizsgagyakorlást.', 'Choose review or exam practice.') });
    steps.push({ kind: 'practice', href: '#/mixed', minutes: share(0.2), startAnswers: (MB.app.state.fun.log || []).length, label: T('Vegyes gyakorlás', 'Mixed practice'), detail: T('Külön blokk; nem keveredik a tanuló blokkal.', 'A separate block; it does not mix with the learning block.') });
    steps.push({ kind: 'redo', href: '#/review', minutes: share(0.15), startWrong: due, label: T('A mai hibák újra', "Redo today's misses"), detail: T('Csak a ma elrontott feladatok.', 'Only the items missed today.') });
    return { date: today(), minutes: minutes, steps: steps, done: {}, created: Date.now() };
  }
  function stepText(step) {
    const entry = step.key ? MB.allChapters.find(function (c) { return c.sectionId + '/' + c.id === step.key; }) : null;
    if (step.kind === 'recall') return { label: T('Hibafüzet: előhívás', 'Error notebook: recall first'), detail: dueCount() + ' ' + T('esedékes bejegyzés', 'due entries') };
    if (step.kind === 'warmup') return { label: T('Bemelegítés ismert anyaggal', 'Warm up with known material'), detail: T('Nincs esedékes ismétlés — ez jó hír.', 'Nothing due — that is good news.') };
    if (step.kind === 'learn') return {
      label: entry ? T('Tanulás: ', 'Learn: ') + MB.cTitle(entry) : T('Minden fejezet elolvasva', 'Every chapter read'),
      detail: T('Egy fejezet, elmélettel és példával. Az ismétlés külön lépés.', 'One chapter with theory and an example. Review is a separate step.')
    };
    if (step.kind === 'practice') return { label: T('Vegyes gyakorlás', 'Mixed practice'), detail: T('Külön blokk; nem keveredik a tanuló blokkal.', 'A separate block; it does not mix with the learning block.') };
    return { label: T('A mai hibák újra', "Redo today's misses"), detail: T('Csak a ma elrontott feladatok.', 'Only the items missed today.') };
  }
  function stepDone(step, idx) {
    const p = coach().plan;
    if (!p) return false;
    if (p.done[idx]) return true;
    if (step.kind === 'recall' || step.kind === 'redo') return step.startWrong != null && dueCount() < step.startWrong;
    if (step.kind === 'learn' && step.key) return !!MB.app.state.read[step.key];
    if (step.kind === 'practice' && step.startAnswers != null) return (MB.app.state.fun.log || []).length >= step.startAnswers + 4;
    return false;
  }

  /* ---------- views ---------- */
  function pageHead(kicker, title, lead) {
    return '<div class="page-head"><div class="kicker">' + esc(kicker) + '</div><h1>' + esc(title) + '</h1><p class="lead">' + lead + '</p></div>';
  }
  function calendarHTML(days) {
    let h = '<div class="habit-calendar">';
    for (let i = days - 1; i >= 0; i--) {
      const day = addDays(today(), -i), m = minutesOn(day);
      h += '<span class="hc-day' + (m > 0 ? ' studied' : '') + (m >= target() ? ' target' : '') + '" title="' + esc(day + ' · ' + m + ' ' + T('perc', 'min')) + '"><b>' + m + '</b><i>' + Number(day.slice(8)) + '</i></span>';
    }
    return h + '</div>';
  }
  function tags() {
    const c = coach(), out = { concept: 0, slip: 0, misread: 0 };
    Object.keys(c.tags).forEach(function (k) { const v = c.tags[k]; if (out[v] != null) out[v]++; });
    return out;
  }
  function tagLabel(id) {
    return id === 'concept' ? T('Nem tudtam a fogalmat', "Didn't know the concept")
      : id === 'slip' ? T('Számolási hiba', 'Calculation slip')
      : T('Félreolvastam a kérdést', 'Misread the question');
  }
  function patternHTML() {
    const t = tags(), total = t.concept + t.slip + t.misread;
    if (!total) return '<div class="coach-panel"><h3>' + T('Miért csúszol el?', 'Why do you miss?') + '</h3><p class="muted">' + T('Még nincs címkézett hiba. Egy téves válasz után megkérdezzük, miért.', 'No tagged misses yet. After a missed answer we ask why.') + '</p></div>';
    const top = Object.keys(t).sort(function (a, b) { return t[b] - t[a]; })[0];
    return '<div class="coach-panel"><h3>' + T('Miért csúszol el?', 'Why do you miss?') + '</h3>' +
      '<p>' + T('Leggyakoribb minta: ', 'Most common pattern: ') + '<b>' + tagLabel(top) + '</b> (' + t[top] + '/' + total + ')</p>' +
      '<ul class="tag-list">' + Object.keys(t).map(function (k) { return '<li>' + tagLabel(k) + ': <b>' + t[k] + '</b></li>'; }).join('') + '</ul></div>';
  }
  function icsText() {
    const c = coach();
    const m = String(c.intention || '').match(/(\d{1,2})[:.](\d{2})/);
    const hh = m ? Math.min(23, Number(m[1])) : 18, mm = m ? Math.min(59, Number(m[2])) : 30;
    const day = today().replace(/-/g, '');
    function clean(s) { return String(s || '').replace(/\r?\n/g, ' ').replace(/([,;\\])/g, '\\$1').slice(0, 200); }
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MatekBazis//Study plan//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT', 'UID:study-' + today() + '@matekbazis.local', 'DTSTAMP:' + stamp,
      'DTSTART:' + day + 'T' + pad(hh) + pad(mm) + '00', 'RRULE:FREQ=DAILY',
      'SUMMARY:' + clean(T('Napi tanulás — MatekBázis', 'Daily study — MatekBázis')),
      'DESCRIPTION:' + clean(c.intention), 'DURATION:PT60M', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  function weeklySummary() {
    const st = MB.app.state;
    const read = MB.allChapters.filter(function (c) { return MB.app.isRead(c); }).length;
    const due = dueCount();
    return T(
      'Tanulási összegzés — ' + today() + '\nEzen a héten ' + weeklyMinutes() + ' perc, ' + weeklyDays() + ' nap.\nMa ' + minutesOn(today()) + ' perc.\nElolvasva: ' + read + '/' + MB.allChapters.length + ' fejezet.\nSorozat: ' + ((st.fun && st.fun.streak && st.fun.streak.count) || 0) + ' nap.\nHibafüzet: ' + due + ' esedékes.\nVizsga: ' + (coach().examDate || 'nincs megadva') + '.',
      'Study summary — ' + today() + '\nThis week: ' + weeklyMinutes() + ' minutes across ' + weeklyDays() + ' days.\nToday: ' + minutesOn(today()) + ' minutes.\nRead: ' + read + '/' + MB.allChapters.length + ' chapters.\nStreak: ' + ((st.fun && st.fun.streak && st.fun.streak.count) || 0) + ' days.\nNotebook: ' + due + ' due.\nExam: ' + (coach().examDate || 'not set') + '.'
    );
  }
  function exportCode() {
    const payload = {
      v: 1,
      minutes: coach().minutes,
      read: MB.app.state.read,
      ex: MB.app.state.ex,
      examDate: coach().examDate || '',
      target: coach().target || null
    };
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(payload)))); } catch (e) { return ''; }
  }
  function importCode(code) {
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob(String(code || '').trim()))));
      if (!data || data.v !== 1) return false;
      const c = coach(), st = MB.app.state;
      Object.keys(data.minutes || {}).forEach(function (d) {
        const m = Number(data.minutes[d]) || 0;
        if (m > (Number(c.minutes[d]) || 0)) c.minutes[d] = m;
      });
      Object.keys(data.read || {}).forEach(function (k) { if (data.read[k]) st.read[k] = true; });
      Object.keys(data.ex || {}).forEach(function (k) { if (data.ex[k]) st.ex[k] = true; });
      if (!c.examDate && data.examDate) c.examDate = data.examDate;
      if (!c.target && data.target) c.target = data.target;
      save();
      return true;
    } catch (e) { return false; }
  }

  MB.habit = {};

  MB.habit.todayView = function () {
    const c = coach();
    if (!c.plan || c.plan.date !== today()) c.plan = null;
    const plan = c.plan;
    const w = weeklyMinutes(), days = weeklyDays(), due = dueCount();
    const examDays = c.examDate ? gap(today(), c.examDate) : null;
    const remaining = MB.allChapters.filter(function (ch) { return !MB.app.isRead(ch); }).length;
    const perWeek = examDays && examDays > 0 ? Math.ceil(remaining / Math.max(1, examDays / 7)) : null;
    const month = today().slice(0, 7), cells = [];
    for (let d = 1; d <= 31; d++) {
      const day = month + '-' + pad(d);
      if (parseDay(day) && parseDay(day).getMonth() + 1 === Number(month.slice(5))) cells.push(day);
    }
    let h = pageHead(T('Napi terv', "Today's plan"), T('Mai terv', "Today's plan"),
      T('Válassz időkeretet, és a terv külön lépésekre bontja: előhívás, tanulás, gyakorlás, hibajavítás. A tanulás és az ismétlés nem keveredik egy blokkban.',
        'Pick a time box and the plan splits into separate steps: recall, learn, practice, redo. Learning and review never mix inside one block.'));
    h += '<div class="plan-bar"><div><b id="habitTodayMinutes">' + minutesOn(today()) + '</b><span>' + T('perc ma', 'minutes today') + '</span></div>' +
      '<div><b>' + target() + '</b><span>' + T('napi cél', 'daily target') + '</span></div>' +
      '<div><b>' + w + '</b><span>' + T('perc ezen a héten', 'minutes this week') + '</span></div>' +
      '<div><b>' + days + '</b><span>' + T('aktív nap', 'active days') + '</span></div></div>';
    h += '<div class="plan-picker">' + [30, 60, 120].map(function (m) {
      return '<button class="btn ' + (plan && plan.minutes === m ? 'navy' : '') + '" data-plan-min="' + m + '">' + m + ' ' + T('perc', 'min') + '</button>';
    }).join('') + '<button class="btn" data-plan-min="5">' + T('Rossz nap? 5 perc is számít.', 'Bad day? 5 minutes counts.') + '</button></div>';
    if (plan) {
      h += '<ol class="plan-steps">';
      plan.steps.forEach(function (step, i) {
        const done = stepDone(step, i);
        const current = !done && plan.steps.findIndex(function (s, j) { return !stepDone(s, j); }) === i;
        const copy = stepText(step);
        h += '<li class="' + (done ? 'done' : '') + (current ? ' current' : '') + '"><div class="plan-main"><span class="plan-kicker">' +
          (current ? T('Most', 'Current') : done ? T('Kész', 'Done') : T('Következik', 'Next')) + ' · ' + step.minutes + ' ' + T('perc', 'min') + '</span>' +
          '<a href="' + step.href + '"><b>' + esc(copy.label) + '</b></a><span class="muted">' + esc(copy.detail) + '</span></div>' +
          (done ? '<span class="plan-check">✓</span>' : '<button class="btn sm" data-plan-done="' + i + '">' + T('Kész', 'Done') + '</button>') + '</li>';
      });
      h += '</ol>';
      if (plan.steps.every(function (s, i) { return stepDone(s, i); })) {
        h += '<div class="note-box"><h4>' + T('Megvan a mai terv.', "Today's plan is complete.") + '</h4><p style="margin:0">' + T('Ennyivel tartozol a holnapi önmagadnak — és kész.', 'That is all you owe tomorrow-you.') + '</p></div>';
      }
    } else {
      h += '<div class="note-box"><h4>' + T('Válassz 30, 60 vagy 120 percet', 'Choose 30, 60 or 120 minutes') + '</h4><p style="margin:0">' +
        T('A terv a hibafüzetedből, a következő fejezetből és egy vegyes körből áll. Ha valami hiányzik, üres állapotot látsz — nem hamis feladatot.',
          'The plan is built from your notebook, the next chapter and a mixed run. If something is missing you see an empty state, never a fake task.') + '</p></div>';
    }
    h += '<div class="home-section"><div class="section-head"><div><h2>' + T('Napi cél', 'Daily target') + '</h2><p>' + T('A percek csak aktív időt számolnak: a látható fülön töltött időt. A kihagyott nap nem hiba, csak információ.', 'Minutes count active time only: while the tab is visible. A missed day is information, not failure.') + '</p></div></div>' +
      '<div class="habit-grid"><div class="coach-panel"><h3>' + T('Az elmúlt 5 hét', 'The last 5 weeks') + '</h3>' + calendarHTML(35) +
      '<div class="habit-row"><label>' + T('Napi cél', 'Daily target') + ' <select data-habit-target>' + [30, 45, 60, 75, 90, 105, 120].map(function (n) {
        return '<option value="' + n + '"' + (n === target() ? ' selected' : '') + '>' + n + ' ' + T('perc', 'min') + '</option>';
      }).join('') + '</select></label><span class="muted">' + T('Javaslat: ', 'Suggested: ') + target() + ' ' + T('perc (4-5 hét alatt 60-120 felé)', 'min (toward 60-120 over 4-5 weeks)') + '</span></div>' +
      '<p class="muted">' + T('A cél javaslat: elfogadhatod, átállíthatod vagy figyelmen kívül hagyhatod. A hiányzó nap nem töröl semmit.', 'The target is a suggestion: accept it, change it, or ignore it. A missing day deletes nothing.') + '</p></div>' +
      '<div class="coach-panel"><h3>' + T('Tempó a vizsgáig', 'Pace to the exam') + '</h3>' +
      '<label class="coach-label">' + T('Vizsga dátuma', 'Exam date') + '<input type="date" data-habit-exam value="' + esc(c.examDate || '') + '"></label>' +
      '<p style="margin:.4rem 0">' + (c.examDate
        ? (examDays === 0 ? T('Ma van a vizsga.', 'The exam is today.') : T('Hátralévő fejezet: ', 'Chapters left: ') + '<b>' + remaining + '</b>' + (perWeek ? ' · ' + T('kb. ', 'about ') + '<b>' + perWeek + '</b> ' + T('fejezet / hét', 'chapters per week') + ' ' + T('a határidőig', 'to finish by') + ' ' + esc(c.examDate) : ''))
        : T('Add meg a vizsga dátumát, és kiszámoljuk a heti tempót.', 'Set the exam date and we compute the weekly pace.')) + '</p>' +
      '<div class="study-days">' + cells.map(function (day) { return '<span class="' + (minutesOn(day) > 0 ? 'studied' : '') + '" title="' + esc(day + ' · ' + minutesOn(day) + ' ' + T('perc', 'min')) + '">' + Number(day.slice(8)) + '</span>'; }).join('') + '</div>' +
      '<p class="muted">' + T('A mintázat segít látni, ha visszacsúsznál a vizsga előtti magolásba.', 'The pattern makes a slide back into cramming visible.') + '</p></div></div></div>';
    h += '<div class="home-section"><div class="section-head"><div><h2>' + T('Szokásépítés', 'Habit tools') + '</h2><p>' + T('Helyi, hálózat nélküli eszközök. Egyik sem büntet.', 'Local tools with no network. None of them punishes.') + '</p></div></div>' +
      '<div class="habit-grid"><div class="coach-panel"><h3>' + T('Rögzített időpont', 'Fixed-time reminder') + '</h3>' +
      '<label class="coach-label">' + T('Szándék', 'Implementation intention') + '<input type="text" maxlength="160" data-habit-intention value="' + esc(c.intention) + '"></label>' +
      '<button class="btn" data-habit-ics>' + T('Napi .ics letöltése', 'Download daily .ics') + '</button>' +
      '<p class="muted">' + T('Nincs szerver, nincs értesítés: a naptárad emlékeztet.', 'No server, no notifications: your calendar reminds you.') + '</p>' +
      '<button class="btn sm ' + (c.calm ? 'navy' : '') + '" data-habit-calm>' + T('Nyugodt mód', 'Calm mode') + ': ' + (c.calm ? T('be', 'on') : T('ki', 'off')) + '</button></div>' +
      patternHTML() + '</div>' +
      '<div class="coach-panel"><h3>' + T('Heti összegzés és haladáskód', 'Weekly summary and progress code') + '</h3>' +
      '<p class="muted">' + T('Másold ki és oszd meg egy baráttal. Nincs fiók, nincs hálózat.', 'Copy it and share it with a friend. No account, no network.') + '</p>' +
      '<textarea id="habitSummary" rows="5" readonly>' + esc(weeklySummary()) + '</textarea>' +
      '<div class="coach-actions"><button class="btn" data-habit-copy>' + T('Összegzés másolása', 'Copy summary') + '</button>' +
      '<button class="btn" data-habit-code>' + T('Haladáskód', 'Progress code') + '</button></div>' +
      '<div id="habitCode" hidden><textarea id="habitExport" rows="4" readonly>' + esc(exportCode()) + '</textarea>' +
      '<label class="coach-label">' + T('Behozatal (összefésül, nem töröl)', 'Import (merges, never deletes)') + '<textarea id="habitImport" rows="3"></textarea></label>' +
      '<button class="btn sm" data-habit-import>' + T('Behozatal', 'Import') + '</button></div></div></div>';
    return h;
  };

  MB.habit.homeHTML = function () {
    const c = coach(), due = dueCount(), donePlan = c.plan && c.plan.date === today() && c.plan.steps.every(function (s, i) { return stepDone(s, i); });
    const gapDays = c.lastActive ? gap(c.lastActive, today()) : null;
    let h = '';
    if (gapDays != null && gapDays >= 7 && c.welcomeShown !== today()) {
      c.welcomeShown = today();
      save();
      h += '<div class="note-box welcome-back"><h4>' + T('Üdv újra itt.', 'Welcome back.') + '</h4><p>' +
        T('Semmi nem veszett el. A legkisebb lépés is elég ma: öt perc, és megvan a nap.', 'Nothing is lost. The smallest step is enough today: five minutes and the day counts.') + '</p>' +
        '<div class="coach-actions"><a class="btn navy" href="#/review">' + T('Rossz nap? 5 perc is számít.', 'Bad day? 5 minutes counts.') + '</a>' +
        '<a class="btn" href="#/today">' + T('Mai terv', "Today's plan") + '</a></div></div>';
    }
    h += '<div class="habit-strip">' +
      '<a class="habit-card habit-primary" href="#/today"><span class="hc-kicker">' + T('Mai terv', "Today's plan") + '</span>' +
      '<b>' + (donePlan ? T('Kész a mai terv', 'Today\'s plan is done') : T('Indítsd el a mai tervet', "Start today's plan")) + '</b>' +
      '<span>' + T('30 / 60 / 120 perc, külön lépésekre bontva. A tanulás és az ismétlés nem keveredik.', '30 / 60 / 120 minutes split into separate steps. Learning and review do not mix.') + '</span>' +
      '<span class="hc-go">' + T('Indítás', 'Start') + ' →</span></a>' +
      '<a class="habit-card" href="#/progress"><span class="hc-kicker">' + T('Ma', 'Today') + '</span>' +
      '<b>' + minutesOn(today()) + ' ' + T('perc', 'min') + '</b><span>' + T('aktív idő, cél: ', 'active time, target: ') + target() + ' ' + T('perc', 'min') + '</span>' +
      '<span class="hc-go">' + T('Részletek', 'Details') + ' →</span></a>' +
      '<a class="habit-card" href="#/review"><span class="hc-kicker">' + T('Ismétlés', 'Review') + '</span>' +
      '<b>' + due + '</b><span>' + T('esedékes bejegyzés · öt perc is elég', 'due entries · five minutes counts') + '</span>' +
      '<span class="hc-go">' + (due ? T('Ismétlés', 'Review') : T('Tiszta', 'Clear')) + ' →</span></a></div>';
    return h;
  };

  /* ---------- active minutes ---------- */
  let lastActivity = Date.now();
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, function () { lastActivity = Date.now(); }, { passive: true });
  });
  setInterval(function () {
    if (document.hidden) return;
    if (Date.now() - lastActivity > 120000) return;
    addMinutes(0.25);
    const el = document.getElementById('habitTodayMinutes');
    if (el) el.textContent = minutesOn(today());
  }, 15000);

  /* ---------- stuck timer ---------- */
  function offerTags(ex) {
    if (!ex || !ex.dataset.funid) return;
    let row = ex.querySelector('.miss-tags');
    if (!row) {
      row = document.createElement('div');
      row.className = 'miss-tags';
      row.innerHTML = '<span>' + T('Miért nem ment?', 'Why did I miss it?') + '</span>' +
        ['concept', 'slip', 'misread'].map(function (id) { return '<button type="button" class="btn sm" data-miss="' + id + '">' + tagLabel(id) + '</button>'; }).join('');
      var fb = ex.querySelector('.feedback');
      if (fb) fb.appendChild(row); else ex.appendChild(row);
    }
    row.querySelectorAll('[data-miss]').forEach(function (b) {
      b.classList.toggle('navy', coach().tags[ex.dataset.funid] === b.dataset.miss);
    });
  }
  function scanStuck() {
    if (coach().calm) return;
    MB.qsa('.ex[data-funid]').forEach(function (ex) {
      const key = ex.dataset.funid, started = coach().stuck[key];
      if (!started || started < 0) return;
      if (ex.dataset.answered === '1' || ex.classList.contains('done')) return;
      if (ex.querySelector('.stuck')) return;
      if (Date.now() - started < 15 * 60000) return;
      const box = document.createElement('div');
      box.className = 'stuck';
      box.innerHTML = '<b>' + T('15 perce ezen a feladaton vagy.', 'You have been on this exercise for 15 minutes.') + '</b> ' +
        T('Nézd meg a megoldást, majd oldj meg egy hasonlót. Ez nem feladás, hanem a következő lépés.', 'Look at the solution, then try a similar one. That is not giving up; it is the next step.') +
        '<div class="coach-actions"><button class="btn sm" data-stuck-sol>' + T('Megoldás', 'Show the solution') + '</button>' +
        '<button class="btn sm" data-stuck-similar>' + T('Hasonló feladat', 'Similar exercise') + '</button>' +
        '<button class="btn sm" data-stuck-dismiss>' + T('Elrejtés', 'Dismiss') + '</button></div>';
      ex.appendChild(box);
    });
  }
  setInterval(scanStuck, 30000);

  /* ---------- events ---------- */
  document.addEventListener('pointerdown', function (e) {
    const ex = e.target.closest && e.target.closest('.ex[data-funid]');
    if (!ex) return;
    const key = ex.dataset.funid;
    if (!coach().stuck[key]) { coach().stuck[key] = Date.now(); save(); }
  }, true);

  document.addEventListener('click', function (e) {
    const t = e.target;
    if (!t || !t.closest) return;
    const planMin = t.closest('[data-plan-min]');
    if (planMin) { coach().plan = planFor(Number(planMin.dataset.planMin) || 30); save(); MB.app.render(); return; }
    const done = t.closest('[data-plan-done]');
    if (done) {
      const p = coach().plan;
      if (p) { p.done[Number(done.dataset.planDone)] = true; save(); MB.app.render(); }
      return;
    }
    const miss = t.closest('[data-miss]');
    if (miss) {
      const ex = miss.closest('.ex[data-funid]');
      if (!ex) return;
      coach().tags[ex.dataset.funid] = miss.dataset.miss;
      save();
      const row = miss.closest('.miss-tags');
      if (row) row.querySelectorAll('[data-miss]').forEach(function (b) { b.classList.toggle('navy', b === miss); });
      return;
    }
    if (t.closest('[data-habit-ics]')) {
      const blob = new Blob([icsText()], { type: 'text/calendar;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'study-plan.ics';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      MB.toast(T('Naptárfájl letöltve.', 'Calendar file downloaded.'));
      return;
    }
    if (t.closest('[data-habit-calm]')) {
      coach().calm = !coach().calm;
      save();
      document.body.classList.toggle('calm-mode', coach().calm);
      MB.app.render();
      return;
    }
    if (t.closest('[data-habit-copy]')) {
      const text = weeklySummary();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { MB.toast(T('Összegzés a vágólapon.', 'Summary copied.')); },
          function () { MB.toast(T('Nem sikerült másolni; jelöld ki kézzel.', 'Copy failed; select it manually.')); });
      } else {
        const ta = document.getElementById('habitSummary');
        if (ta) { ta.removeAttribute('readonly'); ta.select(); document.execCommand && document.execCommand('copy'); ta.setAttribute('readonly', ''); }
      }
      return;
    }
    if (t.closest('[data-habit-code]')) {
      const box = document.getElementById('habitCode');
      if (box) box.hidden = !box.hidden;
      return;
    }
    if (t.closest('[data-habit-import]')) {
      const src = document.getElementById('habitImport');
      const ok = importCode(src ? src.value : '');
      MB.toast(ok ? T('Haladás összefésülve. Semmit nem töröltünk.', 'Progress merged. Nothing was deleted.') : T('Ez a kód nem érvényes.', 'That code is not valid.'));
      if (ok) MB.app.render();
      return;
    }
    const sol = t.closest('[data-stuck-sol]');
    if (sol) {
      const ex = sol.closest('.ex');
      const btn = ex && ex.querySelector('[data-sol]');
      if (btn) btn.click();
      return;
    }
    const similar = t.closest('[data-stuck-similar]');
    if (similar) {
      const ex = similar.closest('.ex');
      if (ex) {
        const key = ex.dataset.funid;
        coach().stuck[key] = -1;
        save();
        const group = ex.parentElement;
        const sib = group ? Array.prototype.slice.call(group.querySelectorAll('.ex')).find(function (n) { return n !== ex; }) : null;
        if (sib) { sib.scrollIntoView({ block: 'center', behavior: 'smooth' }); sib.classList.add('flash'); setTimeout(function () { sib.classList.remove('flash'); }, 1500); }
      }
      return;
    }
    const dismiss = t.closest('[data-stuck-dismiss]');
    if (dismiss) {
      const ex = dismiss.closest('.ex');
      if (ex) coach().stuck[ex.dataset.funid] = -1;
      save();
      const box = dismiss.closest('.stuck');
      if (box) box.remove();
    }
  });

  document.addEventListener('change', function (e) {
    const t = e.target;
    if (!t || !t.matches) return;
    if (t.matches('[data-habit-target]')) { coach().target = Number(t.value) || null; save(); MB.app.render(); }
    if (t.matches('[data-habit-exam]')) { coach().examDate = t.value; save(); MB.app.render(); }
    if (t.matches('[data-habit-intention]')) { coach().intention = t.value; save(); }
  });

  /* ---------- answer hook: tags + stuck reset ---------- */
  const prevAnswer = MB.fun && MB.fun.answer;
  if (MB.fun && prevAnswer) {
    MB.fun.answer = function (ex, ok, user) {
      const before = ex && ex.dataset.funid;
      prevAnswer.call(MB.fun, ex, ok, user);
      if (!ex || !before) return;
      coach().stuck[before] = -1;
      if (!ok) offerTags(ex);
      save();
    };
  }

  MB.habit.afterRender = function () {
    document.body.classList.toggle('calm-mode', !!coach().calm);
  };
  MB.habit.patternHTML = patternHTML;
})();
