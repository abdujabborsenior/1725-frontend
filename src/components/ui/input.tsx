import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';
import {
  FIELD_ERROR_TEXT,
  FIELD_HINT_TEXT,
  FIELD_ICON,
  FIELD_INVALID,
  FIELD_LABEL,
  FIELD_SIZE,
  FIELD_SURFACE,
} from './field-styles';

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
 * - Sirt `field-styles.ts` dan — butun loyihada maydonlar bir xil.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, rightIcon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className={FIELD_LABEL}>{label}</label>}
      <div className="relative">
        {icon && (
          <span
            className={cn(
              'pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center',
              FIELD_ICON,
            )}
          >
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            FIELD_SURFACE,
            FIELD_SIZE.md,
            icon && 'pl-11',
            rightIcon && 'pr-11',
            error && FIELD_INVALID,
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span
            className={cn(
              'absolute right-3 top-1/2 flex -translate-y-1/2 items-center',
              FIELD_ICON,
            )}
          >
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className={FIELD_ERROR_TEXT}>{error}</p>}
      {hint && !error && <p className={FIELD_HINT_TEXT}>{hint}</p>}
    </div>
  ),
);

Input.displayName = 'Input';
