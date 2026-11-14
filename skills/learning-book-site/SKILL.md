---
name: learning-book-site
description: Build a self-contained, fully bilingual (EN/HU), book-style preparation or full-course learning website, with supplied files or from research. Every user-visible string — UI, theory, examples, mistakes, exercises, hints, solutions, choices, formulas, videos, generated banks, error hunts and feedback — exists in both languages. Covers source discovery, prerequisite-first curriculum mapping, content schema, KaTeX rendering, checkable exercises, rerollable 50-item practice banks (10 easy / 10 medium / 30 hard), chapter tests, timed exam simulators, daily quests with a solve-streak, a Leitner error notebook, interleaved mixed runs, error hunts, teach-back boxes, exam-readiness scoring, progress tracking, search, and verification. Works for a university semester or a single topic such as JavaScript classes.
---

# Learning Book Site

A repeatable method for turning raw course material into a polished, offline-capable learning site that reads like a textbook and drills like a question bank.

Use when the user says things like:
- "Build me a website to learn X from these PDFs/slides."
- "Make a course site with theory, videos, examples and exercises."
- "I want a book-like site with a test at the end of each chapter."
- "Generate unlimited practice problems for this topic."

## 1. Inputs and discovery

Before designing anything, inventory the sources.

1. List every file and folder. Note formats: PDF, DOCX, PPTX, images, video, ZIP, code.
2. Extract text from PDFs. If extraction is poor, render selected pages as images and read them visually.
3. Identify the **actual curriculum**, not just the folder names:
   - Course pages / syllabi / requirement documents.
   - Exam and midterm papers (these define the real level).
   - Official notes vs. student summaries.
4. Read the most recent 1–2 exam papers *before* writing content. They reveal:
   - Question types (definition + proof, calculation, multiple choice).
   - Time limits and point distribution.
   - Which topics are actually tested.
5. Record a scope map: `Part → Chapter → Prerequisites → Exam relevance`.
6. Respect copyright: summarize, paraphrase, and link to originals. Do not reproduce long copyrighted texts verbatim. Keep source PDFs as downloadable resources when the user owns them.

Deliverable of this phase: a one-page scope map and a list of source assets to bundle.

## 2. Choose the shape

Define the site's parts before writing prose. Example for BME VIK first-year mathematics:

```
00 Kezdőlap
01 Alapok                  (algebra, trig, functions, equations)
02 Logika és bizonyítás
03 Komplex számok
04 Sorozatok
05 Függvényhatárérték és folytonosság
06 Deriválás
07 Integrálás
08 Numerikus sorok
09 Hatványsorok és Taylor
10 Többváltozós analízis
11 Differenciálegyenletek, rekurziók, Fourier
12 Lineáris algebra
13 Diszkrét matematika
+ Képletgyűjtemény
+ Videók
+ Feladatbank
+ ZH / vizsga szimulátor
+ Forrásanyagok
```

For a smaller topic (e.g. "JavaScript classes"), keep the same spine but shrink it:

```
01 Elmélet: miért létezik az osztály?
02 Szintaxis és konstruktor
03 Prototípus és öröklődés
04 Privát mezők, statikus tagok
05 Gyakorlat + teszt
```

Rules of thumb:
- 20–35 chapters is a good size for a full semester.
- Each chapter should fit one 20–40 minute study session.
- Every chapter must have a clear exam relevance tag (`ZH1`, `ZH2`, `vizsga`, `alapozás`).
- Do not create a chapter with no exercises.

## 3. Design language

Pick the institution's real palette and typography. For BME VIK:

```css
--bme-navy: #052a4b;   /* official VIK colour: RGB(5,42,75) */
--bme-gold: #b8912f;   /* restrained gold accent */
--paper:    #fcfbf7;   /* warm book paper */
--ink:      #18222e;
```

Book-style rules:
- Light theme by default; dark mode optional.
- Body text in a serif (Charter/Georgia); headings in a clean sans (system UI).
- Left sidebar is a real table of contents, always visible on desktop.
- Content column max ~780 px; generous line-height (1.65–1.75).
- Thin gold rule under the top bar; navy header block; no neon gradients.
- Chapter opener: large outlined chapter number, title, lead paragraph, metadata pills.
- Section labels are uppercase small caps with a gold square.
- Use callouts consistently:
  - **Miért?** (gold) — intuition first.
  - **Mikor használd?** (blue) — selection guidance.
  - **Definíció / Tétel** (navy/blue left border).
  - **Vigyázat** (red) — traps.
  - **Képlet** (gold left border).
- Print stylesheet: hide sidebar/topbar/buttons; black on white.

Never invent an official logo. A text mark + geometric monogram is safer and still professional.

## 4. Architecture

Use a static site with no build step. It must run by opening `index.html` or via a tiny local server.

```
site/
  index.html
  assets/
    css/app.css
    js/util.js          # icons, escaping, answer checking, storage
    js/generators.js    # deterministic exercise bank
    js/demos.js         # interactive SVG demos
    js/features.js      # practice / test / exam runners
    js/fun.js           # daily quest, notebook, mixed run, hunts, teach-back, readiness
    js/app.js           # router, views, progress, search
  content/
    _helpers.js         # content authoring helpers
    01-alapok.js
    02-logika.js
    ...
    _formulas.js
    _videos.js
  vendor/katex/         # katex.min.js, katex.min.css, auto-render, fonts
  resources/            # source PDFs, exam papers
```

Key decisions:
- **Hash router**: `#/`, `#/section/:sid`, `#/chapter/:sid/:cid`, `#/practice/:cat`, `#/exam/:mode`, `#/test/:sid/:cid`, `#/formulas`, `#/videos`, `#/resources`, plus the retention routes `#/daily`, `#/review`, `#/mixed`, `#/hunt[/:id]`, `#/progress`. No server rewrites needed.
- **Content as JS data**, not Markdown: gives structure (theory blocks, examples, exercises) and avoids a markdown parser.
- **Vendor KaTeX locally** so the site works offline. Use `auto-render` with `$...$` and `$$...$$`.
- **localStorage** for progress, theme, test history. Namespace the key (`appname.v1`).
- **No framework**. Vanilla JS keeps the site portable and fast.
- **Retention layer as one optional module.** `fun.js` adds routes and bookkeeping but owns no content: it reads tracking data from the DOM (see §6.9) and stores everything under one `MB.app.state.fun` key. `app.js` calls its hooks only when present, so deleting the module leaves a working site.

## 5. Content model

Each section pushes one object:

