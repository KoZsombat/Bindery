# Verification — depth contract, limits and habit layer

Date: 2026-11-18. Runs on macOS arm64, Node 24, headless WebKit for the browser walk-through.
The model was mocked (`LLM_MOCK=1` / a scripted `call`): every pipeline, schema, depth and renderer
path is real; the prose is synthetic.

## 1. Limits before/after

Full table with file/line and rationale: [`docs/LIMITS_AUDIT.md`](LIMITS_AUDIT.md). Summary:

| Limit | Before | After |
|---|---|---|
| Max chapters per book | 30 (hard 60) | 90 default, hard 180, target derived from source topics (`ceil(topics × 1.5)`, floor 6) |
| Chapters per model call | 2 | 1 (per-chapter pass) |
| Output tokens | 32 000 per whole book | 32 000 per chapter pass, 2 048–200 000 configurable |
| Request timeout | 300 000 ms hard-coded | 900 000 ms per call, `LLM_TIMEOUT_MS` |
| Pasted source | 40 000 chars | 200 000 chars |
| Combined source | 80 000, silently truncated | 400 000, stored whole, chunked per chapter |
| Per-file extracted text | 150 000 | 400 000 |
| JSON size | unbounded | 96 MiB `site.json` cap, per-chapter validation |
| Quota | jobs, UTC day | book generations, server-local day |
| Chapter depth | none | ≥ 700 + 250 × new-term words, per language; ≤ 3 new terms/block |

## 2. Generated test books

Scripted model, `maxChapters` 6 and 36. Both were produced by the real pipeline (outline → term
registry → one chapter per pass → glossary → depth validation → schema validation).

| Book | Chapters | Sections | Terms | Min words/ chapter | Max budget | Schema | Depth | Size |
|---|---|---|---|---|---|---|---|---|
| Small probe (sets, logic, functions) | 6 | 1 | 18 | 1 893 | 1 450 | pass | pass | 192 KB |
| Large probe (36 topic headings) | 36 | 6 | 108 | 1 893 | 1 450 | pass | pass | 1 159 KB |

`node apps/server/scripts/verify-depth.mjs /tmp/bindery-small.json` → exit 0, all six chapters at
1 893–2 055 words against a 1 450 budget. `--quiet` on the 36-chapter book → exit 0.

No chapter was below budget in either book (`minWords ≥ minBudget`). No term was used before its
definitions chapter: the validator's `term.beforeDefined`, `glossary.missing`, `term.requires` and
`block.termCap` checks all passed. The built books carry a 100 % glossary coverage (18/18, 108/108).

## 3. Forced failure and resume

Scripted run on the 36-chapter book, failing the third chapter call:

```
forcedFailure: "Chapter 1.3 (chapter-3) failed: forced failure for resume test"
keptChaptersInDraft: 2
resumeOutlineCalls: 0          ← the resumed run reused the persisted outline
resumeChapterCalls: 34         ← only the missing chapters were written
resumedChapters: 36
firstDraftChapterStillPresent: true
```

Drafts are written after every chapter (`site_drafts`), reused by the worker, and cleared only after
`site.json` is written. A failed job keeps the previous `site.json` intact.

## 4. Automated gates run

| Check | Result |
|---|---|
| `npm test` (server) | 32/32 pass (includes 6 new depth tests) |
| `node --check` on server, template, example JS, new glossary content | pass |
| Client TypeScript + Vite build | pass |
| `examples/matekbazis/tools/validate-bilingual.js` | pass, 12 glossary entries, no missing overlay; 4 pre-existing math-count warnings |
| `apps/server/scripts/verify-depth.mjs` on both generated books | exit 0 |
| Schema v2 validation on both books | pass |

The new depth tests cover: budget failure, term used before definition, glossary gap, >3 terms in a
block, and a prerequisite pointing forward.

## 5. Browser walk-through (both books + example)

Authenticated at `/s/depth-small/`, `/s/depth-large/`, `/s/legacy-v1/` and `/example/matekbazis/`.

