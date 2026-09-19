import { redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';

/** Tur tanlash vaqtincha o'chiq — hamma standart ro'yxatdan o'tadi (joriy tilda). */
export default function Page({ params: { locale } }: { params: { locale: AppLocale } }) {
  redirect({ href: '/register', locale });
}