```js
MB.section({
  id: 'sorozatok', num: '04', title: 'Sorozatok',
  subtitle: 'A végtelen viselkedése', examTag: 'ZH1',
  intro: '...',
  chapters: [{
    id: 'sorozat-konvergencia', num: '4.1',
    title: 'Konvergencia, korlátosság, monotonitás',
    minutes: 30,
    lead: '...',
    why: ['...', '...'],        // intuition, 2 paragraphs
    when: '...',                 // when to reach for this tool
    theory: [
      MB.def('...', '...'),
      MB.thm('...', '...'),
      MB.formula('...', '\\begin{aligned}...\\end{aligned}', 'note'),
      MB.note('...', '...'),
      MB.warn('...', '...'),
      MB.list('...', ['...', '...'])
    ],
    examples: [
      MB.example({ title:'...', problem:'...', steps:['...','...'], answer:'...' })
    ],
    mistakes: ['...', '...'],
    exercises: [
      MB.q({ level: 2, q:'...', a:'2', type:'number', hint:'...', sol:'...' })
    ],
    video: { id:'...', title:'...', channel:'...', kind:'VIDEÓ' }
  }]
});
```

Authoring rules:
- Write **why** before **what**. The definition is the payoff, not the opener.
- Every theorem gets its conditions. A theorem without hypotheses is usually false.
- Every worked example: problem → numbered steps → boxed result.
- 3–4 typical mistakes per chapter, stated as wrong-vs-right.
- Math must be KaTeX-compatible: `\begin{aligned}`, not `\begin{align}`; avoid exotic packages.
- Hungarian typography: decimal comma in prose, but answers may use `1/3` or `0,333`.

**Every prose field above is bilingual.** Either store `{ hu, en }` values directly, or use an
indexed English overlay keyed by `sectionId/chapterId` as described in §17. Titles, leads, summaries,
`why`, `when`, theory text, examples, mistakes, exercise questions/hints/solutions/choices and video
metadata all need both languages. Math, answer values and IDs stay shared. A schema that can hold only
one language is incomplete.

## 6. Exercise systems

Build four layers. They serve different purposes and share one answer checker.

### 6.1 In-chapter exercises

6–8 per chapter, mixed difficulty, at least one proof/open question.

Answer types:
| type | use | checking |
|---|---|---|
| `number` | integer/decimal result | numeric tolerance |
| `expr` | fraction, `e^2`, `sqrt(2)/2`, symbolic with no variables | normalize + numeric eval |
| `text` | intervals, sets, "x<2 vagy x>3" | normalized string + accepted alternatives |
| `choice` | conceptual MC | index equality |
| `proof` | derivations | reveal solution + self-check buttons |

Checker rules:
- Normalize Unicode minus, spaces, `{}`, `\cdot`, `·`, `×`, decimal comma.
- Evaluate safe numeric expressions (`+ - * / ^`, parentheses, `sqrt`, `pi`, `e`, `ln`, `log`, `sin`, `cos`, `tan`) with a strict character whitelist.
- Compare with relative tolerance `1e-6`.
- Always provide `alt` for equivalent interval notations.
- Never mark a proof automatically. Let the learner self-assess; store the result.

### 6.2 Practice bank — 50 per category

For each category:
- **10 easy (level 1)**
- **10 medium (level 2)**
- **30 hard (level 3)**
- Display the ratio as **1 : 1 : 3** and the counts as **10 / 10 / 30**.
- Make it **rerollable**: a seed-based PRNG generates the bank; "Új feladatsor" changes the seed. Each item also has its own reroll button.

Implementation:
```js
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function generateBank(catId, seed) {
  const r = mulberry32(seed);
  return Array.from({ length: 50 }, (_, i) => {
    const level = i < 10 ? 1 : i < 20 ? 2 : 3;
    return { level, ...cat.gen(level, r) };
  });
}
```
Generator design:
- Each category exports `gen(level, rng) -> { q, a, type, alt, sol, hint, choices? }`.
- Use templates with random parameters, not random nonsense.
- Verify each template algebraically once; add a comment with the formula.
- Hard items should combine two ideas (chain rule + product, polar + improper, eigenvalues + system), not just larger numbers.
- Avoid generated answers that are ugly irrationals unless the question asks for a decimal or an expression.

### 6.3 Chapter test

- 8 questions, 10 minutes.
- Pull first from the chapter's own exercises, then fill from the matching practice category.
- One question at a time, navigation grid, save-on-navigate, auto-submit at 0:00.
- Result page: percentage ring, per-question correct answer and solution.
- Feed correct answers back into progress tracking.

### 6.4 Exam simulator

- ZH1: 10 questions / 75 min — complex, sequences, limits, continuity.
- ZH2: 10 questions / 75 min — derivatives, inverse functions, L'Hôpital, function analysis.
- Vizsga: 12 questions / 90 min — whole semester, integrals weighted.
- Grade thresholds: 40 / 55 / 65 / 80%.
- Show a clear disclaimer: simulator ≠ official exam.

### 6.5 Daily quest (the habit loop)

Five mixed items per day, one from five different core practice categories:

- Seed the set by date: `hash32('daily:' + YYYY-MM-DD)`. The same date always yields the same five items, so a reload is not a reroll.
- Shuffle the core practice categories and take five distinct ones; assign levels `1, 1, 2, 2, 3`.
- Hide the topic until the answer is checked. The point is recognising which method applies, not following a label.
- Reset the answer map when the date changes; store completion dates in a capped list (120 is plenty).
- Lock each item once it is answered correctly; at 5/5 show a toast and record the day.

**Streak rules** (any correct answer counts, not only the daily quest):

| Gap since last active day | Effect |
|---|---|
| 0 (same day) | no change |
| 1 day | `count += 1` |
| 2 days | consume the weekly freeze, then `count += 1` (reset to 1 if already spent) |
| > 2 days | reset to 1 |

- One freeze per ISO week, replenished automatically; show it as `freeze: 1/1` and tell the learner when it is spent.
- Track `best` alongside `count`; never let the streak display become a source of anxiety. A missed day is recoverable.
- The first correct answer of the day calls `markActive()`; show a toast with the new count.

### 6.6 Error notebook (Leitner queue)

Every missed auto-checkable item returns on a spaced schedule. This is the part that turns a practice site into a study system.

- On a wrong answer, add the item with `box = 0` and `due = tomorrow`.
- On a correct answer, promote: `box = min(4, box + 1)`. Due dates follow the intervals **1 / 3 / 7 / 21 days** (`LEITNER = [1, 3, 7, 21]`).
- At `box >= 4`, mark `mastered`, set `due = null`, and drop it from the queue. A later miss resets to box 0 and increments `lapses`.
- Identify an item by `hash(topic + '|' + question)`, not by DOM index or route. The same question missed in a chapter, a test and the practice bank is one notebook entry.
- Only schedule checkable items: skip `proof` and `open` types.
- Cap the notebook (300 entries). Trim mastered items first, then the oldest due dates.
- Review view: due items only (`due <= today`), sorted by due date then added date, capped at 25 visible with a note that the rest come next round. Offer a delete button per entry.
- After each review answer, show the next due date on success and "returns tomorrow" on failure. Do not demand an immediate retry; the schedule is the point.

### 6.7 Interleaved mixed run and error hunts

Both attack the "I know it when the chapter title tells me" illusion.

