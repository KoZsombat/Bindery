import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadPicker, type PickedFile } from '../components/sites/UploadPicker';
import { SuggestionList } from '../components/sites/SuggestionList';
import { SparkIcon } from '../components/icons';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/Card';
import { Checkbox, Field, Input, Select, Textarea } from '../components/ui/Form';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useToast } from '../context/ToastContext';
import { api, describeError } from '../lib/api';
import type { Site } from '../lib/types';

interface FormState {
  title: string;
  topic: string;
  description: string;
  audience: string;
  language: 'hu' | 'en' | 'both';
  longText: string;
  published: boolean;
  maxChapters: string;
  parts: number;
}

interface LimitInfo {
  limits: {
    chapters: { min: number; max: number };
    wordsPerChapter: { min: number; perNewTerm: number };
    tokensPerChapter: number;
    timeoutMs: number;
    sourceChars: number;
    longTextChars: number;
  };
  target: number;
  sourceChars: number;
  overCap: boolean;
  quotaUnit: string;
}

const emptyForm: FormState = {
  title: '',
  topic: '',
  description: '',
  audience: '',
  language: 'both',
  longText: '',
  published: true,
  maxChapters: '',
  parts: 1,
};

function fileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}:${Math.random().toString(36).slice(2)}`;
}

export function NewSitePage() {
  const { me, refresh } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<Site[]>([]);
  const [error, setError] = useState('');
  const [reusingId, setReusingId] = useState<number | null>(null);
  const [limits, setLimits] = useState<LimitInfo | null>(null);

  const remaining = me ? Math.max(0, me.profile.dailyLimit - me.profile.usedToday) : 0;

  useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ source: form.longText, topic: form.topic, maxChapters: form.maxChapters });
        const data = await api.get<LimitInfo>(`/api/limits?${params}`);
        if (alive) setLimits(data);
      } catch {
        /* limits are informative; generation still works if this fails */
      }
    }, 400);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [form.longText, form.topic, form.maxChapters]);
  const needsKey = !!me && !me.profile.canGenerate;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(current => ({ ...current, [key]: value }));
  }

  async function addFiles(picked: File[]) {
    const room = 6 - files.length;
    if (room <= 0) {
      push('error', t('PDF, TXT, MD, CSV, JSON, TEX, JS, HTML, CSS · max 6 × 8 MB'));
      return;
    }
    const batch = picked.slice(0, room);
    const placeholders: PickedFile[] = batch.map(file => ({
      key: fileKey(file),
      name: file.name,
      uploading: true,
    }));
    setFiles(current => [...current, ...placeholders]);
    setUploading(true);
    try {
      const data = await api.upload(batch);
      setFiles(current => {
        const next = [...current];
        placeholders.forEach((placeholder, index) => {
          const match = next.find(item => item.key === placeholder.key);
          if (!match) return;
          const uploaded = data.files[index];
          match.uploading = false;
          match.id = uploaded?.id;
          match.chars = uploaded?.chars;
          match.error = uploaded ? undefined : 'Upload failed.';
        });
        return next;
      });
    } catch (e) {
      const message = describeError(t, e);
      setFiles(current => current.map(item =>
        placeholders.some(placeholder => placeholder.key === item.key)
          ? { ...item, uploading: false, error: message }
          : item
      ));
      push('error', message);
    } finally {
      setUploading(false);
    }
  }

  function removeFile(key: string) {
    setFiles(current => current.filter(file => file.key !== key));
  }

  async function reuse(site: Site) {
    setReusingId(site.id);
    try {
      const data = await api.post<{ site: Site }>(`/api/sites/${site.id}/clone`);
      push('success', t('Reused in your workspace.'));
      await refresh();
      navigate(`/site/${data.site.id}`);
    } catch (e) {
      push('error', describeError(t, e));
    } finally {
      setReusingId(null);
    }
  }

  async function submit(force = false) {
    if (uploading) {
      push('error', t('Uploading…'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const data = await api.post<{ site: Site | null; suggestions: Site[] }>('/api/sites', {
        ...form,
        uploadIds: files.flatMap(file => (file.id ? [file.id] : [])),
        maxChapters: form.maxChapters ? Number(form.maxChapters) : undefined,
        parts: form.parts,
        force,
      });
      if (data.site) {
        push('success', t('Site queued.'));
        await refresh();
        navigate(`/site/${data.site.id}`);
      } else {
        setSuggestions(data.suggestions || []);
        push('info', t('Similar sites already exist'));
      }
    } catch (e) {
      setError(describeError(t, e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker={t('Create')}
        title={t('New learning site')}
        description={
          <>
            {t('Give the model a topic, your notes, or both. Uploaded PDFs and text files are added to the skill as context. The result is routed at')}{' '}
            <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">/s/&lt;slug&gt;/</code>.
          </>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}
      {needsKey ? <Alert tone="warning">{t('Set your API key in Settings before generating.')}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
        <Card>
          <form className="space-y-4" onSubmit={event => { event.preventDefault(); void submit(false); }}>
            <Field label={t('Title')} htmlFor="title">
              <Input
                id="title"
                value={form.title}
                maxLength={160}
                placeholder={t('e.g. Linear algebra from scratch')}
                onChange={event => set('title', event.target.value)}
              />
            </Field>

            <Field label={t('Topic / goal')} htmlFor="topic">
              <Input
                id="topic"
                value={form.topic}
                maxLength={300}
                placeholder={t('What should the learner be able to do?')}
                onChange={event => set('topic', event.target.value)}
              />
            </Field>

            <Field label={t('Description')} htmlFor="description">
              <Textarea
                id="description"
                value={form.description}
                maxLength={600}
                rows={3}
                placeholder={t('Audience, level, scope, exam format…')}
                onChange={event => set('description', event.target.value)}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('Audience')} htmlFor="audience">
                <Input
                  id="audience"
                  value={form.audience}
                  maxLength={160}
                  placeholder={t('e.g. first-year BSc, BME VIK')}
                  onChange={event => set('audience', event.target.value)}
                />
              </Field>
              <Field label={t('Source language preference')} htmlFor="language">
                <Select
                  id="language"
                  value={form.language}
                  onChange={event => set('language', event.target.value as FormState['language'])}
                >
                  <option value="both">{t('Both Hungarian and English')}</option>
                  <option value="en">{t('English first')}</option>
                  <option value="hu">{t('Hungarian first')}</option>
                </Select>
              </Field>
            </div>

            <Field label={t('Long text / pasted notes')} htmlFor="longText" hint={`${form.longText.length} / 200000`}>
              <Textarea
                id="longText"
                value={form.longText}
                maxLength={200000}
                rows={9}
                placeholder={t('Paste a syllabus, lecture notes, exam requirements, or a detailed brief…')}
                onChange={event => set('longText', event.target.value)}
              />
            </Field>

            <Field label={t('Files')}>
              <UploadPicker
                files={files}
                onSelect={files => void addFiles(files)}
                onRemove={removeFile}
                disabled={uploading || submitting}
              />
            </Field>

            <Checkbox
              checked={form.published}
              onChange={event => set('published', event.target.checked)}
              label={t('Show this site in the shared catalog')}
            />

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button type="submit" loading={submitting} disabled={uploading || needsKey} icon={<SparkIcon className="h-4 w-4" />}>
                {t('Generate site')}
              </Button>
              {suggestions.length ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting || uploading || needsKey}
                  onClick={() => void submit(true)}
                >
                  {t('Generate a new one anyway')}
                </Button>
              ) : null}
              <span className="text-xs text-muted-foreground">
                {t('Remaining today:')} <b className="font-mono text-foreground">{remaining}</b>. {t('Uploads are saved as context; the generated site is routed, never downloadable.')}
              </span>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('Active limits')}</h2>
            <p className="text-xs text-muted-foreground">{t('These numbers come from the server before anything is queued.')}</p>
            {limits ? (
              <>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">{t('Chapter target')}</dt>
                  <dd className="font-mono text-foreground">{limits.target}</dd>
                  <dt className="text-muted-foreground">{t('words per chapter')}</dt>
                  <dd className="font-mono text-foreground">{limits.limits.wordsPerChapter.min}{t(' plus per new term')} +{limits.limits.wordsPerChapter.perNewTerm}</dd>
                  <dt className="text-muted-foreground">{t('tokens per chapter')}</dt>
                  <dd className="font-mono text-foreground">{limits.limits.tokensPerChapter}</dd>
                  <dt className="text-muted-foreground">{t('source characters')}</dt>
                  <dd className="font-mono text-foreground">{limits.sourceChars} / {limits.limits.sourceChars}</dd>
                  <dt className="text-muted-foreground">{t('Estimated time')}</dt>
                  <dd className="font-mono text-foreground">~{Math.max(2, Math.ceil(limits.target * 1.1))} min</dd>
                </dl>
                {limits.overCap ? <Alert tone="warning">{t('This request is large. Split it, or raise the chapter target.')}</Alert> : null}
                <Field label={t('Chapter target')} htmlFor="maxChapters" hint={t('Leave empty to derive it from the source topic count.')}>
                  <Input
                    id="maxChapters"
                    type="number"
                    min={limits.limits.chapters.min}
                    max={limits.limits.chapters.max}
                    value={form.maxChapters}
                    placeholder={String(limits.target)}
                    onChange={event => set('maxChapters', event.target.value)}
                  />
                </Field>
                <Field label={t('Split the source into parts')} htmlFor="parts">
                  <Select id="parts" value={String(form.parts)} onChange={event => set('parts', Number(event.target.value))}>
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n === 1 ? t('One part') : `${n} × ${t('One part')}`}</option>
                    ))}
                  </Select>
                </Field>
                <p className="text-xs text-muted-foreground">
                  {t('Each generation is one book unit: chapter passes are free.')} {t('Daily quota:')} <b className="font-mono text-foreground">{remaining}</b>
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t('Add a topic or notes to see the estimate.')}</p>
            )}
          </Card>

          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{t('Reuse before generating')}</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {t('The catalog is searched first. If an existing site already covers the need, open it or reuse it without spending a generation.')}
            </p>
          </Card>

          {suggestions.length ? (
            <Card className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">{t('Similar sites already exist')}</h2>
              <p className="text-sm text-muted-foreground">{t('Open it, reuse it, or generate a new version anyway.')}</p>
              <SuggestionList sites={suggestions} onReuse={reuse} reusingId={reusingId} />
            </Card>
          ) : null}

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('Browse catalog')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('Search published sites before creating a new one. Reuse copies a site into your workspace without calling the model.')}
            </p>
            <Button variant="secondary" onClick={() => navigate('/catalog')}>{t('Open catalog')}</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
