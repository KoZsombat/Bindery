# Limits audit — Bindery + learning-book-site

Date: 2026-11-18. Scope: the whole repo. Two codebases produce learner-facing books and both are
affected by every limit:

| Codebase | What it is | Where |
|---|---|---|
| **Hosted renderer** | One EJS shell + `site.json` per book, served at `/s/<slug>/`. This is what the builder produces. | `apps/server/src/views/generated.ejs`, `apps/server/src/template/{app.js,styles.css}`, `apps/server/src/services/generation.js` |
| **Static example** | Self-contained, no-build reference implementation (`index.html` + JS content). Also the design/behaviour contract for the hosted shell. | `examples/matekbazis/**` |

Limits below are grouped by kind. "New" values live in **one place**:
`apps/server/src/limits.js` (documented constants) plus `apps/server/src/config.js` (env-seeded
defaults). The skill text (`skills/learning-book-site/SKILL.md`) carries the same numbers as prose;
`docs/LIMITS_AUDIT.md` is the human-readable diff.

## 1. Source / upload text

| # | Limit | Where | Why it existed | New value / behaviour |
|---|---|---|---|---|
| 1 | `MAX_LONG_TEXT = 40000` chars for pasted notes | `apps/server/src/config.js:79`, enforced `apps/server/src/routes/api.js:107` | One-call generation had to fit the whole source into one prompt | 200 000 chars. The source is now chunked and only relevant chunks go to each chapter pass. |
| 2 | `MAX_SOURCE = 80000` chars for the combined source | `config.js:78`, truncation at `routes/api.js:143` | Same single-call constraint | 400 000 chars, **no silent truncation**: the combined source is stored whole; chunk selection happens per chapter pass. |
| 3 | `MAX_EXTRACTED = 150000` chars per uploaded file | `apps/server/src/services/uploads.js:9,54` | Kept the uploads row and prompt small | 400 000 chars (matches `MAX_SOURCE`). PDF/text extraction is unchanged otherwise. |
| 4 | `MAX_UPLOAD = 8 MiB`, `MAX_FILES = 6` | `config.js:74-75`, enforced `routes/api.js:326` | Memory safety | Unchanged. These are transport limits, not content limits. |
| 5 | Skill text sliced to 60 000 chars per prompt | `services/generation.js:224,247` (`skill.slice(0, 60000)`) | Prompt size guard when the file was shorter | 140 000 chars (`LIMITS.model.promptSkillChars`). The depth contract is also injected as a dedicated prompt section, so it survives any future truncation. |
| 6 | Source material injected verbatim into the outline prompt | `generation.js:224` (`req.long_text`) | Same | Outline gets a heading/scope **digest** (≤ 30 000 chars); each chapter pass gets ≤ 24 000 chars of the most relevant chunks. |

## 2. Book structure

| # | Limit | Where | Why | New |
|---|---|---|---|---|
| 7 | Max chapters `30` (hard range 4–60) | `config.js:71`, `db/index.js:145` | Single outline + small context | **90 default, hard cap 180**, and the target is derived from topic count: `chapters = clamp(ceil(topics × 1.5), 8, 120)` (`limits.js`). One chapter = one idea cluster ≤ ~40 min. |
| 8 | Max sections 12 (`normalizeSite`), 8 (`normalizeOutline`) | `generation.js:36,196` | Tabbed navigation comfort | Implicit chapter cap only; sections scale with the outline (≤ 30 chapters per section). `normalizeSite` no longer slices to 12 sections. |
| 9 | Exercises per chapter sliced to 8 | `generation.js:85` | Prompt/output budget | 12; 6–10 required by the skill. |
| 10 | Theory blocks per chapter sliced to 12 | `generation.js:62` | Single-call output budget | 24. The block count is a *minimum* rule in the skill, not a cap on depth. |
| 11 | Worked examples sliced to 4 | `generation.js:73` | Same | 6. |
| 12 | Chapter `minutes` forced into 5–90 | `generation.js:58`, schema `min(5).max(90)` | Session framing | 20–60; reading+practices target ~40 min. |
| 13 | Fixed skill guidance "20–35 chapters", "2 why paragraphs", "6–8 theory blocks", "one 20–40 minute session per chapter" | `SKILL.md:58-60`, `SKILL.md §5`, kickoff template §11, §6.1 "6–8 per chapter" | Tuned for a one-semester book produced in one shot | Replaced by: chapter count follows topic count; per-chapter **minimums** (1–3 plain-words sentences, ≥ 2 `why` bullets, blocks added until every term and step is explained, ≥ N words of explanation per new concept); validation fails a chapter under budget. |
| 14 | Practice bank 50 items/category (10/10/30) | `SKILL.md §6.2`, `examples/.../generators.js` | Deterministic bank, unchanged | Unchanged. |
| 15 | Chapter test 8 questions / 10 min | `SKILL.md §6.3` | Unchanged | Unchanged. |

## 3. Model calls, tokens, timeouts

