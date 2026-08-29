'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Play, X, Lock, Trophy } from '@/components/icons';
import { useQueryClient } from '@tanstack/react-query';
import { pollsApi, getErrorMessage } from '@/lib/api';
import { patchEntityInQueries } from '@/lib/entity-sync';
import { useInViewOnce } from '@/components/landing/reveal';
import { useAuthStore } from '@/store/auth.store';
import { StartupLogo } from '@/components/startups/startup-logo';
import { cn } from '@/lib/utils';
import type { Poll, PollOption } from '@/types';
import toast from 'react-hot-toast';

/* Foizning yumshoq o'sishi — natijalar ko'ringanda bir marta ishlaydi */
function useCountUp(target: number, active: boolean, duration = 800) {
  const [val, setVal] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVal(target); return; }
    let raf = 0;
    const start = performance.now();
    const from = ref.current;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else ref.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return val;
}

/* Video — iOS pleyeri uslubida (qora sirt, tepada yopish tugmasi) */
function VideoModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="animate-scale-in relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Yopish"
          className="material-dark tappable absolute -top-12 right-0 grid h-9 w-9 place-items-center rounded-full text-white"
        >
          <X className="h-5 w-5" />
        </button>
        <video src={url} controls autoPlay playsInline className="w-full rounded-ios-lg bg-black shadow-modal" />
      </div>
    </div>
  );
}

/**
 * Ovoz berish kartasi — iOS "picker" naqshi: variantlar inset-grouped
 * ro'yxatda, tanlangan qator tint fonda va o'ngida belgi bilan. Natija
 * ko'rinishida foiz + nozik progress chizig'i (dekor emas — ma'lumot).
 */
export function PollCard({ poll: initial }: { poll: Poll }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const qc = useQueryClient();
  const [poll, setPoll] = useState(initial);
  const [voting, setVoting] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const { ref: cardRef, inView } = useInViewOnce<HTMLDivElement>('-40px');
  const interacted = useRef(false);

  // Ovoz berilgach eskirgan refetch prop'i holatni qayta bosib yubormasin
  useEffect(() => {
    if (!interacted.current) setPoll(initial);
  }, [initial]);

  const voted = poll.myVotedOptionId;
  const showResults = !!voted || poll.isClosed;
  const sorted = [...poll.options].sort((a, b) => b.voteCount - a.voteCount);
  const leaderId = sorted[0]?.voteCount > 0 ? sorted[0].id : null;
  const rows = showResults ? sorted : poll.options;

  async function vote(optionId: string) {
    if (!token) { router.push('/login?next=/polls'); return; }
    if (poll.isClosed || voting) return;
    interacted.current = true;
    setVoting(optionId);
    try {
      const res = await pollsApi.vote(poll.id, optionId);
      setPoll(res);
      // Barcha sahifa keshlarida (home, /polls) ovoz holati bir xil qolsin
      patchEntityInQueries(qc, poll.id, res as unknown as Record<string, unknown>);
    }
    catch (err) { toast.error(getErrorMessage(err)); }
    finally { setVoting(null); }
  }

  const subtitle = poll.isClosed
    ? 'Ovoz berish yopildi — yakuniy natijalar'
    : showResults
      ? 'Ovozingiz qabul qilindi. Natijalar real vaqtda yangilanadi.'
      : 'Bitta startapni tanlang. Ovozingiz anonim qoladi.';

  return (
    <div
      ref={cardRef}
      className={cn('reveal overflow-hidden rounded-ios-2xl bg-white shadow-card', inView && 'reveal-in')}
      style={{ '--reveal-y': '20px' } as React.CSSProperties}
    >
      {/* Sarlavha */}
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-footnote font-semibold text-accent-600">Hamjamiyat ovozi</span>
          {poll.isClosed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-fill-tertiary px-2.5 py-1 text-caption-1 font-medium text-slate-500">
              <Lock className="h-3 w-3" /> Yakunlandi
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-caption-1 font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Jonli
            </span>
          )}
        </div>

        <h3 className="mt-3 text-title-2 font-semibold leading-snug text-brand-900">{poll.question}</h3>
        {poll.description && (
          <p className="mt-1.5 text-subhead leading-relaxed text-slate-500">{poll.description}</p>
        )}
        <p className="mt-2 text-footnote text-slate-500">{subtitle}</p>
      </div>

      {/* Variantlar — inset grouped ro'yxat */}
      <div className="p-4 sm:p-5">
        <div className="overflow-hidden rounded-ios-lg bg-surface-soft">
          {rows.map((o, i) => (
            <OptionRow
              key={o.id}
              option={o}
              rank={i + 1}
              first={i === 0}
              voted={voted === o.id}
              showResults={showResults}
              isLeader={leaderId === o.id}
              closed={poll.isClosed}
              busy={voting === o.id}
              animate={inView}
              onVote={() => vote(o.id)}
              onPlay={setVideo}
            />
          ))}
        </div>
      </div>

      {/* Pastki qator */}
      <div className="hairline-t flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 py-3.5 sm:px-6">
        <span className="flex items-baseline gap-1.5 text-footnote text-slate-500">
          <span className="text-subhead font-semibold tabular-nums text-brand-900">
            {poll.totalVotes.toLocaleString('uz')}
          </span>
          ishtirokchi ovoz berdi
        </span>
        <span className="text-caption-1 text-slate-500">
          {voted
            ? 'Boshqasini tanlab fikringizni o‘zgartiring'
            : poll.isClosed
              ? 'Ovoz berish yopilgan'
              : 'Tanlash uchun bosing'}
        </span>
      </div>

      {video && <VideoModal url={video} onClose={() => setVideo(null)} />}
    </div>
  );
}

