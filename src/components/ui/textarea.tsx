import { cn } from '@/lib/utils';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  count?: { current: number; max: number };
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, count, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {(label || count) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {label}
            </label>
          )}
          {count && (
            <span
              className={cn(
                'text-[11px]',
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
          'w-full rounded-xl bg-white border border-slate-200 hover:border-slate-300 px-4 py-3 text-sm text-brand-900',
          'placeholder:text-slate-400 focus:outline-none input-focus transition-all duration-150 resize-none',
          error && 'border-rose-400',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  ),
);

Textarea.displayName = 'Textarea';
