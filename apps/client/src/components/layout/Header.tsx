import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';
import { GridIcon, LogOutIcon, MoonIcon, PlusIcon, SearchIcon, SettingsIcon, SunIcon, UsersIcon } from '../icons';
import { Logo } from './Logo';

const baseLink = 'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap';

export function Header() {
  const { me, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const items = [
    { to: '/app', label: t('Sites'), icon: GridIcon },
    { to: '/new', label: t('New site'), icon: PlusIcon },
    { to: '/catalog', label: t('Catalog'), icon: SearchIcon },
    { to: '/settings', label: t('Settings'), icon: SettingsIcon },
    ...(me?.admin ? [{ to: '/admin', label: t('Admin'), icon: UsersIcon }] : []),
  ];

  async function signOut() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Logo />

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(baseLink, isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={theme === 'dark' ? t('Light theme') : t('Dark theme')}
            title={theme === 'dark' ? t('Light theme') : t('Dark theme')}
          >
            {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
          <select
            value={lang}
            onChange={event => setLang(event.target.value === 'hu' ? 'hu' : 'en')}
            className="h-9 rounded-md border border-border bg-background px-2 font-mono text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t('Language')}
            title={t('Language')}
          >
            <option value="hu">HU</option>
            <option value="en">EN</option>
          </select>

          {me ? (
            <div className="ml-1 flex items-center gap-2 border-l border-border pl-2">
              <span className="hidden max-w-40 truncate text-xs text-muted-foreground sm:block" title={me.user.email}>
                {me.user.email}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={t('Sign out')}
                title={t('Sign out')}
              >
                <LogOutIcon className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="flex w-full gap-1 overflow-x-auto border-t border-border px-4 py-2 lg:hidden" aria-label="Main">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(baseLink, 'px-2 py-2 text-xs', isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-muted')
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
