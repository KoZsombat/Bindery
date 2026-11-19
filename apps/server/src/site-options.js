import { z } from 'zod';

/**
 * Per-book generation options.
 *
 * Every default reproduces the current skill: exam-focused, undergraduate
 * level, mixed exercises, balanced theory/practice, source-grounded, math
 * notation, textbook voice, one worked example, 40-minute chapters.
 * The options only steer scope and emphasis; the depth contract, the bilingual
 * rule and the schema stay mandatory.
 */
export const SiteOptionsSchema = z.object({
  purpose: z.enum(['exam', 'course', 'practice', 'reference']).default('exam'),
  level: z.enum(['undergrad', 'beginner', 'graduate', 'professional']).default('undergrad'),
  assessment: z.enum(['mixed', 'mcq', 'written', 'none']).default('mixed'),
  balance: z.enum(['balanced', 'theory', 'practice']).default('balanced'),
  sources: z.enum(['only', 'open']).default('only'),
  domain: z.enum(['math', 'general', 'programming']).default('math'),
  tone: z.enum(['textbook', 'coach']).default('textbook'),
  examples: z.enum(['one', 'two', 'three']).default('one'),
  minutes: z.coerce.number().int().min(10).max(120).default(40),
  /** Free-form user instructions; highest prompt priority within the hard rules. */
  customInstructions: z.string().max(4000).default(''),
});

export const DEFAULT_SITE_OPTIONS = SiteOptionsSchema.parse({});

/** Accepts a JSON string (DB column) or an already parsed object. */
export function parseSiteOptions(raw) {
  let value = raw;
  if (typeof raw === 'string') {
    try { value = raw ? JSON.parse(raw) : {}; } catch { value = {}; }
  }
  const parsed = SiteOptionsSchema.safeParse(value && typeof value === 'object' ? value : {});
  return parsed.success ? parsed.data : DEFAULT_SITE_OPTIONS;
}

const PURPOSE = {
  exam: 'This is exam preparation. Every chapter must earn its place through exam relevance; exercises should mirror the stated exam question types and difficulty. Add timed self-checks where the schema allows them.',
  course: 'This is a course companion. Follow the course structure, explain for durable understanding, and use teach-back style checks. Exam practice is secondary.',
  practice: 'This is a practice-first book. Keep the required theory complete but compact, and push exercise counts toward the maximum with varied, checkable tasks.',
  reference: 'This is a reference companion. Make the definition, conditions and formulas easy to find again; keep the required explanation, but lead each block with the precise statement and its use.',
};

const LEVEL = {
  undergrad: 'Assume a first-year undergraduate reading level. Prerequisites from earlier chapters are known; anything beyond that is defined on first use.',
  beginner: 'Assume no prior knowledge. Define prerequisites before use, spell out every condition, and keep the pace gentle without dropping rigour.',
  graduate: 'Assume a solid undergraduate background. Skip elementary derivations, keep definitions exact, and spend the space on structure, edge cases and connections.',
  professional: 'Assume domain experience. Prioritise decision rules, applications and failure modes; formal definitions still appear but tersely.',
};

const ASSESSMENT = {
  mixed: 'Mix exercise types: short numeric/expr answers, multiple choice, and at least one written or proof task per chapter.',
  mcq: 'All exercises must be multiple choice with plausible distractors and exactly one correct option (type "choice"). No free-text answers in the exercise list.',
  written: 'Favour worked/written answers (types "proof", "expr", "text"), with full solutions in "sol"; avoid multiple choice.',
  none: 'Use short checkable answers (types "number", "expr", "text") that verify understanding; no exam-style multiple choice.',
};

const BALANCE = {
  balanced: 'Keep theory and practice balanced: the required explanation depth, then 8-10 exercises.',
  theory: 'Weight toward explanation and worked examples; use the minimum credible exercise count (6-7) per chapter.',
  practice: 'Weight toward practice: keep the required explanation but use 10-12 exercises, mixing difficulty so easy items build confidence before hard ones.',
};

const SOURCES = {
  only: 'Use only the supplied source material. Do not invent citations, papers, videos or facts the source does not support; say so when the source is silent.',
  open: 'You may add standard textbook background to fill gaps, but keep it conventional and never fabricate citations, links or specific claims about the user\'s institution.',
};

const DOMAIN = {
  math: 'Mathematics and science notation: use LaTeX for every formula (KaTeX-compatible), keep units and conditions explicit, and prefer symbols over vague prose.',
  general: 'Do not assume mathematical notation. Define any symbol or formula before use and keep arguments in prose when a formula is not essential.',
  programming: 'Programming domain: use fenced code blocks with the correct language tag, prefer runnable examples, and include code-reading and debugging tasks among the exercises.',
};

const TONE = {
  textbook: 'Neutral textbook voice: precise, calm, no direct address or cheerleading.',
  coach: 'Coaching voice: address the reader directly, short sentences, anticipate the point where they get stuck and name it.',
};

const EXAMPLES = {
  one: 'Write exactly one fully worked example per chapter.',
  two: 'Write two fully worked examples per chapter: one standard, one where a common mistake would happen.',
  three: 'Write three fully worked examples per chapter, progressing from routine to exam-level difficulty.',
};

/** Compact block injected into both the outline and the chapter prompts. */
export function optionsPrompt(raw) {
  const o = parseSiteOptions(raw);
  const custom = String(o.customInstructions || '').trim();
  const lines = [
    'SITE OPTIONS (override any conflicting default in the skill; the depth contract, schema and bilingual rule still apply):',
    `- Purpose: ${PURPOSE[o.purpose]}`,
    `- Learner level: ${LEVEL[o.level]}`,
    `- Assessment style: ${ASSESSMENT[o.assessment]}`,
    `- Theory/practice balance: ${BALANCE[o.balance]}`,
    `- Sources: ${SOURCES[o.sources]}`,
    `- Domain: ${DOMAIN[o.domain]}`,
    `- Tone: ${TONE[o.tone]}`,
    `- Worked examples: ${EXAMPLES[o.examples]}`,
    `- Chapter size: set every chapter "minutes" field to ${o.minutes}.`,
  ];
  if (custom) {
    lines.push(
      '',
      'USER CUSTOM INSTRUCTIONS (highest priority; follow them even when they contradict the skill, as long as they do not break the JSON schema, the depth contract, or the bilingual completeness rule):',
      custom
    );
  }
  return lines.join('\n');
}
