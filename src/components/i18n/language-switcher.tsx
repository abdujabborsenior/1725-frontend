'use client';

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Language } from '@/components/icons';
import { usePathname } from '@/i18n/navigation';
import { LANGUAGE_WORDS, LOCALE_META, LOCALES, localizePath } from '@/i18n/locales';
import type { AppLocale } from '@/i18n/routing';
import { switchLocale } from '@/i18n/switch-locale';
import { cn } from '@/lib/utils';

/**
 * Bitta til qatori — HAQIQIY havola (`<a hrefLang lang>`):
 *  · JavaScript'siz ham ishlaydi, o'rta tugma bilan yangi oynada ochiladi;
 *  · qidiruv tizimi boshqa til versiyalarini havola orqali ham topadi;
 *  · `lang` — ekran o'quvchi endonimni o'z talaffuzida o'qiydi.
 * Bosilganda tanlov eslab qolinadi va sahifa so'rov parametrlari bilan
 * birga shu tilda ochiladi (`switchLocale`).
 */
function LocaleOption({
  target,
  current,
  pathname,
  compact,
  onPicked,
  role,
}: {
  target: AppLocale;
  current: AppLocale;
  pathname: string;
  compact?: boolean;
  onPicked?: () => void;
  role?: 'menuitemradio';
}) {
  const meta = LOCALE_META[target];
  const selected = target === current;

  return (
    <a
      href={localizePath(target, pathname)}
      hrefLang={target}
      lang={target}
      role={role}
      aria-checked={role ? selected : undefined}
      aria-current={!role && selected ? 'true' : undefined}
      onClick={(e) => {
        // Yangi oyna/tab uchun brauzer xulqi saqlanadi
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        onPicked?.();
        if (!selected) switchLocale(target, pathname);
      }}
      className={cn(
        'flex w-full items-center gap-3 text-left outline-none focus-visible:bg-accent-50',
        // `.ios-list` qator ajratkichi ham `::before` — `hv-row` relsi bilan
        // to'qnashmasin: ro'yxat ko'rinishida faqat `ios-row` (o'z hover'i bor)
        compact ? 'ios-row' : 'hv-row px-3.5 py-2.5',
      )}
    >
      {/* Monogramma — bayroq o'rniga (bayroq davlatni bildiradi, tilni emas) */}
      <span
        aria-hidden
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-caption-1 font-semibold tracking-wide',
          selected ? 'bg-accent-600 text-white' : 'bg-fill-tertiary text-slate-600',
        )}
      >
        {meta.short}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-body leading-tight',
            selected ? 'font-semibold text-accent-700' : 'text-brand-900',
          )}
        >
          {meta.name}
        </span>
        {/* Shu tildagi shior — sayt tanlanadigan tilda qanday "eshitilishi" */}
        <span className="mt-0.5 block truncate text-footnote text-slate-500">
          {meta.tagline}
        </span>
      </span>
      {selected && <Check aria-hidden className="h-[18px] w-[18px] shrink-0 text-accent-600" strokeWidth={2.6} />}
    </a>
  );
}

/**
 * Navbar'dagi til tugmasi + menyu (desktop).
 * Semantika: `menu` + `menuitemradio` (bir nechta variantdan bittasi tanlangan),
 * ↑/↓/Home/End bilan yurish, Esc — yopish va fokus tugmaga qaytadi.
 */
export function LanguageMenuButton({ className }: { className?: string }) {
  const t = useTranslations('lang');
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Ochilganda fokus joriy tilga (klaviatura foydalanuvchisi qayerdaligini bilsin)
    const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]');
    const current = Array.from(items ?? []).find((el) => el.getAttribute('aria-checked') === 'true');
    (current ?? items?.[0])?.focus();

    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function onMenuKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [],
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (e.key === 'ArrowDown') next = (index + 1) % items.length;
    else if (e.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    else if (e.key === 'Tab') setOpen(false);
    if (next >= 0) {
      e.preventDefault();
      items[next]?.focus();
    }
  }

  return (
    <div ref={wrapRef} className={cn('relative shrink-0', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('change', { name: LOCALE_META[locale].name })}
        className={cn(
          'tappable hv-pop flex h-9 items-center gap-1 rounded-full px-2.5 text-subhead font-semibold',
          open ? 'bg-accent-50 text-accent-700' : 'text-slate-600',
        )}
      >
        <Language aria-hidden className="h-[19px] w-[19px]" />
        <span className="tabular-nums tracking-wide">{LOCALE_META[locale].short}</span>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={t('label')}
          onKeyDown={onMenuKeyDown}
          className="material-menu absolute right-0 z-50 mt-2 w-[272px] origin-top-right animate-scale-in overflow-hidden rounded-ios-lg py-1.5 shadow-modal ring-1 ring-black/[0.06]"
        >
          {/* Uch tildagi sarlavha — qaysi tilni bilmasin, odam o'z so'zini topadi */}
          <p aria-hidden className="px-3.5 pb-1.5 pt-1 text-caption-1 font-medium text-slate-500">
            {LANGUAGE_WORDS}
          </p>
          {LOCALES.map((l) => (
            <LocaleOption
              key={l}
              target={l}
              current={locale}
              pathname={pathname}
              role="menuitemradio"
              onPicked={() => setOpen(false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Ro'yxat ko'rinishi — mobil menyu va sozlamalar uchun (iOS inset grouped).
 */
export function LanguageList({ onPicked }: { onPicked?: () => void }) {
  const t = useTranslations('lang');
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();

  return (
    <nav aria-label={t('label')}>
      <p className="px-4 pb-2 text-footnote text-slate-500">{LANGUAGE_WORDS}</p>
      <div className="ios-list">
        {LOCALES.map((l) => (
          <LocaleOption
            key={l}
            target={l}
            current={locale}
            pathname={pathname}
            compact
            onPicked={onPicked}
          />
        ))}
      </div>
    </nav>
  );
}

/**
 * Footer'dagi til havolalari — joriy sahifaning boshqa til versiyalariga
 * to'g'ridan-to'g'ri `hrefLang` havolalar (qidiruv tizimi uchun ham signal).
 */
export function FooterLanguages({ className }: { className?: string }) {
  const t = useTranslations('lang');
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();

  return (
    <nav aria-label={t('label')} className={cn('flex flex-wrap items-center gap-x-1 gap-y-2', className)}>
      <Language aria-hidden className="mr-1 h-[18px] w-[18px] text-white/70" />
      {LOCALES.map((l, i) => {
        const selected = l === locale;
        return (
          <span key={l} className="flex items-center">
            {i > 0 && <span aria-hidden className="mx-1.5 text-white/40">·</span>}
            <a
              href={localizePath(l, pathname)}
              hrefLang={l}
              lang={l}
              aria-current={selected ? 'true' : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                e.preventDefault();
                if (!selected) switchLocale(l, pathname);
              }}
              className={cn(
                'footer-link text-subhead',
                selected ? 'font-semibold text-white' : 'font-medium',
              )}
            >
              {LOCALE_META[l].name}
            </a>
          </span>
        );
      })}
    </nav>
  );
}
