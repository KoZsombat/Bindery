export type Lang = 'hu' | 'en';

export type SiteStatus = 'queued' | 'running' | 'ready' | 'failed' | 'cancelled' | 'deleted';

export interface SiteOptions {
  purpose: 'exam' | 'course' | 'practice' | 'reference';
  level: 'undergrad' | 'beginner' | 'graduate' | 'professional';
  assessment: 'mixed' | 'mcq' | 'written' | 'none';
  balance: 'balanced' | 'theory' | 'practice';
  sources: 'only' | 'open';
  domain: 'math' | 'general' | 'programming';
  tone: 'textbook' | 'coach';
  examples: 'one' | 'two' | 'three';
  minutes: number;
  customInstructions: string;
}

/** Must match the server defaults: the current skill's behaviour. */
export const DEFAULT_SITE_OPTIONS: SiteOptions = {
  purpose: 'exam',
  level: 'undergrad',
  assessment: 'mixed',
  balance: 'balanced',
  sources: 'only',
  domain: 'math',
  tone: 'textbook',
  examples: 'one',
  minutes: 40,
  customInstructions: '',
};

export interface Site {
  id: number;
  slug: string;
  title: string;
  description: string;
  /** Book title and summary in both languages, when the book has them. */
  titleI18n?: { hu: string; en: string };
  descriptionI18n?: { hu: string; en: string };
  topic: string;
  audience: string;
  language: 'hu' | 'en' | 'both';
  options?: SiteOptions;
  status: SiteStatus;
  published: boolean;
  example: boolean;
  createdAt: string;
  updatedAt: string;
  error: string;
  /** Stable code for the failure; the UI translates it instead of showing server text. */
  errorCode?: string | null;
  url: string;
  archived: boolean;
  reusable: boolean;
  /** Admin-only: owner email on the all-sites list. */
  ownerEmail?: string;
}

export interface JobActivity {
  chars: number;
  elapsedMs: number;
  updatedAt: string;
}

export interface JobProgress {
  phase: string;
  done: number;
  total: number;
  chapter: string;
  activity?: JobActivity | null;
  /** Absolute ISO deadline; the UI counts down from it. */
  etaAt?: string | null;
}

export interface Job {
  status: string;
  kind?: 'generate' | 'chapter';
  chapterId?: string | null;
  log: string;
  attempts: number;
  lastError: string;
  progress: JobProgress | null;
  heartbeatAt: string;
  updatedAt: string;
}

export interface SharedBy {
  email: string;
  name: string;
  apiBase: string;
  apiModel: string;
}

export interface Profile {
  dailyLimit: number;
  usedToday: number;
  remaining: number;
  apiBase: string;
  apiModel: string;
  hasKey: boolean;
  keySource: 'own' | 'shared' | 'none';
  sharedBy: SharedBy | null;
  canGenerate: boolean;
}

export interface Me {
  user: { id: string; email: string; name: string; role: string };
  admin: boolean;
  mock: boolean;
  profile: Profile;
}

export interface UploadedFile {
  id: number;
  name: string;
  chars: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  dailyLimit: number;
  disabled: boolean;
  usedToday: number;
}

export interface AdminSettings {
  maxBookChapters: number;
  chapterBatchSize: number;
  chapterConcurrency: number;
  chapterWordMargin: number;
  budgetTolerance: number;
  huBudgetRatio: number;
  llmMaxTokens: number;
}

export interface AdminSettingLimit {
  min: number;
  max: number;
  default: number;
  step?: number;
}

export type AdminSettingLimits = Record<keyof AdminSettings, AdminSettingLimit>;

export interface AdminAccountRequest {
  id: number;
  name: string;
  about: string;
  contact: string;
  status: 'pending' | 'handled';
  createdAt: string;
  reviewedAt: string | null;
}