function OptionRow({
  option, rank, first, voted, showResults, isLeader, closed, busy, animate, onVote, onPlay,
}: {
  option: PollOption; rank: number; first: boolean; voted: boolean; showResults: boolean;
  isLeader: boolean; closed: boolean; busy: boolean; animate: boolean;
  onVote: () => void; onPlay: (url: string) => void;
}) {
  const s = option.startup;
  const pct = useCountUp(option.percent, animate && showResults);
  const winner = closed && isLeader;
  const accent = voted || isLeader;

  return (
    <div
      onClick={onVote}
      role="button"
      tabIndex={closed ? undefined : 0}
      onKeyDown={(e) => {
        if (!closed && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onVote(); }
      }}
      aria-pressed={voted}
      className={cn(
        'group/row relative px-3.5 py-3 transition-colors duration-150 sm:px-4',
        !first && 'hairline-t',
        voted && 'bg-accent-50',
        !closed && 'cursor-pointer hover:bg-fill-quaternary active:bg-fill-tertiary',
      )}
    >
      <div className="flex items-center gap-3">
        {/* O'rin (faqat natijalarda) */}
        {showResults && (
          <span
            className={cn(
              'grid h-6 w-6 shrink-0 place-items-center rounded-full text-caption-1 font-semibold tabular-nums',
              winner
                ? 'bg-accent-600 text-white'
                : accent
                  ? 'bg-accent-100 text-accent-700'
                  : 'bg-fill-tertiary text-slate-500',
            )}
          >
            {winner ? <Trophy className="h-3 w-3" /> : rank}
          </span>
        )}

        {/* Logotip — ilova ikonkasi (squircle), doira EMAS */}
        <StartupLogo
          src={s?.logoUrl}
          title={s?.title ?? 'Startap'}
          size={44}
          className="!rounded-[11px] ring-1 ring-black/[0.06]"
        />

        {/* Ma'lumot */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-callout font-semibold leading-tight text-brand-900">
              {s?.title ?? 'Startap'}
            </p>
            {winner && (
              <span className="shrink-0 rounded-full bg-accent-600 px-2 py-0.5 text-caption-2 font-semibold text-white">
                G‘olib
              </span>
            )}
            {!closed && isLeader && showResults && (
              <span className="shrink-0 rounded-full bg-accent-100 px-2 py-0.5 text-caption-2 font-semibold text-accent-700">
                Yetakchi
              </span>
            )}
          </div>

          <div className="mt-0.5 flex items-center gap-3">
            {s?.tagline || s?.category ? (
              <span className="truncate text-footnote text-slate-500">{s.tagline || s.category}</span>
            ) : null}
            {s?.videoUrl && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onPlay(s.videoUrl as string); }}
                className="tappable -my-2 inline-flex shrink-0 items-center gap-1 py-2 text-caption-1 font-medium text-accent-600"
              >
                <Play className="h-3 w-3" /> Video
              </button>
            )}
            {s && (
              <Link
                href={`/startups/${s.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="tappable -my-2 inline-flex shrink-0 items-center gap-0.5 py-2 text-caption-1 font-medium text-accent-600"
              >
                Batafsil <ChevronRight className="h-3 w-3" strokeWidth={3} />
              </Link>
            )}
          </div>
        </div>

        {/* O'ng: foiz (natija) yoki tanlash belgisi */}
        <div className="flex shrink-0 items-center">
          {showResults ? (
            <div className="flex flex-col items-end leading-none">
              <span
                className={cn(
                  'text-title-1 font-semibold tabular-nums',
                  accent ? 'text-brand-900' : 'text-slate-400',
                )}
              >
                {pct}
                <span className="text-subhead font-semibold text-slate-400">%</span>
              </span>
              <span className="mt-1 flex items-center gap-1 text-caption-1 tabular-nums text-slate-500">
                {voted && (
                  <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-accent-500 text-white">
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  </span>
                )}
                {option.voteCount.toLocaleString('uz')} ovoz
              </span>
            </div>
          ) : busy ? (
            <span className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-accent-500 border-t-transparent" />
          ) : (
            <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-slate-300 text-transparent transition-colors duration-150 group-hover/row:border-accent-500 group-hover/row:bg-accent-500 group-hover/row:text-white">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
          )}
        </div>
      </div>

      {/* Natija chizig'i */}
      {showResults && (
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-fill-tertiary">
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-700 ease-ios',
              accent ? 'bg-accent-500' : 'bg-slate-300',
            )}
            style={{ width: `${animate ? option.percent : 0}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function PollCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-ios-2xl bg-white">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="skeleton h-4 w-32 rounded-md" />
        <div className="skeleton mt-3 h-6 w-3/4 rounded-md" />
        <div className="skeleton mt-2 h-4 w-1/2 rounded-md" />
      </div>
      <div className="p-4 sm:p-5">
        <div className="overflow-hidden rounded-ios-lg bg-surface-soft">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="skeleton h-11 w-11 rounded-[11px]" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/2 rounded-md" />
                <div className="skeleton h-3 w-2/3 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