**Mixed run**
- 10 items, cycling through the core categories, levels `1,1,1,2,2,2,2,3,3,3`.
- Hide the topic label until the item is answered.
- Persist per-run answers and a seed; "New run" increments the seed and clears the answers.
- Score as `correct / 10`.

**Error hunts**
- Author 12–25 static items: a short problem, **three statements, exactly one false**.
- The false statement must be a *plausible* misconception (chain rule omitted, `\ln(a+b)` split, harmonic series declared convergent), never a typo or a trivial arithmetic slip.
- Clicking a true statement marks it correct but does not solve the hunt; clicking the false one locks the item and reveals an explanation naming the rule plus a counterexample.
- Group by section, show a per-topic solved count, and feed completion into the log and streak.
- Validate by construction that each item has exactly one false statement; do not generate hunts randomly.

### 6.8 Teach-back box (Feynman test)

Every chapter ends with a short explanation prompt. It is not graded.

- Textarea for 2–3 sentences, debounced autosave (~700 ms), and an explicit Save button for reassurance.
- Word counter; an empty textarea deletes the saved entry.
- Three self-check boxes: named the definition, stated a condition or exception, gave an example or counterexample.
- Collapsible model answer assembled from the chapter's existing fields: `lead`, first `why`, `when`, plus the names of formulas whose `ref` points at this chapter. No new content schema.
- Store under `teach[sectionId + '/' + chapterId] = { text, checks, date }`.
- Surface unfinished chapters on the progress page; completion is a diagnostic, not a gate.

### 6.9 Exam readiness and the weekly recap

A single percentage that is honest about missing data.

**Per-section readiness** is the weighted mean of the components that exist:

| Component | Weight | Available when |
|---|---|---|
| exercise coverage (`solved / checkable`) | 0.45 | the section has exercises |
| answer accuracy | 0.30 | at least 3 logged answers for the section |
| review health (`1 - overdue / open notebook items`) | 0.15 | the section has notebook entries |
| best test score | 0.30 | a test with `section` recorded exists |

- Divide by the sum of present weights (renormalise). If no component exists, return `null` and render `—`, never `0%`.
- Labels: `< 35%` starting, `< 55%` building, `< 75%` solid, otherwise exam-ready.
- Aggregate overall readiness over **core** sections only; show optional sections as separate groups so preview material never drags the score down.
- Record `section` (and a `tag` such as `test` or `exam`) whenever a test or exam is submitted. Without it the test component silently never appears.

**Weekly recap** (last 7 days): answers and accuracy, active days, successful reviews, daily quests completed, explanations saved, hunts solved, and the weakest topic with at least 3 answers. Derive it from the same append-only log; do not store counters that can drift.

**Home dashboard**: one card each for the daily quest (with streak), the error notebook (due count), and readiness, plus a next-action link. Keep the cards terse; the detail lives on `#/progress`.

### 6.10 Wiring the retention layer

Keep the tracker decoupled from the renderer: put the data on the exercise node, and give the tracker three hooks.

```html
<div class="ex" data-kind="chapter|practice|daily|mixed|review"
     data-topic="sectionId" data-funid="optional-unique-key"
     data-q="..." data-ans="..." data-type="number|expr|text|choice"
     data-alt="[...]" data-choices="[...]"
     data-solution="..." data-exhint="..." data-level="2">
```

- Retention views also need `data-idx` (daily and mixed answers are keyed by position in the day/run) and `data-review-id` (the notebook key) on their nodes.
- Notebook identity is derived, not stored in the DOM: `hash(topic + '|' + question)`. `data-funid` is only a convenience for view-local progress.
- `MB.fun.answer(ex, ok, value)` after every single checked answer. It logs the first attempt only, adds misses to the notebook, schedules successes, advances the streak, and updates the chrome.
- `MB.fun.batch(results, kind, section)` once after a chapter test or exam submits, with `{ it, ok }` per item. Runner items must carry `topic`, `cat` and `choices` through to the result.
- `MB.fun.afterRender(route)` after each route render to refresh the streak chip, sidebar badges and due count.
- Guard every call (`MB.fun && MB.fun.answer(...)`) so the site still works if the module is removed.
- Store all state under one object (`MB.app.state.fun`): `review`, `log`, `hunts`, `teach`, `dailyDone`, `streak`, `daily`, `mixed`. Cap the log at ~800 entries.
- Load order: `util → generators → demos → features → fun → coach → app`.
- The coach layer (§6.11) uses the same answer hook; do not add a second grading path.

### 6.11 Motivation-aware launchpad (friction, competence, stakes)

A site can have perfect content and still be avoided when the learner feels confused, exposed or
bored. Add a small **coach layer** that lowers the start cost, makes competence visible, imports a
real deadline, and protects against shame. It is local-first and optional; keep it out of the
content schema.

**State** — store under `MB.app.state.coach` and save with the same `MB.app.save()`:

```js
state.coach = {
  examDate: 'YYYY-MM-DD' | '',
  weeklyGoal: 3,                 // 1–7 sessions, user-set
  sessions: ['YYYY-MM-DD'],      // max one per day, cap ~120
  diag: { [sectionId]: { done, correct, total, passed, date } },
  diagDraft: { [sectionId]: { [idx]: boolean } },
  sessionSection: 'alapok' | '',  // last part chosen on #/sessions
  calm: false
}
```

**Mastery is not readiness.** Readiness (§6.9) is the evidence-weighted exam estimate. The coach
map uses a simpler navigation score:

`0.50 * exercise coverage + 0.10 * chapters read + 0.25 * test average + 0.15 * recall accuracy`.

- A passed diagnostic floors that section at `0.75` so the map reflects test-out knowledge.
- Aggregate only core sections. Ramps are `weak < .35`, `building < .55`, `solid < .75`, `ready`.
- **No data is not zero.** If a section has no read/solved/test/recall/diagnostic evidence, render
  `—` and a neutral `.new` class. Never paint an untouched section red; a new learner must not open
  a wall of failure.

**Four deliberate session modes**

Do not make “sprint” mean “here are some random tasks”. A session must either teach first or test
prior knowledge, and it must respect what the learner has already completed.

| Route | Duration | Content |
|---|---|---|
| `#/sessions` | — | Part picker and four cards: learn 10, learn 20, review 5, review 10. Shows known/unknown chapter counts and whether the diagnostic passed. |
| `#/learn/10/:section` | 10 min | One **unknown** chapter: a short theory block, one worked example, then 2 tasks from that chapter. |
| `#/learn/20/:section` | 20 min | Up to two **unknown** chapters: theory, examples, then 4 tasks. |
| `#/review/5/:section` | 5 min | 3 retrieval tasks from **known/completed** chapters only; no theory. |
| `#/review/10/:section` | 10 min | 6 retrieval tasks from **known/completed** chapters only; no theory. |
| `#/coach` | — | Exam date, weekly commitment, next three actions, calm toggle and a single entry point to `#/sessions`. |
| `#/map` | — | Section cards with prerequisites, mastery and learn/review/diagnostic links. |
| `#/diagnostic/:section` | — | Five generated items (`1,1,2,2,3`); first attempt counts; `>= 4/5` passes. |

