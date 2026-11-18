import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/Card';
import { Field, Input } from '../components/ui/Form';
import { PageSpinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useToast } from '../context/ToastContext';
import { api, describeError } from '../lib/api';
import { formatDateShort } from '../lib/format';
import type { AdminSettings, AdminSettingLimits, AdminUser } from '../lib/types';

function UserRow({ user, onChanged }: { user: AdminUser; onChanged: () => Promise<void> }) {
  const { t, lang } = useI18n();
  const { push } = useToast();
  const [limit, setLimit] = useState(String(user.dailyLimit));
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState('');

  async function patch(body: Record<string, unknown>, label: string) {
    setBusy(label);
    try {
      await api.patch(`/api/admin/users/${user.id}`, body);
      await onChanged();
      push('success', label === 'password' ? t('Password updated.') : t('Limit saved.'));
    } catch (e) {
      push('error', describeError(t, e));
    } finally {
      setBusy('');
    }
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3 py-3 align-top">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">{user.email}</span>
          <span className="text-xs text-muted-foreground">{user.name}</span>
          <div className="flex flex-wrap gap-1">
            <Badge tone={user.role === 'admin' ? 'accent' : 'neutral'}>{t(user.role)}</Badge>
            <Badge tone={user.disabled ? 'danger' : 'success'}>{user.disabled ? t('disabled') : t('active')}</Badge>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 align-top text-xs text-muted-foreground">{formatDateShort(user.createdAt, lang)}</td>
      <td className="px-3 py-3 align-top">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={1000}
            value={limit}
            onChange={event => setLimit(event.target.value)}
            className="h-8 w-20 px-2 text-xs"
            aria-label={t('Sites per day')}
          />
          <Button size="sm" variant="outline" loading={busy === 'limit'} onClick={() => void patch({ dailyLimit: Number(limit) }, 'limit')}>
            {t('Save')}
          </Button>
        </div>
      </td>
      <td className="px-3 py-3 align-top font-mono text-sm text-foreground">{user.usedToday}</td>
      <td className="px-3 py-3 align-top">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              type="password"
              minLength={10}
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder={t('New password (10+)')}
              className="h-8 w-44 px-2 text-xs"
              autoComplete="new-password"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={password.length < 10}
              loading={busy === 'password'}
              onClick={() => void patch({ password }, 'password').then(() => setPassword(''))}
            >
              {t('Reset')}
            </Button>
          </div>
          {user.role !== 'admin' ? (
            <Button
              size="sm"
              variant={user.disabled ? 'secondary' : 'danger'}
              loading={busy === 'toggle'}
              onClick={() => void patch({ disabled: !user.disabled }, 'toggle')}
            >
              {user.disabled ? t('Enable') : t('Disable')}
            </Button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

export function AdminPage() {
  const { refresh } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', password: '', dailyLimit: '3' });
  const [settingsForm, setSettingsForm] = useState({ maxBookChapters: '', chapterBatchSize: '', chapterConcurrency: '', llmMaxTokens: '' });
  const [limits, setLimits] = useState<AdminSettingLimits | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ users: AdminUser[] }>('/api/admin/users');
      setUsers(data.users);
      setError('');
    } catch (e) {
      setError(describeError(t, e));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadSettings = useCallback(async () => {
    try {
      const data = await api.get<{ settings: AdminSettings; limits: AdminSettingLimits }>('/api/admin/settings');
      setLimits(data.limits);
      setSettingsForm({
        maxBookChapters: String(data.settings.maxBookChapters),
        chapterBatchSize: String(data.settings.chapterBatchSize),
        chapterConcurrency: String(data.settings.chapterConcurrency),
        llmMaxTokens: String(data.settings.llmMaxTokens),
      });
    } catch (e) {
      setError(describeError(t, e));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function create(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError('');
    try {
      await api.post('/api/admin/users', {
        email: form.email,
        name: form.name,
        password: form.password,
        dailyLimit: Number(form.dailyLimit),
      });
      setForm({ email: '', name: '', password: '', dailyLimit: '3' });
      await load();
      push('success', t('User created.'));
    } catch (e) {
      setError(describeError(t, e));
    } finally {
      setCreating(false);
    }
  }

  async function changed() {
    await load();
    await refresh();
  }

  async function saveLimits(event: FormEvent) {
    event.preventDefault();
    setSavingSettings(true);
    try {
      const data = await api.patch<{ settings: AdminSettings; limits: AdminSettingLimits }>('/api/admin/settings', {
        maxBookChapters: Number(settingsForm.maxBookChapters),
        chapterBatchSize: Number(settingsForm.chapterBatchSize),
        chapterConcurrency: Number(settingsForm.chapterConcurrency),
        llmMaxTokens: Number(settingsForm.llmMaxTokens),
      });
      setLimits(data.limits);
      setSettingsForm({
        maxBookChapters: String(data.settings.maxBookChapters),
        chapterBatchSize: String(data.settings.chapterBatchSize),
        chapterConcurrency: String(data.settings.chapterConcurrency),
        llmMaxTokens: String(data.settings.llmMaxTokens),
      });
      push('success', t('Limits saved.'));
    } catch (e) {
      setError(describeError(t, e));
    } finally {
      setSavingSettings(false);
    }
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker={t('Admin')}
        title={t('Users')}
        description={t('Only the administrator can create accounts. Each user has a daily site limit.')}
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      {limits ? (
        <Card>
          <h2 className="text-lg font-semibold text-foreground">{t('Generation limits')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Caps for new generations. Running jobs keep the values they started with.')}
          </p>
          <form className="mt-4 grid gap-4 sm:grid-cols-3" onSubmit={saveLimits}>
            <Field label={t('Chapters per book')} htmlFor="set-max-chapters">
              <Input
                id="set-max-chapters"
                type="number"
                min={limits.maxBookChapters.min}
                max={limits.maxBookChapters.max}
                value={settingsForm.maxBookChapters}
                onChange={event => setSettingsForm({ ...settingsForm, maxBookChapters: event.target.value })}
              />
            </Field>
            <Field label={t('Chapters per request')} htmlFor="set-batch-size">
              <Input
                id="set-batch-size"
                type="number"
                min={limits.chapterBatchSize.min}
                max={limits.chapterBatchSize.max}
                value={settingsForm.chapterBatchSize}
                onChange={event => setSettingsForm({ ...settingsForm, chapterBatchSize: event.target.value })}
              />
            </Field>
            <Field label={t('Chapters in flight')} htmlFor="set-concurrency">
              <Input
                id="set-concurrency"
                type="number"
                min={limits.chapterConcurrency.min}
                max={limits.chapterConcurrency.max}
                value={settingsForm.chapterConcurrency}
                onChange={event => setSettingsForm({ ...settingsForm, chapterConcurrency: event.target.value })}
              />
            </Field>
            <Field label={t('Output tokens per chapter pass')} htmlFor="set-max-tokens">
              <Input
                id="set-max-tokens"
                type="number"
                min={limits.llmMaxTokens.min}
                max={limits.llmMaxTokens.max}
                value={settingsForm.llmMaxTokens}
                onChange={event => setSettingsForm({ ...settingsForm, llmMaxTokens: event.target.value })}
              />
            </Field>
            <div className="sm:col-span-3">
              <Button type="submit" loading={savingSettings}>{t('Save limits')}</Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t('Add user')}</h2>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={create}>
          <Field label={t('Email')} htmlFor="new-email">
            <Input
              id="new-email"
              type="email"
              required
              value={form.email}
              onChange={event => setForm({ ...form, email: event.target.value })}
            />
          </Field>
          <Field label={t('Name')} htmlFor="new-name">
            <Input
              id="new-name"
              value={form.name}
              onChange={event => setForm({ ...form, name: event.target.value })}
            />
          </Field>
          <Field label={t('Password (10+)')} htmlFor="new-password">
            <Input
              id="new-password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={form.password}
              onChange={event => setForm({ ...form, password: event.target.value })}
            />
          </Field>
          <Field label={t('Sites per day')} htmlFor="new-limit">
            <Input
              id="new-limit"
              type="number"
              min={0}
              max={1000}
              value={form.dailyLimit}
              onChange={event => setForm({ ...form, dailyLimit: event.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" loading={creating}>{t('Create user')}</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-border p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">{t('Existing users')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-muted/60">
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">{t('Email')}</th>
                <th className="px-3 py-2 font-medium">{t('Created')}</th>
                <th className="px-3 py-2 font-medium">{t('Limit')}</th>
                <th className="px-3 py-2 font-medium">{t('Used today')}</th>
                <th className="px-3 py-2 font-medium">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <UserRow key={user.id} user={user} onChanged={changed} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
