/**
 * Every generation limit in one place.
 *
 * Values here are *behaviour*, not taste. They are imported by the config,
 * the pipeline, the depth validator and the builder API so the UI can show the
 * real numbers before a job starts. Environment variables only seed the few
 * runtime-tunable values in config.js (`MAX_BOOK_CHAPTERS`, `CHAPTER_BATCH_SIZE`,
 * `LLM_MAX_TOKENS`, `LLM_TIMEOUT_MS`).
 *
 * Units are named in each comment. Nothing in this file may be "silently"
 * truncated at a call site: if a source or a chapter exceeds a budget, the
 * pipeline chunks, splits or fails with a message.
 */

/** Schema written by new generations. Version 1 books keep loading (see migrate.js). */
export const SCHEMA_VERSION = 2;

export const LIMITS = {
  chapters: {
    /** Absolute floor for any generated book. */
    floor: 6,
    /** Chapters per counted source topic ("headings, numbered lines, list items"). */
    perTopic: 1.5,
    /** Never plan more than this, whatever the source says. */
    cap: 120,
    /** Default admin setting / hard cap used for validation. */
    defaultMax: 90,
    settingMax: 180,
    /** Chapters allowed in one section before the outline is considered top-heavy. */
    perSection: 30
  },

  source: {
    /** Combined topic + pasted text + uploads, in characters. Stored whole. */
    totalChars: 400_000,
    /** Pasted `longText` field, characters. */
    longTextChars: 200_000,
    /** Extracted text kept per uploaded file, characters. */
    extractedChars: 400_000,
    /** Target size of one source chunk, characters. */
    chunkChars: 12_000,
    /** Source characters attached to one chapter pass (the most relevant chunks). */
    chapterBudgetChars: 24_000,
    /** Heading/scope digest attached to the outline pass, characters. */
    outlineDigestChars: 30_000,
    /** How many chunks are inspected when scoring relevance for a chapter. */
    scoreChunks: 400
  },

  model: {
    /** Output tokens for one chapter (also used as the admin default). */
    chapterTokens: 32_000,
    /** Output tokens for the outline pass. */
    outlineTokens: 12_000,
    /** One HTTP call, milliseconds. A deep bilingual chapter can legitimately take minutes. */
    timeoutMs: 900_000,
    /** Abort a streamed reply when no chunk arrives for this long (milliseconds). */
    idleTimeoutMs: 120_000,
    /** Attempts per chapter before the validation pass takes over. */
    chapterRetries: 2,
    /** Extra regeneration rounds driven by the validation pass. */
    validationRetries: 1,
    /** Attempts for the outline pass. */
    outlineAttempts: 2,
    /** Rough per-pass time used only for the very first ETA before one completes. */
    chapterEstimateMs: 150_000,
    /** Skill text characters per prompt. Depth rules are appended separately. */
    promptSkillChars: 140_000
  },

  depth: {
    /** Minimum explanation words per chapter, in each language. */
    minChapterWords: 700,
    /** Additional explanation words required per new term defined in the chapter. */
    wordsPerNewTerm: 250,
    /** "One new idea at a time": new terms declared by one content block. */
    maxNewTermsPerBlock: 3,
    /** Reading + practice target for one chapter, minutes. */
    minMinutes: 20,
    maxMinutes: 60,
    /** Check-yourself questions per chapter (block-level checks are 1–2 each). */
    minChecks: 2,
    /** Recap bullets. */
    minRecapPoints: 3,
    maxRecapPoints: 5
  },

  json: {
    /** Refuse to write a site.json larger than this (bytes). */
    siteBytes: 96 * 1024 * 1024
  },

  quota: {
    /**
     * One unit = one book generation run (one job). Outline, chapter, glossary
     * and validation passes are free, so a 90-chapter book costs one unit.
     * Regenerating an existing site is one new unit.
     */
    unit: 'book generation'
  }
};

/**
 * Count source topics conservatively. A "topic" is a heading, a numbered line,
 * or a list item long enough to name a concept. This only seeds the outline
 * target; the model sees the real source and may merge true duplicates.
 */
export function countTopics(text) {
  const lines = String(text || '').split(/\r?\n/);
  let n = 0;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.length < 4 || line.length > 160) continue;
    if (/^#{1,6}\s+\S/.test(line)) { n++; continue; }
    if (/^(\d{1,2}(\.\d{1,2}){0,2}[.)]|[IVXLC]{1,5}[.)])\s+\S/.test(line)) { n++; continue; }
    if (/^[-*•]\s+\S/.test(line) && line.split(/\s+/).length >= 3) { n++; continue; }
    if (/^[A-ZÁÉÍÓÖŐÚÜŰ][^.!?]{4,80}$/.test(line) && line.split(/\s+/).length <= 10) { n++; continue; }
  }
  return n;
}

