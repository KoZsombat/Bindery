import { useI18n } from '../../context/I18nContext';
import type { Site } from '../../lib/types';
import { CopyIcon, ExternalIcon } from '../icons';
import { Button, ButtonLink } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export function SuggestionList({
  sites,
  onReuse,
  reusingId,
}: {
  sites: Site[];
  onReuse: (site: Site) => void;
  reusingId: number | null;
}) {
  const { t } = useI18n();

  if (!sites.length) {
    return <EmptyState title={t('No suggestions yet. Search the catalog or generate the first version.')} />;
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {sites.map(site => (
        <li key={site.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{site.title}</p>
            <p className="truncate text-xs text-muted-foreground">{site.description || site.slug}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ButtonLink href={site.url} target="_blank" rel="noreferrer" size="sm" variant="outline" icon={<ExternalIcon className="h-3.5 w-3.5" />}>
              {t('Open')}
            </ButtonLink>
            {site.reusable ? (
              <Button
                size="sm"
                variant="secondary"
                icon={<CopyIcon className="h-3.5 w-3.5" />}
                loading={reusingId === site.id}
                onClick={() => onReuse(site)}
              >
                {t('Reuse')}
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
