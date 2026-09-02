'use client';

import { AlertCircle, RefreshCw } from '@/components/icons';
import { AiAnswer, type AnswerData } from './ai-answer';
import { AiThinking } from './ai-thinking';

export interface Turn {
  id: string;
  question: string;
  status: 'thinking' | 'done' | 'error';
  data?: AnswerData;
  error?: string;
  /**
   * Javob AYNAN hozir keldimi. Tarixdan ochilgan suhbatda `false`:
   * eski javobni qaytadan "yozib berish" — soxta taassurot bo'lardi.
   */
  fresh: boolean;
}

/**
 * Suhbat oqimi: savol (o'ngda, kapsulada) → javob (chapda, varaq).
 *
 * Javob ATAYLAB pufak emas: ichida ro'yxatlar, kartalar va tugmalar bor —
 * ular pufakka sig'maydi va o'qilishi qiyinlashardi.
 */
export function AiStream({
  turns,
  onRetry,
  onPublish,
}: {
  turns: Turn[];
  onRetry: (turn: Turn) => void;
  onPublish: (turn: Turn) => void;
}) {
  return (
    <div className="space-y-8">
      {turns.map((turn) => (
        <div key={turn.id} className="space-y-5">
          <div className="flex justify-end">
            <p
              className={
                'max-w-[85%] whitespace-pre-line rounded-[20px] rounded-br-[7px] bg-white/[0.09] px-4 py-2.5 text-body leading-snug text-[color:var(--yz-ink)] sm:max-w-[75%]' +
                (turn.fresh ? ' yz-ask' : '')
              }
            >
              {turn.question}
            </p>
          </div>

          {turn.status === 'thinking' && <AiThinking />}

          {turn.status === 'error' && (
            <div className="yz-card flex items-start gap-3 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <div className="min-w-0 flex-1">
                <p className="text-subhead text-[color:var(--yz-ink-2)]">
                  {turn.error}
                </p>
                <button
                  type="button"
                  onClick={() => onRetry(turn)}
                  className="mt-2 inline-flex items-center gap-1.5 text-subhead font-medium text-[color:var(--yz-blue)]"
                >
                  <RefreshCw className="h-4 w-4" /> Qayta urinish
                </button>
              </div>
            </div>
          )}

          {turn.status === 'done' && turn.data && (
            <AiAnswer
              data={turn.data}
              animate={turn.fresh}
              onPublish={() => onPublish(turn)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
