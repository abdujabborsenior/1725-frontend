import { Navbar } from '@/components/layout/navbar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Footer } from '@/components/layout/footer';
import { MediaPermissionPrimer } from '@/components/media/permission-primer';
import { ChatFab } from '@/components/layout/chat-fab';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-surface-soft">
      {/* iOS: fon tinch va tekis (systemGroupedBackground) — dekor gradient yo'q */}
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 pt-6 md:py-8">
          {children}
        </main>
        <Footer />
      </div>
      <BottomNav />
      {/* Suhbat FAB — kirgan foydalanuvchiga barcha sahifada (desktop) */}
      <ChatFab />
      {/* Kamera/mikrofon ruxsatini bir marta nazokat bilan so'rash */}
      <MediaPermissionPrimer />
    </div>
  );
}
