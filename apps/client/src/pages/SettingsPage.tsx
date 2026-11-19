import { useEffect, useState, type FormEvent } from 'react';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/Card';
import { Checkbox, Field, Input } from '../components/ui/Form';
import { PageSpinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useToast } from '../context/ToastContext';
import { api, describeError } from '../lib/api';

interface SharedBy {
  email: string;
  name: string;
  apiBase: string;
  apiModel: string;
}

interface SettingsData {
  apiBase: string;
  apiModel: string;
  hasKey: boolean;
  keySource: 'own' | 'shared' | 'none';
  sharedBy: SharedBy | null;
  canGenerate: boolean;
}

interface ShareEntry {
  id: number;
  createdAt: string;
  active?: boolean;
  owner?: SharedBy;
  grantee?: SharedBy;
}

interface SharesData {
  incoming: ShareEntry[];
  outgoing: ShareEntry[];
}

const EMPTY_SHARES: SharesData = { incoming: [], outgoing: [] };

export function SettingsPage() {
  const { refresh } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();

  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [shares, setShares] = useState<SharesData>(EMPTY_SHARES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [revoking, setRevoking] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [apiBase, setApiBase] = useState('');
  const [apiModel, setApiModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [clearKey, setClearKey] = useState(false);
  const [shareEmail, setShareEmail] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<{ settings: SettingsData }>('/api/settings'),
      api.get<{ shares: SharesData }>('/api/settings/shares'),
    ])
      .then(([settingsData, sharesData]) => {
        setSettings(settingsData.settings);
        setApiBase(settingsData.settings.apiBase);
        setApiModel(settingsData.settings.apiModel);
        setShares(sharesData.shares);
      })
      .catch(e => setError(describeError(t, e)))
      .finally(() => setLoading(false));
  }, [t]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = await api.put<{ settings: SettingsData }>('/api/settings', {
        apiBase,
        apiModel,
        apiKey,
        clearKey,
      });
      setSettings(data.settings);
      setApiKey('');
      setClearKey(false);
      push('success', t('Settings saved.'));
      await refresh();
    } catch (e) {
      setError(describeError(t, e));
    } finally {
      setSaving(false);
    }
  }

  async function shareKey(event: FormEvent) {
    event.preventDefault();
    if (!shareEmail.trim()) return;
    setSharing(true);
    setError('');
    try {
      const data = await api.post<{ shares: SharesData }>('/api/settings/shares', { email: shareEmail.trim() });
      setShares(data.shares);
      setShareEmail('');
      push('success', t('Key sharing updated.'));
      await refresh();
    } catch (e) {
      setError(describeError(t, e));
    } finally {
      setSharing(false);
    }
  }

  async function reloadSettings() {
    const data = await api.get<{ settings: SettingsData }>('/api/settings');
    setSettings(data.settings);
  }

  async function revokeShare(id: number) {
    setRevoking(id);
    setError('');
    try {
      const data = await api.delete<{ shares: SharesData }>('/api/settings/shares/' + id);
      setShares(data.shares);
      await reloadSettings();
      push('success', t('Key sharing updated.'));
      await refresh();
    } catch (e) {
      setError(describeError(t, e));
    } finally {
      setRevoking(null);
    }
  }

  if (loading) return <PageSpinner />;

  const sharedBy = settings?.keySource === 'shared' ? settings.sharedBy : null;
  const sharedByName = sharedBy?.name || sharedBy?.email || '';
  const sharedHost = sharedBy?.apiBase
    ? (() => { try { return new URL(sharedBy.apiBase).host; } catch { return sharedBy.apiBase; } })()
    : '';

  return (
    <div className="space-y-6">
      <PageHeader
        kicker={t('Configuration')}
        title={t('API settings')}
        description={t('Each user brings their own OpenAI-compatible endpoint and key. They are stored encrypted and never shown again.')}
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
      <Card>
        <form className="space-y-4" autoComplete="off" onSubmit={save}>
          <Field label={t('API base URL')} htmlFor="apiBase" hint="https://api.commandcode.ai/provider/v1">
            <Input
              id="apiBase"
              name="api-base-url"
              autoComplete="off"
              value={apiBase}
              onChange={event => setApiBase(event.target.value)}
              placeholder="https://api.commandcode.ai/provider/v1"
              inputMode="url"
            />
          </Field>

          <Field label={t('Model')} htmlFor="apiModel">
            <Input
              id="apiModel"
              name="api-model"
              autoComplete="off"
              value={apiModel}
              onChange={event => setApiModel(event.target.value)}
              placeholder="deepseek/deepseek-v4.1-flash"
            />
          </Field>

          <Field
            label={t('API key')}
            htmlFor="apiKey"
            hint={t('Leave blank to keep the current key')}
          >
            <div className="space-y-2">
              <Badge tone={settings?.hasKey ? 'success' : 'neutral'}>
                {settings?.hasKey ? t('set') : t('not set')}
              </Badge>
              <Input
                id="apiKey"
                name="api-key"
                type="password"
                autoComplete="new-password"
                data-lpignore="true"
                data-1p-ignore="true"
                value={apiKey}
                onChange={event => setApiKey(event.target.value)}
                placeholder={t('Leave blank to keep the current key')}
              />
            </div>
          </Field>

          <Checkbox checked={clearKey} onChange={event => setClearKey(event.target.checked)} label={t('Remove my key')} />

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" loading={saving}>{t('Save')}</Button>
            <span className="text-xs text-muted-foreground">
              {settings?.hasKey
                ? t('Your key is used for your jobs.')
                : sharedBy
                  ? t(sharedHost ? 'Using a key shared by {who} via {host}.' : 'Using a key shared by {who}.', { who: sharedByName, host: sharedHost })
                  : t('Set your key to run generations.')}
            </span>
          </div>
        </form>
      </Card>

      <Card>
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-semibold">{t('Key sharing')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('Share your key with specific people. They can use it for their own generations but never see it. Your own key always takes precedence over a shared one.')}
            </p>
          </div>

          {settings?.hasKey ? (
            <p className="text-xs text-muted-foreground">{t('Your own key is used first.')}</p>
          ) : sharedBy ? (
            <p className="text-xs text-muted-foreground">
              {t(sharedHost ? 'Using a key shared by {who} via {host}.' : 'Using a key shared by {who}.', { who: sharedByName, host: sharedHost })}
            </p>
          ) : null}

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Shared with me')}</h3>
            {shares.incoming.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">{t('No one has shared a key with you.')}</p>
            ) : (
              <ul className="mt-2 divide-y divide-border">
                {shares.incoming.map(share => (
                  <li key={share.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                    <span className="text-sm">
                      {t('Shared by {who}', { who: share.owner?.name || share.owner?.email || '' })}
                      {!share.active ? <Badge tone="warning" className="ml-2">{t('inactive')}</Badge> : null}
                    </span>
                    <Button
                      variant="outline"
                      loading={revoking === share.id}
                      onClick={() => revokeShare(share.id)}
                    >
                      {t('Stop using')}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Shared by me')}</h3>
            {shares.outgoing.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">{t('You have not shared your key with anyone.')}</p>
            ) : (
              <ul className="mt-2 divide-y divide-border">
                {shares.outgoing.map(share => (
                  <li key={share.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                    <span className="text-sm">
                      {t('Shared with {who}', { who: share.grantee?.name || share.grantee?.email || '' })}
                    </span>
                    <Button
                      variant="outline"
                      loading={revoking === share.id}
                      onClick={() => revokeShare(share.id)}
                    >
                      {t('Revoke')}
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <form className="mt-4 flex flex-wrap items-end gap-3" autoComplete="off" onSubmit={shareKey}>
              <Field label={t('Email address')} htmlFor="shareEmail">
                <Input
                  id="shareEmail"
                  name="share-email"
                  type="email"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  value={shareEmail}
                  onChange={event => setShareEmail(event.target.value)}
                  placeholder="name@example.com"
                />
              </Field>
              <Button type="submit" loading={sharing} disabled={!settings?.hasKey}>
                {t('Share')}
              </Button>
            </form>
            {!settings?.hasKey ? (
              <p className="mt-2 text-xs text-muted-foreground">{t('Add your own key before sharing it.')}</p>
            ) : null}
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}
