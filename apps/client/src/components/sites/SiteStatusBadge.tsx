import { Badge, type BadgeTone } from '../ui/Badge';
import { useI18n } from '../../context/I18nContext';
import type { Site, SiteStatus } from '../../lib/types';

const toneByStatus: Record<SiteStatus, BadgeTone> = {
  queued: 'warning',
  running: 'warning',
  ready: 'success',
  failed: 'danger',
  cancelled: 'neutral',
  deleted: 'neutral',
};

export function SiteStatusBadge({ status }: { status: SiteStatus }) {
  const { t } = useI18n();
  return <Badge tone={toneByStatus[status] || 'neutral'}>{t(status)}</Badge>;
}

export function SiteFlags({ site }: { site: Site }) {
  const { t } = useI18n();
  return (
    <>
      {site.example ? <Badge tone="accent">{t('example')}</Badge> : null}
      {!site.published && !site.example ? <Badge tone="neutral">{t('private')}</Badge> : null}
    </>
  );
}
