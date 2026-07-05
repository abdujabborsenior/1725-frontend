import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/providers';

export const metadata: Metadata = {
  title: { default: 'MYMarkaz', template: '%s | MYMarkaz' },
  description:
    'G‘oyadan startapgacha — o‘quvchilar va talabalar uchun ijtimoiy platforma: muammolar, startaplar, hamjamiyat va real-vaqt chat.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        {/* Inter — runtime'da yuklanadi (build offline bo'lsa ham ishlaydi; aks holda system-ui) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* App Router'da shrift root layout head'ida yuklanadi (offline build uchun next/font o'rniga) */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
