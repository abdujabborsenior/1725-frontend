'use client';

import { useTranslations } from 'next-intl';
import { PLATFORM_ORDER, PLATFORM_META } from '@/lib/constants';
import { PlatformIcon } from './platform';
import { CheckCircleFill, Spinner } from '@/components/icons';
import type { PlatformType } from '@/types';
import type { AutofillState, FilledField } from './use-link-autofill';
import { cn } from '@/lib/utils';

export type LinkValues = Record<PlatformType, string>;

export const EMPTY_LINKS: LinkValues = {
  website: '',
  ios: '',
  android: '',
  telegram_bot: '',
  other: '',
};

/*
 * Har bir maydonning nomi va tushunarli namunasi (foydalanuvchi nima yozishni
 * biladi) — lug'atda: `startupForm.links.label.<type>` / `links.placeholder.<type>`.
 */

/**
 * Foydalanuvchi yozgan matnni to'g'ri havolaga aylantiradi.
 * `https://` yozish SHART EMAS — o'zi qo'shiladi; Telegram uchun `@nom` ham
 * qabul qilinadi. Havola noto'g'ri bo'lsa `null` qaytadi.
 */
export function normalizeUrl(input: string, type: PlatformType): string | null {
  let v = input.trim();
  if (!v) return null;
  if (type === 'telegram_bot' && v.startsWith('@')) v = `t.me/${v.slice(1)}`;
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    const u = new URL(v);
    // Hech bo'lmasa bitta nuqtali domen bo'lishi kerak (masalan "abc" — havola emas)
    if (!u.hostname.includes('.') || u.hostname.startsWith('.') || u.hostname.endsWith('.')) {
      return null;
    }
    return u.pathname === '/' && !u.search && !u.hash ? `${u.protocol}//${u.host}` : u.toString();
  } catch {
    return null;
  }
}

/** Mavjud startapning havolalarini maydonlarga yoyadi (tahrirlash rejimi). */
export function linksFromPlatforms(
  platforms: { type: PlatformType; url: string }[] | undefined,
): LinkValues {
  const v = { ...EMPTY_LINKS };
  for (const p of platforms ?? []) if (!v[p.type]) v[p.type] = p.url;
  return v;
}

/** Maydonlarni backend kutadigan ro'yxatga aylantiradi (bo'shlari tashlanadi). */
export function platformsFromLinks(values: LinkValues): { type: PlatformType; url: string }[] {
  const out: { type: PlatformType; url: string }[] = [];
  for (const type of PLATFORM_ORDER) {
    const url = normalizeUrl(values[type], type);
    if (url) out.push({ type, url });
  }
  return out;
}

/** Qaysi maydonlar noto'g'ri to'ldirilgan (bo'sh emas, lekin havola emas). */
export function invalidLinks(values: LinkValues): PlatformType[] {
  return PLATFORM_ORDER.filter((t) => values[t].trim() !== '' && !normalizeUrl(values[t], t));
}

/** Gap bosh harf bilan boshlanadi (o'zbekchada ro'yxat gap boshida turadi). */
function upperFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Havola maydonlari — iOS Sozlamalar/Kontaktlar uslubidagi guruhlangan ro'yxat.
 *
 * Eski oqim ("tur tanla → havolani yoz → «Qo'shish» tugmasini bos") oddiy
 * foydalanuvchi uchun tushunarsiz edi. Endi har bir platformaning O'Z nomli
 * maydoni bor: yozdingiz — tayyor, alohida tugma yo'q, hammasi forma bilan
 * birga saqlanadi.
 */
export function LinkFields({
  values,
  onChange,
  autofill,
  onFieldBlur,
}: {
  values: LinkValues;
  onChange: (v: LinkValues) => void;
  /** Havoladan avtomatik to'ldirish holati (qatordagi belgi uchun). */
  autofill?: AutofillState;
  /** Maydondan chiqilganda — avtomatik to'ldirishni darhol boshlash. */
  onFieldBlur?: (type: PlatformType) => void;
}) {
  const t = useTranslations('startupForm');
  const bad = invalidLinks(values);

  /** «logo, muqova va nom» — nima to'ldirilganini joriy tilda aytadi. */
  function describeFilled(filled: FilledField[]): string {
    const parts = filled.map((f) => t(`links.field.${f}`));
    if (parts.length <= 1) return parts[0] ?? '';
    if (parts.length === 2) return t('links.listTwo', { a: parts[0], b: parts[1] });
    return t('links.listMany', {
      head: parts.slice(0, -1).join(', '),
      last: parts[parts.length - 1],
    });
  }

  return (
    <div>
      <div className="ios-list" style={{ ['--row-inset' as string]: '3.25rem' }}>
        {PLATFORM_ORDER.map((type) => {
          const isBad = bad.includes(type);
          return (
            <div key={type} className="ios-row items-center">
              <span
                className={cn(
                  'flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px] text-white',
                  PLATFORM_META[type].badgeClass.split(' ')[0],
                )}
              >
                <PlatformIcon type={type} className="h-[15px] w-[15px]" />
              </span>
              <label className="w-[104px] shrink-0 whitespace-nowrap text-body text-brand-900" htmlFor={`link-${type}`}>
                {t(`links.label.${type}`)}
              </label>
              <input
                id={`link-${type}`}
                type="text"
                inputMode="url"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={values[type]}
                onChange={(e) => onChange({ ...values, [type]: e.target.value })}
                onBlur={() => onFieldBlur?.(type)}
                placeholder={t(`links.placeholder.${type}`)}
                className={cn(
                  'min-w-0 flex-1 bg-transparent text-right text-body placeholder:text-slate-500 focus:outline-none',
                  isBad ? 'text-rose-600' : 'text-slate-600',
                )}
              />
              {/* Avtomatik to'ldirish — jim ishlaydi, faqat holatini bildiradi */}
              {autofill?.type === type && autofill.status === 'loading' && (
                <Spinner
                  className="h-4 w-4 shrink-0 animate-spin text-accent-500"
                  aria-label={t('links.fetching')}
                />
              )}
              {autofill?.type === type && autofill.status === 'done' && (
                <CheckCircleFill
                  className="h-[18px] w-[18px] shrink-0 text-accent-500"
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="px-4 pt-2 text-footnote text-slate-500" aria-live="polite">
        {bad.length > 0 ? (
          <span className="text-rose-600">
            {t('links.invalid')}
          </span>
        ) : autofill?.status === 'loading' ? (
          t('links.searching')
        ) : autofill?.status === 'done' ? (
          <span className="text-accent-600">
            {upperFirst(t('links.filled', { items: describeFilled(autofill.filled) }))}
          </span>
        ) : (
          t('links.idle')
        )}
      </p>
    </div>
  );
}
