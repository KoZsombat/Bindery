import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { authClient } from '../lib/auth-client';
import { Logo } from '../components/layout/Logo';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Form';
import { PageSpinner } from '../components/ui/Spinner';
import { MoonIcon, SunIcon } from '../components/icons';

function safeNext(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/app';
}

export function LoginPage() {
  const { me, loading: authLoading, refresh, error: authError } = useAuth();
  const { t, lang, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  if (authLoading) return <PageSpinner />;
  if (me) return <Navigate to={next} replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) {
        setError(result.error.message || t('Wrong email or password.'));
        return;
      }
      await refresh();
      navigate(next, { replace: true });
    } catch {
      setError(t('Wrong email or password.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col justify-center bg-background px-4 py-8 sm:px-6">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={theme === 'dark' ? t('Light theme') : t('Dark theme')}
        >
          {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={toggleLang}
          className="inline-flex h-9 items-center justify-center rounded-md border border-border px-2 font-mono text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t('Language')}
        >
          {lang === 'hu' ? 'EN' : 'HU'}
        </button>
      </div>

      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-2">
        <section className="space-y-6">
          <Logo to="/login" />
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">{t('Learning Book Builder')}</p>
            <h1 className="max-w-xl text-2xl font-semibold leading-tight tracking-tight text-foreground">
              {t('Turn notes into routed learning books.')}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {t('Upload PDFs and paste long text. The builder uses the learning-book-site skill, generates one bilingual book, and publishes it at a URL — no downloads.')}
            </p>
          </div>
          <ul className="grid max-w-xl gap-2 text-sm text-muted-foreground">
            {[
              t('Admin-managed users, no public sign-up'),
              t('Daily creation quota per user'),
              t('Bring your own model key'),
              t('Catalog-first reuse before generation'),
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-t-4 border-border border-t-accent bg-card p-6 shadow-lg sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">{t('Sign in')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('Use the account the administrator created for you.')}</p>

          {error ? <Alert tone="error" className="mt-4">{error}</Alert> : null}

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <Field label={t('Email')} htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Field label={t('Password')} htmlFor="password">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={event => setPassword(event.target.value)}
              />
            </Field>
            <Button type="submit" className="w-full" size="lg" loading={submitting}>
              {t('Sign in')}
            </Button>
          </form>

          <p className="mt-4 text-xs leading-5 text-muted-foreground">{t('No public sign-up. Ask the administrator for an account.')}</p>
          {import.meta.env.DEV ? (
            <p className="mt-2 font-mono text-xs text-accent">{t('Development login: admin@example.com / admin12345')}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
