'use client';

import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}

/**
 * iOS **Switch** (UISwitch) — 51×31pt kapsula, yoqilganda systemGreen.
 * Tugmacha bosilganda bir oz cho'ziladi (iOS'dagi kabi).
 */
export function Switch({ checked, onChange, disabled, className, ...rest }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={rest['aria-label']}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'group relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-0.5',
        'transition-[background-color,filter] duration-250 ease-ios focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-500/25',
        'enabled:hover:brightness-95',
        checked ? 'bg-emerald-400' : 'bg-[rgba(120,120,128,0.16)]',
        disabled && 'opacity-40',
        className,
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-[27px] w-[27px] rounded-full bg-white',
          'shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.16)]',
          'transition-transform duration-250 ease-ios',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}