Define **known** explicitly:

```js
const stats = chapterCheckableStats(chapter); // total, done, ratio
const known = diagnosticPassed(section) ||
  (isRead(chapter) &&
   (stats.total === 0 || stats.done >= Math.min(2, stats.total) || stats.ratio >= 0.5));
```

- `learn` selects `unknownChapters(section)`; `review` selects `knownChapters(section)`.
- Learning tasks come from the selected chapters’ unchecked exercises. If a chapter does not have
  enough checkable exercises, generate from that section’s practice categories; generated items
  have no chapter key and cannot mark a chapter complete.
- Review never generates new theory and never pulls from unread chapters. If the learner has no
  completed chapter in that part, show an empty state that links to learn 10 — do not silently
  fall back to new material.
- The learner chooses the part on `#/sessions`; store it in `coach.sessionSection`. The same part
  is carried into learn/review routes.
- A session timer is optional to start and always stoppable. It is not a punishment: at 00:00 show
  “stop, the next step can wait”.
- On the first learn answer (right or wrong), mark the lesson chapter read. On a correct learn
  answer, mark that exercise done. This is how the next session knows what is known without asking
  the learner to maintain a second checklist.
- 10-minute learn shows two tasks; 20-minute learn shows four; review 5 shows three; review 10
  shows six. Do not mix learn and review content in one mode.
- Home adds a compact coach strip before the daily/readiness cards: sessions, map, focus. Keep it to
  three cards.
- Exam countdown uses local dates, not UTC midnight; a deadline is a user-facing date.
- Weekly commitment counts distinct session days in the current ISO week; it is a commitment, not
  a streak. If a week slips, reset it without a punishment screen.

**Safe-fail feedback** — this is a UX rule, not a slogan:

- Wrong answers use an amber `.learning` state, never red. Copy: “not yet — this is information”.
- Offer a smaller step/hint before the solution. Do not remove points or lock the learner out.
- The error notebook remains the review queue, but rename the visible metric to **confusions
  fixed** where possible. A miss is data, not a verdict.
- After a correct answer, name the next step (“slightly harder”, “mixed set”, “exam paper”).
- Proof/open items stay self-assessed; never fake a grade for them.

**Calm mode**

- `body.calm-mode` hides streak chips, badges, flame cards and loss-framed copy.
- No leaderboards, no “you lost your streak”, no red countdown. Persist the preference.
- Keep the weekly commitment and exam date visible; those are useful pressure, unlike guilt.

**Wiring contract**

```html
<div class="ex" data-kind="learn|review-session|diagnostic"
     data-diag="sectionId" data-diag-idx="0"
     data-learn-key="sectionId/chapterId/exerciseIndex"
     data-funid="..." data-idx="0" ...>
```

- Reuse `MB.fun.itemHTML(it, { kind, funid, idx, done, showTopic, attrs })`; add an `attrs` string
  for `data-diag` / `data-diag-idx` and `data-learn-key`. Do not fork the exercise renderer.
- After every checked answer, `MB.fun.answer` calls `MB.fun.onAnswer(ex, d, kind, first)`. Wrap the
  existing coach hook from the session module; do not replace it. The wrapper records the first
  diagnostic attempt, marks a session, marks learn chapters read and correct exercises done, and
  locks correct items.
- `MB.coach.afterRender(route)` applies calm mode; `MB.app.render()` calls it after `fun`.
- Load order: `util → generators → demos → features → fun → coach → sessions → app`.
- Guard every coach call (`MB.coach && ...`) so the book still works if the layer is removed.

**Evidence and constraints**

- Autonomy, competence and relatedness predict intrinsic motivation; use choice, visible mastery
  and optional social accountability, not pressure alone.
- Implementation intentions (“if it is 18:30 at my desk, then I open the 10-minute learn session”)
  are effective for starting; give the learner a place to write one.
- Procrastination is often emotion regulation, not laziness; the first screen must make confusion
  safe.
- Retrieval, spacing and interleaving remain the learning engine; the coach only changes the
  entrance.
- Do **not** match instruction to “learning styles”; evidence for meshing is weak. Ask about
  conditions (structure, novelty, pressure, social energy), not a label.

**Acceptance**

- [ ] A new learner with no data sees `—` and neutral map nodes, not `0%` red nodes.
- [ ] Choose a part on `#/sessions`; all four cards point at that part.
- [ ] Learn 10 shows exactly one unknown chapter, theory + one example, then 2 tasks.
- [ ] Learn 20 shows up to two unknown chapters, theory + examples, then 4 tasks.
- [ ] Review 5/10 show 3/6 tasks from known chapters only, with no theory.
- [ ] Learn never uses a known chapter; review never uses an unread chapter.
- [ ] Answering learn tasks marks the chapter read and the exercise done; the sessions page updates
      its known/unknown counts after reload.
- [ ] Empty states appear instead of fake tasks when there is nothing to learn or review.
- [ ] Diagnostic `4/5` passes, persists, floors the map at 75%, and can be retested.
- [ ] Wrong answers are amber, offer a hint, and create one notebook entry; no score is lost.
- [ ] All four timers start at their advertised duration and stop at 00:00.
- [ ] Exam date, weekly goal and weekly session count survive reload.
- [ ] Calm mode hides streak chrome and survives reload.
- [ ] All coach strings switch HU/EN; dates and week boundaries use local time.
- [ ] No console errors on `#/coach`, `#/sessions`, `#/learn/*`, `#/review/5/*`, `#/review/10/*`,
      `#/map`, or `#/diagnostic/:id`.

## 7. UX features worth building

- **Progress**: mark chapter read; count solved exercises; overall bar in sidebar; readiness dashboard (see §6.9).
- **Learn / review** (§6.11): four deliberate modes (learn 10, learn 20, review 5, review 10), a part picker, knowledge map, section diagnostics, exam countdown and weekly commitment. Put the entries first on the home page.
- **Daily practice group**: sidebar links for the daily quest, error notebook, mixed run, error hunts and progress, with a due-count badge.
- **Calm mode** (§6.11): hide streak chrome and loss-framed copy for learners who find it punitive.
- **Streak chip**: one compact flame + count in the topbar, linking to the daily quest; render the zero state muted rather than hiding it.
- **Search**: `Ctrl/Cmd+K`; index sections, chapters, theory text, formula names, videos; keyboard navigation.
- **Formula sheet**: searchable, grouped by category, each formula links back to its chapter.
- **Video library**: lazy-load iframes on click; always offer a YouTube search link as fallback.
- **Interactive demos** (optional but high value):
  - Unit circle with angle slider.
  - Secant → tangent animation (`h → 0`).
  - Riemann sum with `n` slider.
- **Resources page**: bundled PDFs with labels, plus a note on provenance.
- **Theme toggle** and **print stylesheet**.
- **Mobile**: sidebar becomes a drawer; search collapses to an icon.

