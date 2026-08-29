import { cn } from '@/lib/utils';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

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
          {label && <label className="text-subhead font-medium text-slate-500">{label}</label>}
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
          'w-full resize-none rounded-ios-md border border-slate-200 bg-white px-4 py-3 text-body text-brand-900',
          'placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 ease-ios',
          'enabled:hover:border-slate-300',
          'focus:outline-none input-focus',
          error && 'border-rose-400 focus:border-rose-500',
          className,
        )}
        {...props}
      />
      {error && <p className="text-footnote text-rose-600">{error}</p>}
      {hint && !error && <p className="text-footnote text-slate-500">{hint}</p>}
    </div>
  ),
);

Textarea.displayName = 'Textarea';
