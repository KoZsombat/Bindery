import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}
interface ToastValue {
  push: (kind: ToastKind, message: string) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

const styles: Record<ToastKind, string> = {
  success: 'border-success/40 bg-card text-foreground',
  error: 'border-destructive/50 bg-card text-foreground',
  info: 'border-border bg-card text-foreground',
};

const marks: Record<ToastKind, string> = { success: '✓', error: '!', info: 'i' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = nextId.current++;
    setItems(current => [...current, { id, kind, message }]);
    window.setTimeout(() => {
      setItems(current => current.filter(item => item.id !== id));
    }, 4500);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
        {items.map(item => (
          <div
            key={item.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg',
              styles[item.kind]
            )}
          >
            <span
              className={cn(
                'mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                item.kind === 'success' && 'bg-success text-background',
                item.kind === 'error' && 'bg-destructive text-destructive-foreground',
                item.kind === 'info' && 'bg-secondary text-secondary-foreground'
              )}
              aria-hidden="true"
            >
              {marks[item.kind]}
            </span>
            <span className="min-w-0 break-words">{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}
