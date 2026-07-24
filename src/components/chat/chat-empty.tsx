'use client';

import { MessagesSquare, Sparkles } from 'lucide-react';

/**
 * Bo'sh suhbat holati — Telegram naqshi ("No messages here yet"), lekin
 * MYMarkaz kontekstida: suhbat nima uchun boshlanishini aytadi va tayyor
 * boshlang'ich jumlalar taklif qiladi (bosilganda composer'ga yoziladi).
 */

const DIRECT_STARTERS = [
  'Assalomu alaykum! Loyihangiz bilan tanishdim.',
  'Hamkorlik haqida gaplashsak bo‘ladimi?',
  'G‘oyangiz bo‘yicha bir nechta savolim bor.',
];

const GROUP_STARTERS = [
  'Assalomu alaykum, hammaga!',
  'Yangi g‘oyam bor — fikr bildirasizmi?',
  'Kim shu yo‘nalishda ishlayapti?',
];

export function ChatEmptyState({
  isGroup,
  title,
  onPick,
}: {
  isGroup: boolean;
  /** Suhbatdosh yoki guruh nomi (bo'lmasa umumiy matn ko'rsatiladi) */
  title: string | null;
  /** Tayyor jumla tanlanganda — composer'ga yoziladi (yuborilmaydi) */
  onPick: (text: string) => void;
}) {
  const starters = isGroup ? GROUP_STARTERS : DIRECT_STARTERS;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white/85 p-6 text-center shadow-card backdrop-blur">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-900 text-accent-400">
          <MessagesSquare className="h-6 w-6" strokeWidth={2} />
        </span>

        <h2 className="text-base font-bold text-brand-900">Bu yerda hali xabar yo&apos;q</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          {isGroup ? (
            <>
              <span className="font-semibold text-brand-900">{title ?? 'Bu guruh'}</span> guruhida
              suhbat hali boshlanmagan. Birinchi fikrni siz tashlang — g&apos;oya
              shu yerdan o&apos;sadi.
            </>
          ) : (
            <>
              <span className="font-semibold text-brand-900">{title ?? 'Suhbatdosh'}</span> bilan
              suhbatni boshlang. Loyihangizni tanishtiring yoki savol bering.
            </>
          )}
        </p>

        <div className="mt-5 space-y-2 text-left">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <Sparkles className="h-3 w-3 text-accent-600" /> Shunday boshlash mumkin
          </p>
          {starters.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              className="w-full rounded-xl border border-slate-200 bg-surface-soft px-3.5 py-2.5 text-left text-sm text-slate-700 transition-all hover:border-accent-300 hover:bg-white hover:text-brand-900"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
