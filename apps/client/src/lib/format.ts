import type { Lang } from './types';

const locale = (lang: Lang) => (lang === 'hu' ? 'hu-HU' : 'en-GB');

export function formatDate(iso: string, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(locale(lang), {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatDateShort(iso: string, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(locale(lang), { dateStyle: 'medium' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatNumber(value: number, lang: Lang): string {
  try {
    return new Intl.NumberFormat(locale(lang)).format(value);
  } catch {
    return String(value);
  }
}

/** ETA display. Quantised to 30-second steps so it does not jitter every tick. */
export function formatDuration(seconds: number): string {
  const rounded = Math.max(30, Math.ceil(seconds / 30) * 30);
  if (rounded < 120) return `${rounded}s`;
  const minutes = Math.round(rounded / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}
