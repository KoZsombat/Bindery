import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* Minimal .env loader so `node src/server.js` works without a shell wrapper. */
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

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadDotEnv(path.join(ROOT, '.env'));

export const DEV = process.env.NODE_ENV !== 'production';
export const PORT = Number(process.env.PORT || 8080);
export const BASE_DOMAIN = process.env.BASE_DOMAIN || 'example.com';
export const SITE_DOMAIN = (process.env.SITE_DOMAIN || ('sites.' + BASE_DOMAIN)).toLowerCase();
export const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
export const DB_PATH = path.join(DATA_DIR, 'builder.db');
export const SITES_DIR = path.join(DATA_DIR, 'sites');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
export const TEMPLATE_DIR = path.join(ROOT, 'src', 'template');
export const SHARED_DIR = path.join(ROOT, 'shared');
export const VIEWS_DIR = path.join(ROOT, 'src', 'views');
export const PUBLIC_DIR = path.join(ROOT, 'public');
export const EXAMPLE_DIR = process.env.EXAMPLE_DIR || path.join(ROOT, 'examples', 'matekbazis');
export const SKILL_PATH = process.env.SKILL_PATH || path.join(ROOT, 'skills', 'learning-book-site', 'SKILL.md');
export const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || (DEV ? 'http://localhost:' + PORT : 'https://builder.' + BASE_DOMAIN);
export const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || process.env.ENCRYPTION_KEY || (DEV ? 'dev-secret-please-change-0123456789' : '');
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '';
export const DEFAULT_DAILY_LIMIT = Number(process.env.DEFAULT_DAILY_LIMIT || 3);
export const ADMIN_DAILY_LIMIT = Number(process.env.ADMIN_DAILY_LIMIT || 100);
export const MAX_CONCURRENT_JOBS = Math.max(1, Math.min(20, Number(process.env.MAX_CONCURRENT_JOBS || 3)));
export const MAX_UPLOAD = 8 * 1024 * 1024;
export const MAX_FILES = 6;
export const MAX_SOURCE = 80000;
export const LLM_MOCK = process.env.LLM_MOCK === '1';
export const DEV_MOCK = DEV && process.env.LLM_MOCK !== '0';
export const LLM_BASE_URL = (process.env.LLM_BASE_URL || process.env.COMMAND_CODE_BASE_URL || 'https://api.commandcode.ai/v1').replace(/\/+$/, '');
export const LLM_API_KEY = process.env.LLM_API_KEY || process.env.COMMAND_CODE_API_KEY || '';
export const LLM_MODEL = process.env.LLM_MODEL || process.env.COMMAND_CODE_MODEL || 'deepseek-v4.1';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || (DEV ? 'admin@example.com' : '');
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (DEV ? 'admin1234' : '');
export const DEV_LOGIN_HINT = DEV && !process.env.ADMIN_PASSWORD;

if (!BETTER_AUTH_SECRET) throw new Error('Set BETTER_AUTH_SECRET (or ENCRYPTION_KEY) in production.');
