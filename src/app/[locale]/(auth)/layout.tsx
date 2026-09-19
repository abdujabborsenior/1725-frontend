import { setRequestLocale } from 'next-intl/server';
import { AuthBrandPanel, AuthHomeLink } from '@/components/auth/auth-shell';
import { NextCapture } from '@/components/auth/next-capture';
import { LanguageMenuButton } from '@/components/i18n/language-switcher';
import type { AppLocale } from '@/i18n/routing';
import { Scope } from '@/i18n/scope';

export default function AuthLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  return (
    <Scope name="auth">
      <div className="flex min-h-screen bg-surface-soft">
        {/* ?next= ni saqlaymiz — auth tugagach maqsad sahifasiga qaytish uchun */}
        <NextCapture />
        {/* Chap: brend showcase (lg+) */}
        <AuthBrandPanel />

        {/* O'ng: forma maydoni — iOS'da fon tinch va tekis (dekor nur yo'q) */}
        <div className="relative flex flex-1 flex-col px-4 py-5 sm:px-6">
          {/*
            iOS navigatsiya paneli naqshi: ekranning chap yuqorisida ORQAGA
            boshqaruvi. Bu sahifalarga foydalanuvchi ko'pincha "otilib" keladi
            (tizimdan chiqish, mehmon holatida himoyalangan sahifa) — chiqish
            yo'li doim ko'rinib turishi kerak, aks holda sahifa tuzoqqa
            aylanadi. Barcha auth sahifalari uchun BITTA joyda.
          */}
          <div className="flex items-center justify-between gap-3">
            <AuthHomeLink />
            {/* Til — auth sahifalarida navbar yo'q, shuning uchun shu yerda */}
            <LanguageMenuButton />
          </div>

          <div className="flex flex-1 items-center justify-center py-6">
            <div className="flex w-full justify-center">{children}</div>
          </div>
        </div>
      </div>
    </Scope>
  );
}
