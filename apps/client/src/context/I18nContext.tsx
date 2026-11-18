import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../lib/types';
import { translate } from '../lib/i18n';

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);
const LANG_KEY = 'bindery.lang';
const LANG_CHOSEN_KEY = 'bindery.lang.chosen';

/**
 * English by default. A saved language only counts after the visitor picked one
 * explicitly, so values left behind by older automatic detection do not stick.
 */
function initialLang(): Lang {
  try {
    if (localStorage.getItem(LANG_CHOSEN_KEY) !== '1') return 'en';
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'hu' || saved === 'en') return saved;
  } catch {
    /* storage can be blocked */
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_KEY, next);
      localStorage.setItem(LANG_CHOSEN_KEY, '1');
    } catch {
      /* storage can be blocked */
    }
  }, []);
  const t = useCallback((key: string, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}
