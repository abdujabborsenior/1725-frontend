import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Startaplar',
  description:
    'Hamjamiyat tomonidan yaratilgan startaplar — ilovalar, saytlar va Telegram botlar bir joyda.',
};

export default function StartupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
