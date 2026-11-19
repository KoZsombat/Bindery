import type { Site } from './types';

/**
 * Prefer the translated message for the server's error code. The server only
 * sends a friendly sentence, never the raw generation failure.
 */
export function siteErrorText(t: (key: string) => string, site: Pick<Site, 'error' | 'errorCode'>): string {
  if (!site.error) return '';
  if (site.errorCode) {
    const key = `generation.${site.errorCode}`;
    const translated = t(key);
    if (translated !== key) return translated;
  }
  return site.error;
}
