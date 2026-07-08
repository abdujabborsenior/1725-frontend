import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/providers';
import { API_URL } from '@/lib/constants';

// API alohida origin (portda) — birinchi fetch'gacha ulanish tayyor tursin
const API_ORIGIN = new URL(API_URL).origin;

export const metadata: Metadata = {
  title: { default: 'MYMarkaz', template: '%s | MYMarkaz' },
  description:
    'G‘oyadan startapgacha — o‘quvchilar va talabalar uchun ijtimoiy platforma: muammolar, startaplar, hamjamiyat va real-vaqt chat.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        {/* Inter — SELF-HOST: lotin subset globals.css ichida inline (base64),
            qolgan subset'lar (latin-ext/cyrillic) public/fonts'dan kerak bo'lganda.
            Google Fonts'ga tashqi so'rov umuman yo'q. */}
        <link rel="preconnect" href={API_ORIGIN} crossOrigin="anonymous" />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