## 8. Verification checklist

Do these before declaring done:

1. `node --check` every JS content and feature file.
2. Serve locally (`python -m http.server 8000` in `site/`) and open in a browser.
3. Check:
   - Every sidebar link resolves; no blank routes.
   - KaTeX renders inline and display math without errors.
   - An exercise accepts a correct answer and rejects a wrong one.
   - A generated bank shows 50 items, filters by difficulty, rerolls.
   - Chapter test timer starts, submits, scores, and shows review.
   - Exam simulator starts, navigates, submits, shows grade.
   - Progress persists after reload.
   - Search returns results and navigates.
   - Videos load only on click.
   - Daily quest: reloading on the same date shows the same five items; answering all five records the day and advances the streak once.
   - Streak: a one-day gap increments, a two-day gap consumes the weekly freeze (only once per week), a longer gap resets to 1.
   - Error notebook: a wrong answer is due tomorrow; a correct review moves through 1 → 3 → 7 → 21 days; box 4 marks it mastered and removes it; a later miss resets to box 0.
   - Mixed run hides topics until answered; "New run" yields a different set and clears the score.
   - Error hunts: every item has exactly one false statement; clicking a true one does not solve it; the explanation appears only after the false one.
   - Sessions: choose a part; learn 10/20 use only unknown chapters and show theory/examples before tasks; review 5/10 use only known chapters and show no theory; timers stop at their advertised duration; diagnostics still work.
   - Safe-fail: a wrong answer is amber, offers a hint, creates one notebook entry and does not deduct a score.
   - Map: sections with no evidence show `—` and a neutral class, never a red `0%`.
   - Teach-back text and checkboxes survive reload; clearing the text deletes the entry.
   - Readiness: missing components show `—`; with coverage alone the value equals coverage; test scores only appear when a test recorded its section.
   - Week recap counts only the last seven days.
   - English mode has no Hungarian chrome, theory, examples, mistakes, exercises, hints, solutions, choices, formula names/notes, video titles/notes, hunts or toasts.
   - Chapter body switches: each chapter shows English theory, examples, mistakes and exercises; switching back restores Hungarian.
   - Generated banks show 50 English items per category and the same answers; daily quest, mixed run, chapter test and exam display English questions and hints.
   - Search returns English results for English queries and Hungarian results for Hungarian queries.
   - A numeric, expression, text and choice answer still check correctly after switching language.
4. Test mobile width (360 px) and print preview in both languages.
5. Check console for errors on every route.
6. Verify content accuracy against the source exam papers for at least 3 topics.

## 9. Scaling down: a small topic

The same architecture works for "JavaScript classes" in a weekend:

- 5–6 chapters, 1 section.
- 5 exercises per chapter.
- 4 practice categories × 50 generated items:
  - syntax, constructors, inheritance, private/static.
- One 10-question test.
- No exam simulator, no video page (or 3 links).
- Same checker, progress, search, formula sheet (syntax cheat sheet instead of formulas).
- Keep the daily quest and error notebook even at this size: five generated items per day and a one-tap review queue cost little and are the difference between a demo and a habit.

Keep the content schema and generator contract; delete unused pages from the nav.

## 10. Anti-patterns

- **Wall of formulas without motivation.** Lead with the problem the formula solves.
- **Exercises that cannot be checked.** If the answer is a proof, use self-assessment.
- **Generated questions with wrong answers.** Test every template once; prefer exact integers/fractions.
- **A "test" that is just the exercises repeated.** Change numbers and combine concepts.
- **Huge single HTML file.** Split content by section; keep the shell small.
- **CDN-only dependencies.** Vendor KaTeX; the site must work offline.
- **Fake official branding.** Use the institution's colours and a neutral text mark, not its logo.
- **No mobile handling.** The sidebar and math overflow are the usual breakages.
- **Progress that lives only in memory.** Persist to localStorage.
- **A streak with no recovery.** One missed day must not erase months; ship a weekly freeze and show when it is consumed.
- **A streak as the only progress metric.** Count mastery, confusions fixed and exam readiness too; make the streak optional/hideable in calm mode.
- **Readiness that counts missing data as zero.** Renormalise over present components and show `—`; a new learner should not start at 0%.
- **A map of red 0% nodes with no evidence.** Use a neutral `new` state and `—`; never make an untouched section look failed.
- **A diagnostic that behaves like a graded exam.** It is a five-question routing decision; no grade, no shame, allow a retest.
- **Red X feedback on a missed exercise.** Use amber “not yet”, a hint ladder and the notebook; preserve the learner’s willingness to try.
- **A daily quest the learner can topic-pick.** Interleaving is the feature; hide the category until the answer is checked.
- **Tracking logic spread across the renderer.** Put the data on the node and use one answer hook (§6.10), or every new view silently loses progress.
- **Error hunts with a trivial or negative false statement.** The distractor must be a real misconception the learner is likely to hold.
- **Teach-back that is graded.** It is a self-diagnostic; grading it turns reflection into performance.
- **An English overview instead of a translation.** “The theory below is in Hungarian” is a defect, not a feature.
- **A language toggle that only swaps chrome.** If chapter bodies, exercises, generated banks or hunts stay Hungarian, the site is not bilingual.
- **Silent fallback to the source language.** Missing translations must fail validation; a learner must never hit an untranslated string.
- **One translator editing a shared file.** Partition by file and give each file exactly one owner, or translations overwrite each other.

## 11. Kickoff prompt template

Copy this when starting a new site:

```
Build a self-contained, book-style learning website for <TOPIC>.

SOURCE: <FOLDER with PDFs/slides/exams | none — research authoritative sources first>.
Audience: <WHO>, level: <LEVEL>, language: <LANG>.
Prior knowledge to assume: <e.g. Hungarian középszintű érettségi, but forgotten>.
Mode: <preparation/basics | full course>. Core parts: <N>; optional parts: <M>.
Scope: <N> parts, <M> chapters. Use the source exam papers (or official syllabus/exams found by research) to set the real difficulty.
Order: basics first; each part must state its prerequisites and build on them.

Design: <INSTITUTION> palette (<HEX>), light book theme, serif body, sans headings,
left table-of-contents sidebar, chapter opener with number, callouts for Why/When/Definition/Trap.

Architecture: static HTML/CSS/vanilla JS, hash router, content as JS data, vendored KaTeX,
localStorage progress, no build step.

Bilingual: full EN/HU parity for every user-visible string — UI, section/chapter metadata, theory,
examples, mistakes, exercises (question/hint/solution/choices), generated bank templates, error
hunts, teach-back, formula names/notes, video titles/channels/notes, search, toasts and empty
states. No “content remains Hungarian” notice and no silent fallback. Math and answer values stay
language-independent; text answers get accepted variants in both languages.

Each chapter: lead, why, when, 6–8 theory blocks, 2–3 worked examples,
3–4 typical mistakes, 6–8 checkable exercises (number/expr/text/choice/proof), one video.

Practice: 50 generated exercises per category (10 easy / 10 medium / 30 hard,
show 1:1:3 and 10/10/30), deterministic PRNG, reroll all and reroll one.

Tests: 8-question/10-minute chapter test; timed ZH/vizsga simulators with grade thresholds.

Retention: date-seeded daily quest (5 items, levels 1/1/2/2/3, topic hidden until answered),
solve-streak with one weekly freeze, Leitner error notebook (1/3/7/21 days, mastered at box 4),
interleaved 10-item mixed run, three-statement error hunts with exactly one false statement,
per-chapter teach-back box with autosave, and per-section exam readiness
(45% coverage + 30% accuracy + 15% review health + 30% best test, renormalised).

Also build: searchable formula sheet, video library, resources page, progress dashboard.

Verify every route in a browser; `node --check` all JS; test one correct and one wrong answer per type.
```

