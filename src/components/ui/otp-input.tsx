'use client';

import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
}

export function OtpInput({ value, onChange, length = 6, error }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  function handleChange(index: number, char: string) {
    if (!/^\d*$/.test(char)) return;
    const next = [...digits];
    next[index] = char.slice(-1);
    onChange(next.join(''));
    if (char && index < length - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < length - 1) refs.current[index + 1]?.focus();
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(text.padEnd(length, '').slice(0, length));
    const focusIdx = Math.min(text.length, length - 1);
    refs.current[focusIdx]?.focus();
  }

  return (
    <div className="flex items-center gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            // iOS kod maydoni — kvadratga yaqin, yumaloq, yirik raqam
            'h-14 w-12 rounded-ios-md border bg-white text-center text-title-2 font-semibold tabular-nums',
            'transition-[border-color,box-shadow,background-color] duration-150 ease-ios focus:outline-none',
            error
              ? 'border-rose-400 text-rose-600 focus:border-rose-500 focus:shadow-[0_0_0_4px_rgba(255,59,48,0.16)]'
              : 'border-slate-200 text-brand-900 focus:border-accent-500 focus:shadow-[0_0_0_4px_rgba(0,122,255,0.18)]',
            d && !error && 'border-accent-500 bg-accent-50 text-accent-700',
          )}
        />
      ))}
    </div>
  );
}
