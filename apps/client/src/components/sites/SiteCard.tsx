import { Link } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import { formatDateShort } from '../../lib/format';
import type { Site } from '../../lib/types';
import { ArrowRightIcon, CopyIcon, ExternalIcon } from '../icons';
import { Button, ButtonLink, buttonStyles } from '../ui/Button';
import { SiteFlags, SiteStatusBadge } from './SiteStatusBadge';

export function SiteCard({
  site,
  onReuse,
  reusing = false,
}: {
  site: Site;
  onReuse?: (site: Site) => void;
  reusing?: boolean;
}) {
  const { t, lang } = useI18n();
  const generating = site.status === 'queued' || site.status === 'running';

  return (
    <article className="flex flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-lg font-semibold leading-snug text-foreground">{site.title}</h3>
        <SiteStatusBadge status={site.status} />
      </div>

      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">
        {site.description || t('No description yet.')}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="font-mono">{site.slug}</span>
        <span aria-hidden="true">·</span>
        <span>{formatDateShort(site.createdAt, lang)}</span>
        {site.ownerEmail ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{site.ownerEmail}</span>
          </>
        ) : null}
        <SiteFlags site={site} />
      </div>

      {site.error && site.status === 'failed' ? (
        <p className="mt-3 line-clamp-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive">
          {site.error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {site.status === 'ready' ? (
          <ButtonLink
            href={site.url}
            target="_blank"
            rel="noreferrer"
            size="sm"
            variant="primary"
            icon={<ExternalIcon className="h-3.5 w-3.5" />}
          >
            {t('Open')}
          </ButtonLink>
        ) : null}
        {onReuse && site.reusable ? (
          <Button size="sm" variant="secondary" icon={<CopyIcon className="h-3.5 w-3.5" />} loading={reusing} onClick={() => onReuse(site)}>
            {t('Reuse')}
          </Button>
        ) : null}
        <Link to={`/site/${site.id}`} className={buttonStyles('outline', 'sm')}>
          <ArrowRightIcon className="h-3.5 w-3.5" />
          {t('Details')}
        </Link>
        {generating ? <span className="text-xs text-muted-foreground">{t('generating…')}</span> : null}
      </div>
    </article>
  );
}
