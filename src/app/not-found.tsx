import Link from 'next/link';
import { Zap, Home, Rocket } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="relative inline-flex mb-8">
          <div className="absolute inset-0 rounded-3xl bg-accent-200/50 blur-2xl" />
          <div className="relative h-20 w-20 rounded-3xl bg-brand-900 flex items-center justify-center mx-auto">
            <Zap className="h-9 w-9 text-accent-400" fill="currentColor" />
          </div>
        </div>

        <p className="text-7xl font-black gradient-text leading-none">404</p>
        <h1 className="mt-4 text-xl font-bold text-brand-900">Sahifa topilmadi</h1>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Qidirayotgan sahifangiz mavjud emas yoki ko&apos;chirilgan bo&apos;lishi mumkin.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-brand-900 text-white font-semibold hover:bg-brand-800 transition-all btn-lift shadow-glow-brand"
          >
            <Home className="h-4 w-4" /> Bosh sahifa
          </Link>
          <Link
            href="/startups"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-slate-300 bg-white text-brand-900 font-semibold hover:bg-slate-50 transition-all btn-lift"
          >
            <Rocket className="h-4 w-4" /> Startaplar
          </Link>
        </div>
      </div>
    </div>
  );
}
