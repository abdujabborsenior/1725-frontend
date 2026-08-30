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
        // Tanlangan chip — to'ldirilgan brend kapsulasi + rangdosh nur;
        // tanlanmagani hover'da KULRANGDAN kulrangga emas, tintga o'tadi.
        // Tanlangan chip — to'ldirilgan brend kapsulasi. Tanlanmagani esa
        // KULRANG PLOMBA emas, oq sirt + hairline: sahifada 10-15 chip yonma-yon
        // turganda kulrang plombalar butun ekranni "kulrang" qilib ko'rsatardi;
        // oq kapsulalar tinch turadi va tanlangani yaqqol ajraladi.
        active
          ? 'hv-sheen bg-accent-600 text-white shadow-[0_4px_12px_-4px_rgba(0,113,227,0.5)] hover:shadow-[0_8px_20px_-8px_rgba(0,113,227,0.8)]'
          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-accent-50 hover:text-accent-700 hover:ring-accent-200',
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
        /* Kulrang (slate-300) belgi "yarim o'chgan" ko'rinardi — endi brend
           tintidagi yumshoq kvadrat: bo'sh holat ham mahsulotning bir qismi. */
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-ios-lg bg-accent-50 text-accent-500 [&>svg]:h-7 [&>svg]:w-7">
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
