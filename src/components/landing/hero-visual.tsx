import type { CSSProperties } from 'react';

import { Eye, StarFill, TrendingUp, Users } from '@/components/icons';
import { YechimMark } from '@/components/ai/yechim-mark';

/**
 * Hero vizuali — MAHSULOTNING O'ZI (stock rasm emas).
 *
 * Sarlavhani ("G'oyadan biznes loyihagacha") bir qarashda ko'rsatadi:
 * yuqorida hamjamiyat yozgan MUAMMO, pastda uni loyihaga ulagan Yechim AI,
 * o'ngda esa tayyor STARTAP kartasi. Uch sirt turli balandlikda qalashadi —
 * Apple mahsulot sahifasidagi "qatlamli mahsulot" naqshi: chuqurlikni soya
 * beradi, dekor emas. Chiplar kartaning faqat BURCHAGINI qoplaydi — logotip,
 * sarlavha va reyting hech qachon berkilmaydi.
 *
 * Rasm fayli YO'Q — hammasi DOM + dizayn tokenlari: retina'da aniq, tarmoqqa
 * bitta ham so'rov qo'shmaydi va LCP ga tegmaydi (LCP — h1 matni). Karta
 * kirishi faqat transform'dan (`hero-enter-x`), chiplarda opacity ham bor;
 * kirishdan keyin kompozitsiya butunlay tinch turadi (cheksiz animatsiya yo'q).
 *
 * Mobil (2026-08-28): uchala qatlam ham ko'rinadi — AI chipi ixcham (152px)
 * bo'lib chap ustunda pastga o'rnashadi, karta esa 12px torayadi. Kanvas
 * balandligi o'zgarmadi → sahifa maketi surilmaydi.
 */
export function HeroVisual() {
  return (
    <div
      aria-hidden
      className="relative mx-auto h-[404px] w-full max-w-[352px] text-left sm:h-[440px] sm:max-w-[444px]"
    >
      {/* Yorug'lik manbai — sirtlar ostidagi tinch nur (dekor blob emas) */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(78% 62% at 62% 38%, rgba(0,122,255,0.13), transparent 72%)',
        }}
      />

      {/* ── Tayyor startap — kompozitsiyaning yakuni ─────────────────── */}
      <article
        className="hero-enter-x absolute right-0 top-[92px] z-10 w-[60%] overflow-hidden rounded-ios-2xl bg-white shadow-modal ring-1 ring-black/[0.04] sm:top-12 sm:w-[296px]"
        style={{ '--enter-delay': '0.06s' } as CSSProperties}
      >
        <div className="relative h-24 bg-gradient-to-br from-iris-500 to-brand-900 sm:h-28">
          {/* Yorug'lik chap-yuqoridan — muqova tekis to'q maydon bo'lib qolmaydi */}
          <span
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 100% at 10% 0%, rgba(255,255,255,0.24), transparent 58%)',
            }}
          />
          <span className="material-dark absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption-2 font-semibold text-white">
            <StarFill className="h-2.5 w-2.5 text-amber-400" /> TOP
          </span>
          <span className="absolute inset-x-0 bottom-0 h-[3px] bg-iris-500" />
        </div>

        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="relative z-10 -mt-8 mb-3 flex items-end justify-between gap-3">
            <span className="flex h-[58px] w-[58px] items-center justify-center rounded-[14px] bg-[#5856D6] text-title-2 font-semibold leading-none text-white shadow-card ring-1 ring-black/[0.06]">
              K
            </span>
            <span className="mb-1 rounded-full bg-iris-50 px-2.5 py-1 text-caption-1 font-medium text-iris-700">
              EdTech
            </span>
          </div>

          <h3 className="text-title-3 font-semibold text-brand-900">Kitobxon</h3>
          <p className="mt-1 text-subhead leading-snug text-slate-500">
            Maktab kutubxonasi raqamlashdi — kerakli kitob 2 soniyada topiladi.
          </p>

          <div className="mt-2.5 flex items-center gap-1">
            <StarFill className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-footnote font-semibold tabular-nums text-brand-900">8.7</span>
            <span className="text-caption-1 text-slate-500">/10 (42)</span>
          </div>
        </div>

        <div className="hairline-t flex items-center justify-between px-4 py-2.5 sm:px-5">
          <span className="inline-flex items-center gap-1.5 text-caption-1 text-slate-500">
            <Eye className="h-[15px] w-[15px]" /> 1 240
          </span>
          <span className="inline-flex items-center gap-1.5 text-caption-1 font-medium text-emerald-700">
            <TrendingUp className="h-[15px] w-[15px]" /> 3-o‘rin
          </span>
        </div>
      </article>

      {/* ── Boshlanish: hamjamiyat yozgan muammo ─────────────────────── */}
      <div
        className="hero-enter absolute left-0 top-0 z-20 w-[53%] rounded-ios-xl bg-white p-3.5 shadow-lift ring-1 ring-black/[0.04] sm:-left-5 sm:w-[232px]"
        style={{ '--enter-delay': '0.2s' } as CSSProperties}
      >
        <span className="flex items-center gap-1.5 text-caption-1 font-medium text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Muammo
        </span>
        <p className="mt-1.5 text-subhead leading-snug text-brand-900">
          Kutubxonada kerakli kitobni topish juda ko‘p vaqt oladi.
        </p>
        <span className="mt-2.5 flex items-center gap-1.5 text-caption-1 text-slate-500">
          <Users className="h-[15px] w-[15px]" /> 34 ta yechim
        </span>
      </div>

      {/* ── Ko'prik: Yechim AI muammoni loyihaga ulaydi ──────────────────
          Mobilda ham KO'RINADI (ilgari `hidden sm:block` edi — narrativning
          o'rta bo'g'ini tushib qolardi). Kanvas balandligi o'zgarmasin deb
          chip kengligi kartaning ichki chekinishiga (padding) qadar cheklandi:
          chip 42%, karta 60% → 100% dan 2% kam, ya'ni chipning o'ng qirrasi
          har doim kartaning ichki chekinishidan (16px) chapda qoladi.
          ⚠️ Qat'iy px kengliklar 360px'da reyting qatorini qoplab qo'yardi
          (o'lchandi) — shuning uchun mobil kengliklar FOIZDA: kanvas
          torayganda uch qatlam ham birga torayadi. Logotip/sarlavha/reyting
          hech qachon berkilmaydi (desktopdagi qoida bilan bir xil). */}
      <div
        className="hero-enter absolute bottom-0 left-0 z-20 w-[42%] rounded-ios-xl bg-white p-3 shadow-lift ring-1 ring-black/[0.04] sm:-left-5 sm:w-[240px] sm:p-3.5"
        style={{ '--enter-delay': '0.32s' } as CSSProperties}
      >
        <span className="flex items-center gap-2">
          <YechimMark size={22} />
          <span className="text-footnote font-semibold text-brand-900">Yechim AI</span>
        </span>
        <p className="mt-1.5 text-caption-1 leading-snug text-slate-500 sm:text-subhead">
          {/* Tor chipda jumla qisqaradi (kontekstni tepadagi "Muammo" chipi
              allaqachon beradi); raqam bo'lagi qatorga bo'linmaydi. */}
          <span className="hidden sm:inline">Bu muammoga mos </span>
          <span className="whitespace-nowrap font-semibold text-brand-900">2 ta loyiha</span>{' '}
          topildi.
        </p>
      </div>
    </div>
  );
}
