import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top Startaplar — Reyting taxtasi',
  description:
    'Foydalanuvchilar baholari asosida, IMDB uslubidagi vaznli (Bayes) reyting bilan tartiblangan eng yaxshi startaplar.',
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
