'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { Lock, MessagesSquareFill, UserPlus } from '@/components/icons';
import { ChatShell } from '@/components/chat/chat-shell';

/**
 * Desktop'dagi o'ng panel — hali suhbat tanlanmagan holat.
 *
 * Ilgari bu joy tekis KULRANG maydon edi: katta bo'sh sirt ustida ozgina
 * kulrang matn turardi va ekranning yarmi "o'lik zona" bo'lib ko'rinardi.
 * Endi ikki qatlam: (1) fon — suhbat kanvasining O'ZI (`chat-canvas`,
 * MYMarkaz suv belgisi bilan), ya'ni bu joy allaqachon chatga tegishli
 * ekani ko'rinib turadi; (2) ustida OQ karta — kontent sirtdan aniq
 * ajraladi va "bu yerda nima qilish kerak?" savoliga javob beradi.
 */
export default function MessagesPage() {
  return (
    <ChatShell>
      <div className="chat-canvas relative flex h-full w-full items-center justify-center px-6 py-8">
        <div
          className="row-in w-full max-w-[21rem] rounded-ios-2xl bg-white px-7 py-8 text-center shadow-modal ring-1 ring-black/[0.04]"
          style={{ '--row-delay': '0.02s' } as CSSProperties}
        >
          {/* Xabarlar ilovasining system yashili — suhbat domenining belgisi.
              Ostidagi rangdosh nur belgini sirtdan "ko'taradi". */}
          <span className="mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-[19px] bg-emerald-500 text-white shadow-[0_14px_30px_-12px_rgba(52,199,89,0.85)]">
            <MessagesSquareFill className="h-9 w-9" />
          </span>

          <h1 className="text-title-2 font-bold tracking-tight text-brand-900">
            Suhbatni tanlang
          </h1>
          <p className="mx-auto mt-2 max-w-[18.5rem] text-subhead leading-relaxed text-slate-600">
            Chap tomondagi ro‘yxatdan suhbat oching yoki hamjamiyatdan yangi odam toping
          </p>

          <Link
            href="/discover"
            className="cta-fill mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-ios-md bg-accent-600 px-5 text-callout font-semibold text-white"
          >
            <UserPlus className="h-[18px] w-[18px]" />
            Odamlarni topish
          </Link>

          {/* Ikonka matn OQIMIDA (flex emas): matn ikki qatorga o'ralganda
              flex uni markazdan uzib, "sinib qolgan qator" ko'rinishini berardi. */}
          <p className="mt-5 text-caption-1 leading-relaxed text-slate-500">
            <Lock className="mr-1 inline h-3 w-3 align-[-1.5px] text-emerald-600" />
            Suhbatlar shaxsiy — faqat ikkalangiz ko‘rasiz
          </p>
        </div>
      </div>
    </ChatShell>
  );
}
