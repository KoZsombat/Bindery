import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIMITS } from './limits.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/** apps/server */
export const APP_ROOT = path.resolve(HERE, '..');
/** repository root (workspace root) */
export const REPO_ROOT = path.resolve(APP_ROOT, '..', '..');

/* Minimal .env loader so `node apps/server/src/index.js` works without a shell wrapper. */
function loadDotEnv(file) {
  try {
    fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      if (line.startsWith('export ')) line = line.slice(7);
      const i = line.indexOf('=');
      if (i < 1) return;
      const key = line.slice(0, i).trim();
      let value = line.slice(i + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      if (process.env[key] === undefined) process.env[key] = value;
    });
  } catch {}
}
loadDotEnv(path.join(REPO_ROOT, '.env'));

export const IS_PROD = process.env.NODE_ENV === 'production';
export const DEV = !IS_PROD;
export const PORT = Number(process.env.PORT || 8080);
export const BASE_DOMAIN = String(process.env.BASE_DOMAIN || 'example.com').trim();
export const SITE_DOMAIN = String(process.env.SITE_DOMAIN || ('sites.' + BASE_DOMAIN)).trim().toLowerCase();
export const DATA_DIR = process.env.DATA_DIR || path.join(REPO_ROOT, 'data');
export const DB_PATH = path.join(DATA_DIR, 'builder.db');
export const SITES_DIR = path.join(DATA_DIR, 'sites');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
export const TEMPLATE_DIR = path.join(APP_ROOT, 'src', 'template');
export const VIEWS_DIR = path.join(APP_ROOT, 'src', 'views');
/** Built React SPA. `npm run build` populates it; Vite proxies the API in development. */
export const STATIC_DIR = process.env.STATIC_DIR || path.join(REPO_ROOT, 'apps', 'client', 'dist');
export const SHARED_DIR = path.join(REPO_ROOT, 'shared');
export const EXAMPLE_DIR = process.env.EXAMPLE_DIR || path.join(REPO_ROOT, 'examples', 'matekbazis');
export const SKILL_PATH = process.env.SKILL_PATH || path.join(REPO_ROOT, 'skills', 'learning-book-site', 'SKILL.md');

const rawAuthUrl = String(process.env.BETTER_AUTH_URL || (DEV ? 'http://localhost:' + PORT : 'https://bindery.' + BASE_DOMAIN)).trim().replace(/\/+$/, '');
export const BETTER_AUTH_URL = DEV && !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(rawAuthUrl)
  ? `http://localhost:${PORT}`
  : rawAuthUrl;
const rawSecret = String(process.env.BETTER_AUTH_SECRET || process.env.ENCRYPTION_KEY || (DEV ? 'dev-secret-please-change-0123456789' : '')).trim();
if (!rawSecret) throw new Error('Set BETTER_AUTH_SECRET in production.');
if (IS_PROD && rawSecret.length < 32) throw new Error('BETTER_AUTH_SECRET must be at least 32 characters in production.');
export const BETTER_AUTH_SECRET = rawSecret;
export const ENCRYPTION_KEY = String(process.env.ENCRYPTION_KEY || rawSecret).trim();
if (IS_PROD && !process.env.ENCRYPTION_KEY) {
  console.warn('ENCRYPTION_KEY is not set; falling back to BETTER_AUTH_SECRET. Rotating either key makes saved API keys unreadable.');
}
export const COOKIE_DOMAIN = String(process.env.COOKIE_DOMAIN || '').trim();
export const COOKIE_SECURE = process.env.COOKIE_SECURE === '1' || BETTER_AUTH_URL.startsWith('https://');

/* Reverse proxy hops. Launchpad terminates TLS in Traefik/Cloudflare, so one hop is correct. */
const trustProxyRaw = String(process.env.TRUST_PROXY || '1').trim();
export const TRUST_PROXY = /^\d+$/.test(trustProxyRaw) ? Number(trustProxyRaw) : trustProxyRaw;

