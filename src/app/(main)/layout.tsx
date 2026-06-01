import { Navbar } from '@/components/layout/navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-soft relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
          © {new Date().getFullYear()} StartupHub. Barcha huquqlar himoyalangan.
        </footer>
      </div>
    </div>
  );
}
