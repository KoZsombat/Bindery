import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent' | 'brand';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground border border-primary hover:opacity-90',
  secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-muted',
  outline: 'bg-card text-foreground border border-border hover:bg-muted',
  ghost: 'bg-transparent text-foreground border border-transparent hover:bg-muted',
  danger: 'bg-destructive text-destructive-foreground border border-destructive hover:opacity-90',
  accent: 'bg-accent text-accent-foreground border border-accent hover:opacity-90',
  brand: 'bg-transparent text-brand-foreground border border-brand-foreground/25 hover:bg-brand-foreground/10',
};

/** One control height everywhere: every button matches Input and Select. */
export function buttonStyles(variant: Variant = 'primary', className?: string): string {
  return cn(
    'inline-flex h-10 select-none items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    className
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', loading = false, icon, className, children, disabled, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonStyles(variant, className)}
      {...props}
    >
      {loading ? <Spinner className="h-4 w-4" /> : icon}
      {children}
    </button>
  );
});

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  icon?: ReactNode;
}

/** Anchor styled exactly like Button, without nesting interactive elements. */
export function ButtonLink({ variant = 'primary', icon, className, children, ...props }: ButtonLinkProps) {
  return (
    <a className={buttonStyles(variant, className)} {...props}>
      {icon}
      {children}
    </a>
  );
}
