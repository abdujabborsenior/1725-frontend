import Link from 'next/link';
import { ChevronRight } from '@/components/icons';
import { LogoMark } from '@/components/brand/logo-mark';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <LogoMark className="mx-auto mb-8 h-14 w-14" />

        <p className="text-[4rem] font-semibold leading-none tracking-[-0.03em] text-brand-900">
          404
        </p>
        <h1 className="mt-3 text-title-2 font-semibold text-brand-900">Sahifa topilmadi</h1>
        <p className="mt-2 text-callout leading-relaxed text-slate-500">
          Qidirayotgan sahifangiz mavjud emas yoki ko&apos;chirilgan bo&apos;lishi mumkin.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/"
            className="tappable flex h-[50px] min-w-[180px] items-center justify-center rounded-full bg-accent-600 px-7 text-body font-medium text-white active:bg-accent-700"
          >
            Bosh sahifa
          </Link>
          <Link
            href="/startups"
            className="tappable inline-flex items-center gap-0.5 text-body font-medium text-accent-700"
          >
            Startaplar
            <ChevronRight className="h-[15px] w-[15px]" strokeWidth={3} />
          </Link>
        </div>
      </div>
    </div>
  );
}
