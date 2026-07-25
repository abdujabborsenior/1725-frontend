'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { CloseCircleFill, Search } from '@/components/icons';
import { cn } from '@/lib/utils';

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onValueChange: (v: string) => void;
  /** O'ng tomonda "Bekor qilish" tugmasi (iOS naqshi) */
  onCancel?: () => void;
  cancelLabel?: string;
  containerClassName?: string;
}

/**
 * iOS **Search Field** (UISearchBar) — kulrang fill, ichkarida lupa,
 * matn kiritilganda tozalash uchun to'ldirilgan × belgisi.
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    { value, onValueChange, onCancel, cancelLabel = 'Bekor qilish', containerClassName, className, ...props },
    ref,
  ) => (
    <div className={cn('flex items-center gap-2.5', containerClassName)}>
      <div className="ios-search relative flex h-9 min-w-0 flex-1 items-center">
        <Search className="pointer-events-none absolute left-2.5 h-4 w-4 text-slate-400" />
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn(
            'h-full w-full min-w-0 bg-transparent pl-8 pr-8 text-body text-brand-900',
            'placeholder:text-slate-400 focus:outline-none',
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
            className="tappable absolute right-2 flex h-5 w-5 items-center justify-center text-slate-400"
          >
            <CloseCircleFill className="h-[18px] w-[18px]" />
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
