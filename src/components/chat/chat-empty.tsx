'use client';

import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';

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

// Tayyor jumlalar — lug'at kalitlari (`chat.empty.starters.*`), matn joriy tilda
const DIRECT_STARTERS = ['directHello', 'directPartnership', 'directQuestions'] as const;

const GROUP_STARTERS = ['groupHello', 'groupIdea', 'groupWho'] as const;

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
  const t = useTranslations('chat.empty');
  const starters = isGroup ? GROUP_STARTERS : DIRECT_STARTERS;
  const bold = (chunks: React.ReactNode) => (
    <span className="font-semibold text-brand-900">{chunks}</span>
  );

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
          {t('title')}
        </h2>
        <p
          className="row-in mx-auto mt-1.5 max-w-[19rem] text-subhead leading-relaxed text-slate-500"
          style={{ '--row-delay': '0.1s' } as CSSProperties}
        >
          {isGroup
            ? title
              ? t.rich('groupIntro', { title, b: bold })
              : t.rich('groupIntroNoTitle', { b: bold })
            : title
              ? t.rich('directIntro', { title, b: bold })
              : t.rich('directIntroNoTitle', { b: bold })}
        </p>

        <div className="mt-6 text-left">
          <p className="ios-section-header !px-0 text-center">{t('startersTitle')}</p>
          <div className="ios-list" style={{ '--row-inset': '1rem' } as CSSProperties}>
            {starters.map((key, i) => {
              const s = t(`starters.${key}`);
              return (
                <button
                  key={key}
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
