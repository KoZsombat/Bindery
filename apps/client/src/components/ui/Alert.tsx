import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { AlertIcon, CheckIcon, SparkIcon } from '../icons';

type Tone = 'error' | 'success' | 'warning' | 'info';

const tones: Record<Tone, string> = {
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  info: 'border-border bg-muted text-foreground',
};

export function Alert({ tone = 'info', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const Icon = tone === 'success' ? CheckIcon : tone === 'info' ? SparkIcon : AlertIcon;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex items-start gap-2 rounded-lg border px-3 py-2 text-sm', tones[tone], className)}>
      <Icon className="mt-1 h-4 w-4 shrink-0" />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}
