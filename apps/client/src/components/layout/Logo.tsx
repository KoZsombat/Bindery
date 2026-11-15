import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

export function Logo({ to = '/app', className }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={cn('group flex min-w-0 items-center gap-2', className)} aria-label="Learning Book Builder">
      <img src="/logo.svg" alt="" className="h-9 w-9 shrink-0 rounded-md" width={36} height={36} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-display text-lg font-semibold text-foreground">Learning Book Builder</span>
        <span className="truncate text-xs font-medium uppercase tracking-widest text-muted-foreground">
          routed learning sites
        </span>
      </span>
    </Link>
  );
}