## 12. File ownership and parallelism

When delegating content to multiple agents:
- Give each agent **exclusive files** and exact section/chapter IDs.
- Provide the schema by pointing at one finished reference file.
- Require `node --check` and forbid edits outside their files.
- Keep formula references (`[sectionId, chapterId]`) in a separate file and assign it to one owner.
- Integrate, then verify routes and math once, centrally.

## 13. Portable agent contract

This skill is deliberately **tool-agnostic**. Any agent that can read files, write files, run a shell command, and optionally drive a browser can execute it. Do not assume a particular LLM vendor, IDE, plugin, or orchestration framework.

### Inputs

| Input | Required | Default |
|---|---|---|
| `source_dir` (course PDFs/slides/exams) | yes | — |
| `topic` and scope | yes | — |
| `audience` + level | yes | first-year BSc |
| `language` | yes | source language |
| `output_dir` | yes | `./site` |
| institution palette / fonts | no | neutral book palette |
| exam format and timing | no | infer from papers |

### Outputs (must exist)

```
output_dir/
  index.html                 # opens by double click; no build
  README.md                  # 3-step open instructions
  start.bat / start.command / start.sh
  assets/css/app.css
  assets/js/util.js
  assets/js/app.js
  assets/js/features.js      # practice / chapter test / exam runners
  assets/js/fun.js           # daily quest, notebook, mixed run, hunts, teach-back, readiness
  assets/js/generators.js    # deterministic 50-item banks
  assets/js/demos.js
  content/_helpers.js
  content/01-*.js ... NN-*.js   # source-language content
  content/_en/01-*.js ... NN-*.js  # full English overlays (or parallel fields in source files)
  content/_formulas.js
  content/_videos.js
  vendor/katex/              # local, no CDN
  resources/                 # source PDFs / exam papers
```

### Execution loop

1. **Inventory** — list files, extract text, read the latest exam papers.
2. **Scope** — write `Part → Chapter → Prerequisites → Exam tag`; 20–35 chapters for a semester, 3–8 for a single topic.
3. **Shell** — `index.html`, CSS design system, hash router, KaTeX, storage, search.
4. **Content** — one JS file per part; each chapter follows the schema in §5, in both languages.
5. **Practice** — at least one generator category per part; 50 items (10/10/30) and reroll, with every template bilingual.
6. **Tests** — chapter test + timed exam simulator with grade thresholds, fully localized.
7. **Retention** — daily quest, Leitner notebook, mixed run, error hunts, teach-back, readiness dashboard; wire the answer hook from §6.10.
8. **Verify** — see §8 and §17 gates; scan every route in both languages.
9. **Package** — README, launchers, ZIP; test the ZIP in a fresh folder.

### Tool fallbacks

- **No browser tool**: run `node --check` on every JS file; use `node` with a mocked `MB` to count chapters/exercises and render every math segment with the vendored KaTeX (`throwOnError: true`). State that visual verification was not performed.
- **No shell**: perform the same steps with file read/write tools; use `start.bat`/`index.html` for the user.
- **No image/PDF OCR**: rely on extracted text, prefer official exam papers, and mark uncertain content as `[INFERENCE]`.
- **No internet**: do not embed remote dependencies; use search-only video placeholders; the site must still work offline except for videos.
- **No Python**: the site works from `file://`; keep the launchers optional.

### Quality gates (all must pass)

1. `node --check` on every content and feature JS file.
2. Every section and chapter route renders with text length > 300 characters.
3. Zero `.katex-error` elements and zero raw `$$` on every chapter route.
4. One correct and one wrong answer accepted/rejected for each answer type.
5. Practice bank shows exactly 50 items, filters by difficulty, and rerolls.
6. Chapter test and exam simulator start, navigate, submit, and show a score.
7. Search returns at least one result for a known term.
8. Progress persists after reload.
9. Mobile width (360 px) and print preview do not overflow.
10. Daily quest is date-stable, completes at 5/5, and advances the streak once per day.
11. Streak freeze is consumed at most once per ISO week; a longer gap resets cleanly.
12. Notebook promotes 1/3/7/21 and retires mastered items; a later miss resets to box 0.
13. Readiness renormalises over present components and shows `—` with no data.
14. Every error hunt has exactly one false statement and validates it by construction.
15. `index.html` opens directly from `file://` without console errors.
16. The bilingual coverage validator passes: every chapter overlay key exists, all arrays match length/order, formula/video counts match, every generator template has English fields, and no Hungarian prose leaks into English fields.

### Non-negotiables

- No build step, no npm install for the learner, no CDN at runtime.
- No fabricated citations or video IDs; search links are safer than guessed embeds.
- No official logo misuse; colours + neutral text mark.
- No content copied wholesale from copyrighted books; summarize and link.
- No hidden telemetry, accounts, or network calls beyond optional video embeds.
- No dark-pattern engagement: no loss-framed streak pressure, no punitive reset for one missed day, no fabricated social proof.


## 14. Preparation-first scoping (basics, not the whole course)

When the user says **prepare**, **basics**, **make the first weeks easier**, or **I forgot everything**, do not build a full-semester course. Build a preparation book.

### Scope contract

- **Core (5–8 parts):** the minimum needed to start the course confidently.
- **Optional (0–6 parts):** forward-looking material, clearly separated and marked `opcionális`.
- Write the contract at the top of the README and on the home page:
  - what this is,
  - what it is **not**,
  - what prior level is assumed,
  - how to skip ahead.
- Example for BME VIK first-semester mathematics:
  - Core: algebra/trig/functions → logic → complex numbers → sequences → limits/continuity → derivatives → integrals.
  - Optional: series, Taylor, multivariable, differential equations/Fourier, linear algebra, discrete mathematics.
- Do not hide the optional label in a footnote. Use a sidebar group label, a card badge, and a box on the section page.

### Assumed prior knowledge

State the assumption explicitly, e.g.:

> Feltételezem, hogy középszintű érettségi szinten tanultál matematikát, de sok mindent elfelejtettél.

Then make the first part a **revision**, not a from-zero course:

