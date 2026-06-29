'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Lightbulb } from 'lucide-react';
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
    <div className="mx-auto max-w-3xl divide-y divide-slate-200/80 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-soft backdrop-blur">
      {DOUBTS.map((d, i) => {
        const active = open === i;
        return (
          <button
            key={d.q}
            onClick={() => setOpen(active ? null : i)}
            className="block w-full px-5 py-5 text-left transition-colors hover:bg-slate-50/70 md:px-7"
          >
            <div className="flex items-center justify-between gap-4">
              <span
                className={cn(
                  'text-base font-bold transition-colors md:text-lg',
                  active ? 'text-brand-900' : 'text-slate-700',
                )}
              >
                {d.q}
              </span>
              <span
                className={cn(
                  'flex h-8 w-8 flex-none items-center justify-center rounded-full border transition-all duration-300',
                  active
                    ? 'rotate-45 border-accent-300 bg-gradient-emerald-iris text-white shadow-glow-accent'
                    : 'border-slate-200 bg-white text-slate-500',
                )}
              >
                <Plus className="h-4 w-4" />
              </span>
            </div>
            <AnimatePresence initial={false}>
              {active && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="flex gap-2.5 pt-3 text-sm leading-relaxed text-slate-600 md:text-[15px]">
                    <Lightbulb className="mt-0.5 h-4 w-4 flex-none text-accent-500" />
                    <span>{d.a}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
