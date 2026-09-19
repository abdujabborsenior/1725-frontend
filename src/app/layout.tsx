/**
 * Ildiz layout — faqat o'tkazib yuboradi. `<html lang>` va provayderlar
 * `[locale]/layout.tsx` da (til URL segmentidan olinadi). Bu fayl global
 * `not-found.tsx` (middleware'dan tashqaridagi so'rovlar) uchun kerak.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
