'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { CloseCircleFill, Search } from '@/components/icons';
import { cn } from '@/lib/utils';
import { FIELD_ICON, FIELD_SIZE, FIELD_SURFACE } from './field-styles';

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onValueChange: (v: string) => void;
  /** O'ng tomonda "Bekor qilish" tugmasi (iOS naqshi) */
  onCancel?: () => void;
  cancelLabel?: string;
  containerClassName?: string;
}

/**
 * Sahifa qidiruv maydoni — sirti loyihaning boshqa BARCHA maydonlari bilan
 * bir xil (`field-styles.ts`): oq fon + hairline chegara.
 *
 * ⚠️ Ilgari bu maydon iOS'ning kulrang `fill` sirtida edi (`.ios-search`).
 * iOS'da u NAV BAR ichida (oq sirtda) turadi; bizda esa sahifa foni
 * `surface-soft` (#F2F2F7) — kulrang ustidagi kulrang maydon amalda
 * ko'rinmasdi (2026-08-29 direktivasi). Kulrang fill endi faqat chrome
 * boshqaruvlarida (navbar qidiruv tugmasi) qoladi.
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    { value, onValueChange, onCancel, cancelLabel = 'Bekor qilish', containerClassName, className, ...props },
    ref,
  ) => (
    <div className={cn('flex items-center gap-2.5', containerClassName)}>
      <div className="relative flex min-w-0 flex-1 items-center">
        <Search
          className={cn(
            'pointer-events-none absolute left-3.5 h-[18px] w-[18px]',
            FIELD_ICON,
          )}
        />
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn(
            FIELD_SURFACE,
            FIELD_SIZE.md,
            'pl-11 pr-11',
            '[&::-webkit-search-cancel-button]:appearance-none',
            className,
          )}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={() => onValueChange('')}
            aria-label="Tozalash"
            className={cn(
              'tappable absolute right-3 flex h-6 w-6 items-center justify-center rounded-full',
              'text-slate-500 transition-colors duration-150 hover:text-accent-700',
            )}
          >
            <CloseCircleFill className="h-[19px] w-[19px]" />
          </button>
        )}
      </div>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="tappable shrink-0 text-body text-accent-700"
        >
          {cancelLabel}
        </button>
      )}
    </div>
  ),
);

SearchField.displayName = 'SearchField';
