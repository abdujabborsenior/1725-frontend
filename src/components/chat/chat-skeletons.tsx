'use client';

import { cn } from '@/lib/utils';

/**
 * Telegram uslubidagi chat skeletonlari — spinner o'rniga kontent shakli.
 * Yuklanish paytida layout keyin keladigan kontent bilan bir xil bo'ladi
 * (CLS yo'q, "chekkada spinner" muammosi yo'q).
 */

/* Suhbatlar ro'yxati — avatar + ikki qator (Telegram list) */
export function ConversationListSkeleton() {
  const titleW = ['w-32', 'w-24', 'w-36', 'w-28', 'w-40', 'w-24', 'w-32', 'w-28'];
  const lineW = ['w-3/4', 'w-1/2', 'w-2/3', 'w-4/5', 'w-1/2', 'w-3/5', 'w-2/3', 'w-1/2'];
  return (
    <div className="p-2" aria-hidden>
      {titleW.map((w, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5">
          <div className="skeleton h-12 w-12 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className={cn('skeleton h-3.5 rounded-md', w)} />
              <div className="skeleton h-2.5 w-8 rounded-md" />
            </div>
            <div className={cn('skeleton h-3 rounded-md', lineW[i])} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Xabarlar maydoni — chap/o'ng turli kenglikdagi bubble'lar */
export function MessagesSkeleton() {
  const rows: { mine: boolean; w: string; h: string }[] = [
    { mine: false, w: 'w-44', h: 'h-9' },
    { mine: false, w: 'w-64', h: 'h-14' },
    { mine: true, w: 'w-52', h: 'h-9' },
    { mine: false, w: 'w-36', h: 'h-9' },
    { mine: true, w: 'w-72', h: 'h-14' },
    { mine: true, w: 'w-40', h: 'h-9' },
    { mine: false, w: 'w-60', h: 'h-9' },
    { mine: true, w: 'w-48', h: 'h-9' },
  ];
  return (
    <div className="flex h-full w-full flex-col justify-end space-y-1.5 px-3 py-4" aria-hidden>
      {rows.map((r, i) => (
        <div key={i} className={cn('flex', r.mine ? 'justify-end' : 'justify-start')}>
          <div
            className={cn(
              'skeleton max-w-[75%] rounded-[20px]',
              r.w,
              r.h,
              r.mine ? 'rounded-br-[7px]' : 'rounded-bl-[7px]',
            )}
          />
        </div>
      ))}
    </div>
  );
}

/* Suhbat to'liq ochilmagan (ro'yxat keshida ham yo'q) holat — header + xabarlar + composer */
export function ChatOpeningSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden" aria-hidden>
      <div className="material-bar hairline-b flex items-center gap-3 px-3 py-2.5">
        <div className="skeleton h-9 w-9 shrink-0 rounded-lg" />
        <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton h-3.5 w-36 rounded-md" />
          <div className="skeleton h-2.5 w-20 rounded-md" />
        </div>
      </div>
      <div className="chat-canvas min-h-0 flex-1">
        <MessagesSkeleton />
      </div>
      <div className="material-bar hairline-t px-3 py-2.5">
        <div className="skeleton h-11 w-full rounded-[22px]" />
      </div>
    </div>
  );
}
