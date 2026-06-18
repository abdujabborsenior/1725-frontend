'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Check, ExternalLink, Play, X, Lock, Trophy, BarChart3 } from 'lucide-react';
import { pollsApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Poll, PollOption } from '@/types';
import toast from 'react-hot-toast';

/* Smooth count-up for percentages */
function useCountUp(target: number, active: boolean, duration = 900) {
  const [val, setVal] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    let raf = 0;
    const start = performance.now();
    const from = ref.current;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-brand-900/70 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 12 }}
        className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/80 hover:text-white"><X className="h-6 w-6" /></button>
        <video src={url} controls autoPlay playsInline className="w-full rounded-2xl bg-black shadow-modal" />
      </motion.div>
    </motion.div>
  );
}

export function PollCard({ poll: initial }: { poll: Poll }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [poll, setPoll] = useState(initial);
  const [voting, setVoting] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: '-40px' });

  useEffect(() => setPoll(initial), [initial]);

  const voted = poll.myVotedOptionId;
  const showResults = !!voted || poll.isClosed;
  const sorted = [...poll.options].sort((a, b) => b.voteCount - a.voteCount);
  const leaderId = sorted[0]?.voteCount > 0 ? sorted[0].id : null;

  async function vote(optionId: string) {
    if (!token) { router.push('/login?next=/polls'); return; }
    if (poll.isClosed || voting) return;
    setVoting(optionId);
    try { setPoll(await pollsApi.vote(poll.id, optionId)); }
    catch (err) { toast.error(getErrorMessage(err)); }
    finally { setVoting(null); }
  }

  const subtitle = poll.isClosed
    ? 'Yakuniy natijalar'
    : showResults
      ? 'Ovozingiz qabul qilindi — natijalar jonli yangilanmoqda'
      : 'Bitta variantni tanlang — ovozingiz anonim';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group/card relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-soft transition-shadow duration-500 hover:shadow-lift"
    >
      {/* premium ambient wash */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-iris-500/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-accent-500/[0.07] blur-3xl" />

      {/* Header */}
      <div className="relative px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-emerald-iris text-white shadow-glow-iris">
              <BarChart3 className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Hamjamiyat ovozi</span>
          </span>
          {poll.isClosed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-500">
              <Lock className="h-3 w-3" /> Yakunlandi
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1.5 text-[11px] font-bold text-accent-700 ring-1 ring-inset ring-accent-500/15">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
              </span>
              Jonli
            </span>
          )}
        </div>

        <h3 className="mt-4 text-[1.35rem] font-black leading-[1.18] tracking-tight text-brand-900 sm:text-[1.55rem]">
          {poll.question}
        </h3>
        {poll.description && <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{poll.description}</p>}
        <p className="mt-2 text-[12.5px] font-medium text-slate-400">{subtitle}</p>
      </div>

      {/* Options */}
      <motion.div layout className="flex flex-col gap-2 px-3 pb-2 sm:px-4">
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
      </motion.div>

      {/* Footer */}
      <div className="relative mt-1 flex items-center justify-between gap-2 px-5 py-4 sm:px-7">
        <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent sm:inset-x-7" />
        <span className="flex items-baseline gap-1.5 text-sm">
          <span className="font-black tabular-nums text-brand-900">{poll.totalVotes.toLocaleString('uz')}</span>
          <span className="text-xs font-medium text-slate-400">ishtirokchi ovoz berdi</span>
        </span>
        <span className="text-[11.5px] font-medium text-slate-400">
          {voted ? 'Boshqasini tanlab — fikringizni o‘zgartiring' : poll.isClosed ? 'Ovoz berish yopilgan' : 'Tanlash uchun bosing'}
        </span>
      </div>

      <AnimatePresence>{video && <VideoModal url={video} onClose={() => setVideo(null)} />}</AnimatePresence>
    </motion.div>
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

  /* tone drives the liquid fill + accents */
  const tone: 'gold' | 'accent' | 'slate' =
    winner ? 'gold' : voted ? 'accent' : isLeader ? 'accent' : 'slate';

  const fillWidth = showResults ? `${Math.max(option.percent, hasVotes ? 4 : 0)}%` : '0%';

  return (
    <motion.div
      layout
      transition={{ layout: { type: 'spring', stiffness: 360, damping: 32 } }}
      whileTap={!closed ? { scale: 0.985 } : undefined}
      onClick={onVote}
      role="button"
      tabIndex={closed ? undefined : 0}
      onKeyDown={(e) => { if (!closed && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onVote(); } }}
      aria-pressed={voted}
      className={cn(
        'relative isolate overflow-hidden rounded-2xl border px-3 py-3 text-left transition-all duration-300 sm:px-3.5',
        voted ? 'border-accent-500/40' : isLeader && showResults ? 'border-accent-500/20' : 'border-slate-200/70',
        !closed && 'cursor-pointer hover:border-accent-500/40 hover:shadow-soft',
      )}
    >
      {/* Liquid fill — the signature result visual */}
      {showResults && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: fillWidth }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 -z-10"
        >
          <div className={cn(
            'h-full w-full',
            tone === 'gold'
              ? 'bg-gradient-to-r from-amber-400/45 via-amber-300/30 to-amber-200/18'
              : tone === 'accent'
                ? 'bg-gradient-to-r from-accent-500/40 via-accent-400/26 to-iris-500/16'
                : 'bg-gradient-to-r from-slate-200 to-slate-100',
          )} />
          {/* soft top highlight for a glossy, liquid feel */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent" />
          {/* meniscus — bold glowing edge marking exactly where the fill reaches */}
          {hasVotes && (
            <span className={cn(
              'absolute inset-y-0.5 right-0 w-1 rounded-full',
              tone === 'gold'
                ? 'bg-amber-400 shadow-[0_0_18px_3px_rgba(251,191,36,0.7)]'
                : tone === 'accent'
                  ? 'bg-accent-500 shadow-[0_0_18px_3px_rgba(16,185,129,0.65)]'
                  : 'bg-slate-300 shadow-[0_0_10px_1px_rgba(148,163,184,0.5)]',
            )} />
          )}
        </motion.div>
      )}

      <div className="relative flex items-center gap-3">
        {/* logo + rank chip */}
        <div className="relative shrink-0">
          <div className={cn(
            'h-11 w-11 overflow-hidden rounded-xl border bg-white transition-shadow',
            winner ? 'border-amber-300 shadow-[0_0_0_3px_rgba(251,191,36,0.18)]'
              : voted ? 'border-accent-300 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]'
              : 'border-slate-200',
          )}>
            {s?.logoUrl ? (
              <Avatar src={s.logoUrl} name={s.title} size={44} className="!rounded-xl" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-slate-50 text-lg font-black text-brand-900">
                {s?.title?.[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          {showResults && (
            <span className={cn(
              'absolute -bottom-1.5 -left-1.5 grid h-5 min-w-[20px] place-items-center rounded-full px-1 text-[10px] font-black tabular-nums text-white ring-2 ring-white',
              tone === 'gold' ? 'bg-amber-500' : tone === 'accent' ? 'bg-accent-600' : 'bg-slate-400',
            )}>
              {winner ? <Trophy className="h-2.5 w-2.5" /> : rank}
            </span>
          )}
        </div>

        {/* info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className={cn('truncate text-[15px] font-bold leading-tight',
              voted ? 'text-accent-900' : 'text-brand-900')}>{s?.title ?? 'Startap'}</p>
            {winner && <span className="shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-700">G‘olib</span>}
            {!closed && isLeader && showResults && <span className="shrink-0 rounded-md bg-accent-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-accent-700">Yetakchi</span>}
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            {s?.tagline ? (
              <span className="truncate text-xs text-slate-500">{s.tagline}</span>
            ) : s?.category ? (
              <span className="truncate text-xs text-slate-400">{s.category}</span>
            ) : null}
            {s?.videoUrl && (
              <button type="button"
                onClick={(e) => { e.stopPropagation(); onPlay(s.videoUrl as string); }}
                className="inline-flex shrink-0 items-center gap-1 text-[10.5px] font-bold text-iris-600 transition-colors hover:text-iris-700">
                <Play className="h-2.5 w-2.5 fill-current" /> Video
              </button>
            )}
            {s && (
              <Link href={`/startups/${s.slug}`} onClick={(e) => e.stopPropagation()}
                className="inline-flex shrink-0 items-center gap-1 text-[10.5px] font-semibold text-slate-400 transition-colors hover:text-brand-900">
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
                'text-2xl font-black tabular-nums sm:text-[1.65rem]',
                tone === 'gold'
                  ? 'text-amber-600'
                  : tone === 'accent'
                    ? 'bg-gradient-emerald-iris bg-clip-text text-transparent'
                    : 'text-slate-400',
              )}>
                {pct}<span className="text-sm font-bold">%</span>
              </span>
              <span className="mt-1 flex items-center gap-1 text-[10.5px] tabular-nums text-slate-400">
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
            <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-slate-300 text-transparent transition-all duration-200 group-hover/card:border-slate-300 hover:!border-accent-500 hover:bg-accent-500 hover:text-white">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
