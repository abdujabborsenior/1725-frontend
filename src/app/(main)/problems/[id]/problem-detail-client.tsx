'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, Eye, Clock, MessageSquare, Link2,
  Send, Trash2, CheckCircle2, ExternalLink, X, FileText, Video,
} from '@/components/icons';
import { problemsApi, commentsApi, solutionsApi, startupsApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { Problem, Comment, Solution } from '@/types';
import { ProblemCard } from '@/components/problems/problem-card';
import { StartupMiniCard } from '@/components/startups/startup-mini-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ProblemStatusPill } from '@/components/ui/badge';
import { Segmented } from '@/components/ui/segmented';
import { SolutionHelpfulButton } from '@/components/solutions/helpful-button';
import { PROBLEM_STATUS_META } from '@/lib/constants';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { categoryTint } from '@/lib/category-tint';
import { ProblemLikeButton } from '@/components/problems/like-button';
import { ProblemShareModal } from '@/components/problems/share-modal';
import { ReportButton } from '@/components/reports/report-dialog';
import { Share2 } from '@/components/icons';
import { timeAgo } from '@/lib/date';
import toast from 'react-hot-toast';

function isValidUrl(s: string) {
  try { new URL(s); return true; } catch { return false; }
}

/* ── Comment item ────────────────────────────────────────────── */
function CommentItem({
  comment, myId, problemId,
}: { comment: Comment; myId?: string; problemId: string }) {
  const qc = useQueryClient();
  const { mutate: remove, isPending } = useMutation({
    mutationFn: () => commentsApi.remove(problemId, comment.id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['comments', problemId] });
      toast.success("Izoh o'chirildi");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const canDelete = !!myId && myId === comment.authorId;

  return (
    <div className="flex gap-3 group">
      <div className="mt-0.5 flex-shrink-0">
        <Avatar src={comment.author?.avatarUrl} name={comment.author?.fullName ?? 'U'} size={32} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {comment.author?.username ? (
            <Link href={`/u/${comment.author.username}`} className="text-subhead font-semibold text-brand-900 hv-link">
              {comment.author.fullName}
            </Link>
          ) : (
            <span className="text-subhead font-semibold text-brand-900">
              {comment.author?.fullName ?? 'Foydalanuvchi'}
            </span>
          )}
          <span className="text-caption-2 text-slate-500">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="text-subhead text-slate-700 leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
        {comment.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {comment.links.map((l) => (
              <a key={l} href={l} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-caption-1 text-accent-700 hover:text-accent-800 transition-colors">
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
          aria-label="Izohni o'chirish"
          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 transition-all focus-visible:opacity-100 group-hover:opacity-100 flex-shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* ── Comment form ────────────────────────────────────────────── */
function CommentForm({ problemId }: { problemId: string }) {
  const qc = useQueryClient();
  const [content, setContent] = useState('');
  /* Havola — ODDIY maydon: alohida "Qo'shish" tugmasi YO'Q, izoh bilan birga
     yuboriladi (2026-07-25 direktivasi: havola qo'shish standart va tushunarli
     bo'lsin). `https://` yozish shart emas — normalizatsiya o'zi qo'shadi. */
  const [link, setLink] = useState('');

  const normalized = normalizeLink(link);
  const linkInvalid = link.trim().length > 0 && !normalized;

  const { mutate: addComment, isPending } = useMutation({
    mutationFn: () =>
      commentsApi.create(problemId, {
        content: content.trim(),
        links: normalized ? [normalized] : [],
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['comments', problemId] });
      setContent('');
      setLink('');
      toast.success("Izoh qo'shildi");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Fikringizni yozing..."
        rows={3}
        count={{ current: content.length, max: 2000 }}
      />
      <Input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Havola (ixtiyoriy)"
        inputMode="url"
        icon={<Link2 className="h-[18px] w-[18px]" />}
        error={linkInvalid ? "Havola to'g'ri emas" : undefined}
      />
      <Button
        variant="accent"
        loading={isPending}
        disabled={content.trim().length === 0 || linkInvalid}
        onClick={() => addComment()}
      >
        Yuborish
      </Button>
    </div>
  );
}

/** "example.uz" ham, "https://example.uz" ham qabul qilinadi; noto'g'ri bo'lsa null. */
function normalizeLink(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  if (!isValidUrl(withScheme)) return null;
  try {
    const u = new URL(withScheme);
    return u.hostname.includes('.') ? u.toString() : null;
  } catch {
    return null;
  }
}

/* ── Solution form ───────────────────────────────────────────── */
function SolutionForm({
  problemId, defaultName, userId, onClose,
}: { problemId: string; defaultName: string; userId?: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [fullName, setFullName] = useState(defaultName);
  const [content, setContent] = useState('');
  const [presentationUrl, setPresentationUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [startupId, setStartupId] = useState('');

  // O'z startapini yechim sifatida biriktirish — foydalanuvchining
  // e'lon qilingan (public) startaplari ro'yxati
  const { data: myStartups } = useQuery({
    queryKey: ['my-startups-attach', userId],
    queryFn: async () =>
      (await startupsApi.list({ userId, limit: 50, sort: 'newest' })).data,
    enabled: !!userId,
    staleTime: 60_000,
  });
  const attachable = (myStartups ?? []).filter(
    (s) => s.status === 'published' && s.visibility === 'public',
  );
  const selectedStartup = attachable.find((s) => s.id === startupId);

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () =>
      solutionsApi.submit({
        problemId,
        fullName: fullName.trim(),
        content: content.trim() || undefined,
        presentationUrl: presentationUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        startupId: startupId || undefined,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['solutions', problemId] });
      toast.success('Yechim yuborildi!');
      onClose();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const presentationInvalid = presentationUrl.trim().length > 0 && !isValidUrl(presentationUrl.trim());
  const videoInvalid = videoUrl.trim().length > 0 && !isValidUrl(videoUrl.trim());
  // Startap biriktirilsa — startapning o'zi yechim: matn/video/hujjat majburiy emas.
  // Biriktirilmasa — eski qoida: yechim matni kamida 20 belgi.
  const hasStartup = !!startupId;
  const contentTooShort = content.trim().length > 0 && content.trim().length < 20;
  const canSubmit =
    fullName.trim().length >= 2 &&
    (hasStartup ? !contentTooShort : content.trim().length >= 20) &&
    !presentationInvalid &&
    !videoInvalid;

  return (
    <div className="animate-slide-up space-y-4 rounded-ios-2xl bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-callout font-semibold text-brand-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-accent-600" /> Yechim taqdim etish
        </h3>
        <button onClick={onClose} aria-label="Yopish" className="text-slate-500 transition-colors hover:text-accent-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      <Input
        label="To'liq ism"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Ism Familiya"
      />

      {/* O'z startapini yechim sifatida yuborish — tanlansa qolgan maydonlar ixtiyoriy */}
      {attachable.length > 0 && (
        <div className="space-y-2">
          <label className="block text-subhead font-medium text-brand-900">
            Startapingizni yechim sifatida yuborish{' '}
            <span className="font-normal text-slate-500">(ixtiyoriy)</span>
          </label>
          <Select
            aria-label="Startapni biriktirish"
            value={startupId}
            onChange={(e) => setStartupId(e.target.value)}
            options={[
              { value: '', label: 'Biriktirilmasin' },
              ...attachable.map((s) => ({ value: s.id, label: s.title })),
            ]}
          />
          {selectedStartup && <StartupMiniCard startup={selectedStartup} />}
          <p className="text-caption-1 text-slate-500">
            {hasStartup
              ? 'Startapingizning o’zi yechim sifatida yetarli — matn, taqdimot va video endi ixtiyoriy.'
              : 'Startap tanlasangiz, matn/taqdimot/video majburiy bo’lmaydi.'}
          </p>
        </div>
      )}

      <Textarea
        label={hasStartup ? 'Yechim izohi (ixtiyoriy)' : 'Yechim'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          hasStartup
            ? 'Xohlasangiz startapingiz bu muammoni qanday hal qilishini qisqacha yozing...'
            : 'Yechimingizni batafsil yozing... (kamida 20 ta belgi)'
        }
        rows={hasStartup ? 3 : 5}
        hint={contentTooShort ? 'Kamida 20 ta belgi' : undefined}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Taqdimot havolasi"
          value={presentationUrl}
          onChange={(e) => setPresentationUrl(e.target.value)}
          placeholder="https://... (ixtiyoriy)"
          icon={<FileText className="h-4 w-4" />}
          error={presentationInvalid ? "Noto'g'ri havola" : undefined}
        />
        <Input
          label="Video havolasi"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://... (ixtiyoriy)"
          icon={<Video className="h-4 w-4" />}
          error={videoInvalid ? "Noto'g'ri havola" : undefined}
        />
      </div>

      <Button variant="accent" loading={isPending} disabled={!canSubmit} onClick={() => submit()}>
        <Send className="h-4 w-4" /> Yechimni yuborish
      </Button>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export function ProblemDetailClient({ initialProblem }: { initialProblem: Problem | null }) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [showSolutionForm, setShowSolutionForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'solutions'>('comments');
  const [shareOpen, setShareOpen] = useState(false);

  // Muammo sahifasi guestga ham ochiq. ?solve=1 bilan kelgan (masalan,
  // register'dan qaytgan) foydalanuvchiga yechim formasini darhol ochamiz.
  useEffect(() => {
    if (!token) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('solve') === '1') {
      setShowSolutionForm(true);
      setActiveTab('solutions');
    }
  }, [token]);

  const { data: problem, isLoading } = useQuery({
    queryKey: ['problem', id],
    queryFn: () => problemsApi.findOne(id),
    enabled: !!id,
    // SSR'dan kelgan boshlang'ich kontent; shaxsiy flaglar background'da yangilanadi
    initialData: initialProblem ?? undefined,
    initialDataUpdatedAt: 0,
  });

  const commentsEnabled =
    !!problem && (problem.status === 'open' || problem.submittedById === user?.id);

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => (await commentsApi.list(id, { limit: 100 })).data,
    enabled: commentsEnabled,
  });

  // Yechimlar ochiq kontent — joylangan zahoti hammaga (guest ham) ko'rinadi.
  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions', id],
    queryFn: async () =>
      (await solutionsApi.list({ problemId: id, limit: 100 })).data,
    enabled: !!problem,
  });

  // O'xshash muammolar (kategoriya + matn o'xshashligi) — sahifa pastida
  const { data: similar } = useQuery({
    queryKey: ['problem-similar', id],
    queryFn: () => problemsApi.similar(id),
    enabled: !!problem && problem.status === 'open',
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-32 rounded bg-slate-100" />
        <div className="h-48 rounded-ios-2xl bg-slate-100" />
        <div className="h-64 rounded-ios-2xl bg-slate-100" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500">Muammo topilmadi</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">Orqaga</Button>
      </div>
    );
  }

  const isOpen = problem.status === 'open';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="tappable -ml-1 flex items-center gap-0.5 text-body text-accent-700"
      >
        <ChevronLeft className="h-[19px] w-[19px]" strokeWidth={3} />
        Orqaga
      </button>

      {/* Problem card */}
      {/* Holat FAQAT pill orqali bildiriladi — kartaga rangli chiziq (web
          urg'u naqshi) qo'yilmaydi (iOS: sirt tinch, ma'no belgida). */}
      <article className="relative overflow-hidden rounded-ios-2xl bg-white p-6 shadow-card md:p-8">
        <div className="relative mb-5 flex flex-wrap items-center gap-3">
          <ProblemStatusPill status={problem.status} />
          {problem.category && (
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-caption-1 font-medium',
                categoryTint(problem.category).chip,
              )}
            >
              {problem.category}
            </span>
          )}
          <div className="ml-auto flex items-center gap-3.5 text-footnote text-slate-500">
            <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {problem.viewCount.toLocaleString('uz')}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />
              {timeAgo(problem.createdAt)}
            </span>
          </div>
        </div>

        <h1 className="relative mb-4 text-title-1 font-bold leading-tight tracking-tight text-brand-900">
          {problem.title}
        </h1>
        <p className="relative whitespace-pre-wrap break-words text-body leading-relaxed text-slate-600">
          {problem.description}
        </p>

        {problem.imageUrls.length > 0 && (
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">
            {problem.imageUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                className="hv-media aspect-video rounded-ios-md bg-fill-tertiary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Muammo rasmi" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </a>
            ))}
          </div>
        )}

        {problem.videoUrls.length > 0 && (
          <div className="mt-4 space-y-3">
            {problem.videoUrls.map((url, i) => (
              <video key={i} src={url} controls playsInline
                className="w-full max-h-96 rounded-ios-lg bg-black" />
            ))}
          </div>
        )}

        {/* Like + Share + author */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
          <ProblemLikeButton
            problemId={problem.id}
            initialLiked={problem.likedByMe ?? false}
            initialCount={problem.likeCount}
          />
          <button
            onClick={() => setShareOpen(true)}
            className="tappable inline-flex h-10 items-center gap-2 rounded-full bg-accent-50 px-4 text-subhead font-semibold text-accent-700 transition-colors hover:bg-accent-100"
          >
            <Share2 className="h-4 w-4" /> Ulashish
          </button>
          <ReportButton
            targetType="problem"
            targetId={problem.id}
            className="h-10 rounded-full bg-fill-tertiary px-4"
          />

          {problem.submittedBy && (
            <div className="ml-auto flex items-center gap-2.5">
              <Avatar src={problem.submittedBy.avatarUrl} name={problem.submittedBy.fullName} size={32} />
              <span className="text-subhead text-slate-500">
                {problem.submittedBy.username ? (
                  <Link href={`/u/${problem.submittedBy.username}`} className="font-semibold text-brand-900 hv-link">
                    {problem.submittedBy.fullName}
                  </Link>
                ) : (
                  <span className="font-semibold text-brand-900">{problem.submittedBy.fullName}</span>
                )}{' '}tomonidan
              </span>
            </div>
          )}
        </div>

        {problem.analyzerNote && (
          <div className="mt-4 p-4 rounded-lg bg-accent-50 border border-accent-200">
            <p className="text-footnote font-semibold text-accent-700 mb-1">Analizator izohi</p>
            <p className="text-subhead text-slate-700 whitespace-pre-wrap">{problem.analyzerNote}</p>
          </div>
        )}
      </article>

      {/* Solution CTA — guest bosса register orqali aynan shu yerga qaytadi */}
      {isOpen && !showSolutionForm && (
        <div className="flex justify-center">
          {token ? (
            <Button variant="accent" size="lg" onClick={() => { setShowSolutionForm(true); setActiveTab('solutions'); }}>
              <CheckCircle2 className="h-4 w-4" /> Yechim taqdim etish
            </Button>
          ) : (
            <Link href={`/register?next=${encodeURIComponent(`/problems/${id}?solve=1`)}`}>
              <Button variant="accent" size="lg">
                <CheckCircle2 className="h-4 w-4" /> Yechim taqdim etish
              </Button>
            </Link>
          )}
        </div>
      )}

      {showSolutionForm && (
        <SolutionForm
          problemId={id}
          defaultName={user?.fullName ?? ''}
          userId={user?.id}
          onClose={() => setShowSolutionForm(false)}
        />
      )}

      {/* Tabs */}
      <div>
        <div className="mb-5 w-full sm:w-80">
          <Segmented
            aria-label="Izohlar yoki yechimlar"
            value={activeTab}
            onChange={(v) => setActiveTab(v)}
            options={[
              { value: 'comments', label: 'Izohlar', count: comments.length },
              { value: 'solutions', label: 'Yechimlar', count: solutions.length },
            ]}
          />
        </div>

        {/* Comments */}
        {activeTab === 'comments' && (
          <div className="space-y-5">
            {token && isOpen ? (
              <div className="rounded-ios-2xl bg-white p-5 shadow-card">
                <div className="flex items-center gap-2 mb-3 text-subhead font-semibold text-brand-900">
                  <MessageSquare className="h-4 w-4 text-accent-600" /> Izoh yozish
                </div>
                <CommentForm problemId={id} />
              </div>
            ) : !token ? (
              <p className="text-caption-1 text-slate-500">
                Izoh yozish uchun{' '}
                <Link
                  href={`/register?next=${encodeURIComponent(`/problems/${id}`)}`}
                  className="font-semibold text-accent-700 hv-link"
                >
                  ro&apos;yxatdan o&apos;ting
                </Link>
                .
              </p>
            ) : null}

            {comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-10 w-10 text-accent-300 mx-auto mb-3" />
                <p className="text-slate-500 text-subhead">Hali izoh yo&apos;q</p>
              </div>
            ) : (
              <div className="space-y-5 rounded-ios-2xl bg-white p-5 shadow-card">
                {comments.map((c) => (
                  <CommentItem key={c.id} comment={c} myId={user?.id} problemId={id} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Solutions */}
        {activeTab === 'solutions' && (
          <div className="space-y-4">
            {solutions.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-10 w-10 text-accent-300 mx-auto mb-3" />
                <p className="text-slate-500 text-subhead">Hali yechim yo&apos;q — birinchi bo&apos;ling!</p>
              </div>
            ) : solutions.map((s: Solution) => (
              <div key={s.id} className="rounded-ios-2xl bg-white p-5 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={s.submittedBy?.avatarUrl} name={s.submittedBy?.fullName ?? s.fullName} size={32} />
                    <div>
                      {s.submittedBy?.username ? (
                        <Link href={`/u/${s.submittedBy.username}`} className="text-subhead font-semibold text-brand-900 hv-link">
                          {s.submittedBy?.fullName ?? s.fullName}
                        </Link>
                      ) : (
                        <p className="text-subhead font-semibold text-brand-900">{s.submittedBy?.fullName ?? s.fullName}</p>
                      )}
                      <p className="text-caption-2 text-slate-500">
                        {timeAgo(s.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Startap yechim sifatida yuborilganda matn bo'sh bo'lishi mumkin */}
                {s.content?.trim() && (
                  <p className="text-subhead text-slate-700 leading-relaxed whitespace-pre-wrap break-words">{s.content}</p>
                )}
                {/* Yechim sifatida biriktirilgan startap — card */}
                {s.startup && (
                  <div className="mt-3">
                    <StartupMiniCard startup={s.startup} />
                  </div>
                )}
                {(s.presentationUrl || s.videoUrl) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {s.presentationUrl && (
                      <a href={s.presentationUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-caption-1 text-accent-700 hv-link">
                        <FileText className="h-3 w-3" /> Taqdimot
                      </a>
                    )}
                    {s.videoUrl && (
                      <a href={s.videoUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-caption-1 text-violet-700 hv-link">
                        <Video className="h-3 w-3" /> Video
                      </a>
                    )}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                  <SolutionHelpfulButton
                    solutionId={s.id}
                    ownerId={s.submittedById}
                    initialHelpful={s.helpfulByMe ?? false}
                    initialCount={s.helpfulCount ?? 0}
                  />
                  <ReportButton targetType="solution" targetId={s.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* O'xshash muammolar */}
      {similar && similar.length > 0 && (
        <section className="space-y-3 border-t border-slate-200 pt-6">
          <h2 className="text-title-2 font-semibold text-brand-900">O&apos;xshash muammolar</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.slice(0, 6).map((p) => (
              <ProblemCard key={p.id} problem={p} compact />
            ))}
          </div>
        </section>
      )}

      <ProblemShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        problemId={problem.id}
        problemTitle={problem.title}
      />
    </div>
  );
}
