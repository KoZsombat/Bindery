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

interface SettingsData {
  apiBase: string;
  apiModel: string;
  hasKey: boolean;
}

export function SettingsPage() {
  const { refresh } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();

  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [apiBase, setApiBase] = useState('');
  const [apiModel, setApiModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [clearKey, setClearKey] = useState(false);

  useEffect(() => {
    api.get<{ settings: SettingsData }>('/api/settings')
      .then(data => {
        setSettings(data.settings);
        setApiBase(data.settings.apiBase);
        setApiModel(data.settings.apiModel);
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

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker={t('Configuration')}
        title={t('API settings')}
        description={t('Each user brings their own OpenAI-compatible endpoint and key. They are stored encrypted and never shown again.')}
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <Card className="max-w-2xl">
        <form className="space-y-4" onSubmit={save}>
          <Field label={t('API base URL')} htmlFor="apiBase" hint="https://api.commandcode.ai/v1">
            <Input
              id="apiBase"
              value={apiBase}
              onChange={event => setApiBase(event.target.value)}
              placeholder="https://api.commandcode.ai/v1"
              inputMode="url"
            />
          </Field>

          <Field label={t('Model')} htmlFor="apiModel">
            <Input
              id="apiModel"
              value={apiModel}
              onChange={event => setApiModel(event.target.value)}
              placeholder="deepseek-v4.1"
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
                type="password"
                autoComplete="off"
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
              {settings?.hasKey ? t('Your key is used for your jobs.') : t('Set your key to run generations.')}
            </span>
          </div>
        </form>
      </Card>
    </div>
  );
}