| # | Limit | Where | Why | New |
|---|---|---|---|---|
| 16 | Whole book in one model call | pre-`8d90943`; today outline + batches | Context/output ceiling | Already multi-pass; now **one chapter per call by default** (`CHAPTER_BATCH_SIZE=1`), plus explicit outline, glossary and validation passes. |
| 17 | `LLM_MAX_TOKENS = 32000` per call | `config.js:84`, `db/index.js:147` | Provider output cap | 32 000 default (raised again after a real 16-chapter run; the provider could not finish a bilingual chapter within 16k/4 min), applied **per chapter**; range 2 048–200 000. |
| 18 | HTTP timeout `300000 ms` hard-coded | `generation.js:153` (`AbortSignal.timeout`) | Prevent hung workers | `LIMITS.model.timeoutMs = 900000` per call (15 min), configurable via `LLM_TIMEOUT_MS`; the body read is raced against the timer, not only the headers. |
| 19 | Retry: 2 outline attempts, 2 batch attempts, then split batches | `generation.js:236,277` | Truncation recovery | Outline 2 attempts; each chapter pass 2 attempts (`LIMITS.model.chapterRetries`); validation pass re-generates **only failing chapters**, once, then fails the job. |
| 20 | Job attempts 2, lease 10 min | `config.js:68-69`, `db/index.js:84-88` | Crash recovery | Unchanged. A resumed job now reuses the persisted draft instead of restarting the book. |
| 21 | Job log is one string | `db/index.js:53` (`jobs.log`) | Simple status text | Kept for humans; add `jobs.progress` JSON (`{phase, done, total, chapter}`) for a real progress bar and per-chapter log lines. |
| 22 | No JSON size guard beyond SQLite/disk | `generation.js:419` (`writeFile`) | Nothing bounded deep books | `LIMITS.json.siteBytes = 96 MiB`; refuse and fail with a clear message instead of writing a truncated/huge file. |

## 4. Daily quota

| # | Limit | Where | Why | New |
|---|---|---|---|---|
| 23 | Quota counts **jobs started today** (`substr(created_at,1,10)` = UTC day) | `db/index.js:193-200` | One job per book, cheap to count | Still counts **book generations** (one job = one book run; chapter passes and repairs are free), but the day boundary is the **server's local day** and the unit is documented in the UI/README. Regeneration is one more book unit. |
| 24 | Default 3 books/day (admin 100) | `config.js:65-66`, `db/index.js:16` | Fair use | Unchanged numbers; semantics clarified: a deep 90-chapter book costs **1**, not 90 calls. |
| 25 | Client shows "sites left today" only | `apps/client/src/pages/DashboardPage.tsx:97-111`, `NewSitePage.tsx:54` | Simple | Still shown, plus a pre-generation limits card: chapter range for this source, ~words per chapter, per-chapter token budget, estimated time, and a warning when the request exceeds the caps. |

## 5. Depth / content-shape limits (the new contract)

| # | Old behaviour | Where | New |
|---|---|---|---|
| 26 | No minimum explanation length | — | `LIMITS.depth.minChapterWords = 700` and `wordsPerNewTerm = 250`: budget = `700 + 250 × (new terms in chapter)`. A chapter below budget **fails validation** and is regenerated. |
| 27 | No per-block term cap | — | At most **3 new terms per content block**; a block needing more is split. Enforced by the depth validator (`term ids declared per block`). |
| 28 | No term registry, no glossary, no prerequisite graph below section level | — | Book-level `glossary` (term, plain, precise, chapter link), per-chapter `terms[]`, per-term `requires[]`, `refresher[]`, `recap`, chapter `checks[]`, section `conceptMap`/`summary`. |
| 29 | Old books had no depth fields | `data/sites/*/site.json` (version 1) | Schema **version 2**. The normalizer fills missing fields with empty values and the renderer skips them, so version-1 books load and render exactly as before. No stored data is rewritten. |

## 6. Learner-side (habit) limits

| # | Limit | Where | New |
|---|---|---|---|
| 30 | Session lengths fixed at 5/10/20 min | `examples/.../sessions.js:212-215`, `SKILL.md §6.11` | Keep those four modes; add a **daily plan** of 30/60/120 minutes that chains separate steps (recall → learn → practice → redo). Learn and review still never mix inside one session. |
| 31 | Streak is the main daily metric | `examples/.../fun.js` | Add **active minutes** per day (visible-tab timer, idle pause), a ramp 30–45 → 60–120 min over 4–5 weeks as a suggestion, and a calendar grid. Missing the target is neutral. |
| 32 | Weekly commitment counts session days | `coach.js` | Unchanged, but the **5-minute minimum day** ("Bad day? 5 minutes counts.") is labelled and counts toward streak and weekly commitment. |
| 33 | No reminders | — | Local `.ics` export from the implementation-intention field. No server, no notifications. |
| 34 | Notebook entries have no reason | `fun.js:addMiss` | Optional tag: concept / calculation slip / misread question, with an aggregate pattern summary. |
| 35 | No pace view | — | Pace planner from exam date + remaining core chapters (local dates). |
| 36 | No return-after-gap handling | — | Welcome-back screen suggesting the 5-minute minimum; no guilt copy. |
| 37 | No social layer | — | Copy-paste weekly summary and local export/import progress code. No network, no accounts. |

## 7. What is deliberately *not* changed

- No build step for the learner, no CDN at runtime, no telemetry.
- KaTeX remains vendored in `shared/katex` and `examples/matekbazis/vendor/katex`.
- Math and answer values stay language-independent; IDs and routes stay stable.
- Upload transport limits and auth/quota ownership stay with the creator.
- Old books are never rewritten in place; only new generations use schema v2.
