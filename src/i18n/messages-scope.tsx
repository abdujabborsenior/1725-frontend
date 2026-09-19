'use client';

import { useMemo } from 'react';
import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';

/**
 * Marshrut bo'limi uchun QO'SHIMCHA xabarlar — ota provider xabarlari bilan
 * BIRLASHTIRILADI (ichma-ich `NextIntlClientProvider` odatda almashtiradi).
 *
 * Nega kerak (performance): brauzerga butun lug'at emas, faqat shu bo'limda
 * haqiqatan ishlatiladigan nomlar maydoni (namespace) yuboriladi. Umumiy
 * qism (navbar, tugmalar...) ildiz layout'da bir marta keladi va client-side
 * navigatsiyada qayta yuborilmaydi; bo'lim xabarlari esa faqat o'sha bo'limga
 * kirilganda keladi.
 */
export function MessagesScope({
  messages,
  children,
}: {
  messages: AbstractIntlMessages;
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const parent = useMessages();
  const merged = useMemo(() => ({ ...parent, ...messages }), [parent, messages]);

  return (
    <NextIntlClientProvider locale={locale} messages={merged}>
      {children}
    </NextIntlClientProvider>
  );
}
