import { AuthBrandPanel } from '@/components/auth/auth-shell';
import { NextCapture } from '@/components/auth/next-capture';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-soft">
      {/* ?next= ni saqlaymiz — auth tugagach maqsad sahifasiga qaytish uchun */}
      <NextCapture />
      {/* Chap: brend showcase (lg+) */}
      <AuthBrandPanel />

      {/* O'ng: forma maydoni — iOS'da fon tinch va tekis (dekor nur yo'q) */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="flex w-full justify-center">{children}</div>
      </div>
    </div>
  );
}
