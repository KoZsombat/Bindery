import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadPicker, type PickedFile } from '../components/sites/UploadPicker';
import { SuggestionList } from '../components/sites/SuggestionList';
import { SparkIcon } from '../components/icons';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/Card';
import { Field, Input, Select, Textarea } from '../components/ui/Form';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useToast } from '../context/ToastContext';
import { api, describeError } from '../lib/api';
import type { Site, SiteOptions } from '../lib/types';
import { DEFAULT_SITE_OPTIONS } from '../lib/types';

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

/** Per-user so a shared browser tab never restores someone else's draft. */
const DRAFT_PREFIX = 'bindery.new-site-draft';

interface StoredDraft {
  form: FormState;
  files: PickedFile[];
  options?: SiteOptions;
}

function readDraft(key: string): StoredDraft | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft> | null;
    if (!parsed || typeof parsed !== 'object' || !parsed.form) return null;
    const files = Array.isArray(parsed.files)
      ? parsed.files.filter(file => file && typeof file.key === 'string' && typeof file.name === 'string' && typeof file.id === 'number')
      : [];
    return {
      form: { ...emptyForm, ...parsed.form },
      files: files.map(file => ({ key: file.key, name: file.name, id: file.id, chars: file.chars, uploading: false })),
      options: { ...DEFAULT_SITE_OPTIONS, ...(parsed.options || {}) },
    };
  } catch {
    return null;
  }
}

function clearDraft(key: string) {
  try { sessionStorage.removeItem(key); } catch { /* ignore */ }
}

function fileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}:${Math.random().toString(36).slice(2)}`;
}

export function NewSitePage() {
  const { me, refresh } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const navigate = useNavigate();

  const [restored] = useState(() => readDraft(`${DRAFT_PREFIX}:${me?.user.id ?? 'anonymous'}`));
  const [form, setForm] = useState<FormState>(restored?.form ?? emptyForm);
  const [options, setOptions] = useState<SiteOptions>(restored?.options ?? DEFAULT_SITE_OPTIONS);
  const [files, setFiles] = useState<PickedFile[]>(restored?.files ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<Site[]>([]);
  const [error, setError] = useState('');
  const [reusingId, setReusingId] = useState<number | null>(null);
  const [limits, setLimits] = useState<LimitInfo | null>(null);

  const remaining = me ? Math.max(0, me.profile.dailyLimit - me.profile.usedToday) : 0;

  useEffect(() => {
    try {
      sessionStorage.setItem(`${DRAFT_PREFIX}:${me?.user.id ?? 'anonymous'}`, JSON.stringify({
        form,
        options,
        files: files
          .filter(file => file.id && !file.uploading)
          .map(({ key, name, id, chars }) => ({ key, name, id, chars })),
      }));
    } catch { /* sessionStorage can be unavailable */ }
  }, [form, options, files, me?.user.id]);

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

  function setOption<K extends keyof SiteOptions>(key: K, value: SiteOptions[K]) {
    setOptions(current => ({ ...current, [key]: value }));
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
    if (needsKey) {
      setError(t('Set your API key in Settings before generating.'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (uploading) {
      push('error', t('Uploading…'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const data = await api.post<{ site: Site | null; suggestions: Site[] }>('/api/sites', {
        ...form,
        options,
        uploadIds: files.flatMap(file => (file.id ? [file.id] : [])),
        maxChapters: form.maxChapters ? Number(form.maxChapters) : undefined,
        parts: form.parts,
        force,
      });
      if (data.site) {
        clearDraft(`${DRAFT_PREFIX}:${me?.user.id ?? 'anonymous'}`);
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
          <form id="new-site-form" className="space-y-4" onSubmit={event => { event.preventDefault(); void submit(false); }}>
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

            <Field label={t('Visibility')} htmlFor="visibility">
              <Select
                id="visibility"
                value={form.published ? 'public' : 'private'}
                onChange={event => set('published', event.target.value === 'public')}
              >
                <option value="public">{t('Public — listed in the catalog')}</option>
                <option value="private">{t('Private — only me and admins')}</option>
              </Select>
            </Field>

            <div className="space-y-4 rounded-md border border-border p-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">{t('Book style')}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('The defaults are the current skill. Change only what your learners need.')}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('Purpose')} htmlFor="opt-purpose">
                  <Select id="opt-purpose" value={options.purpose} onChange={event => setOption('purpose', event.target.value as SiteOptions['purpose'])}>
                    <option value="exam">{t('Exam preparation (default)')}</option>
                    <option value="course">{t('Course companion')}</option>
                    <option value="practice">{t('Practice drills')}</option>
                    <option value="reference">{t('Reference companion')}</option>
                  </Select>
                </Field>

                <Field label={t('Learner level')} htmlFor="opt-level">
                  <Select id="opt-level" value={options.level} onChange={event => setOption('level', event.target.value as SiteOptions['level'])}>
                    <option value="undergrad">{t('Undergraduate (default)')}</option>
                    <option value="beginner">{t('Beginner')}</option>
                    <option value="graduate">{t('Graduate')}</option>
                    <option value="professional">{t('Professional')}</option>
                  </Select>
                </Field>

                <Field label={t('Assessment style')} htmlFor="opt-assessment">
                  <Select id="opt-assessment" value={options.assessment} onChange={event => setOption('assessment', event.target.value as SiteOptions['assessment'])}>
                    <option value="mixed">{t('Mixed — MCQ + written (default)')}</option>
                    <option value="mcq">{t('Multiple choice only')}</option>
                    <option value="written">{t('Written / proofs only')}</option>
                    <option value="none">{t('Short checks only')}</option>
                  </Select>
                </Field>

                <Field label={t('Theory vs practice')} htmlFor="opt-balance">
                  <Select id="opt-balance" value={options.balance} onChange={event => setOption('balance', event.target.value as SiteOptions['balance'])}>
                    <option value="balanced">{t('Balanced (default)')}</option>
                    <option value="theory">{t('Theory-heavy')}</option>
                    <option value="practice">{t('Practice-heavy')}</option>
                  </Select>
                </Field>

                <Field label={t('Sources')} htmlFor="opt-sources">
                  <Select id="opt-sources" value={options.sources} onChange={event => setOption('sources', event.target.value as SiteOptions['sources'])}>
                    <option value="only">{t('Only my material (default)')}</option>
                    <option value="open">{t('Allow general background')}</option>
                  </Select>
                </Field>

                <Field label={t('Domain')} htmlFor="opt-domain">
                  <Select id="opt-domain" value={options.domain} onChange={event => setOption('domain', event.target.value as SiteOptions['domain'])}>
                    <option value="math">{t('Math & science (default)')}</option>
                    <option value="general">{t('General')}</option>
                    <option value="programming">{t('Programming')}</option>
                  </Select>
                </Field>

                <Field label={t('Tone')} htmlFor="opt-tone">
                  <Select id="opt-tone" value={options.tone} onChange={event => setOption('tone', event.target.value as SiteOptions['tone'])}>
                    <option value="textbook">{t('Textbook (default)')}</option>
                    <option value="coach">{t('Coaching')}</option>
                  </Select>
                </Field>

                <Field label={t('Worked examples')} htmlFor="opt-examples">
                  <Select id="opt-examples" value={options.examples} onChange={event => setOption('examples', event.target.value as SiteOptions['examples'])}>
                    <option value="one">{t('One per chapter (default)')}</option>
                    <option value="two">{t('Two per chapter')}</option>
                    <option value="three">{t('Three per chapter')}</option>
                  </Select>
                </Field>

                <Field label={t('Chapter size')} htmlFor="opt-minutes">
                  <Select id="opt-minutes" value={String(options.minutes)} onChange={event => setOption('minutes', Number(event.target.value))}>
                    <option value="40">{t('40 minutes (default)')}</option>
                    <option value="25">{t('25 minutes')}</option>
                    <option value="60">{t('60 minutes')}</option>
                  </Select>
                </Field>
              </div>

              <Field
                label={t('Custom instructions (optional)')}
                htmlFor="opt-instructions"
                hint={t('These override the skill where they can; the schema, depth checks and bilingual rule still apply.')}
              >
                <Textarea
                  id="opt-instructions"
                  value={options.customInstructions}
                  maxLength={4000}
                  rows={3}
                  placeholder={t('e.g. Follow my professor’s notation; focus on the 2025 exam; no proofs, method plus one example per topic.')}
                  onChange={event => setOption('customInstructions', event.target.value)}
                />
              </Field>
            </div>

          </form>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('Generation')}</h2>
            <p className="text-xs text-muted-foreground">{t('These numbers come from the server before anything is queued.')}</p>
            {limits ? (
              <>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-md bg-muted/40 p-3 text-sm">
                  <dt className="text-muted-foreground">{t('Chapter target')}</dt>
                  <dd className="text-right font-mono text-foreground">{limits.target}</dd>
                  <dt className="text-muted-foreground">{t('Estimated time')}</dt>
                  <dd className="text-right font-mono text-foreground">~{Math.max(2, Math.ceil(limits.target * 1.1))} min</dd>
                  <dt className="text-muted-foreground">{t('Daily quota:')}</dt>
                  <dd className="text-right font-mono text-foreground">{remaining}</dd>
                </dl>
                <details className="rounded-md border border-border px-3 py-2">
                  <summary className="cursor-pointer text-xs font-medium text-foreground">{t('Token and source limits')}</summary>
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <dt className="text-muted-foreground">{t('words per chapter')}</dt>
                    <dd className="text-right font-mono text-foreground">{limits.limits.wordsPerChapter.min} + {limits.limits.wordsPerChapter.perNewTerm}</dd>
                    <dt className="text-muted-foreground">{t('tokens per chapter')}</dt>
                    <dd className="text-right font-mono text-foreground">{limits.limits.tokensPerChapter}</dd>
                    <dt className="text-muted-foreground">{t('source characters')}</dt>
                    <dd className="text-right font-mono text-foreground">{limits.sourceChars} / {limits.limits.sourceChars}</dd>
                  </dl>
                </details>
                {limits.overCap ? <Alert tone="warning">{t('This request is large. Split it, or raise the chapter target.')}</Alert> : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t('Add a topic or notes to see the estimate.')}</p>
            )}
            <Field label={t('Chapter target')} htmlFor="maxChapters" hint={t('Leave empty to derive it from the source topic count.')}>
              <Input
                id="maxChapters"
                type="number"
                min={limits?.limits.chapters.min ?? 6}
                max={limits?.limits.chapters.max ?? 180}
                value={form.maxChapters}
                placeholder={limits ? String(limits.target) : ''}
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
            <Button type="submit" form="new-site-form" className="w-full" loading={submitting} disabled={uploading} icon={<SparkIcon className="h-4 w-4" />}>
              {t('Generate site')}
            </Button>
            {suggestions.length ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={submitting || uploading}
                onClick={() => void submit(true)}
              >
                {t('Generate a new one anyway')}
              </Button>
            ) : null}
            <p className="text-xs text-muted-foreground">
              {t('Remaining today:')} <b className="font-mono text-foreground">{remaining}</b>. {t('Each generation is one book unit: chapter passes are free.')}
            </p>
            <p className="text-xs text-muted-foreground">{t('Uploads are saved as context; the generated site is routed, never downloadable.')}</p>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('Reuse before generating')}</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {t('The catalog is searched first. If an existing site already covers the need, open it or reuse it without spending a generation.')}
            </p>
            <Button variant="secondary" onClick={() => navigate('/catalog')}>{t('Open catalog')}</Button>
          </Card>

          {suggestions.length ? (
            <Card className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">{t('Similar sites already exist')}</h2>
              <p className="text-sm text-muted-foreground">{t('Open it, reuse it, or generate a new version anyway.')}</p>
              <SuggestionList sites={suggestions} onReuse={reuse} reusingId={reusingId} />
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
