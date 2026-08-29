import { cn } from '@/lib/utils';
import { forwardRef, type TextareaHTMLAttributes } from 'react';
import {
  FIELD_ERROR_TEXT,
  FIELD_HINT_TEXT,
  FIELD_INVALID,
  FIELD_LABEL,
  FIELD_SURFACE,
} from './field-styles';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  count?: { current: number; max: number };
}

/** iOS ko'p qatorli matn maydoni — Input bilan bir xil sirt va tipografiya. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, count, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {(label || count) && (
        <div className="flex items-end justify-between gap-3">
          {label && <label className={FIELD_LABEL}>{label}</label>}
          {count && (
            <span
              className={cn(
                'shrink-0 text-caption-1 tabular-nums',
                count.current > count.max * 0.96 ? 'text-rose-600' : 'text-slate-400',
              )}
            >
              {count.current} / {count.max}
            </span>
          )}
        </div>
      )}
      <textarea
        ref={ref}
        className={cn(
          FIELD_SURFACE,
          'resize-none px-4 py-3',
          error && FIELD_INVALID,
          className,
        )}
        {...props}
      />
      {error && <p className={FIELD_ERROR_TEXT}>{error}</p>}
      {hint && !error && <p className={FIELD_HINT_TEXT}>{hint}</p>}
    </div>
  ),
);

Textarea.displayName = 'Textarea';
