import { Outlet } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import { Header } from './Header';

export function AppShell() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">{t('Skip to content')}</a>
      <Header />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        Bindery · {t('sites are routed, not downloaded.')}
      </footer>
    </div>
  );
}
