'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check, Users, ExternalLink, Play, X, Lock, BarChart3, Trophy,
} from 'lucide-react';
import { pollsApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Poll, PollOption } from '@/types';
import toast from 'react-hot-toast';

function VideoModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-brand-900/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/80 hover:text-white">
          <X className="h-6 w-6" />
        </button>
        <video src={url} controls autoPlay playsInline className="w-full rounded-2xl bg-black shadow-modal" />
      </div>
    </div>
  );
}

export function PollCard({ poll: initial }: { poll: Poll }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [poll, setPoll] = useState(initial);
  const [voting, setVoting] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);

  useEffect(() => setPoll(initial), [initial]);

  const voted = poll.myVotedOptionId;
  const winner = [...poll.options].sort((a, b) => b.voteCount - a.voteCount)[0];

  async function vote(optionId: string) {
    if (!token) {
      router.push('/login?next=/polls');
      return;
    }
    if (poll.isClosed || voting) return;
    setVoting(optionId);
    try {
      const updated = await pollsApi.vote(poll.id, optionId);
      setPoll(updated);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setVoting(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-br from-surface-soft to-white px-5 py-4 md:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-emerald-iris text-white shadow-glow-accent">
              <BarChart3 className="h-[18px] w-[18px]" />
            </span>
            <span className="rounded-full border border-accent-200 bg-accent-50 px-2.5 py-0.5 text-[11px] font-semibold text-accent-700">
              Ovoz berish
            </span>
          </div>
          {poll.isClosed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
              <Lock className="h-3 w-3" /> Yopilgan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent-500" /> Faol
            </span>
          )}
        </div>
        <h3 className="mt-3 text-lg font-black text-brand-900 md:text-xl">{poll.question}</h3>
        {poll.description && <p className="mt-1 text-sm leading-relaxed text-slate-500">{poll.description}</p>}
      </div>

      {/* Options */}
      <div className="space-y-2.5 p-4 md:p-5">
        {poll.options.map((o) => (
          <OptionRow
            key={o.id}
            option={o}
            voted={voted === o.id}
            anyVote={!!voted}
            isWinner={poll.isClosed && winner?.id === o.id}
            closed={poll.isClosed}
            busy={voting === o.id}
            onVote={() => vote(o.id)}
            onPlay={(url) => setVideo(url)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 md:px-6">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> {poll.totalVotes.toLocaleString('uz')} ovoz
        </span>
        <span className="text-slate-400">
          {voted ? 'Ovozingizni o‘zgartirish uchun yana bosing' : poll.isClosed ? 'Ovoz berish yakunlandi' : 'Variantni tanlab ovoz bering'}
        </span>
      </div>

      {video && <VideoModal url={video} onClose={() => setVideo(null)} />}
    </div>
  );
}

function OptionRow({
  option, voted, anyVote, isWinner, closed, busy, onVote, onPlay,
}: {
  option: PollOption;
  voted: boolean;
  anyVote: boolean;
  isWinner: boolean;
  closed: boolean;
  busy: boolean;
  onVote: () => void;
  onPlay: (url: string) => void;
}) {
  const s = option.startup;
  const showResults = anyVote || closed;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-all',
        voted ? 'border-accent-400 ring-1 ring-accent-400' : 'border-slate-200 hover:border-accent-300',
        !closed && 'cursor-pointer',
      )}
      onClick={onVote}
      role="button"
      aria-pressed={voted}
    >
      {/* Telegram uslubidagi foiz bari (fon) */}
      {showResults && (
        <div
          className={cn('absolute inset-y-0 left-0 transition-all duration-700 ease-out',
            voted ? 'bg-accent-100/70' : isWinner ? 'bg-amber-100/60' : 'bg-slate-100')}
          style={{ width: `${option.percent}%` }}
        />
      )}

      <div className="relative flex items-center gap-3 p-3">
        {/* Logo */}
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {s?.logoUrl ? (
            <Avatar src={s.logoUrl} name={s.title} size={48} className="!rounded-xl" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-base font-black text-brand-900">
              {s?.title?.[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold text-brand-900">{s?.title ?? 'Startap'}</p>
            {isWinner && <Trophy className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
          </div>
          {s?.tagline && <p className="truncate text-xs text-slate-500">{s.tagline}</p>}
          <div className="mt-0.5 flex items-center gap-2">
            {s?.category && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{s.category}</span>}
            {s?.videoUrl && (
              <button
                onClick={(e) => { e.stopPropagation(); onPlay(s.videoUrl as string); }}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-iris-600 hover:text-iris-700"
              >
                <Play className="h-2.5 w-2.5 fill-current" /> Video
              </button>
            )}
            {s && (
              <Link
                href={`/startups/${s.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-brand-900"
              >
                <ExternalLink className="h-2.5 w-2.5" /> Batafsil
              </Link>
            )}
          </div>
        </div>

        {/* Result / check */}
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          {busy ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
          ) : showResults ? (
            <>
              <span className={cn('text-base font-black tabular-nums', voted ? 'text-accent-700' : 'text-brand-900')}>
                {option.percent}%
              </span>
              <span className="text-[10px] text-slate-400">{option.voteCount} ovoz</span>
            </>
          ) : (
            <span className={cn('flex h-6 w-6 items-center justify-center rounded-full border',
              voted ? 'border-accent-500 bg-accent-500 text-white' : 'border-slate-300 text-transparent group-hover:border-accent-400')}>
              <Check className="h-3.5 w-3.5" />
            </span>
          )}
          {voted && showResults && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-accent-600">
              <Check className="h-3 w-3" /> Siz
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