/** Topic-dependent chapter target: more topics → more chapters, never thinner chapters. */
export function targetChapterCount({ topic = '', description = '', sourceText = '', requested = 0 } = {}, maxChapters = LIMITS.chapters.defaultMax) {
  const haystack = [topic, description, sourceText].filter(Boolean).join('\n');
  const topics = countTopics(haystack);
  const derived = topics > 0
    ? Math.ceil(topics * LIMITS.chapters.perTopic)
    : Math.max(LIMITS.chapters.floor, 12);
  const wanted = Number(requested) || derived;
  return Math.max(LIMITS.chapters.floor, Math.min(wanted, maxChapters, LIMITS.chapters.cap));
}

/** Minimum explanation words for a chapter that defines `termCount` new terms. */
export function chapterWordBudget(termCount = 0) {
  return LIMITS.depth.minChapterWords + LIMITS.depth.wordsPerNewTerm * Math.max(0, termCount);
}

/** Human-readable limit summary for the builder UI and job logs. */
export function limitsSummary(maxChapters = LIMITS.chapters.defaultMax) {
  const max = Math.max(LIMITS.chapters.floor, Math.min(maxChapters, LIMITS.chapters.cap));
  const minWords = chapterWordBudget(0);
  return {
    schemaVersion: SCHEMA_VERSION,
    chapters: { min: LIMITS.chapters.floor, max },
    wordsPerChapter: { min: minWords, perNewTerm: LIMITS.depth.wordsPerNewTerm },
    tokensPerChapter: LIMITS.model.chapterTokens,
    timeoutMs: LIMITS.model.timeoutMs,
    sourceChars: LIMITS.source.totalChars,
    longTextChars: LIMITS.source.longTextChars,
    siteBytes: LIMITS.json.siteBytes,
    quotaUnit: LIMITS.quota.unit
  };
}

/**
 * Time estimate for a whole book run, from now until the site is finished.
 * Covers the outline, every chapter, one expected validation/repair pass and
 * all parts of a split source.
 *
 * `perChapterWallMs` / `perChapterWallMaxMs` are optional calibration from
 * completed jobs in this deployment; they already include checks and run in
 * the deployment's concurrency.
 */
export function estimateGeneration({
  chapters, books = 1, bookWaves = null, concurrency = 1, options = {},
  perChapterWallMs = null, perChapterWallMaxMs = null,
} = {}) {
  const factor = optionTimeFactor(options);
  const workers = Math.max(1, Number(concurrency) || 1);
  // Chapter estimate is one pass; write + one repair pass is the normal cost.
  const theoretical = (LIMITS.model.chapterEstimateMs * 1.5) / workers;
  const clamp = ms => Math.max(20_000, Math.min(15 * 60_000, ms));
  const basePerChapter = clamp(perChapterWallMs || theoretical) * factor;
  const highPerChapter = clamp(perChapterWallMaxMs || (perChapterWallMs ? perChapterWallMs * 1.6 : theoretical * 2.2)) * factor;
  const outlineMs = 120_000;
  const assemblyMs = 15_000;
  const perBook = outlineMs + Math.max(1, chapters) * basePerChapter + assemblyMs;
  const perBookHigh = outlineMs + Math.max(1, chapters) * highPerChapter + assemblyMs;
  // Parts are separate jobs; workers take them in waves.
  const waves = Math.max(1, Number(bookWaves) || Math.ceil(Math.max(1, books) / workers));
  const minMs = perBook * waves;
  // +15% slack for provider variance and one extra repair on the high side.
  const maxMs = perBookHigh * waves * 1.15;
  return {
    totalMs: Math.round((minMs + maxMs) / 2),
    minMs: Math.round(minMs),
    maxMs: Math.round(maxMs),
    perChapterMs: Math.round(basePerChapter),
    calibrated: !!perChapterWallMs,
    includesChecks: true,
    waves,
  };
}

/** Relative output volume per option choice; 1 = the current skill. */
function optionTimeFactor(options = {}) {
  const f = {
    purpose: { exam: 1, course: 1, practice: 1.08, reference: 0.97 },
    level: { undergrad: 1, beginner: 1.06, graduate: 0.96, professional: 0.93 },
    assessment: { mixed: 1, mcq: 0.96, written: 1.06, none: 0.95 },
    balance: { balanced: 1, theory: 1.05, practice: 1.1 },
    examples: { one: 1, two: 1.18, three: 1.35 },
  };
  return Object.entries(f).reduce((acc, [key, table]) => acc * (table[options[key]] || 1), 1);
}
