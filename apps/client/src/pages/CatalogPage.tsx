import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SiteCard } from '../components/sites/SiteCard';
import { SearchIcon } from '../components/icons';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Form';
import { PageSpinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useToast } from '../context/ToastContext';
import { api, describeError } from '../lib/api';
import type { Site } from '../lib/types';

export function CatalogPage() {
  const { refresh } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';

  const [input, setInput] = useState(query);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reusing, setReusing] = useState<number | null>(null);
  /** Ignores responses for a query the visitor has already typed past. */
  const requestSeq = useRef(0);
  /** The query the debounce just committed, so it does not overwrite newer typing. */
  const committedQuery = useRef<string | null>(null);

  const load = useCallback(async (value: string) => {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const data = await api.get<{ sites: Site[] }>(`/api/catalog?q=${encodeURIComponent(value)}`);
      if (seq !== requestSeq.current) return;
      setSites(data.sites);
      setError('');
    } catch (e) {
      if (seq !== requestSeq.current) return;
      setError(describeError(t, e));
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load(query);
    if (committedQuery.current === query) committedQuery.current = null;
    else setInput(query);
  }, [query, load]);

  // Live filtering: one second after typing stops, commit the query to the URL.
  useEffect(() => {
    const value = input.trim();
    if (value === query) return;
    const timer = window.setTimeout(() => {
      committedQuery.current = value;
      setParams(value ? { q: value } : {}, { replace: true });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [input, query, setParams]);

  function search(event: FormEvent) {
    event.preventDefault();
    setParams(input.trim() ? { q: input.trim() } : {});
  }

  async function reuse(site: Site) {
    setReusing(site.id);
    try {
      const data = await api.post<{ site: Site }>(`/api/sites/${site.id}/clone`);
      push('success', t('Reused in your workspace.'));
      await refresh();
      navigate(`/site/${data.site.id}`);
    } catch (e) {
      push('error', describeError(t, e));
    } finally {
      setReusing(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker={t('Shared catalog')}
        title={t('Existing sites')}
        description={t('Search published sites before creating a new one. Reuse copies a site into your workspace without calling the model.')}
      />

      <form className="flex flex-wrap items-center gap-2" onSubmit={search}>
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={input}
            onChange={event => setInput(event.target.value)}
            className="pl-8"
            placeholder={t('Search title, topic, description or source text…')}
            aria-label={t('Search')}
          />
        </div>
        <Button type="submit" icon={<SearchIcon className="h-4 w-4" />}>{t('Search')}</Button>
      </form>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {loading && !sites.length ? (
        <PageSpinner />
      ) : sites.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sites.map(site => (
            <SiteCard key={site.id} site={site} onReuse={reuse} reusing={reusing === site.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={t('No matching sites yet.')}
          description={t('Search published sites before creating a new one. Reuse copies a site into your workspace without calling the model.')}
        />
      )}
    </div>
  );
}
