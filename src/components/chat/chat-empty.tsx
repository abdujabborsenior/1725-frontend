'use client';

import { MessagesSquareFill } from '@/components/icons';

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
      <div className="w-full max-w-sm rounded-ios-2xl bg-white p-6 text-center shadow-card">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[13px] bg-emerald-400 text-white">
          <MessagesSquareFill className="h-7 w-7" />
        </span>

        <h2 className="text-title-3 font-semibold text-brand-900">Bu yerda hali xabar yo&apos;q</h2>
        <p className="mt-1.5 text-subhead leading-relaxed text-slate-500">
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
          <p className="ios-section-header px-0">Shunday boshlash mumkin</p>
          {starters.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              className="tappable w-full rounded-ios-md bg-fill-tertiary px-3.5 py-2.5 text-left text-subhead text-brand-900"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
