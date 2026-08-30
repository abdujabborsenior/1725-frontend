import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/providers';
import { TrafficBeacon } from '@/components/analytics/traffic-beacon';
import { API_URL } from '@/lib/constants';

// API alohida origin (portda) — birinchi fetch'gacha ulanish tayyor tursin
const API_ORIGIN = new URL(API_URL).origin;

export const metadata: Metadata = {
  title: { default: 'MYMarkaz', template: '%s | MYMarkaz' },
  description:
    'G‘oyadan startapgacha — o‘quvchilar va talabalar uchun ijtimoiy platforma: muammolar, startaplar, hamjamiyat va real-vaqt chat.',
};

// interactiveWidget: mobil klaviatura ochilganda layout viewport QISQARADI —
// chat composer klaviatura USTIDA qoladi (Telegram xulqi), sahifa sakramaydi
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
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
        {/* Tashrif signali — tashqi skriptsiz, o'z serverimizga (analytics) */}
        <TrafficBeacon />
      </body>
    </html>
  );
}
