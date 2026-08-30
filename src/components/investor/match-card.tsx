'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Bookmark,
  BookmarkFill,
  ChevronDown,
  EyeOff,
  MapPin,
  Send,
} from '@/components/icons';
import { investorsApi, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  GRADE_LABEL,
  GRADE_TONE,
  NEED_LABEL,
  STAGE_LABEL,
  formatRange,
  scoreTone,
} from '@/lib/venture';
import type { DealflowItem } from '@/types';
import { FactorBreakdown, MatchScoreRing } from './match-score';
import { IntroDialog } from './intro-dialog';

/**
 * Deal-flow kartasi.
 *
 * Tuzilishi ataylab "qaror qabul qilish" tartibida: **ball → loyiha →
 * nimaga muhtoj → nima uchun mos**. Investor kunda o'nlab kartani ko'radi,
 * shuning uchun eng ajratuvchi ma'lumot yuqorida turadi.
 */
export function MatchCard({ item }: { item: DealflowItem }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [saved, setSaved] = useState(item.saved);
  const s = item.startup;
  const tone = scoreTone(item.score);

  const { mutate: toggleSave } = useMutation({
    mutationFn: () =>
      saved ? investorsApi.unsave(s.id) : investorsApi.save(s.id),
    onMutate: () => setSaved((v) => !v),
    onError: (e) => {
      setSaved((v) => !v);
      toast.error(getErrorMessage(e));
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['dealflow'] }),
  });

  const { mutate: dismiss, isPending: dismissing } = useMutation({
    mutationFn: () => investorsApi.dismiss(s.id, true),
    onSuccess: (res) => {
      toast.success(res.message);
      void qc.invalidateQueries({ queryKey: ['dealflow'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <article className="overflow-hidden rounded-ios-lg bg-white shadow-card">
      <div className="flex items-start gap-3.5 p-4">
        <MatchScoreRing score={item.score} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <Link
              href={`/startups/${s.slug}`}
              className="min-w-0 flex-1 text-title-3 font-semibold text-brand-900 hover:text-accent-700"
            >
              {s.title}
            </Link>
            {item.isNew && (
              <span className="mt-0.5 shrink-0 rounded-full bg-accent-600 px-2 py-0.5 text-caption-2 font-semibold text-white">
                Yangi
              </span>
            )}
          </div>

          <p className={cn('mt-0.5 text-footnote font-medium', tone.text)}>
            {tone.label}
            {item.readiness && (
              <>
                <span className="text-slate-400"> · </span>
                <span className={GRADE_TONE[item.readiness.grade]}>
                  {GRADE_LABEL[item.readiness.grade]} ({item.readiness.score})
                </span>
              </>
            )}
          </p>

          {s.tagline && (
            <p className="mt-1.5 line-clamp-2 text-subhead text-slate-600">
              {s.tagline}
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption-1 text-slate-500">
            {s.stage && <span>{STAGE_LABEL[s.stage]}</span>}
            {s.category && <span>{s.category}</span>}
            {s.region && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {s.region}
              </span>
            )}
          </div>

          {s.needs.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {s.needs.map((n) => (
                <span
                  key={n}
                  className="rounded-full bg-fill-tertiary px-2.5 py-0.5 text-caption-1 font-medium text-slate-600"
                >
                  {NEED_LABEL[n]}
                </span>
              ))}
            </div>
          )}

          {s.isSeekingInvestment && (
            <p className="mt-2 text-footnote text-slate-600">
              So&apos;rov:{' '}
              <span className="font-medium text-brand-900">
                {formatRange(s.askAmountMin, s.askAmountMax)}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Nega mos — bir bosishda ochiladi */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="hairline-t tappable flex w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <span className="text-footnote font-medium text-accent-700">
          Nega mos keldi?
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-400 transition-transform duration-250 ease-ios',
            open && 'rotate-180',
          )}
          strokeWidth={2.5}
        />
      </button>
      {open && (
        <div className="hairline-t px-4 py-4">
          <FactorBreakdown factors={item.factors} />
        </div>
      )}

      {/* Amallar */}
      <div className="hairline-t flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setIntroOpen(true)}
          className="tappable inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-ios-md bg-accent-600 text-subhead font-semibold text-white"
        >
          <Send className="h-4 w-4" />
          Bog&apos;lanish
        </button>
        <button
          type="button"
          onClick={() => toggleSave()}
          aria-label={saved ? "Ro'yxatdan olib tashlash" : "Ro'yxatga saqlash"}
          aria-pressed={saved}
          className="tappable flex h-10 w-10 items-center justify-center rounded-ios-md bg-fill-tertiary text-slate-600"
        >
          {saved ? (
            <BookmarkFill className="h-[18px] w-[18px] text-accent-600" />
          ) : (
            <Bookmark className="h-[18px] w-[18px]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => dismiss()}
          disabled={dismissing}
          aria-label="Qiziq emas"
          className="tappable flex h-10 w-10 items-center justify-center rounded-ios-md bg-fill-tertiary text-slate-600 disabled:opacity-50"
        >
          <EyeOff className="h-[18px] w-[18px]" />
        </button>
      </div>

      <IntroDialog
        open={introOpen}
        onClose={() => setIntroOpen(false)}
        startupId={s.id}
        startupTitle={s.title}
      />
    </article>
  );
}
