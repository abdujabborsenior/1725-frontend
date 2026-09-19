/**
 * Startaplar bo'limi layout'i. Metadata bu yerda ATAYLAB yo'q: har sahifa
 * (ro'yxat, detal, joylash, tahrirlash) o'z sarlavhasi va kanonik/hreflang
 * manzilini `generateMetadata` orqali beradi — layout'dagi qiymat ularga
 * meros bo'lib, noto'g'ri kanonik bo'lib qolardi.
 */
export default function StartupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
