'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, Lightbulb, Rocket, Trophy } from '@/components/icons';
import { LogoMark } from '@/components/brand/logo-mark';
import { cn } from '@/lib/utils';

/* ── Chap brend paneli (faqat lg+) ──────────────────────────────
   iOS/Apple ritmi: tinch to'q sirt, dekorativ nur/gradient YO'Q,
   yirik zich sarlavha va ilova-ikonkasi uslubidagi belgilar.      */
const HIGHLIGHTS = [
  { key: 'problems', icon: Lightbulb, tint: 'bg-amber-500' },
  { key: 'showcase', icon: Rocket, tint: 'bg-accent-500' },
  { key: 'rankings', icon: Trophy, tint: 'bg-iris-500' },
] as const;

export function AuthBrandPanel() {
  const t = useTranslations('auth.brand');
  return (
    <div className="brand-surface hidden lg:flex lg:w-[46%] xl:w-[42%]">
      <div className="flex w-full flex-col justify-between p-10 xl:p-14">
        {/* Logo */}
        <Link href="/" className="hv-logo tappable inline-flex items-center gap-2.5 self-start">
          <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-white">
            <LogoMark className="h-7 w-7" />
          </span>
          <span className="text-title-2 font-semibold tracking-tight text-white">MYMarkaz</span>
        </Link>

        {/* Sarlavha + xususiyatlar */}
        <div className="max-w-md">
          <h2 className="text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.03em] text-white xl:text-[2.75rem]">
            {t('title')}
          </h2>
          <p className="mt-4 text-callout leading-relaxed text-white/75">
            {t('text')}
          </p>

          <div className="mt-9 space-y-5">
            {HIGHLIGHTS.map(({ key, icon: Icon, tint }) => (
              <div key={key} className="flex items-start gap-3.5">
                <span
                  className={cn(
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-white',
                    tint,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-callout font-semibold text-white">{t(`highlights.${key}.title`)}</p>
                  <p className="mt-0.5 text-subhead leading-snug text-white/70">
                    {t(`highlights.${key}.text`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-subhead text-white/65">{t('secure')}</p>
      </div>
    </div>
  );
}

/* ── Orqaga qaytish (iOS nav bar) ─────────────────────────────────
   iOS'da har bir ekranda chap yuqorida orqaga boshqaruvi turadi. Auth
   sahifalariga foydalanuvchi ko'pincha o'zi xohlamasdan tushadi (tizimdan
   chiqish, mehmon holatida himoyalangan sahifa) — shuning uchun bosh
   sahifaga qaytish yo'li DOIM ko'rinadi va 44px tegish maydoniga ega. */
export function AuthHomeLink() {
  const t = useTranslations('auth');
  return (
    <Link
      href="/"
      className="tappable -ml-2 inline-flex h-11 w-fit items-center gap-0.5 rounded-full pl-1.5 pr-3.5 text-body font-medium text-accent-600 transition-colors duration-150 ease-ios hover:bg-accent-50 hover:text-accent-700"
    >
      <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={2.4} />
      {t('homeLink')}
    </Link>
  );
}

/* ── Mobil logo (brend panel ko'rinmaganda) ───────────────────── */
export function AuthMobileLogo() {
  return (
    <Link href="/" className="tappable mb-7 flex items-center justify-center gap-2.5 lg:hidden">
      <LogoMark className="h-10 w-10" />
      <span className="text-title-2 font-semibold tracking-tight text-brand-900">MYMarkaz</span>
    </Link>
  );
}

/* ── Standart auth kartasi — barcha sahifalar uchun yagona uslub ── */
export function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('w-full max-w-md', className)}>
      <AuthMobileLogo />
      <div className="rounded-ios-2xl bg-white p-6 shadow-card sm:p-8">
        <div className="mb-7">
          {eyebrow && (
            <p className="mb-1.5 text-footnote font-semibold uppercase tracking-[0.06em] text-accent-700">
              {eyebrow}
            </p>
          )}
          <h1 className="text-title-1 font-bold tracking-tight text-brand-900">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-subhead leading-relaxed text-slate-500">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