export const DEFAULT_DAILY_LIMIT = Math.max(0, Number(process.env.DEFAULT_DAILY_LIMIT || 3));
export const ADMIN_DAILY_LIMIT = Math.max(0, Number(process.env.ADMIN_DAILY_LIMIT || 100));
export const MAX_CONCURRENT_JOBS = Math.max(1, Math.min(20, Number(process.env.MAX_CONCURRENT_JOBS || 3)));
export const MAX_JOB_ATTEMPTS = Math.max(1, Math.min(6, Number(process.env.MAX_JOB_ATTEMPTS || 4)));
export const JOB_LEASE_MS = Math.max(60000, Number(process.env.JOB_LEASE_MS || 600000));
/** Upper bound on chapters in one book. The outline target is derived from topic count (limits.js). */
export const MAX_BOOK_CHAPTERS = Math.max(LIMITS.chapters.floor, Math.min(LIMITS.chapters.settingMax, Number(process.env.MAX_BOOK_CHAPTERS || LIMITS.chapters.defaultMax)));
/** Chapters written per model request. Default 1: one deep chapter per call. */
export const CHAPTER_BATCH_SIZE = Math.max(1, Math.min(4, Number(process.env.CHAPTER_BATCH_SIZE || 1)));
/** Chapter calls in flight inside one book. Provider latency dominates generation
 *  time; more concurrency trades tokens/s for a higher chance of 429s. */
export const CHAPTER_CONCURRENCY = Math.max(1, Math.min(8, Number(process.env.CHAPTER_CONCURRENCY || 4)));
/** Ask for this multiple of the minimum word budget so small model undershoots
 *  do not fail validation. 1.15 = 15% headroom. */
export const CHAPTER_WORD_MARGIN = Math.max(1, Math.min(1.5, Number(process.env.CHAPTER_WORD_MARGIN || 1.15)));
/** Longest wait (ms) between a 429/5xx retry. Retry-After wins when larger. */
export const LLM_RETRY_BACKOFF_MAX_MS = Math.max(1000, Number(process.env.LLM_RETRY_BACKOFF_MAX_MS || 30000));
/** Accepted shortfall from the nominal word budget: EN floor. */
export const BUDGET_TOLERANCE = Math.max(0.5, Math.min(1, Number(process.env.CHAPTER_BUDGET_TOLERANCE || 0.9)));
/** Hungarian floor as a share of the nominal budget (fewer words, same content). */
export const HU_BUDGET_RATIO = Math.max(0.5, Math.min(1, Number(process.env.CHAPTER_HU_BUDGET_RATIO || 0.8)));
export const MAX_UPLOAD = 8 * 1024 * 1024;
export const MAX_FILES = 6;
export const MAX_CONCURRENT_UPLOADS = Math.max(1, Math.min(20, Number(process.env.MAX_CONCURRENT_UPLOADS || 4)));
export const SESSION_CACHE_MS = Math.max(0, Number(process.env.SESSION_CACHE_MS || 15000));
export const MAX_SOURCE = LIMITS.source.totalChars;
export const MAX_LONG_TEXT = LIMITS.source.longTextChars;
export const LLM_MOCK = process.env.LLM_MOCK === '1';
export const LLM_BASE_URL = String(process.env.LLM_BASE_URL || process.env.COMMAND_CODE_BASE_URL || 'https://api.commandcode.ai/provider/v1').trim().replace(/\/+$/, '');
export const LLM_MODEL = String(process.env.LLM_MODEL || process.env.COMMAND_CODE_MODEL || 'deepseek/deepseek-v4.1-flash').trim();
/** Output cap per chapter pass. Lower it when a provider rejects large max_tokens. */
export const LLM_MAX_TOKENS = Math.max(2048, Number(process.env.LLM_MAX_TOKENS) || LIMITS.model.chapterTokens);
/** One model request, milliseconds. */
export const LLM_TIMEOUT_MS = Math.max(30000, Number(process.env.LLM_TIMEOUT_MS) || LIMITS.model.timeoutMs);
/** Allow http and private/loopback provider endpoints (local Ollama, vLLM). */
export const LLM_ALLOW_PRIVATE_HOSTS = process.env.LLM_ALLOW_PRIVATE_HOSTS === '1';
export const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || (DEV ? 'admin@example.com' : '')).trim();
export const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || (DEV ? 'admin12345' : '')).trim();
if (IS_PROD && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ADMIN_EMAIL)) {
  throw new Error('ADMIN_EMAIL must be a valid email address.');
}
if (IS_PROD && ADMIN_PASSWORD.length < 10) {
  throw new Error('ADMIN_PASSWORD must be at least 10 characters in production.');
}
export const DEV_LOGIN_HINT = DEV && !process.env.ADMIN_PASSWORD;
