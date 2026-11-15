import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SiteCard } from '../components/sites/SiteCard';
import { ArrowRightIcon, PlusIcon, SearchIcon } from '../components/icons';
import { Alert } from '../components/ui/Alert';
import { QuotaBar, SectionTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { PageSpinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useToast } from '../context/ToastContext';
import { api, errorKey } from '../lib/api';
import type { Site } from '../lib/types';

export function DashboardPage() {
  const { me, refresh } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const navigate = useNavigate();

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reusing, setReusing] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ sites: Site[] }>('/api/sites');
      setSites(data.sites);
      setError('');
    } catch (e) {
      setError(errorKey(e).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function reuse(site: Site) {
    setReusing(site.id);
    try {
      const data = await api.post<{ site: Site }>(`/api/sites/${site.id}/clone`);
      push('success', t('Reused in your workspace.'));
      await refresh();
      navigate(`/site/${data.site.id}`);
    } catch (e) {
      const err = errorKey(e);
      push('error', t(err.key, { message: err.message }));
    } finally {
      setReusing(null);
    }
  }

  if (!me) return null;

  const profile = me.profile;
  const remaining = Math.max(0, profile.dailyLimit - profile.usedToday);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-border bg-brand text-brand-foreground shadow-sm">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,1fr)]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted">{t('Your workspace')}</p>
            <h1 className="text-2xl font-semibold tracking-tight">{t('Learning sites')}</h1>
            <p className="max-w-xl text-sm leading-6 text-brand-muted">
              {t('Create a routed book from files and long text. Every site is served at its own URL — nothing to download.')}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="accent" onClick={() => navigate('/new')} icon={<PlusIcon className="h-4 w-4" />}>
                {t('Start a new book')}
              </Button>
              <Button
                variant="brand"
                onClick={() => navigate('/catalog')}
                icon={<SearchIcon className="h-4 w-4" />}
              >
                {t('Browse catalog')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 self-center">
            <div className="rounded-lg bg-brand-foreground/10 p-3">
              <div className="font-mono text-2xl font-semibold">{remaining}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-muted">{t('sites left today')}</div>
            </div>
            <div className="rounded-lg bg-brand-foreground/10 p-3">
              <div className="font-mono text-2xl font-semibold">{sites.length}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-muted">{t('sites in workspace')}</div>
            </div>
            <div className="col-span-2 rounded-lg bg-brand-foreground/10 p-3">
              <div className="font-mono text-2xl font-semibold">{profile.usedToday} / {profile.dailyLimit}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-muted">{t('used today')}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            <b className="font-mono text-foreground">{remaining}</b> {t('of')} {profile.dailyLimit} {t('sites left today')}
          </span>
          <span className="text-xs text-muted-foreground">{t('Your workspace')}</span>
        </div>
        <QuotaBar used={profile.usedToday} limit={profile.dailyLimit} />
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {loading ? (
        <PageSpinner />
      ) : (
        <section className="space-y-3">
          <SectionTitle
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/new')} icon={<ArrowRightIcon className="h-3.5 w-3.5" />}>
                {t('Create a site')}
              </Button>
            }
          >
            {t('Learning sites')}
          </SectionTitle>

          {sites.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sites.map(site => (
                <SiteCard key={site.id} site={site} onReuse={reuse} reusing={reusing === site.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t('No sites yet.')}
              description={t('Create a routed book from files and long text. Every site is served at its own URL — nothing to download.')}
              action={
                <Button onClick={() => navigate('/new')} icon={<PlusIcon className="h-4 w-4" />}>
                  {t('Create the first one')}
                </Button>
              }
            />
          )}
        </section>
      )}

      <Alert tone="info">{t('The MatekBázis example is a complete project that was already created. Open it to see the target quality.')}</Alert>
    </div>
  );
}
