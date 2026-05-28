import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/providers';

export const metadata: Metadata = {
  title: { default: 'StartupHub', template: '%s | StartupHub' },
  description: 'Muammolaringizni yechimga aylantiring — StartupHub platformasi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body>{<Providers>{children}</Providers>}</body>
    </html>
  );
}
