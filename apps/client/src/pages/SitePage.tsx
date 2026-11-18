import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CopyIcon, ExternalIcon, RefreshIcon, TrashIcon, XIcon } from '../components/icons';
import { SiteFlags, SiteStatusBadge } from '../components/sites/SiteStatusBadge';
import { Alert } from '../components/ui/Alert';
import { Button, ButtonLink } from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PageSpinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useToast } from '../context/ToastContext';
import { api, describeError } from '../lib/api';
import { formatDate, formatDuration } from '../lib/format';
import type { Job, Site } from '../lib/types';

export function SitePage() {
  const { id } = useParams();
  const { refresh } = useAuth();
  const { t, lang } = useI18n();
  const { push } = useToast();
  const navigate = useNavigate();

  const [site, setSite] = useState<Site | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [canManage, setCanManage] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.get<{ site: Site; job: Job | null; canManage?: boolean }>(`/api/sites/${id}`);
      setSite(data.site);
      setJob(data.job);
      setCanManage(!!data.canManage);
      setError('');
    } catch (e) {
      setError(describeError(t, e));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const polling = site?.status === 'queued' || site?.status === 'running';
  useEffect(() => {
    if (!polling) return;
    const timer = window.setInterval(() => void load(), 3000);
    return () => window.clearInterval(timer);
  }, [polling, load]);
  useEffect(() => {
    if (!polling) return;
    const ticker = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(ticker);
  }, [polling]);

  async function action(name: string, request: () => Promise<unknown>, after?: () => void) {
    setBusy(name);
    try {
      await request();
      await load();
      await refresh();
      after?.();
    } catch (e) {
      push('error', describeError(t, e));
    } finally {
      setBusy('');
    }
  }

  function reuse() {
    if (!site) return;
    void action('reuse', async () => {
      const data = await api.post<{ site: Site }>(`/api/sites/${site.id}/clone`);
      push('success', t('Reused in your workspace.'));
      navigate(`/site/${data.site.id}`);
    });
  }

  function remove() {
    if (!site) return;
    void action('delete', async () => {
      await api.delete(`/api/sites/${site.id}`);
      push('success', t('Site deleted.'));
      navigate('/app');
    });
  }

  if (loading) return <PageSpinner />;

  if (!site) {
    return (
      <div className="space-y-4">
        <Alert tone="error">{error || t('Site not found.')}</Alert>
        <Button variant="outline" onClick={() => navigate('/app')} icon={<ArrowLeftIcon className="h-4 w-4" />}>
          {t('Back to sites')}
        </Button>
      </div>
    );
  }

  const progress = job?.progress;
  const activity = progress?.activity;
  const lastSignal = activity?.updatedAt || job?.heartbeatAt || job?.updatedAt;
  const signalAge = lastSignal ? Math.max(0, Math.round((now - new Date(lastSignal).getTime()) / 1000)) : null;
  const phaseLabel = progress?.phase === 'outline' ? t('Designing the outline')
    : progress?.phase === 'glossary' ? t('Assembling the glossary')
    : progress?.phase === 'validate' ? t('Checking depth and repairing chapters')
    : progress?.phase === 'done' ? t('Finishing')
    : t('Writing chapters');
  const etaSeconds = progress?.etaAt ? Math.max(0, (new Date(progress.etaAt).getTime() - now) / 1000) : null;
  const etaLabel = etaSeconds != null
    ? `${t('Estimated time remaining:')} ~${formatDuration(etaSeconds)}`
    : t('Estimating time…');

  return (
    <div className="space-y-6">
      <PageHeader
        kicker={`${t('Site')} · ${site.slug}`}
        title={site.titleI18n?.[lang] || site.title}
        description={site.descriptionI18n?.[lang] || site.description || t('No description yet.')}
        actions={
          <>
            <SiteStatusBadge status={site.status} />
            {site.status === 'ready' ? (
              <ButtonLink href={site.url} target="_blank" rel="noreferrer" icon={<ExternalIcon className="h-4 w-4" />}>
                {t('Open site')}
              </ButtonLink>
            ) : null}
          </>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{t('Routing')}</h2>
          <p className="text-sm text-muted-foreground">{t('The site is served at this path. There is no ZIP or download.')}</p>
          <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-sm text-foreground">{site.url}</code>
          <p className="text-xs text-muted-foreground">
            {t('Status:')} {t(site.status)} · {t('Updated:')} {formatDate(site.updatedAt, lang)}
          </p>
          <div className="flex flex-wrap gap-2">
            <SiteFlags site={site} />
          </div>
          {site.error ? <Alert tone="error">{site.error}</Alert> : null}
          {polling ? (
            <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                </span>
                {t('Working')} · {phaseLabel}
                {progress?.chapter ? <span className="font-mono text-xs text-muted-foreground">{progress.chapter}</span> : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {activity
                  ? `${Number(activity.chars).toLocaleString()} ${t('characters received')} · ${Math.round(activity.elapsedMs / 1000)}s`
                  : t('Waiting for the first streamed tokens…')}
                {signalAge != null ? ` · ${t('last signal')} ${signalAge}s ${t('ago')}` : ''}
              </p>
              {etaLabel ? <p className="text-xs font-medium text-foreground">{etaLabel}</p> : null}
              <p className="text-xs text-muted-foreground">{t('A resumed job keeps its finished chapters.')}</p>
            </div>
          ) : null}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{t('Actions')}</h2>
          <div className="flex flex-wrap gap-2">
            {site.status === 'ready' ? (
              <ButtonLink href={site.url} target="_blank" rel="noreferrer" variant="primary" icon={<ExternalIcon className="h-4 w-4" />}>
                {t('Open')}
              </ButtonLink>
            ) : null}
            {site.reusable ? (
              <Button variant="secondary" onClick={reuse} loading={busy === 'reuse'} icon={<CopyIcon className="h-4 w-4" />}>
                {t('Reuse in my workspace')}
              </Button>
            ) : null}
            {polling && canManage ? (
              <Button variant="outline" onClick={() => void action('cancel', () => api.post(`/api/sites/${site.id}/cancel`))} loading={busy === 'cancel'} icon={<XIcon className="h-4 w-4" />}>
                {t('Cancel')}
              </Button>
            ) : null}
            {canManage && (site.status === 'ready' || site.status === 'failed' || site.status === 'cancelled') ? (
              <Button variant="outline" onClick={() => void action('regenerate', () => api.post(`/api/sites/${site.id}/regenerate`))} loading={busy === 'regenerate'} icon={<RefreshIcon className="h-4 w-4" />}>
                {t('Regenerate')}
              </Button>
            ) : null}
            <Button variant="ghost" onClick={() => navigate('/app')} icon={<ArrowLeftIcon className="h-4 w-4" />}>{t('Back to sites')}</Button>
            {canManage ? (
              <Button variant="danger" onClick={() => setConfirmDelete(true)} icon={<TrashIcon className="h-4 w-4" />}>{t('Delete')}</Button>
            ) : null}
          </div>
          {!canManage ? (
            <p className="text-xs text-muted-foreground">{t('Only the creator and admins can change this site.')}</p>
          ) : null}
        </Card>
      </div>

      {job?.progress ? (
        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">{t('Generation progress')}</h2>
            <span className="font-mono text-sm text-muted-foreground">
              {job.progress.done} / {job.progress.total} · {t(job.progress.phase)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={'h-full rounded-full bg-foreground transition-all' + (polling ? ' progress-live' : '')}
              style={{ width: `${job.progress.total ? Math.round(job.progress.done / job.progress.total * 100) : 0}%` }}
            />
          </div>
          {job.progress.chapter ? (
            <p className="text-xs text-muted-foreground">{t('Current chapter:')} <code className="font-mono">{job.progress.chapter}</code></p>
          ) : null}
        </Card>
      ) : null}

      {canManage ? (
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{t('Job log')}</h2>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-brand p-4 font-mono text-xs leading-6 text-brand-foreground">
            {job ? `${t(job.status)}\n\n${job.log || ''}` : t('No job recorded.')}
          </pre>
        </Card>
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        title={t('Delete this site permanently?')}
        description={t('This cannot be undone.')}
        confirmLabel={t('Delete')}
        cancelLabel={t('Cancel')}
        danger
        loading={busy === 'delete'}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={remove}
      />
    </div>
  );
}
