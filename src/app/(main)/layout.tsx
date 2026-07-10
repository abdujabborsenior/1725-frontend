import { Navbar } from '@/components/layout/navbar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Footer } from '@/components/layout/footer';
import { MediaPermissionPrimer } from '@/components/media/permission-primer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-surface-soft">
      {/* Signature mesh background — nozik, tinch */}
      <div className="pointer-events-none fixed inset-0 bg-mesh opacity-40" aria-hidden />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-24 md:py-8">
          {children}
        </main>
        <Footer />
      </div>
      <BottomNav />
      {/* Kamera/mikrofon ruxsatini bir marta nazokat bilan so'rash */}
      <MediaPermissionPrimer />
    </div>
  );
}
