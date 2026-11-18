export type Lang = 'hu' | 'en';

export type SiteStatus = 'queued' | 'running' | 'ready' | 'failed' | 'cancelled' | 'deleted';

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
  status: SiteStatus;
  published: boolean;
  example: boolean;
  createdAt: string;
  updatedAt: string;
  error: string;
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
