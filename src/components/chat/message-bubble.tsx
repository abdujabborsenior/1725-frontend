'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, FileText, Reply, Check, CheckCheck, Download } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { profileHref } from '@/components/social/user-list-item';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ChatMessage, MessageAttachment } from '@/types';

function fmtTime(iso: string) {
  return format(new Date(iso), 'HH:mm');
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
  const bars = att.waveform?.length ? att.waveform : Array.from({ length: 32 }, () => 30 + Math.random() * 60);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); } else { void a.play(); }
  }

  return (
    <div className="flex items-center gap-3 py-1">
      <button
        onClick={toggle}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          mine ? 'bg-white/25 text-white' : 'bg-accent-500 text-white',
        )}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
      </button>
      <div className="flex h-8 items-center gap-[2px]">
        {bars.map((h, i) => {
          const active = (i / bars.length) * 100 <= progress;
          return (
            <span
              key={i}
              className={cn(
                'w-[3px] rounded-full',
                mine ? (active ? 'bg-white' : 'bg-white/40') : active ? 'bg-accent-500' : 'bg-slate-300',
              )}
              style={{ height: `${Math.max(15, Math.min(100, h))}%` }}
            />
          );
        })}
      </div>
      <span className={cn('text-[11px] tabular-nums', mine ? 'text-white/80' : 'text-slate-500')}>
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
      <video src={att.url} controls playsInline className="max-h-80 w-full rounded-xl object-cover" />
    );
  }
  if (att.type === 'image') {
    return (
      <a href={att.url} target="_blank" rel="noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={att.url} alt={att.name ?? ''} className="max-h-80 rounded-xl object-cover" />
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
        'flex items-center gap-3 rounded-xl px-3 py-2',
        mine ? 'bg-white/15' : 'bg-surface-soft',
      )}
    >
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', mine ? 'bg-white/20' : 'bg-white')}>
        <FileText className={cn('h-4 w-4', mine ? 'text-white' : 'text-slate-500')} />
      </span>
      <span className="min-w-0">
        <span className={cn('block truncate text-xs font-semibold', mine ? 'text-white' : 'text-brand-900')}>
          {att.name ?? 'Fayl'}
        </span>
        <span className={cn('text-[10px]', mine ? 'text-white/70' : 'text-slate-400')}>
          {(att.size / 1024).toFixed(0)} KB
        </span>
      </span>
      <Download className={cn('h-4 w-4 shrink-0', mine ? 'text-white/80' : 'text-slate-400')} />
    </a>
  );
}

interface Props {
  message: ChatMessage;
  mine: boolean;
  showAvatar: boolean;
  isGroup: boolean;
  read?: boolean;
  onReply: (m: ChatMessage) => void;
}

export function MessageBubble({ message, mine, showAvatar, isGroup, read, onReply }: Props) {
  if (message.type === 'system') {
    return (
      <div className="my-2 flex justify-center">
        <span className="rounded-full bg-slate-200/70 px-3 py-1 text-[11px] text-slate-500">
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

  return (
    <div className={cn('group flex items-end gap-2 animate-msg-in', mine ? 'flex-row-reverse' : 'flex-row')}>
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

      <div className={cn('flex max-w-[78%] flex-col', mine ? 'items-end' : 'items-start')}>
        {/* Reply / actions */}
        <button
          onClick={() => onReply(message)}
          className={cn(
            'mb-1 hidden items-center gap-1 text-[11px] text-slate-400 group-hover:flex',
            mine ? 'flex-row-reverse' : '',
          )}
        >
          <Reply className="h-3 w-3" /> Javob
        </button>

        <div
          className={cn(
            'relative rounded-2xl px-3 py-2 shadow-soft',
            isRound ? 'bg-transparent p-0 shadow-none' : mine ? 'bubble-out rounded-br-md' : 'bubble-in rounded-bl-md',
            onlyMedia && !isRound && 'overflow-hidden p-1',
          )}
        >
          {/* Sender name (group) — profilga bog'langan */}
          {!mine && isGroup && showAvatar && message.sender && (
            <Link href={profileHref(message.sender)} className="mb-0.5 block text-xs font-bold text-iris-600 hover:underline">
              {message.sender.fullName}
            </Link>
          )}

          {/* Reply preview */}
          {message.replyTo && (
            <div className={cn('mb-1.5 rounded-lg border-l-2 px-2 py-1 text-xs', mine ? 'border-white/60 bg-white/15' : 'border-accent-400 bg-surface-soft')}>
              <p className={cn('font-semibold', mine ? 'text-white/90' : 'text-accent-700')}>{message.replyTo.senderName ?? 'Xabar'}</p>
              <p className={cn('truncate', mine ? 'text-white/75' : 'text-slate-500')}>{message.replyTo.content ?? '📎 media'}</p>
            </div>
          )}

          {/* Attachments */}
          {message.attachments.map((att, i) => (
            <div key={i} className={cn(message.content || i > 0 ? 'mb-1' : '')}>
              <Attachment att={att} mine={mine} />
            </div>
          ))}

          {/* Text */}
          {message.content && (
            <p className={cn('whitespace-pre-wrap break-words text-sm leading-snug', onlyMedia && 'px-2 pb-1')}>
              {message.content}
            </p>
          )}

          {/* Meta */}
          {!isRound && (
            <span className={cn('mt-0.5 flex items-center justify-end gap-1 text-[10px]', mine ? 'text-white/70' : 'text-slate-400')}>
              {message.pending ? '⏳' : fmtTime(message.createdAt)}
              {mine && !message.pending && (read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