| Surface | Result |
|---|---|
| All hosted routes (`#/`, today, learn, map, daily, errors, mixed, hunt, progress, glossary, glossary/:id, formulas, videos, bank, exam, resources, chapter, search/:q) | render, ≥ 150 chars each, 0 KaTeX errors |
| Chapter depth render | refresher, plain/why/precise/analogy callouts, confusions, 5 check-yourself blocks, reasons under example steps, recap, term chips |
| Hidden answers | `details.open === false`, `.sc-a` `checkVisibility()` false until the summary is clicked |
| Tooltip | click `.term` → tooltip visible with plain-words definition and `#/glossary/<id>` link |
| Glossary / term index | 18 entries (small), 108 (large), 12 (example); in-page filter and search route return terms |
| Today's plan | 30/60/120 + 5-minute minimum; 4 separate steps; current step marked; labels re-render in the active language (HU→EN switch verified) |
| Active minutes | 0.25 min recorded after 15 s on a visible, recently interacted tab; persisted across reload; calendar grid 35 cells |
| Target ramp | 30 min suggested, select 30–120, neutral copy |
| `.ics` | download produced `BEGIN:VCALENDAR`, `RRULE:FREQ=DAILY`, `DTSTART:…T183000`, escaped summary |
| Stuck prompt | with a 16-minute-old exercise, prompt appears after the scan interval; dismiss/solution/similar controls present; hidden in calm mode |
| Miss reason | wrong answer → three tags; saved `section-1/chapter-1/0 = slip`; progress page shows "most common pattern: calculation slip (1/1)" |
| Calm mode | `body.calm-mode`, button state and persistence verified |
| English mode | chapter `Topic 1`, "In plain words", "Before you start", "Recap", "Today's plan", "Glossary and term index"; no Hungarian depth/habit chrome |
| 360 px (hosted + example) | `scrollWidth === innerWidth === 360`, no overflow; calendar and plan stack correctly |
| Old book (schema v1) | home + chapter render, 8 exercises, 0 KaTeX errors; glossary page shows the empty state (no terms in v1) |
| Console | 0 page errors; one 401 on `/api/me` observed from the builder SPA tab before authentication, not from generated pages |

## 6. Not verified (and why)

- **Real provider generations.** No API key was used; all generation was scripted/mock. Token and
  timeout behaviour against a real endpoint is therefore untested.
- **Mid-run progress at realistic speed.** The mock finishes a 36-chapter book in well under a
  second; the progress API was observed at `done: 9 / total: 36` during a failing run, but not as a
  slow, per-chapter stream.
- **Downloads in a real calendar app.** The `.ics` bytes were verified, not imported into
  Google/Apple Calendar.
- **Native mobile devices.** Only a 360 px WebKit viewport was checked, not iOS/Android hardware.
- **Quota exhaustion UX.** The API enforces `books used + parts > limit`; the 429 path was not
  triggered in the browser (limit 100).
- **Schema-v1 books with `maxChapters`/parts metadata.** v1 rendering was checked; no v1 book has
  the new optional fields, so only the absent-field path is exercised.

## 7. Changelog

- **Audit**: `docs/LIMITS_AUDIT.md` lists 37 limits with file/line, old value, old reason and new
  value/behaviour, plus the two codebases and the unchanged non-negotiables.
- **Skill**: new §5.1 depth contract (plain/why/precise/analogy/reasons/confusions/checks, ≤ 3 terms
  per block, word budget, reading level, depth anti-patterns, automated gates); chapter-count and
  per-chapter-count rules revised; new §6.12 habit layer; glossary/schema additions to the content
  model; depth/habit rows in the bilingual contract; updated verification checklist, kickoff prompt,
  quality gates and anti-patterns; hosted creator contract now multi-pass, resumable and limits-aware.
- **Schema/validation**: `SCHEMA_VERSION = 2`, normalizer accepts v1 (read-time `migrateSite`, no data
  rewrite), new `services/depth.js` validator (budgets, term ordering, glossary, block fields,
  examples/reasons, prerequisite direction), `validateSite` extended.
- **Pipeline**: outline + term registry, per-chapter passes with relevant source chunks, immediate
  depth validation with targeted repair, deterministic glossary pass, validation pass with retry
  cap, JSON size cap, draft persistence and resume, structured `jobs.progress`, resumable retries.
- **Limits**: one commented config (`apps/server/src/limits.js`), env/config wiring, quota in book
  generations on the local day, part splitting, `/api/limits`, builder limits card and warning.
- **Hosted renderer**: depth callouts, refresher/recap/checks, glossary + term index + tooltip,
  glossary-aware search, reasons under steps, today's plan, minute calendar/ramp, minimum day,
  `.ics`, stuck timer, miss tags, pace planner, welcome-back, buddy summary/export-import, calm mode,
  mobile styles.
- **Example**: same depth renderer and glossary (12 real terms), new habit module, nav/index/search
  integration, updated validator (ESM fix + glossary/depth checks), README updated.
- **Builder**: type-safe job progress with bar, active-limits card, chapter target and parts
  controls, 200 000-char source field, admin labels, i18n strings.
- **Tests/docs**: depth test suite, updated settings/generation/content tests, README, `.env`
  examples, `scripts/verify-depth.mjs`, this file.
