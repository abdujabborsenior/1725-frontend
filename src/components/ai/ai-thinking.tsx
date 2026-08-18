'use client';

import { YechimThinking } from './yechim-mark';

/**
 * Kutish holati — bo'sh spinner emas.
 *
 * Ikki qatlam: (1) AI ning real ish bosqichlari matni; (2) javob **aynan
 * paydo bo'ladigan joyda** turgan varaq skeleti, uning ustidan skaner nuri
 * o'tadi. Natijada kutish "muzlash" emas, "ishlayapti" bo'lib his qilinadi
 * va javob kelganda maket sakramaydi (skelet o'sha shaklda).
 */
export function AiThinkingPanel() {
  return (
    <div className="space-y-4">
      <YechimThinking />

      <div className="ai-scan rounded-ios-xl bg-white p-4" aria-hidden>
        <div className="space-y-2.5">
          <span className="skeleton block h-3 w-[92%] rounded-full" />
          <span className="skeleton block h-3 w-[78%] rounded-full" />
          <span className="skeleton block h-3 w-[46%] rounded-full" />
        </div>
        <div className="mt-4 space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="skeleton h-11 w-11 shrink-0 rounded-[12px]" />
              <span className="min-w-0 flex-1 space-y-1.5">
                <span className="skeleton block h-3 w-1/3 rounded-full" />
                <span className="skeleton block h-2.5 w-3/4 rounded-full" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
