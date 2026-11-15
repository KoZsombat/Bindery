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
