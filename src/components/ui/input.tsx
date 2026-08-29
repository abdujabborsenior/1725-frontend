import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * iOS matn maydoni.
 * - Yorliq KATTA HARFDA emas — iOS'da maydon yorlig'i oddiy jumla ko'rinishida.
 * - Matn 17px (iOS body). Bu bir vaqtning o'zida iPhone Safari'dagi fokus-zoom
 *   muammosini ham yopadi (16px dan kichik maydonda sahifa o'z-o'zidan kattayadi).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, rightIcon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-subhead font-medium text-slate-500">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center text-slate-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'h-12 w-full rounded-ios-md bg-white text-body text-brand-900 placeholder:text-slate-400',
            'border border-slate-200 transition-[border-color,box-shadow] duration-150 ease-ios',
            'enabled:hover:border-slate-300',
            'focus:outline-none input-focus',
            icon ? 'pl-11 pr-4' : 'px-4',
            rightIcon && 'pr-11',
            error &&
              'border-rose-400 focus:border-rose-500 focus:shadow-[0_0_0_4px_rgba(255,59,48,0.16)]',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-slate-400">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-footnote text-rose-600">{error}</p>}
      {hint && !error && <p className="text-footnote text-slate-500">{hint}</p>}
    </div>
  ),
);

Input.displayName = 'Input';
