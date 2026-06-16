import { Navbar } from '@/components/layout/navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-surface-soft">
      {/* Signature mesh background */}
      <div className="pointer-events-none fixed inset-0 bg-mesh opacity-70" aria-hidden />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white/70 py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} StartupHub · Muammo → Yechim → Startap
        </footer>
      </div>
    </div>
  );
}
