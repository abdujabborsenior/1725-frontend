'use client';

import { useState } from 'react';
import { Plus } from '@/components/icons';
import { cn } from '@/lib/utils';

/**
 * "Sizni nima to'xtatib turibdi?" — boshlashga xalaqit beradigan eng keng tarqalgan
 * shubhalar va ularning real javoblari. Foydalanuvchini ichidan gapiradi.
 */
const DOUBTS: { q: string; a: string }[] = [
  {
    q: '«Mening g‘oyam juda oddiy, arzimas...»',
    a: 'Eng katta mahsulotlar ham bitta oddiy g‘oyadan boshlangan. Muhimi — g‘oyaning kattaligi emas, uni qo‘lga olib sinab ko‘rganingiz. Bu yerda g‘oyangizni ulashing, fikr oling va u haqiqatan ham arzirligini odamlardan bilib oling.',
  },
  {
    q: '«Men dasturlashni bilmayman...»',
    a: 'Startap — bu kod emas, bu yechim. G‘oyangiz, mas’uliyatingiz va odamlarni jamlay olishingiz ko‘proq ahamiyatli. Bu yerda dasturchi, dizayner yoki hammuallif topishingiz — bir necha xabar narida.',
  },
  {
    q: '«Yolg‘izman, jamoam yo‘q...»',
    a: 'Aynan shuning uchun hamjamiyat bor. Sizga o‘xshagan minglab yoshlar shu yerda jamoa qidiryapti. Guruhlarga qo‘shiling, real vaqtda suhbatlashing va o‘z fikrdoshlaringizni toping.',
  },
  {
    q: '«Qayerdan boshlashni bilmayman...»',
    a: 'Birinchi qadam doim eng qiyini. Sizni qiynayotgan muammoni yozing — qolganini hamjamiyat bilan birgalikda bosqichma-bosqich quramiz. Yo‘l yurish bilan paydo bo‘ladi.',
  },
];

export function Doubts() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="ios-list mx-auto max-w-3xl" style={{ '--row-inset': '1.5rem' } as React.CSSProperties}>
      {DOUBTS.map((d, i) => {
        const active = open === i;
        return (
          <button
            key={d.q}
            onClick={() => setOpen(active ? null : i)}
            aria-expanded={active}
            className="block w-full bg-white px-5 py-4 text-left transition-colors duration-150 active:bg-fill-tertiary md:px-6"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-callout font-semibold text-brand-900 md:text-title-3">
                {d.q}
              </span>
              <span
                className={cn(
                  'flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full transition-all duration-250 ease-ios',
                  active ? 'rotate-45 bg-accent-600 text-white' : 'bg-fill-tertiary text-slate-500',
                )}
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </div>
            {/* CSS accordion (grid-rows trick) — framer height animatsiyasisiz;
                kontent doim DOM'da (SEO uchun ham foydali) */}
            <div className={cn('acc-panel', active && 'acc-panel-open')} aria-hidden={!active}>
              <div>
                <p className="pt-2.5 text-subhead leading-relaxed text-slate-500">{d.a}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
