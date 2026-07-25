'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ExternalLink, Play, X, Lock, Trophy } from '@/components/icons';
import { useQueryClient } from '@tanstack/react-query';
import { pollsApi, getErrorMessage } from '@/lib/api';
import { patchEntityInQueries } from '@/lib/entity-sync';
import { useInViewOnce } from '@/components/landing/reveal';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Poll, PollOption } from '@/types';
import toast from 'react-hot-toast';

/* Smooth count-up for percentages */
function useCountUp(target: number, active: boolean, duration = 800) {
  const [val, setVal] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
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

function VideoModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-brand-900/70 backdrop-blur-sm" />
      <div className="animate-scale-in relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Yopish" className="absolute -top-10 right-0 text-white/80 hover:text-white"><X className="h-6 w-6" /></button>
        <video src={url} controls autoPlay playsInline className="w-full rounded-ios-lg bg-black shadow-modal" />
      </div>
    </div>
  );
}

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
      ? 'Ovozingiz qabul qilindi. Natijalar real vaqtda yangilanmoqda.'
      : 'Bitta startapni tanlang. Ovozingiz anonim qoladi.';

  return (
    <div
      ref={cardRef}
      className={cn(
        'reveal overflow-hidden rounded-ios-2xl bg-white shadow-card hover:shadow-card-hover',
        inView && 'reveal-in',
      )}
      style={{ '--reveal-y': '20px' } as React.CSSProperties}
    >
      {/* Header */}
      <div className="px-5 pb-5 pt-5 sm:px-7 sm:pt-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-footnote font-semibold uppercase tracking-[0.06em] text-accent-700">
            Hamjamiyat ovozi
          </span>
          {poll.isClosed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-caption-1 font-semibold text-slate-500">
              <Lock className="h-3 w-3" /> Yakunlandi
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-2.5 py-1 text-caption-1 font-medium text-accent-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-500" />
              </span>
              Jonli
            </span>
          )}
        </div>

        <h3 className="mt-4 text-xl font-bold leading-snug tracking-tight text-brand-900 sm:text-[1.4rem]">
          {poll.question}
        </h3>
        {poll.description && <p className="mt-1.5 text-subhead leading-relaxed text-slate-500">{poll.description}</p>}
        <p className="mt-2 text-[12.5px] font-medium text-slate-500">{subtitle}</p>
      </div>

      {/* divider */}
      <div className="mx-5 h-px bg-slate-100 sm:mx-7" />

      {/* Options */}
      <div className="flex flex-col gap-1.5 p-3 sm:px-4 sm:py-4">
        {(showResults ? sorted : poll.options).map((o, i) => (
          <OptionRow
            key={o.id}
            option={o}
            rank={i + 1}
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

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3.5 sm:px-7">
        <span className="flex items-baseline gap-1.5 text-subhead">
          <span className="font-semibold tabular-nums text-brand-900">{poll.totalVotes.toLocaleString('uz')}</span>
          <span className="text-footnote font-medium text-slate-500">ishtirokchi ovoz berdi</span>
        </span>
        <span className="text-[11.5px] font-medium text-slate-500">
          {voted ? 'Boshqasini tanlab fikringizni o‘zgartiring' : poll.isClosed ? 'Ovoz berish yopilgan' : 'Tanlash uchun bosing'}
        </span>
      </div>

      {video && <VideoModal url={video} onClose={() => setVideo(null)} />}
    </div>
  );
}

function OptionRow({
  option, rank, voted, showResults, isLeader, closed, busy, animate, onVote, onPlay,
}: {
  option: PollOption; rank: number; voted: boolean; showResults: boolean; isLeader: boolean;
  closed: boolean; busy: boolean; animate: boolean; onVote: () => void; onPlay: (url: string) => void;
}) {
  const s = option.startup;
  const pct = useCountUp(option.percent, animate && showResults);
  const winner = closed && isLeader;
  const hasVotes = option.voteCount > 0;
  /* single restrained accent — emerald for anything highlighted, slate otherwise */
  const accent = voted || isLeader;

  return (
    <div
      onClick={onVote}
      role="button"
      tabIndex={closed ? undefined : 0}
      onKeyDown={(e) => { if (!closed && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onVote(); } }}
      aria-pressed={voted}
      className={cn(
        'group/row relative rounded-ios-lg border px-3 py-3 transition-all duration-200 sm:px-3.5',
        voted
          ? 'border-accent-500/50 bg-accent-50/40'
          : isLeader && showResults
            ? 'border-slate-200 bg-slate-50/60'
            : 'border-slate-200',
        !closed && 'cursor-pointer hover:border-accent-500/50 hover:bg-accent-50/30 active:scale-[0.99]',
      )}
    >
      <div className="flex items-center gap-3">
        {/* rank (results only) */}
        {showResults && (
          <span className={cn(
            'grid h-6 w-6 shrink-0 place-items-center rounded-ios text-caption-1 font-semibold tabular-nums',
            winner ? 'bg-accent-700 text-white' : accent ? 'bg-accent-100 text-accent-700' : 'bg-slate-100 text-slate-500',
          )}>
            {winner ? <Trophy className="h-3 w-3" /> : rank}
          </span>
        )}

        {/* logo */}
        <div className={cn(
          'h-11 w-11 shrink-0 overflow-hidden rounded-ios-md border bg-white',
          voted ? 'border-accent-300' : 'border-slate-200',
        )}>
          {s?.logoUrl ? (
            <Avatar src={s.logoUrl} name={s.title} size={44} className="!rounded-ios-md" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-slate-50 text-title-3 font-semibold text-brand-900">
              {s?.title?.[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>

        {/* info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className={cn('truncate text-[15px] font-bold leading-tight', voted ? 'text-accent-900' : 'text-brand-900')}>
              {s?.title ?? 'Startap'}
            </p>
            {winner && (
              <span className="shrink-0 rounded-full bg-accent-600 px-2 py-0.5 text-caption-2 font-semibold text-white">G‘olib</span>
            )}
            {!closed && isLeader && showResults && (
              <span className="shrink-0 rounded-full bg-accent-50 px-2 py-0.5 text-caption-2 font-semibold text-accent-700">Yetakchi</span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2.5">
            {s?.tagline ? (
              <span className="truncate text-footnote text-slate-500">{s.tagline}</span>
            ) : s?.category ? (
              <span className="truncate text-footnote text-slate-500">{s.category}</span>
            ) : null}
            {s?.videoUrl && (
              <button type="button"
                onClick={(e) => { e.stopPropagation(); onPlay(s.videoUrl as string); }}
                className="-my-1.5 inline-flex min-h-6 shrink-0 items-center gap-1 py-1.5 text-[10.5px] font-bold text-iris-600 transition-colors hover:text-iris-700">
                <Play className="h-2.5 w-2.5 fill-current" /> Video
              </button>
            )}
            {s && (
              <Link href={`/startups/${s.slug}`} onClick={(e) => e.stopPropagation()}
                className="-my-1.5 inline-flex min-h-6 shrink-0 items-center gap-1 py-1.5 text-[10.5px] font-semibold text-slate-500 transition-colors hover:text-brand-900">
                <ExternalLink className="h-2.5 w-2.5" /> Batafsil
              </Link>
            )}
          </div>
        </div>

        {/* right: percentage (results) or selector (before vote) */}
        <div className="flex shrink-0 items-center">
          {showResults ? (
            <div className="flex flex-col items-end leading-none">
              <span className={cn(
                'text-[1.7rem] font-semibold tabular-nums',
                accent ? 'text-brand-900' : 'text-slate-400',
              )}>
                {pct}<span className="text-subhead font-bold text-slate-400">%</span>
              </span>
              <span className="mt-1 flex items-center gap-1 text-[10.5px] tabular-nums text-slate-500">
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
            <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-slate-300 text-transparent transition-all duration-200 group-hover/row:border-accent-500 group-hover/row:bg-accent-500 group-hover/row:text-white">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
          )}
        </div>
      </div>

      {/* progress track — clean, restrained (results only) */}
      {showResults && (
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
              accent ? 'bg-accent-500' : 'bg-slate-300',
            )}
            style={{ width: animate ? `${Math.max(option.percent, hasVotes ? 3 : 0)}%` : 0 }}
          />
        </div>
      )}
    </div>
  );
}

/* Tanlov kartasi skeletoni — ro'yxat yuklanayotganda (spinner o'rniga shakl) */
export function PollCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-ios-2xl bg-white p-5 shadow-card sm:p-6">
      <div className="skeleton h-4 w-2/3 rounded-md" />
      <div className="skeleton mt-2 h-3 w-1/3 rounded-md" />
      <div className="mt-5 space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-ios-lg border border-slate-200 px-3 py-3">
            <div className="skeleton h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton h-3.5 w-1/2 rounded-md" />
              <div className="skeleton h-2.5 w-1/4 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