- Each chapter opens with a “Miért?” box that rebuilds the intuition.
- Add a “Ha ez ismerős, ugorj a feladatokra” escape hatch.
- Add a short diagnostic set (5–8 mixed exercises) at the start.
- Include the formulas that a középszintű student is expected to know, but re-derive the ones they usually forget.
- Never assume advanced notation without a one-line reminder.

### Preparation quality bar

- A learner who does only the core should be able to follow the first 3–4 weeks.
- Every core chapter must answer: “Where will I use this in the first month?”
- Optional parts must not be prerequisites for core parts.
- The home page should show a “core path” and a separate “after the core” path.

## 15. Prerequisite-first sequencing

A section is not a bag of topics. It is a **rung** on a ladder.

### Dependency graph

Define it explicitly in code:

```js
const PREREQ = {
  fundamentals: [],
  logic: ['fundamentals'],
  complex: ['fundamentals'],
  sequences: ['fundamentals', 'logic'],
  limits: ['sequences'],
  derivatives: ['limits'],
  integrals: ['derivatives'],
  series: ['sequences', 'integrals'],
  taylor: ['series', 'derivatives'],
  multivariable: ['derivatives', 'integrals'],
  'diff-eq': ['integrals', 'sequences'],
  linear: ['fundamentals'],
  discrete: ['logic']
};
```

Then derive `builds` (reverse edges) and render:

- a **learning path** on the home page,
- a **“Mielőtt elkezded”** box on every section page,
- an **“előfeltétel”** badge on every chapter,
- a “Kötelező mag” / “Előretekintés” split.

### Rules

1. **Basics first, always.** The first chapter of a section is the simplest, not the most general.
2. **No forward references without a link.** If a chapter must mention a later concept, add “ezt később, a X. részben” and link it.
3. **Within a chapter:** intuition → definition → theorem → worked example → exercise. Never start with a formal definition.
4. **Within exercises:** levels 1 → 2 → 3. The first three items must be solvable after reading the chapter.
5. **Within a section:** chapters build cumulatively; chapter 3 may use chapter 1, but not chapter 5.
6. **Across sections:** a section may use any earlier section, never a later one (except explicit optional previews).
7. **Tests:** weight basics more than edge cases. A test should diagnose the foundation, not only rank.
8. **Verify:** for every chapter, list the concepts it uses. If a concept is not in this or an earlier chapter, fix it or link it.

### Example: JavaScript classes

```
basics (values, functions) → objects → classes/constructors → methods/this
→ inheritance → private/static → composition → testing
```

Do not start with `#private` and `static` before the learner has written a constructor.

## 16. Research-first mode (no files supplied)

When the user gives **no files**, do not invent a curriculum. Research it.

### 1. Fix the brief

Ask or infer, then state:

- topic and exact scope,
- audience and level,
- language,
- prior knowledge,
- output directory,
- assessment goal (exam? interview? hobby?).

If the user does not answer, choose the conservative default and state it at the top of the README.

### 2. Find authoritative sources

Priority order:

1. **Official course page / syllabus / requirement document.**
2. **Official past exams and solutions** — these define the real level.
3. **Official lecture notes / textbook chapters.**
4. **Reputable university lecture videos.**
5. **Community notes** — useful, but verify against 1–3.

Research queries to try:

```
<course name> syllabus site:<university domain>
<course name> exam pdf
<course name> lecture notes pdf
<course name> "tematika" OR "követelmény" OR "tételsor"
<topic> past paper solutions
<topic> official documentation
```

Record for every source: title, author/institution, URL, access date, and which chapters it supports.

### 3. Build a source map

```md
| Source | Type | Trust | Used for |
|---|---|---|---|
| Official syllabus | primary | high | scope, order |
| 2025 exam + solutions | primary | high | difficulty, question types |
| Lecture notes ch. 1–4 | primary | high | theory |
| Video playlist | secondary | medium | intuition |
```

If sources conflict, prefer the official one and note the conflict.

### 4. Extract the assessment shape

From exams, record:

- question types (definition/proof, calculation, multiple choice),
- time limit and points,
- topic distribution,
- allowed aids,
- pass thresholds.

Build the exam simulator from this shape, not from guesswork.

### 5. Build without files

- Use the same content schema and site architecture.
- Mark every non-official claim as `[INFERENCE]` in the working notes, not necessarily in the learner-facing text.
- Do not fabricate citations, exam names, dates, video IDs, or official logos.
- If you cannot verify a video, use a YouTube **search link** instead of an embed.
- If the network is unavailable, build a generic curriculum from the topic name, state that it is generic, and ask for the official syllabus/exams.

### 6. Cite and package

- Put source links in `README.md` and a `resources/` page.
- Keep PDFs only when the user owns them or they are openly licensed.
- Add a one-line disclaimer: “This is a study aid, not the official course material.”

### 7. Research-first checklist

- [ ] Scope and assumptions written down.
- [ ] At least one official syllabus/course page found.
- [ ] At least one official exam or assessment description found (or explicitly marked missing).
- [ ] Every chapter maps to a source or is marked `[INFERENCE]`.
- [ ] No invented citations, dates, logos, or video IDs.
- [ ] Learner-facing README states what is official and what is inferred.

## 17. Fully bilingual by default (English + Hungarian)

Every generated site must ship with **complete English and Hungarian parity**. The language switch
is part of the product, not an afterthought. English mode must contain **no Hungarian user-visible
string**, and Hungarian mode must contain no English chrome.

### Coverage contract

Both languages must exist for every layer:

| Layer | What must be translated |
|---|---|
| UI chrome | Navigation, breadcrumbs, buttons, inputs, placeholders, tooltips, `aria-label`, toasts, empty states, errors, confirmations |
| Metadata | Section title/subtitle/intro; chapter title/lead/summary; exam tags; difficulty and status labels |
| Theory | `why` paragraphs, `when`, every definition/theorem/note/warning/formula title, list title and items |
| Examples | Title, problem, every numbered step, answer prose |
| Exercises | Question, hint, solution, choices (same order), text-answer variants |
| Generated banks | Category titles/descriptions and every template's question/hint/solution/choices |
| Retention | Daily quest, streak/freeze text, notebook/review states, mixed run, every error-hunt statement and explanation, teach-back prompt/model |
| Reference | Formula categories/names/notes; video categories/titles/channels/notes; resource metadata; archive labels |
| Search | Both language indexes, result kind labels, empty/no-result text |
| Document meta | `<title>`, descriptions, print headings, image alt text |

Not translated: LaTeX and variables, IDs, route segments, storage keys, URLs, file names, official
exam codes (`ZH1`, `ZH2`, `vizsga`), institution names and people's names.

### Content model

Choose one and apply it to *every* human-readable field.

**A. Parallel fields (best for new content)**

```js
{ title: { hu: 'Sorozatok', en: 'Sequences' },
  lead:  { hu: '...', en: '...' },
  why:   { hu: ['...'], en: ['...'] } }
```

Render with `field[MB.lang]` (or a `pick(field)` helper).

