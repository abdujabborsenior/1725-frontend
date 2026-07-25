import { Navbar } from '@/components/layout/navbar';
import { BottomNav } from '@/components/layout/bottom-nav';

/**
 * Chat layout — Telegram his: sahifa O'ZI scroll bo'lmaydi, faqat ichki
 * ro'yxat/xabarlar scroll bo'ladi. Balandlik `100dvh` (mobil brauzer URL
 * paneli hisobga olinadi — pastda ortiqcha bo'sh joy yo'q).
 * Mobil: navbar/footer yo'q — chat butun ekranni egallaydi (bottom-nav faqat
 * ro'yxatda ko'rinadi, suhbat ichida o'zi yashirinadi). Desktop: navbar + karta.
 */
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-surface-soft">
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="hidden md:block">
          <Navbar />
        </div>
        <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col md:px-4 md:py-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
