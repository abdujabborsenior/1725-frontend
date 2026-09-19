import { setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';

/**
 * Reyting bo'limi qobig'i. Metadata endi sahifaning o'zida (`generateMetadata`,
 * uch tilda) — bu yerdagi eski o'zbekcha `metadata` olib tashlandi.
 */
export default function LeaderboardLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  return <>{children}</>;
}
