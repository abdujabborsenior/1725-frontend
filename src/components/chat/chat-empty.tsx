'use client';

import type { CSSProperties } from 'react';

import { ChevronRight, MessagesSquareFill } from '@/components/icons';

/**
 * Bo'sh suhbat holati — Telegram naqshi ("No messages here yet"), lekin
 * MYMarkaz kontekstida: suhbat NIMA UCHUN boshlanishini aytadi va tayyor
 * boshlang'ich jumlalar taklif qiladi (bosilganda composer'ga yoziladi,
 * yuborilmaydi — birinchi so'z har doim foydalanuvchiniki).
 *
 * "Bo'sh ekran" — mahsulotdagi eng qimmat lahzalardan biri: aynan shu yerda
 * odam yo yozadi, yo chiqib ketadi. Shuning uchun bu yerda tanlov yuki
 * nolga tushiriladi — bir bosish va matn tayyor.
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
    <div className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm text-center">
        {/* Xabarlar ilovasining system yashili — suhbat domeni belgisi */}
        <span className="msg-pop mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[15px] bg-emerald-500 text-white shadow-card">
          <MessagesSquareFill className="h-8 w-8" />
        </span>

        <h2
          className="row-in text-title-3 font-semibold text-brand-900"
          style={{ '--row-delay': '0.06s' } as CSSProperties}
        >
          Bu yerda hali xabar yo‘q
        </h2>
        <p
          className="row-in mx-auto mt-1.5 max-w-[19rem] text-subhead leading-relaxed text-slate-500"
          style={{ '--row-delay': '0.1s' } as CSSProperties}
        >
          {isGroup ? (
            <>
              <span className="font-semibold text-brand-900">{title ?? 'Bu guruh'}</span> guruhida
              suhbat hali boshlanmagan. Birinchi fikrni siz tashlang.
            </>
          ) : (
            <>
              <span className="font-semibold text-brand-900">{title ?? 'Suhbatdosh'}</span> bilan
              suhbatni boshlang — loyihangizni tanishtiring yoki savol bering.
            </>
          )}
        </p>

        <div className="mt-6 text-left">
          <p className="ios-section-header !px-0 text-center">Shunday boshlash mumkin</p>
          <div className="ios-list" style={{ '--row-inset': '1rem' } as CSSProperties}>
            {starters.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => onPick(s)}
                style={{ '--row-delay': `${0.16 + i * 0.05}s` } as CSSProperties}
                className="ios-row row-in group w-full gap-2 text-left"
              >
                <span className="min-w-0 flex-1 text-subhead leading-snug text-brand-900">
                  {s}
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-slate-300 transition-transform duration-250 ease-ios group-hover:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
