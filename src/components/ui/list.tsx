'use client';

import Link from 'next/link';
import { ChevronRight } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * iOS **Inset Grouped List** — Sozlamalar/Kontaktlar ilovasidagi ro'yxat naqshi.
 *
 *   <ListGroup header="Hisob">
 *     <ListRow icon={<Bell/>} title="Bildirishnomalar" href="/notifications" />
 *     <ListRow title="Til" value="O'zbekcha" />
 *   </ListGroup>
 *
 * Qatorlar orasidagi ajratkich matn boshlanadigan joydan (inset) chiziladi —
 * bu aynan iOS'ning o'zi.
 */
export function ListGroup({
  header,
  footer,
  children,
  className,
}: {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {header && <h2 className="ios-section-header">{header}</h2>}
      <div className="ios-list">{children}</div>
      {footer && <p className="px-4 pt-2 text-footnote text-slate-500">{footer}</p>}
    </section>
  );
}

interface ListRowProps {
  /** Chapdagi belgi — iOS'da rangli kvadrat ichida */
  icon?: ReactNode;
  /** Belgi kvadratining foni (iOS system rang klassi, masalan `bg-accent-500`) */
  iconClass?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** O'ngdagi ikkilamchi qiymat */
  value?: ReactNode;
  /** O'ngdagi ixtiyoriy element (Switch va h.k.) — chevron o'rniga */
  accessory?: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Destruktiv amal — yorliq qizil (iOS) */
  destructive?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ListRow({
  icon,
  iconClass,
  title,
  subtitle,
  value,
  accessory,
  href,
  onClick,
  destructive,
  disabled,
  className,
}: ListRowProps) {
  const interactive = !!(href || onClick);

  const inner = (
    <>
      {icon && (
        <span
          className={cn(
            'flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px] text-white',
            iconClass ?? 'bg-slate-400',
          )}
        >
          <span className="flex h-[17px] w-[17px] items-center justify-center [&>svg]:h-full [&>svg]:w-full">
            {icon}
          </span>
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-body',
            destructive ? 'text-rose-600' : 'text-brand-900',
          )}
        >
          {title}
        </span>
        {subtitle && (
          <span className="mt-0.5 block truncate text-footnote text-slate-500">{subtitle}</span>
        )}
      </span>
      {value !== undefined && value !== null && (
        <span className="shrink-0 truncate text-body text-slate-500">{value}</span>
      )}
      {accessory}
      {interactive && !accessory && (
        <ChevronRight className="ios-chevron h-[15px] w-[15px] shrink-0 text-slate-300" strokeWidth={3} />
      )}
    </>
  );

  const rowClass = cn('ios-row w-full text-left', disabled && 'opacity-40', className);

  if (href && !disabled) {
    return (
      <Link href={href} className={rowClass}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className={rowClass}>
        {inner}
      </button>
    );
  }
  return <div className={rowClass}>{inner}</div>;
}
