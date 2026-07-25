import { cn } from '@/lib/utils';

/**
 * Umumiy skeleton primitivlari — spinner o'rniga kontent shakli.
 * `.skeleton` (globals.css) shimmer beradi; bu yerda faqat shakllar.
 */

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton rounded-md', className)} />;
}

/* Avatar + ikki qator — user/guruh ro'yxat elementi (discover, follow modal, qidiruv) */
export function UserRowSkeleton({ rows = 5 }: { rows?: number }) {
  const w = ['w-36', 'w-28', 'w-40', 'w-32', 'w-44', 'w-28', 'w-36', 'w-32'];
  return (
    <div aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2.5">
          <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className={cn('skeleton h-3.5 rounded-md', w[i % w.length])} />
            <div className="skeleton h-3 w-1/2 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Oddiy karta shakli — grid ro'yxatlar uchun (discover kartalari va h.k.) */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('rounded-ios-2xl bg-white p-5', className)}>
      <div className="flex items-center gap-3">
        <div className="skeleton h-12 w-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton h-3.5 w-2/3 rounded-md" />
          <div className="skeleton h-3 w-1/3 rounded-md" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="skeleton h-3 w-full rounded-md" />
        <div className="skeleton h-3 w-4/5 rounded-md" />
      </div>
      <div className="skeleton mt-4 h-9 w-full rounded-xl" />
    </div>
  );
}

/* Ro'yxat qatori (rasm yo'q) — sarlavha + meta (profil bo'limlari va h.k.) */
export function ListRowSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-hidden className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-ios-lg bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton h-3.5 w-2/3 rounded-md" />
              <div className="skeleton h-3 w-4/5 rounded-md" />
            </div>
            <div className="skeleton h-5 w-16 shrink-0 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
