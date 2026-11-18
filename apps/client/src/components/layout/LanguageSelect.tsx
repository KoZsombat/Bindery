import { useI18n } from '../../context/I18nContext';

/** The single language selector used by the header and the sign-in page. */
export function LanguageSelect() {
  const { t, lang, setLang } = useI18n();
  return (
    <select
      value={lang}
      onChange={event => setLang(event.target.value === 'hu' ? 'hu' : 'en')}
      className="select-chevron h-9 rounded-md border border-border bg-background px-2 font-mono text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={t('Language')}
      title={t('Language')}
    >
      <option value="hu">HU</option>
      <option value="en">EN</option>
    </select>
  );
}
