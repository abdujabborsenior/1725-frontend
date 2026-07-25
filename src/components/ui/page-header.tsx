import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** O'ngdagi asosiy amal (kapsula tugma va h.k.) */
  action?: ReactNode;
  /** Sarlavha ustidagi kichik rangli qator */
  eyebrow?: ReactNode;
  className?: string;
}

/**
 * iOS **Large Title** sarlavhasi — Pochta/Sozlamalar/App Store'dagi ekran
 * boshi naqshi: yirik qalin sarlavha chapda, ikkilamchi izoh ostida, amal
 * o'ngda. Barcha ichki sahifalar shu bitta naqshdan foydalanadi.
 */
export function PageHeader({ title, subtitle, action, eyebrow, className }: PageHeaderProps) {
  return (
    <header className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-footnote font-semibold uppercase tracking-[0.06em] text-accent-700">
            {eyebrow}
          </p>
        )}
        <h1 className="text-large-title font-bold tracking-tight text-brand-900">{title}</h1>
        {subtitle && <p className="mt-1 text-subhead text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 pt-1">{action}</div>}
    </header>
  );
}

/** iOS filtr chipi — kapsula; tanlanganda tint bilan to'ladi. */
export function FilterChip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'tappable inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-subhead font-medium transition-colors duration-150 ease-ios',
        active ? 'bg-accent-600 text-white' : 'bg-fill-tertiary text-slate-600',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** iOS bo'sh holat — belgi, sarlavha, izoh va ixtiyoriy amal. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-ios-2xl bg-white px-6 py-16 text-center', className)}>
      {icon && (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center text-slate-300 [&>svg]:h-full [&>svg]:w-full">
          {icon}
        </div>
      )}
      <p className="text-title-3 font-semibold text-brand-900">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-subhead text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
