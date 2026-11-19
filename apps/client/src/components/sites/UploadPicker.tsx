import { useRef, type ChangeEvent } from 'react';
import { useI18n } from '../../context/I18nContext';
import { formatNumber } from '../../lib/format';
import { FileIcon, UploadIcon, XIcon } from '../icons';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

export interface PickedFile {
  key: string;
  name: string;
  id?: number;
  chars?: number;
  uploading: boolean;
  error?: string;
}

export function UploadPicker({
  files,
  onSelect,
  onRemove,
  disabled,
}: {
  files: PickedFile[];
  onSelect: (files: File[]) => void;
  onRemove: (key: string) => void;
  disabled?: boolean;
}) {
  const { t, lang } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const full = files.length >= 6;

  function change(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files || []);
    if (picked.length) onSelect(picked);
    event.target.value = '';
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={change}
          accept=".pdf,.txt,.md,.markdown,.csv,.json,.tex,.js,.html,.css"
          disabled={disabled || full}
        />
        <Button
          type="button"
          variant="outline"
          icon={<UploadIcon className="h-4 w-4" />}
          onClick={() => inputRef.current?.click()}
          disabled={disabled || full}
        >
          {t('Add files')}
        </Button>
        <span className="text-xs text-muted-foreground">{t('PDF, TXT, MD, CSV, JSON, TEX, JS, HTML, CSS · max 6 × 8 MB')}</span>
      </div>

      {files.length ? (
        <ul className="flex flex-wrap gap-2">
          {files.map(file => (
            <li
              key={file.key}
              className="inline-flex max-w-full items-center gap-2 rounded-md border border-border bg-muted px-2 py-1 text-xs text-foreground"
            >
              {file.uploading ? <Spinner className="h-3.5 w-3.5" /> : <FileIcon className="h-3.5 w-3.5 text-muted-foreground" />}
              <span className="max-w-48 truncate">{file.name}</span>
              {typeof file.chars === 'number' ? (
                <span className="text-muted-foreground">{formatNumber(file.chars, lang)}</span>
              ) : null}
              {file.error ? <span className="text-destructive">{file.error}</span> : null}
              <button
                type="button"
                onClick={() => onRemove(file.key)}
                className="rounded-md  p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                aria-label={t('Remove file')}
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
