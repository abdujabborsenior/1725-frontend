'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Play, Pause, FileText, Reply, Download, Copy, Flag, Paperclip, Pencil } from '@/components/icons';
import { Avatar } from '@/components/ui/avatar';
import { ReportDialog } from '@/components/reports/report-dialog';
import { profileHref } from '@/components/social/user-list-item';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/date';
import type { ChatMessage, MessageAttachment } from '@/types';
import toast from 'react-hot-toast';

function fmtTime(iso: string) {
  return formatTime(iso);
}
function fmtDuration(sec?: number | null) {
  const s = Math.round(sec ?? 0);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Ovozli xabar — to'lqin + play/pause */
function VoiceMessage({ att, mine }: { att: MessageAttachment; mine: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  // To'lqin ustunlari SONI cheklanadi: uzun yozuvda (waveform 100+ nuqta)
  // pufak mobil ekrandan chiqib ketardi. Ortiqchasi tashlanmaydi —
  // teng oraliqda TANLANADI, shakl saqlanadi.
  const raw = att.waveform?.length ? att.waveform : Array.from({ length: 28 }, () => 30 + Math.random() * 60);
  const MAX_BARS = 28;
  const bars =
    raw.length <= MAX_BARS
      ? raw
      : Array.from({ length: MAX_BARS }, (_, i) => raw[Math.floor((i * raw.length) / MAX_BARS)]);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); } else { void a.play(); }
  }

  return (
    <div className="flex w-full min-w-0 items-center gap-3 py-1">
      <button
        onClick={toggle}
        aria-label={playing ? 'To‘xtatish' : 'Tinglash'}
        className={cn(
          'tappable-scale flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          mine ? 'bg-white/25 text-white' : 'bg-accent-500 text-white',
        )}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
      </button>
      <div className="flex h-8 min-w-0 flex-1 items-center gap-[2px]">
        {bars.map((h, i) => {
          const active = (i / bars.length) * 100 <= progress;
          return (
            <span
              key={i}
              className={cn(
                'min-w-[2px] flex-1 rounded-full transition-colors duration-150',
                mine ? (active ? 'bg-white' : 'bg-white/40') : active ? 'bg-accent-500' : 'bg-slate-300',
              )}
              style={{ height: `${Math.max(15, Math.min(100, h))}%` }}
            />
          );
        })}
      </div>
      <span className={cn('shrink-0 text-caption-1 tabular-nums', mine ? 'text-white/80' : 'text-slate-500')}>
        {fmtDuration(att.durationSec)}
      </span>
      <audio
        ref={audioRef}
        src={att.url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          if (a.duration) setProgress((a.currentTime / a.duration) * 100);
        }}
        className="hidden"
      />
    </div>
  );
}

function Attachment({ att, mine }: { att: MessageAttachment; mine: boolean }) {
  if (att.type === 'voice') return <VoiceMessage att={att} mine={mine} />;
  if (att.type === 'round_video') {
    return (
      <video
        src={att.url}
        controls
        playsInline
        className="h-52 w-52 rounded-full object-cover"
      />
    );
  }
  if (att.type === 'video') {
    return (
      <video src={att.url} controls playsInline className="max-h-80 w-full rounded-[15px] object-cover" />
    );
  }
  if (att.type === 'image') {
    return (
      <a href={att.url} target="_blank" rel="noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={att.url} alt={att.name ?? ''} className="max-h-80 rounded-[15px] object-cover" />
      </a>
    );
  }
  // file
  return (
    <a
      href={att.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'flex items-center gap-3 rounded-[14px] px-3 py-2',
        mine ? 'bg-white/15' : 'bg-fill-tertiary',
      )}
    >
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-[9px]', mine ? 'bg-white/20' : 'bg-white')}>
        <FileText className={cn('h-4 w-4', mine ? 'text-white' : 'text-slate-500')} />
      </span>
      <span className="min-w-0">
        <span className={cn('block truncate text-footnote font-medium', mine ? 'text-white' : 'text-brand-900')}>
          {att.name ?? 'Fayl'}
        </span>
        <span className={cn('text-caption-2', mine ? 'text-white/70' : 'text-slate-500')}>
          {(att.size / 1024).toFixed(0)} KB
        </span>
      </span>
      <Download className={cn('h-4 w-4 shrink-0', mine ? 'text-white/80' : 'text-slate-400')} />
    </a>
  );
}

