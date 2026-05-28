'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Eye, Clock, User, MessageSquare, Link2,
  Send, Trash2, CheckCircle2, ExternalLink, X,
} from 'lucide-react';
import { problemsApi, commentsApi, solutionsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { Problem, Comment, Solution } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_BADGE: Record<string, string> = {
  pending:      'bg-amber-500/15 text-amber-400 border-amber-500/30',
  open:         'bg-neon-green/10 text-neon-green border-neon-green/30',
  under_review: 'bg-brand-500/15 text-brand-400 border-brand-400/30',
  resolved:     'bg-violet-500/15 text-violet-400 border-violet-500/30',
  rejected:     'bg-red-500/15 text-red-400 border-red-500/30',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'Kutilmoqda', open: 'Ochiq',
  under_review: "Ko'rib chiqilmoqda", resolved: 'Hal qilindi', rejected: 'Rad etildi',
};
const SOL_BADGE: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400', approved: 'bg-neon-green/10 text-neon-green', rejected: 'bg-red-500/15 text-red-400',
};

function isValidUrl(s: string) {
  try { new URL(s); return true; } catch { return false; }
}

function CommentItem({
  comment, myId, problemId,
}: { comment: Comment; myId?: string; problemId: string }) {
  const qc = useQueryClient();
  const { mutate: remove, isPending } = useMutation({
    mutationFn: () => commentsApi.remove(problemId, comment.id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['comments', problemId] });
      toast.success('Comment o\'chirildi');
    },
    onError: () => toast.error('Xatolik'),
  });

  const canDelete = myId === comment.authorId;

  return (
    <div className="flex gap-3 group">
      <div className="h-8 w-8 rounded-xl bg-gradient-brand/20 border border-brand-400/20 flex items-center justify-center text-xs font-bold text-brand-400 flex-shrink-0 mt-0.5">
        {comment.author?.fullName?.charAt(0).toUpperCase() ?? 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-slate-200">
            {comment.author?.fullName ?? 'Foydalanuvchi'}
          </span>
          <span className="text-[10px] text-slate-600">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{comment.content}</p>
        {comment.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {comment.links.map((l) => (
              <a key={l} href={l} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-white transition-colors">
                <ExternalLink className="h-3 w-3" /> {l.length > 40 ? `${l.slice(0, 40)}…` : l}
              </a>
            ))}
          </div>
        )}
      </div>
      {canDelete && (
        <button
          onClick={() => remove()}
          disabled={isPending}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function CommentForm({ problemId }: { problemId: string }) {
  const qc = useQueryClient();
  const [content, setContent] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');

  const { mutate: addComment, isPending } = useMutation({
    mutationFn: () => commentsApi.create(problemId, { content, links }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['comments', problemId] });
      setContent('');
      setLinks([]);
      toast.success('Comment qo\'shildi');
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });

  function addLink() {
    const trimmed = linkInput.trim();
    if (!trimmed || !isValidUrl(trimmed) || links.includes(trimmed)) return;
    setLinks(l => [...l, trimmed]);
    setLinkInput('');
  }

  return (
    <div className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Fikringizni yozing..."
        rows={3}
        className="w-full rounded-2xl glass border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 px-4 py-3 focus:outline-none input-glow transition-all resize-none"
      />

      {/* Link adder */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          <input
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
            placeholder="Havola qo'shish (ixtiyoriy)"
            className="w-full h-10 pl-9 pr-3 rounded-xl glass border border-white/10 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none input-glow transition-all"
          />
        </div>
        <button onClick={addLink}
          className="h-10 px-3 rounded-xl glass border border-white/10 text-xs text-slate-400 hover:text-white hover:border-white/20 transition-all whitespace-nowrap">
          + Qo&apos;shish
        </button>
      </div>

      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((l) => (
            <div key={l} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-400/20 text-xs text-brand-400">
              <ExternalLink className="h-3 w-3" />
              <span className="truncate max-w-[160px]">{l}</span>
              <button onClick={() => setLinks(ls => ls.filter(x => x !== l))} className="text-brand-400/60 hover:text-brand-400">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button
        size="sm"
        loading={isPending}
        disabled={!content.trim()}
        onClick={() => addComment()}
      >
        <Send className="h-3.5 w-3.5" /> Yuborish
      </Button>
    </div>
  );
}

function SolutionForm({ problemId, onClose }: { problemId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [content, setContent] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => solutionsApi.submit({ problemId, content, links }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['problem', problemId] });
      toast.success('Yechim taqdim etildi!');
      onClose();
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });

  function addLink() {
    const trimmed = linkInput.trim();
    if (!trimmed || !isValidUrl(trimmed) || links.includes(trimmed)) return;
    setLinks(l => [...l, trimmed]);
    setLinkInput('');
  }

  return (
    <div className="glass-strong border border-neon-green/20 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-neon-green" /> Yechim taqdim etish
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Yechimingizni batafsil yozing..."
        rows={5}
        className="w-full rounded-2xl glass border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 px-4 py-3 focus:outline-none input-glow transition-all resize-none"
      />
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          <input value={linkInput} onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
            placeholder="Havola (GitHub, video...)"
            className="w-full h-10 pl-9 pr-3 rounded-xl glass border border-white/10 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none input-glow transition-all" />
        </div>
        <button onClick={addLink} className="h-10 px-3 rounded-xl glass border border-white/10 text-xs text-slate-400 hover:text-white transition-all whitespace-nowrap">
          + Qo&apos;shish
        </button>
      </div>
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((l) => (
            <div key={l} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neon-green/10 border border-neon-green/20 text-xs text-neon-green">
              <ExternalLink className="h-3 w-3" />
              <span className="truncate max-w-[160px]">{l}</span>
              <button onClick={() => setLinks(ls => ls.filter(x => x !== l))}><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      )}
      <Button variant="neon" loading={isPending} disabled={!content.trim()} onClick={() => submit()}>
        <Send className="h-4 w-4" /> Yechimni yuborish
      </Button>
    </div>
  );
}

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [showSolutionForm, setShowSolutionForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'solutions'>('comments');

  const { data: problem, isLoading } = useQuery<Problem>({
    queryKey: ['problem', id],
    queryFn: async () => {
      const res = await problemsApi.findOne(id);
      return (res.data as { data: Problem }).data;
    },
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['comments', id],
    queryFn: async () => {
      const res = await commentsApi.list(id);
      return (res.data as { data: Comment[] }).data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-32 rounded-lg bg-white/5" />
        <div className="h-48 rounded-2xl bg-white/5" />
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!problem) return (
    <div className="text-center py-24">
      <p className="text-slate-400">Muammo topilmadi</p>
      <Button variant="ghost" onClick={() => router.back()} className="mt-4">Orqaga</Button>
    </div>
  );

  const solutions: Solution[] = problem.solutions ?? [];
  const approvedSolutions = solutions.filter(s => s.status === 'approved');

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Orqaga
      </button>

      {/* Problem card */}
      <article className="glass-strong border border-white/[0.08] rounded-3xl p-6 md:p-8">
        {/* Status + meta */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className={cn('px-3 py-1 rounded-xl text-xs font-semibold border', STATUS_BADGE[problem.status])}>
            {STATUS_LABEL[problem.status]}
          </span>
          {problem.category && (
            <span className="px-3 py-1 rounded-xl text-xs font-medium glass border border-white/10 text-slate-400">
              {problem.category}
            </span>
          )}
          <div className="flex items-center gap-3 ml-auto text-xs text-slate-500">
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {problem.viewCount}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(problem.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-4">{problem.title}</h1>

        {/* Description */}
        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{problem.description}</p>

        {/* Images */}
        {problem.imageUrls.length > 0 && (
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">
            {problem.imageUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                className="aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-brand-400/30 transition-all">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        )}

        {/* Video links */}
        {problem.videoUrls.length > 0 && (
          <div className="mt-4 space-y-2">
            {problem.videoUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-brand-400 hover:text-white transition-colors">
                <ExternalLink className="h-4 w-4" /> Video {i + 1}
              </a>
            ))}
          </div>
        )}

        {/* Author */}
        {problem.submittedBy && (
          <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/[0.06]">
            <div className="h-7 w-7 rounded-lg bg-gradient-brand/20 flex items-center justify-center text-xs font-bold text-brand-400">
              {problem.submittedBy.fullName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-400">
              <span className="text-slate-200 font-medium">{problem.submittedBy.fullName}</span> tomonidan
            </span>
          </div>
        )}

        {/* Analyzer note */}
        {problem.analyzerNote && (
          <div className="mt-4 p-4 rounded-2xl bg-brand-500/10 border border-brand-400/20">
            <p className="text-xs font-semibold text-brand-400 mb-1 uppercase tracking-wide">Analizator izohi</p>
            <p className="text-sm text-slate-300">{problem.analyzerNote}</p>
          </div>
        )}
      </article>

      {/* Solution button */}
      {token && problem.status === 'open' && !showSolutionForm && (
        <div className="flex justify-center">
          <Button variant="neon" size="lg" onClick={() => setShowSolutionForm(true)}>
            <CheckCircle2 className="h-4 w-4" /> Yechim taqdim etish
          </Button>
        </div>
      )}

      {showSolutionForm && (
        <SolutionForm problemId={id} onClose={() => setShowSolutionForm(false)} />
      )}

      {/* Tabs */}
      <div>
        <div className="flex gap-1 p-1 glass border border-white/10 rounded-2xl w-fit mb-5">
          {[
            { key: 'comments', label: 'Commentlar', count: comments.length },
            { key: 'solutions', label: 'Yechimlar', count: approvedSolutions.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'comments' | 'solutions')}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-200',
                activeTab === key ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300',
              )}
            >
              {label}
              <span className={cn(
                'px-1.5 py-0.5 rounded-md text-[10px] font-bold',
                activeTab === key ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-600',
              )}>{count}</span>
            </button>
          ))}
        </div>

        {/* Comments tab */}
        {activeTab === 'comments' && (
          <div className="space-y-5">
            {token && problem.status === 'open' && (
              <div className="glass border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-200">
                  <MessageSquare className="h-4 w-4 text-brand-400" /> Comment yozish
                </div>
                <CommentForm problemId={id} />
              </div>
            )}

            {comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Hali comment yo&apos;q</p>
              </div>
            ) : (
              <div className="glass border border-white/[0.07] rounded-2xl p-5 space-y-5">
                {comments.map((c) => (
                  <CommentItem key={c.id} comment={c} myId={user?.id} problemId={id} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Solutions tab */}
        {activeTab === 'solutions' && (
          <div className="space-y-4">
            {approvedSolutions.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Hali tasdiqlangan yechim yo&apos;q</p>
              </div>
            ) : approvedSolutions.map((s) => (
              <div key={s.id} className="glass border border-neon-green/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-neon-green/10 flex items-center justify-center text-xs font-bold text-neon-green">
                      {s.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{s.fullName}</p>
                      <p className="text-[10px] text-slate-600">
                        {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <span className={cn('px-2 py-0.5 rounded-lg text-[11px] font-semibold', SOL_BADGE[s.status])}>
                    Tasdiqlangan
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{s.content}</p>
                {s.links.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {s.links.map((l) => (
                      <a key={l} href={l} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-neon-green hover:underline">
                        <ExternalLink className="h-3 w-3" />
                        {l.length > 50 ? `${l.slice(0, 50)}…` : l}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
