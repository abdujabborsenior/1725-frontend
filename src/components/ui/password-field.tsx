'use client';

import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react';
import { CheckCircleFill, Eye, EyeOff, Lock } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  FIELD_ERROR_TEXT,
  FIELD_HINT_TEXT,
  FIELD_ICON,
  FIELD_INVALID,
  FIELD_LABEL,
  FIELD_SIZE,
  FIELD_SURFACE,
} from './field-styles';

/* ── Parol talablari — YAGONA manba ──────────────────────────────────────
   Backend `pwd` sxemasi bilan bir xil: 8+ belgi, katta harf, raqam, maxsus
   belgi. Ro'yxat shu yerda turadi — forma sxemalari va jonli ko'rsatkich
   ikkalasi ham shundan foydalanadi, ya'ni ular hech qachon ajralib
   ketmaydi.                                                              */
export const PASSWORD_RULES = [
  { id: 'len', label: '8+ belgi', test: (v: string) => v.length >= 8 },
  { id: 'upper', label: 'Katta harf', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'digit', label: 'Raqam', test: (v: string) => /[0-9]/.test(v) },
  { id: 'special', label: 'Maxsus belgi', test: (v: string) => /[!@#$%^&*]/.test(v) },
] as const;

export function isPasswordValid(v: string) {
  return PASSWORD_RULES.every((r) => r.test(v));
}

/**
 * Parol talablarining JONLI ko'rsatkichi.
 *
 * Foydalanuvchi yozayotganda darhol nima yetishmayotganini ko'radi —
 * "Ro'yxatdan o'tish" bosilishini kutmaydi (2026-08-29 direktivasi).
 * Bajarilgan shart yashil ✓ oladi, bajarilmagani tinch kulrang bo'lib
 * turadi; forma xato bergandan keyin esa qolganlari qizil bo'ladi.
 */
export function PasswordRules({
  value,
  invalid = false,
  className,
  id,
}: {
  value: string;
  invalid?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <ul
      id={id}
      aria-live="polite"
      className={cn('flex flex-wrap gap-1.5', className)}
    >
      {PASSWORD_RULES.map((r) => {
        const ok = r.test(value);
        return (
          <li
            key={r.id}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption-1 transition-colors duration-150 ease-ios',
              ok
                ? 'bg-emerald-50 text-emerald-700'
                : invalid
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-fill-tertiary text-slate-600',
            )}
          >
            {ok ? (
              <CheckCircleFill className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : (
              <span
                className={cn(
                  'h-[7px] w-[7px] shrink-0 rounded-full',
                  invalid ? 'bg-rose-400' : 'bg-slate-300',
                )}
                aria-hidden
              />
            )}
            <span className="sr-only">{ok ? 'Bajarildi:' : 'Kerak:'}</span>
            {r.label}
          </li>
        );
      })}
    </ul>
  );
}

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
  error?: string;
  hint?: string;
  /** Jonli talablar ro'yxati (ro'yxatdan o'tish / parol tiklash) */
  rules?: boolean;
  /** `rules` bilan birga — ko'rsatkich uchun joriy qiymat (controlled bo'lmasa) */
  ruleValue?: string;
};

/**
 * Parol maydoni — butun loyihada YAGONA (login, register, parol tiklash).
 *
 * ⚠️ `autoComplete` MAJBURIY (default `new-password`): busiz brauzer parol
 * maydoniga saqlangan EMAIL manzilini to'ldirib qo'yardi (2026-08-29 xato
 * hisoboti) — parol maydoni `name="password"` bo'lsa ham brauzer uni
 * "hisob maydoni" deb hisoblaydi. Kirish formasida `current-password`,
 * yangi parol yaratishda `new-password` beriladi.
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      label = 'Parol',
      error,
      hint,
      rules = false,
      ruleValue,
      className,
      autoComplete = 'new-password',
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [show, setShow] = useState(false);
    // Yozayotgan paytda qolgan shartlar QIZIL bo'lmaydi (odam hali yozyapti) —
    // ular maydondan chiqilgandan keyin yoki forma xato berganda qizaradi.
    const [focused, setFocused] = useState(false);
    // Jonli ko'rsatkich uchun qiymat: controlled bo'lsa propdan, aks holda
    // maydonning o'zidan (react-hook-form `register()` uncontrolled ishlaydi).
    const [typed, setTyped] = useState('');
    const rulesId = useId();
    const value = ruleValue ?? (props.value !== undefined ? String(props.value) : typed);

    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className={FIELD_LABEL}>{label}</label>}
        <div className="relative">
          <Lock
            className={cn(
              'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2',
              FIELD_ICON,
            )}
          />
          <input
            ref={ref}
            type={show ? 'text' : 'password'}
            autoComplete={autoComplete}
            aria-invalid={error ? true : undefined}
            aria-describedby={rules ? rulesId : undefined}
            onChange={(e) => {
              if (ruleValue === undefined && props.value === undefined) setTyped(e.target.value);
              onChange?.(e);
            }}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              // RHF `register()` ning onBlur'i — validatsiya uchun SHART
              onBlur?.(e);
            }}
            className={cn(
              FIELD_SURFACE,
              FIELD_SIZE.md,
              'pl-11 pr-12',
              // Yozayotganda maydon QIZARMAYDI — xato belgisi maydondan
              // chiqilgandan keyin (yoki forma yuborilganda) ko'rinadi.
              error && !focused && FIELD_INVALID,
              className,
            )}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Parolni yashirish' : "Parolni ko'rsatish"}
            className="tappable absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors duration-150 hover:text-slate-700"
          >
            {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>

        {rules ? (
          <PasswordRules id={rulesId} value={value} invalid={!!error && !focused} className="mt-0.5" />
        ) : (
          error && <p className={FIELD_ERROR_TEXT}>{error}</p>
        )}
        {!rules && hint && !error && <p className={FIELD_HINT_TEXT}>{hint}</p>}
      </div>
    );
  },
);

PasswordField.displayName = 'PasswordField';