**B. Indexed overlay (best for an existing Hungarian corpus)**

Keep the Hungarian source untouched and add `content/_en/NN-*.js`. Each file assigns
`MB.enContent[sectionId + '/' + chapterId]` with arrays in the same order as the source:

```js
MB.enContent['sorozatok/sorozat-konvergencia'] = {
  title: '...', lead: '...', summary: '...',
  why: ['...', '...'], when: '...',
  theory: [{ title: '...', body: '...' }, { title: '...', note: '...' }],
  examples: [{ title: '...', problem: '...', steps: ['...'], answer: '...' }],
  mistakes: ['...'],
  exercises: [{ q: '...', hint: '...', sol: '...', choices: ['...'], altEn: ['...'] }],
  video: { title: '...', channel: '...', note: '...' }
};
```

Merge by index, preserving `t`, `latex`, `a`, `type`, `alt`, `level`, IDs and routes. An overlay is
acceptable **only** when validation proves every field is covered; a missing translation is a build
failure, not a runtime fallback.

### Translation rules

- **Math is language-independent.** Copy every `$...$`/`$$...$$` segment byte-for-byte; the only
  allowed change is translating words inside `\text{...}`.
- **Answers stay stable.** Numeric and symbolic answers are shared. Choice arrays keep the same
  order so the stored index remains valid. For text answers containing prose (`x<2 vagy x>3`), add
  English accepted variants (`x<2 or x>3`) through `altEn` or a shared `alt` list.
- **Translate the frame, not the identifiers.** IDs, keys, routes, state fields and CSS classes never
  change with language.
- **No apologies, no notices.** Do not ship “the detailed content is in Hungarian” boxes, English
  overview callouts or mixed-language warnings. Either the string is translated or it is a bug.
- **Use natural target-language prose.** Do not translate word-for-word; keep mathematical terminology
  consistent across chapters, hints, solutions and generated banks.
- **Official Hungarian exam terms may stay in parentheses** (`ZH`, `vizsga`, `középszintű érettségi`)
  when they name a real course artifact.

### Translation workflow

1. **Inventory** every user-visible string, including strings built dynamically and strings in
   generator templates, hunt data, toasts and empty states.
2. **Partition by file.** One translator or agent owns one source file at a time. Never let two
   workers edit the same file.
3. **Give a written contract**: exact keys, array lengths, forbidden fields, math preservation, answer
   stability, output format and a `node --check` gate.
4. **Translate in parallel**, then integrate centrally. Do not ask translators to edit renderers.
5. **Validate structurally and linguistically** before merging: key coverage, array lengths, LaTeX
   preservation, answer equality, no Hungarian prose in English fields.
6. **Render every route in both languages**; run the full exercise, bank, test, exam, retention and
   search flows once per language.

### Validation (automated minimum)

```js
// Structure
for (const s of MB.sections) for (const c of s.chapters) {
  const e = MB.enContent[c.sectionId + '/' + c.id];
  if (!e) fail('missing chapter overlay: ' + c.id);
  ['why','theory','examples','mistakes','exercises'].forEach(k => {
    if (c[k] && (!e[k] || e[k].length !== c[k].length)) fail('length mismatch: ' + c.id + ' ' + k);
  });
  c.exercises.forEach((q, i) => {
    if (q.a !== e.exercises[i].a && e.exercises[i].a !== undefined) fail('answer changed');
    if (q.type !== e.exercises[i].type && e.exercises[i].type !== undefined) fail('type changed');
  });
}
```

- **Hungarian detector**: flag English fields containing Hungarian function words
  (` a `, ` az `, ` és `, ` hogy `, ` nem `, ` van `, ` ez `, ` egy `, ` meg `, ` vagy `, ` minden `,
  ` létezik `) or the characters `ő`/`ű`. Allow proper names and quoted course terms.
- **LaTeX preservation**: extract every `$...$` segment from source and translation and compare
  counts per field; investigate every mismatch.
- **DOM scan**: load each route in English mode, walk visible text, and fail on Hungarian words
  outside the allowlist (exam names, people, institutions).
- **State stability**: switch languages on a chapter, practice bank, test, notebook entry and search
  result; progress, answers and route must survive.

### Bilingual quality gates (all must pass)

- [ ] Toggle visible, persisted; `<html lang>` changes; no page reload; progress preserved.
- [ ] Every static and dynamic UI string switches, including toasts and empty states.
- [ ] Section/chapter metadata, theory, examples, mistakes and exercises switch.
- [ ] Every generated bank item (50 per category, all levels), daily quest, mixed run, chapter test and exam is fully English.
- [ ] Every error hunt, teach-back prompt/model and readiness label switches.
- [ ] Formula categories/names/notes and video categories/titles/channels/notes switch.
- [ ] Both search indexes work; English queries find English content and show English kind labels.
- [ ] One numeric, one expression, one text and one choice answer check correctly in both languages.
- [ ] LaTeX renders identically in both languages; no raw `$$`.
- [ ] No mixed-language chrome on any route; no “content is Hungarian” notice remains.
- [ ] Mobile width and print preview verified in both languages.

## 18. Hosted creator output (routed, not downloaded)

When the skill runs inside a creator platform, the deliverable is not a repository the learner
downloads. The creator stores one JSON book per project and serves it at a route.

- **One JSON document per site.** Store `title`, bilingual `subtitle`/`summary`, and
  `sections[].chapters[]` with the same prose fields as §5. Prose is `{hu,en}`; LaTeX and answer
  values are shared. Keep the schema small enough for a model to emit reliably, then normalize and
  validate structurally on the server.
- **One static renderer.** A small `index.html` + `app.js` + `styles.css` reads `site.json`.
  Do not generate a separate app per site and do not run a container per site.
- **Match the reference shell.** The rendered site must use the same design tokens and layout as the
  example: navy/gold topbar, paper background, serif reading column, fixed contents sidebar, chapter
  opener, callouts and card rhythm. Do not ship a generic sans-serif template or a second visual
  language. Keep the renderer CSS and the example tokens in sync when either changes.
- **Routed, not downloadable.** Serve at `/s/<slug>/` and optionally at `<slug>.<SITE_DOMAIN>`.
  Never expose a ZIP, archive, attachment or download button. The learner opens the URL.
- **Auth and quota belong to the creator.** Only authenticated users may open the builder, the
  catalog or a generated site. One admin creates users; each user has a daily site limit.
- **Reuse before generation.** Search already-created books by title/topic/source text and offer
  open/clone. Only call the model after the user explicitly chooses a new site.
- **Uploads are context.** Extract text from PDFs/notes, append it to the skill prompt, and cap the
  combined source length. The skill still governs structure, prerequisites and exercise quality.
- **Generation is asynchronous.** Queue a job, show status/log, validate the JSON, write
  `site.json`, then flip the site to `ready`. Failures keep the previous site intact.
- **Least compute.** Prefer a single process, SQLite, static files and an external model API over
  per-site builds, containers or servers.
