import { AuthBrandPanel } from '@/components/auth/auth-shell';
import { NextCapture } from '@/components/auth/next-capture';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-soft">
      {/* ?next= ni saqlaymiz — auth tugagach maqsad sahifasiga qaytish uchun */}
      <NextCapture />
      {/* Chap: brend showcase (lg+) */}
      <AuthBrandPanel />

      {/* O'ng: forma maydoni */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
        {/* Yumshoq brend aksanlari (mobil/planshet) */}
        <div className="pointer-events-none absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent-100/50 blur-3xl lg:hidden" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-iris-100/50 blur-3xl lg:hidden" />
        <div className="relative z-10 flex w-full animate-slide-up justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
