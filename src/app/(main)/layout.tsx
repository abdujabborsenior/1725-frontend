import { Navbar } from '@/components/layout/navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-hero relative">
      {/* Background orbs */}
      <div className="fixed -top-64 -left-64 w-[700px] h-[700px] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-48 -right-48 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

      {/* Grid */}
      <div
        className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-slate-600">
          © 2025 StartupHub. Barcha huquqlar himoyalangan.
        </footer>
      </div>
    </div>
  );
}
