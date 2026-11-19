import { useI18n } from '../../context/I18nContext';
import { Select } from '../ui/Form';

/** The single language selector used by the header and the sign-in page. */
export function LanguageSelect() {
  const { t, lang, setLang } = useI18n();
  return (
    <Select
      value={lang}
      onChange={event => setLang(event.target.value === 'hu' ? 'hu' : 'en')}
      className="font-mono text-xs font-semibold"
      aria-label={t('Language')}
      title={t('Language')}
    >
      <option value="hu">HU</option>
      <option value="en">EN</option>
    </Select>
  );
}
