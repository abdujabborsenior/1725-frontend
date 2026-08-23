import { Navbar } from '@/components/layout/navbar';
import { BottomNav } from '@/components/layout/bottom-nav';

/**
 * Yechim AI layouti — chat bilan bir xil tamoyil: sahifa O'ZI scroll
 * BO'LMAYDI, faqat suhbat oqimi scroll bo'ladi. Balandlik `100dvh`
 * (mobil brauzer paneli hisobga olinadi) → kirish maydoni doim ekran
 * pastida turadi va uning OSTIDA ortiqcha bo'sh joy qolmaydi.
 *
 * Footer ATAYLAB yo'q: AI — sayt sahifasi emas, ilova ekrani (haqiqiy
 * AI mahsulotlarida ham konsol ostida sayt "podvali" bo'lmaydi).
 * Navbar ikkala o'lchamda ham qoladi — mobilda ortga qaytish yo'li
 * (pastki tab barда AI bandi yo'q).
 */
export default function AiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-surface-soft">
      <Navbar />
      <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-4 pt-3 md:px-6 md:pt-5">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
