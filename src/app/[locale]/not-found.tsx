import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ChevronRight } from '@/components/icons';
import { LogoMark } from '@/components/brand/logo-mark';

/** Tilga mos 404 (Next unga avtomatik `noindex` qo'yadi). */
export default function NotFound() {
  const t = useTranslations('notFound');
  // Next 404'ni O'Z qobig'ida (`<html id="__next_error__">`, `lang` siz) beradi —
  // shuning uchun til shu yerda e'lon qilinadi (skrinrider to'g'ri o'qiydi).
  const locale = useLocale();
  return (
    <div lang={locale} className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <LogoMark className="mx-auto mb-8 h-14 w-14" />

        <p className="text-[4rem] font-semibold leading-none tracking-[-0.03em] text-brand-900">
          404
        </p>
        <h1 className="mt-3 text-title-2 font-semibold text-brand-900">{t('title')}</h1>
        <p className="mt-2 text-callout leading-relaxed text-slate-500">{t('text')}</p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/"
            className="tappable flex h-[50px] min-w-[180px] items-center justify-center rounded-full bg-accent-600 px-7 text-body font-medium text-white active:bg-accent-700"
          >
            {t('home')}
          </Link>
          <Link
            href="/startups"
            className="tappable inline-flex items-center gap-0.5 text-body font-medium text-accent-700"
          >
            {t('startups')}
            <ChevronRight className="h-[15px] w-[15px]" strokeWidth={3} />
          </Link>
        </div>
      </div>
    </div>
  );
}