/* ── Kontekst menyu (o'ng tugma / uzun bosish) ──────────────── */
function ContextMenu({
  x, y, hasText, canReport, canEdit, onReply, onCopy, onReport, onEdit, onClose,
}: {
  x: number; y: number; hasText: boolean; canReport: boolean; canEdit: boolean;
  onReply: () => void; onCopy: () => void; onReport: () => void; onEdit: () => void; onClose: () => void;
}) {
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    window.addEventListener('pointerdown', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('pointerdown', close);
    };
  }, [onClose]);

  // Ekrandan chiqib ketmasligi uchun joylashuvni cheklash
  const left = Math.min(x, (typeof window !== 'undefined' ? window.innerWidth : 9999) - 180);
  const top = Math.min(y, (typeof window !== 'undefined' ? window.innerHeight : 9999) - 120);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70]"
      onContextMenu={(e) => { e.preventDefault(); onClose(); }}
    >
      <div
        className="material-menu animate-pop-in absolute min-w-[184px] overflow-hidden rounded-ios-lg p-1 shadow-modal ring-1 ring-black/[0.06]"
        style={{ left, top, transformOrigin: 'top left' }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => { onReply(); onClose(); }}
          className="flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2 text-body text-brand-900 transition-colors duration-150 active:bg-fill-tertiary"
        >
          <Reply className="h-[18px] w-[18px] text-slate-500" /> Javob berish
        </button>
        {canEdit && (
          <button
            onClick={() => { onEdit(); onClose(); }}
            className="flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2 text-body text-brand-900 transition-colors duration-150 active:bg-fill-tertiary"
          >
            <Pencil className="h-[18px] w-[18px] text-slate-500" /> Tahrirlash
          </button>
        )}
        {hasText && (
          <button
            onClick={() => { onCopy(); onClose(); }}
            className="flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2 text-body text-brand-900 transition-colors duration-150 active:bg-fill-tertiary"
          >
            <Copy className="h-[18px] w-[18px] text-slate-500" /> Nusxa olish
          </button>
        )}
        {canReport && (
          <button
            onClick={() => { onReport(); onClose(); }}
            className="flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2 text-body text-rose-600 transition-colors duration-150 active:bg-rose-50"
          >
            <Flag className="h-[18px] w-[18px]" /> Shikoyat qilish
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}

interface Props {
  message: ChatMessage;
  mine: boolean;
  /** Guruh (ketma-ket bir muallif xabarlari) BOSHI — avatar va ism shu yerda */
  showAvatar: boolean;
  /** Guruh OXIRI — pastki burchak to'liq yumaloq qoladi */
  groupEnd?: boolean;
  isGroup: boolean;
  read?: boolean;
  /**
   * Kirish animatsiyasi. FAQAT suhbat ochilgandan KEYIN kelgan (yoki
   * yuborilgan) xabarlar uchun: aks holda ochilishda 30 ta pufak birdan
   * sakraydi — shovqin bo'ladi va Telegram xulqiga zid.
   */
  animate?: boolean;
  onReply: (m: ChatMessage) => void;
  onEdit?: (m: ChatMessage) => void;
}

const SWIPE_THRESHOLD = 64;

export function MessageBubble({
  message, mine, showAvatar, groupEnd = true, isGroup, read, animate: animateIn, onReply, onEdit,
}: Props) {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const x = useMotionValue(0);
  // Surilganda ko'rinadigan reply ikonkasi — surish chuqurligiga bog'liq
  const iconScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.2, 1]);
  const iconOpacity = useTransform(x, [8, SWIPE_THRESHOLD], [0, 1]);

  const lastTap = useRef(0);
  const longPress = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggedRef = useRef(false);

  if (message.type === 'system') {
    return (
      <div className="my-2 flex justify-center">
        <span className={cn('rounded-full bg-black/[0.06] px-3 py-1 text-caption-1 font-medium text-slate-500', animateIn && 'msg-pop')}>
          {message.content}
        </span>
      </div>
    );
  }

  const isRound = message.attachments.some((a) => a.type === 'round_video');
  const onlyMedia =
    !message.content &&
    message.attachments.length > 0 &&
    message.attachments.every((a) => ['image', 'video', 'round_video'].includes(a.type));

  // Vaqt pufak ichida, oxirgi qatorda turadi — shuning uchun oxirgi qatorda
  // unga joy ajratiladi (`bubble-gap`). Kengligi meta uzunligiga bog'liq.
  const edited = !!message.editedAt && !message.pending;
  const metaGap = edited ? 92 : 40;

  function triggerReply() {
    onReply(message);
  }

  function copyText() {
    if (message.content) {
      navigator.clipboard?.writeText(message.content).then(
        () => toast.success('Nusxa olindi'),
        () => toast.error('Nusxa olib bo‘lmadi'),
      );
    }
  }

  // Ikki marta bosish/tegish → javob
  function handleClick() {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      triggerReply();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }

  // Uzun bosish (mobil) → kontekst menyu
  function startLongPress(e: React.PointerEvent) {
    if (e.pointerType !== 'touch') return;
    const px = e.clientX;
    const py = e.clientY;
    longPress.current = setTimeout(() => {
      if (!draggedRef.current) setMenu({ x: px, y: py });
    }, 450);
  }
  function cancelLongPress() {
    if (longPress.current) { clearTimeout(longPress.current); longPress.current = null; }
  }

  const meta = !isRound && (
    <span
      className={cn(
        'bubble-meta',
        onlyMedia && 'bubble-meta-over',
        mine && !onlyMedia ? 'text-white/75' : onlyMedia ? '' : 'text-slate-400',
      )}
    >
      {edited && <span className="italic">tahrirlangan</span>}
      {fmtTime(message.createdAt)}
    </span>
  );

  return (
    <div
      className={cn(
        'group relative flex items-end gap-2',
        animateIn && 'msg-pop',
        mine ? 'flex-row-reverse msg-pop-out' : 'flex-row msg-pop-in',
      )}
    >
      {/* Avatar (group, others) — profilga bog'langan */}
      {!mine && isGroup ? (
        showAvatar ? (
          message.sender ? (
            <Link href={profileHref(message.sender)} className="shrink-0">
              <Avatar src={message.sender.avatarUrl} name={message.sender.fullName} size={28} />
            </Link>
          ) : (
            <Avatar name="" size={28} />
          )
        ) : (
          <span className="w-7 shrink-0" />
        )
      ) : null}

      {/* Surish (swipe) reply ikonkasi — bubble ortida */}
      <motion.span
        style={{ scale: iconScale, opacity: iconOpacity }}
        className="pointer-events-none absolute left-8 top-1/2 z-0 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-accent-600 text-white"
      >
        <Reply className="h-4 w-4" />
      </motion.span>

      <div className={cn('relative z-10 flex max-w-[82%] flex-col sm:max-w-[76%]', mine ? 'items-end' : 'items-start')}>
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: SWIPE_THRESHOLD + 24 }}
          dragElastic={0.18}
          dragSnapToOrigin
          style={{ x }}
          onDragStart={() => { draggedRef.current = true; cancelLongPress(); }}
          onDragEnd={(_, info) => {
            if (info.offset.x >= SWIPE_THRESHOLD) {
              triggerReply();
            }
            void animate(x, 0, { type: 'spring', stiffness: 600, damping: 40 });
            setTimeout(() => { draggedRef.current = false; }, 60);
          }}
          onClick={handleClick}
          onContextMenu={(e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY }); }}
          onPointerDown={startLongPress}
          onPointerUp={cancelLongPress}
          onPointerCancel={cancelLongPress}
          onPointerMove={(e) => { if (e.pointerType === 'touch') cancelLongPress(); }}
          className={cn(
            'bubble relative cursor-pointer touch-pan-y select-none px-3.5 py-2',
            isRound
              ? 'bg-transparent p-0 shadow-none'
              : mine
                ? 'bubble-out'
                : 'bubble-in',
            // Guruhlash: qo'shni burchaklar toraytiriladi (dumcha o'rniga)
            !isRound && !showAvatar && (mine ? 'bubble-mid-out' : 'bubble-mid-in'),
            !isRound && !groupEnd && (mine ? 'bubble-cont-out' : 'bubble-cont-in'),
            onlyMedia && !isRound && 'overflow-hidden p-1',
            // Matnsiz biriktirma (fayl/ovoz): vaqt absolyut turadi — unga joy
            !isRound && !onlyMedia && !message.content && 'pb-5',
            // Yuborilmoqda — pufak bo'ylab yorug'lik yuguradi (soat ikonkasi yo'q)
            !isRound && message.pending && 'bubble-pending',
          )}
        >
          {/* Sender name (group) — profilga bog'langan */}
          {!mine && isGroup && showAvatar && message.sender && (
            <Link
              href={profileHref(message.sender)}
              onClick={(e) => e.stopPropagation()}
              draggable={false}
              className="mb-0.5 block text-footnote font-semibold text-accent-700"
            >
              {message.sender.fullName}
            </Link>
          )}

          {/* Reply preview */}
          {message.replyTo && (
            <div className={cn('mb-1.5 rounded-[10px] border-l-[3px] px-2.5 py-1.5 text-footnote', mine ? 'border-white/70 bg-white/15' : 'border-accent-500 bg-black/[0.04]')}>
              <p className={cn('font-semibold', mine ? 'text-white/90' : 'text-accent-700')}>{message.replyTo.senderName ?? 'Xabar'}</p>
              <p className={cn('flex items-center gap-1 truncate', mine ? 'text-white/75' : 'text-slate-500')}>
                {message.replyTo.content ?? (<><Paperclip className="h-3 w-3 shrink-0" /> Biriktirma</>)}
              </p>
            </div>
          )}

          {/* Attachments */}
          {message.attachments.map((att, i) => (
            <div key={i} className={cn(message.content || i > 0 ? 'mb-1' : '')}>
              <Attachment att={att} mine={mine} />
            </div>
          ))}

          {/* Text — oxiriga vaqt uchun joy ajratiladi (pufak matnni quchoqlaydi) */}
          {message.content && (
            <p className="whitespace-pre-wrap break-words text-body leading-snug">
              {message.content}
              {!isRound && <span aria-hidden className="bubble-gap" style={{ width: metaGap }} />}
            </p>
          )}

          {/* Faqat biriktirma bo'lsa — vaqt uchun alohida joy kerak emas */}
          {meta}
        </motion.div>

        {/* Holat — HAR pufakda emas, faqat oxirgi o'z xabaring ostida */}
        {mine && read !== undefined && (
          <span className="bubble-status">
            {message.pending ? 'Yuborilmoqda' : read ? 'Ko‘rildi' : 'Yetkazildi'}
          </span>
        )}
      </div>

      {/* Javob affordansi (desktop) — matnli yorliq emas, pufak yonidagi
          ixcham ikonka; sichqoncha kelgandagina paydo bo'ladi. */}
      <button
        onClick={triggerReply}
        aria-label="Javob berish"
        title="Javob berish"
        className="btn-round mb-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 group-hover:flex"
      >
        <Reply className="h-[15px] w-[15px]" />
      </button>

      <AnimatePresence>
        {menu && (
          <ContextMenu
            x={menu.x}
            y={menu.y}
            hasText={!!message.content}
            canReport={!mine}
            canEdit={mine && !message.pending && !!onEdit && ['text', 'image', 'video', 'file'].includes(message.type)}
            onReply={triggerReply}
            onCopy={copyText}
            onReport={() => setReportOpen(true)}
            onEdit={() => onEdit?.(message)}
            onClose={() => setMenu(null)}
          />
        )}
      </AnimatePresence>

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="message"
        targetId={message.id}
      />
    </div>
  );
}
