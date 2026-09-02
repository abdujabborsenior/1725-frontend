'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { YechimOrb } from './yechim-mark';

/**
 * Kutish holati — bo'sh spinner emas.
 *
 * Ko'rsatiladigan bosqichlar quvurning HAQIQIY ketma-ketligi (tushunish →
 * retrieval → reranking → javob), tasodifiy matn emas. Bir vaqtning o'zida
 * FAQAT bitta qator ko'rinadi (to'rttasi birdan — ortiqcha shovqin), ostida
 * esa progress segmentlari. Pastdagi skelet — javob AYNAN paydo bo'ladigan
 * joyda turadi, shuning uchun javob kelganda maket sakramaydi.
 */
const STAGES = [
  'Muammoni tushunyapman',
  'Loyihalarni ko‘rib chiqyapman',
  'Eng mosini solishtiryapman',
  'Javobni yozyapman',
];

export function AiThinking() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Oxirgi bosqichda to'xtaydi: aylanib takrorlanish yolg'on taassurot
    // berardi ("qayta boshladi" degan hissiyot).
    const timers = [1500, 3400, 5800].map((ms, i) =>
      setTimeout(() => setStage(i + 1), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex gap-3.5" role="status" aria-live="polite">
      <YechimOrb size={34} state="thinking" className="mt-0.5" />

      <div className="min-w-0 flex-1">
        {/* key — matn almashganda yangidan materializatsiya bo'ladi */}
        <p key={stage} className="yz-shimmer text-subhead font-medium">
          {STAGES[stage]}…
        </p>

        {/* Progress — bajarilgan bosqichlar yorug' qoladi */}
        <div className="mt-2.5 flex gap-1.5" aria-hidden>
          {STAGES.map((s, i) => (
            <span
              key={s}
              className={cn(
                'h-[3px] w-9 rounded-full transition-colors duration-500 ease-ios',
                i < stage
                  ? 'bg-[color:var(--yz-blue)]'
                  : i === stage
                    ? 'bg-[color:var(--yz-blue)]/50'
                    : 'bg-white/20',
              )}
            />
          ))}
        </div>

        {/* Javob varag'ining skeleti + skaner nuri */}
        <div className="yz-scan yz-card mt-4 p-4" aria-hidden>
          <div className="space-y-2.5">
            <span className="block h-3 w-[92%] rounded-full bg-white/10" />
            <span className="block h-3 w-[74%] rounded-full bg-white/10" />
            <span className="block h-3 w-[44%] rounded-full bg-white/10" />
          </div>
          <div className="mt-5 space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="h-10 w-10 shrink-0 rounded-[12px] bg-white/10" />
                <span className="min-w-0 flex-1 space-y-1.5">
                  <span className="block h-3 w-1/3 rounded-full bg-white/10" />
                  <span className="block h-2.5 w-3/4 rounded-full bg-white/[0.07]" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
