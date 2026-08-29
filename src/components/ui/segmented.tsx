'use client';

import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Ixtiyoriy hisob — yorliqdan keyin kichik raqam */
  count?: number;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Ekranga to'la yoyilsin (iOS: odatda shunday) */
  fullWidth?: boolean;
  'aria-label'?: string;
  className?: string;
}

/**
 * iOS **Segmented Control** (UISegmentedControl).
 * Kulrang fill ustidagi oq "kapsula" tanlangan bandni ko'rsatadi.
 * Variantlar sig'masa — kesilmaydi, gorizontal suriladi.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  fullWidth = true,
  className,
  ...rest
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={rest['aria-label']}
      className={cn(
        // Har doim blok-flex: inline-flex bo'lsa oldingi matn qatoriga yopishib qolardi
        'segmented no-scrollbar flex max-w-full overflow-x-auto',
        fullWidth && 'w-full',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'segment shrink-0 whitespace-nowrap',
              active ? 'segment-active' : 'text-slate-600',
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={cn('ml-1.5 tabular-nums', active ? 'text-slate-500' : 'text-slate-600')}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
