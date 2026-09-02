'use client';

import { useState, type CSSProperties } from 'react';

import { Check, Plus, Trash2, X } from '@/components/icons';
import { dayLabel } from '@/lib/date';
import { cn } from '@/lib/utils';
import type { AiConversationSummary } from '@/types';

/**
 * Suhbatlar tarixi (rail).
 *
 * Tuzilishi ATAYLAB oddiy: kun bo'yicha guruh → qatorlar. Faol qatorning
 * chap qirrasida yonuvchi tayoqcha bor (navbardagi suzuvchi kapsulaning
 * vertikal aksi) — foydalanuvchi qaysi suhbatда turganini bir qarashda
 * ko'radi.
 *
 * O'chirish MODALSIZ: tugma bosilgach qator o'z ichida tasdiq so'raydi.
 * Sabab — tarixni tozalash tez-tez qilinadigan amal; har safar modal
 * ochilishi ortiqcha to'siq bo'lardi, tasdiqsiz o'chirish esa xavfli.
 */
export function AiHistory({
  items,
  activeId,
  loading,
  hasMore,
  onSelect,
  onNew,
  onDelete,
  onLoadMore,
}: {
  items: AiConversationSummary[];
  activeId: string | null;
  loading: boolean;
  hasMore: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onLoadMore: () => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-3 pb-2 pt-3">
        <button
          type="button"
          onClick={onNew}
          className="yz-card yz-card-tap flex h-11 w-full items-center justify-center gap-2 text-callout font-semibold text-[color:var(--yz-ink)]"
        >
          <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
          Yangi suhbat
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {loading && items.length === 0 ? (
          <div className="space-y-1.5 pt-2" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="block h-11 rounded-xl bg-white/[0.05]"
                style={{ opacity: 1 - i * 0.16 }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="px-1 pt-6 text-center text-footnote leading-relaxed text-[color:var(--yz-ink-3)]">
            Suhbatlaringiz shu yerda saqlanadi
          </p>
        ) : (
          <div className="yz-stagger space-y-0.5">
            {items.map((c, i) => {
              const label = dayLabel(c.lastMessageAt);
              const showLabel =
                i === 0 || dayLabel(items[i - 1].lastMessageAt) !== label;
              const active = c.id === activeId;

              return (
                <div key={c.id} style={{ '--i': Math.min(i, 12) } as CSSProperties}>
                  {showLabel && (
                    <p className="px-2 pb-1 pt-4 text-caption-2 font-semibold uppercase tracking-[0.07em] text-[color:var(--yz-ink-3)] first:pt-1">
                      {label}
                    </p>
                  )}

                  {confirmId === c.id ? (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-500/12 px-3 py-2">
                      <span className="min-w-0 flex-1 truncate text-footnote text-[color:var(--yz-ink-2)]">
                        O‘chirilsinmi?
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        aria-label="Bekor qilish"
                        className="yz-btn flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--yz-ink-2)]"
                      >
                        <X className="h-[17px] w-[17px]" strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmId(null);
                          onDelete(c.id);
                        }}
                        aria-label="O‘chirish"
                        className="yz-btn flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-300"
                      >
                        <Check className="h-[17px] w-[17px]" strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <div className="group/row relative">
                      <button
                        type="button"
                        onClick={() => onSelect(c.id)}
                        aria-current={active ? 'true' : undefined}
                        className="yz-row flex w-full items-center gap-2 py-2 pl-3 pr-10 text-left"
                      >
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              'block truncate text-subhead',
                              active
                                ? 'font-semibold text-[color:var(--yz-ink)]'
                                : 'text-[color:var(--yz-ink-2)]',
                            )}
                          >
                            {c.title}
                          </span>
                          <span className="block text-caption-2 text-[color:var(--yz-ink-3)]">
                            {c.turnCount} ta savol
                          </span>
                        </span>
                      </button>

                      {/* Kursorli qurilmada hover'da, sensorlida — doim
                          ko'rinadi (mobilda hover yo'q, tugma yo'qolmasin). */}
                      <button
                        type="button"
                        onClick={() => setConfirmId(c.id)}
                        aria-label={`“${c.title}” suhbatini o‘chirish`}
                        className="yz-btn absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[color:var(--yz-ink-3)] opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/row:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
                      >
                        <Trash2 className="h-[17px] w-[17px]" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {hasMore && (
              <button
                type="button"
                onClick={onLoadMore}
                className="yz-btn mt-3 w-full rounded-xl py-2 text-footnote font-medium text-[color:var(--yz-ink-2)]"
              >
                Oldingilarini ko‘rsatish
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
