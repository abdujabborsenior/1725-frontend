'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Paperclip, Mic, Send, X, Check, Video, Loader2, Trash2, ShieldAlert,
  FileText, Pencil, Plus,
} from 'lucide-react';
import { chatApi, getErrorMessage, type SendMessagePayload } from '@/lib/api';
import { useMediaRecorder } from '@/lib/use-media-recorder';
import { cn } from '@/lib/utils';
import type { ChatMessage, MessageType } from '@/types';
import toast from 'react-hot-toast';

function typeFromMime(mime: string): MessageType {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'voice';
  return 'file';
}

let stagedCounter = 0;

interface Staged {
  id: string;
  file: File;
  type: MessageType;
  preview: string; // object URL (image/video) yoki ''
}

interface Props {
  onSend: (payload: SendMessagePayload) => void;
  onTyping: () => void;
  replyTo: ChatMessage | null;
  onCancelReply: () => void;
  /** Tahrirlanayotgan xabar (mavjud bo'lsa — composer "edit" rejimida) */
  editing?: ChatMessage | null;
  onEditSave?: (id: string, content: string) => Promise<void> | void;
  onCancelEdit?: () => void;
  /** Guruhda oddiy a'zolar uchun taqiqlangan turlar */
  blockedMessageTypes?: MessageType[];
  /** Egasi/admin/superadmin — cheklovlarni chetlab o'tadi */
  canBypassRestrictions?: boolean;
}

const RESTRICTION_LABEL: Record<string, string> = {
  text: 'Matn', image: 'Rasm', video: 'Video', voice: 'Ovozli xabar', round_video: 'Video xabar',
};

/** Bir nechta biriktirma uchun umumlashtirilgan xabar turi (preview/cheklov uchun) */
function dominantType(items: Staged[]): MessageType {
  if (items.some((s) => s.type === 'image')) return 'image';
  if (items.some((s) => s.type === 'video')) return 'video';
  return items[0]?.type ?? 'file';
}

export function Composer({
  onSend, onTyping, replyTo, onCancelReply,
  editing, onEditSave, onCancelEdit,
  blockedMessageTypes = [], canBypassRestrictions = false,
}: Props) {
  const [text, setText] = useState('');
  const [staged, setStaged] = useState<Staged[]>([]);
  const [uploading, setUploading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const rec = useMediaRecorder();
  const lastTyping = useRef(0);

  const isEditing = !!editing;

  // Cheklovlar — faqat oddiy a'zolarga ta'sir qiladi
  const blocked = canBypassRestrictions ? new Set<MessageType>() : new Set(blockedMessageTypes);
  const textBlocked = blocked.has('text');
  const voiceBlocked = blocked.has('voice');
  const roundBlocked = blocked.has('round_video');
  const restrictionList = blockedMessageTypes.filter((t) => !canBypassRestrictions);

  // Edit rejimiga kirganda — matnni oldindan to'ldiramiz; chiqqanda tozalaymiz
  useEffect(() => {
    if (editing) setText(editing.content ?? '');
    else setText('');
  }, [editing]);

  // Round video live preview
  useEffect(() => {
    if (rec.kind === 'video' && rec.stream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = rec.stream;
      void videoPreviewRef.current.play().catch(() => undefined);
    }
  }, [rec.kind, rec.stream]);

  // Object URL'larni tozalash (memory leak oldini olish)
  useEffect(() => () => { staged.forEach((s) => s.preview && URL.revokeObjectURL(s.preview)); }, [staged]);

  function emitTyping() {
    const now = Date.now();
    if (now - lastTyping.current > 2000) {
      lastTyping.current = now;
      onTyping();
    }
  }

  /* ── Fayllarni tanlash (ko'p, har xil tur) → tray'ga qo'yiladi ── */
  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;

    const next: Staged[] = [];
    for (const file of files) {
      if (staged.length + next.length >= 10) { toast.error('Eng ko‘pi 10 ta fayl'); break; }
      if (file.size > 50 * 1024 * 1024) { toast.error(`${file.name}: maks. 50MB`); continue; }
      const type = typeFromMime(file.type);
      if (blocked.has(type)) {
        toast.error(`Bu guruhda ${RESTRICTION_LABEL[type] ?? type} taqiqlangan`);
        continue;
      }
      const isMedia = type === 'image' || type === 'video';
      next.push({
        id: `s${++stagedCounter}`,
        file,
        type,
        preview: isMedia ? URL.createObjectURL(file) : '',
      });
    }
    if (next.length) setStaged((prev) => [...prev, ...next]);
  }

  function removeStaged(id: string) {
    setStaged((prev) => {
      const hit = prev.find((s) => s.id === id);
      if (hit?.preview) URL.revokeObjectURL(hit.preview);
      return prev.filter((s) => s.id !== id);
    });
  }

  /* ── Yuborish ── */
  async function sendStaged() {
    if (!staged.length || uploading) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        staged.map(async (s) => {
          const res = await chatApi.upload(s.file);
          return {
            url: res.url, type: s.type, mimeType: s.file.type, size: s.file.size,
            name: s.file.name, durationSec: null, waveform: null,
          };
        }),
      );
      onSend({
        type: dominantType(staged),
        content: text.trim() || undefined,
        replyToId: replyTo?.id,
        attachments: uploaded,
      });
      staged.forEach((s) => s.preview && URL.revokeObjectURL(s.preview));
      setStaged([]);
      setText('');
      onCancelReply();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Yuklashda xatolik'));
    } finally {
      setUploading(false);
    }
  }

  function sendText() {
    const t = text.trim();
    if (!t) return;
    if (textBlocked) { toast.error('Bu guruhda matn yuborish taqiqlangan'); return; }
    onSend({ type: 'text', content: t, replyToId: replyTo?.id });
    setText('');
    onCancelReply();
  }

  async function saveEdit() {
    if (!editing || !onEditSave) return;
    const t = text.trim();
    const hasAttach = (editing.attachments?.length ?? 0) > 0;
    if (!t && !hasAttach) { toast.error("Xabar matni bo'sh bo'lmasin"); return; }
    if (t === (editing.content ?? '')) { onCancelEdit?.(); return; }
    setSavingEdit(true);
    try {
      await onEditSave(editing.id, t);
      setText('');
      onCancelEdit?.();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Tahrirlab bo‘lmadi'));
    } finally {
      setSavingEdit(false);
    }
  }

  /** Asosiy "yuborish" amali — kontekstga qarab */
  function primaryAction() {
    if (isEditing) return void saveEdit();
    if (staged.length) return void sendStaged();
    return sendText();
  }

  async function uploadAndSend(file: File, type: MessageType, extra?: Partial<{ durationSec: number; waveform: number[] }>) {
    setUploading(true);
    try {
      const res = await chatApi.upload(file);
      onSend({
        type,
        replyToId: replyTo?.id,
        attachments: [{
          url: res.url, type, mimeType: file.type, size: file.size,
          name: file.name, durationSec: extra?.durationSec ?? null, waveform: extra?.waveform ?? null,
        }],
      });
      onCancelReply();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Yuklashda xatolik'));
    } finally {
      setUploading(false);
    }
  }

  async function finishRecording() {
    const isVideo = rec.kind === 'video';
    const result = await rec.stop();
    if (!result) return;
    const ext = result.mimeType.includes('mp4') ? 'mp4' : 'webm';
    const file = new File([result.blob], `${isVideo ? 'round' : 'voice'}.${ext}`, { type: result.mimeType });
    await uploadAndSend(file, isVideo ? 'round_video' : 'voice', {
      durationSec: result.durationSec,
      waveform: result.waveform,
    });
  }

  async function startRec(kind: 'audio' | 'video') {
    try {
      await rec.start(kind);
    } catch (err) {
      const name = (err as { name?: string })?.name;
      if (name === 'NotAllowedError') {
        toast.error(kind === 'video' ? 'Kameraga ruxsat bering' : 'Mikrofonga ruxsat bering');
      } else if (name === 'NotFoundError') {
        toast.error(kind === 'video' ? 'Kamera topilmadi' : 'Mikrofon topilmadi');
      } else if (name === 'NotReadableError') {
        toast.error(kind === 'video' ? 'Kamera band (boshqa dastur ishlatyapti)' : 'Mikrofon band');
      } else {
        toast.error('Yozishni boshlab bo‘lmadi');
      }
    }
  }

  const mmss = `${Math.floor(rec.seconds / 60)}:${String(rec.seconds % 60).padStart(2, '0')}`;
  const hasStaged = staged.length > 0;
  const showSendBtn = isEditing || hasStaged || !!text.trim();

  return (
    <div className="border-t border-slate-200 bg-white px-3 py-2.5" style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}>
      {/* Cheklov banneri */}
      {restrictionList.length > 0 && !isEditing && (
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-1.5 text-[11px] font-medium text-rose-600">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Bu guruhda taqiqlangan: {restrictionList.map((t) => RESTRICTION_LABEL[t] ?? t).join(', ')}</span>
        </div>
      )}

      {/* Edit banneri */}
      {isEditing && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border-l-2 border-iris-400 bg-iris-50/70 px-3 py-1.5">
          <Pencil className="h-3.5 w-3.5 shrink-0 text-iris-600" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-iris-700">Xabarni tahrirlash</p>
            <p className="truncate text-xs text-slate-500">{editing?.content ?? 'Media izohi'}</p>
          </div>
          <button onClick={() => { setText(''); onCancelEdit?.(); }} className="text-slate-400 hover:text-rose-500"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Reply preview */}
      {replyTo && !isEditing && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border-l-2 border-accent-400 bg-surface-soft px-3 py-1.5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-accent-700">{replyTo.sender?.fullName ?? 'Xabar'}</p>
            <p className="flex items-center gap-1 truncate text-xs text-slate-500">
              {replyTo.content ?? (<><Paperclip className="h-3 w-3 shrink-0" /> Biriktirma</>)}
            </p>
          </div>
          <button onClick={onCancelReply} className="text-slate-400 hover:text-rose-500"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Biriktirmalar tray'i — yuborishdan oldin (Telegram uslubi) */}
      {hasStaged && !isEditing && (
        <div className="mb-2 flex gap-2 overflow-x-auto rounded-2xl bg-surface-soft p-2 chat-scroll">
          {staged.map((s) => (
            <div key={s.id} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {s.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.preview} alt={s.file.name} className="h-full w-full object-cover" />
              ) : s.type === 'video' ? (
                <video src={s.preview} muted className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1.5 text-center">
                  <FileText className="h-6 w-6 text-slate-400" />
                  <span className="line-clamp-2 text-[9px] leading-tight text-slate-500">{s.file.name}</span>
                </div>
              )}
              <button
                onClick={() => removeStaged(s.id)}
                aria-label="O'chirish"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-900/70 text-white opacity-0 transition-opacity hover:bg-rose-500 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {/* Yana qo'shish */}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-accent-300 hover:text-accent-600"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[10px]">Qo&apos;shish</span>
          </button>
        </div>
      )}

      {/* Round video recording overlay */}
      {rec.kind === 'video' && (
        <div className="mb-2 flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-b from-brand-900 to-brand-950 p-5">
          <div className="relative">
            <div className="rounded-full bg-gradient-to-br from-accent-400 via-iris-400 to-iris-600 p-[3px] shadow-glow-iris">
              <video ref={videoPreviewRef} muted playsInline className="h-44 w-44 rounded-full object-cover ring-2 ring-brand-900" />
            </div>
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" /> REC
            </span>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-black tabular-nums text-brand-900 shadow">{mmss}</span>
          </div>
          <p className="text-xs text-slate-400">Dumaloq video yozilmoqda…</p>
          <div className="flex items-center gap-5">
            <button onClick={rec.cancel} title="Bekor qilish" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-105 hover:bg-rose-500/80"><Trash2 className="h-5 w-5" /></button>
            <button onClick={finishRecording} disabled={uploading} title="Yuborish" className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-white shadow-glow-accent transition-transform hover:scale-105 active:scale-95">
              {uploading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Send className="h-7 w-7" />}
            </button>
          </div>
        </div>
      )}

      {/* Voice recording bar */}
      {rec.kind === 'audio' ? (
        <div className="flex items-center gap-3 rounded-2xl bg-surface-soft px-3 py-2">
          <button onClick={rec.cancel} className="rec-pulse flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white">
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="flex flex-1 items-center gap-[2px]">
            {rec.waveform.map((h, i) => (
              <span key={i} className="w-[3px] rounded-full bg-accent-500" style={{ height: `${Math.max(15, h)}%` }} />
            ))}
          </div>
          <span className="text-sm font-semibold tabular-nums text-brand-900">{mmss}</span>
          <button onClick={finishRecording} disabled={uploading} className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-white hover:bg-accent-600">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-5 w-5" />}
          </button>
        </div>
      ) : rec.kind === 'video' ? null : (
        <div className="flex items-end gap-2">
          {/* Biriktirish — edit rejimida yashiringan */}
          {!isEditing && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-brand-900"
              aria-label="Biriktirish"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
            </button>
          )}

          <textarea
            value={text}
            disabled={textBlocked && !isEditing && !hasStaged}
            onChange={(e) => { setText(e.target.value); emitTyping(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); primaryAction(); }
              if (e.key === 'Escape' && isEditing) { setText(''); onCancelEdit?.(); }
            }}
            rows={1}
            placeholder={
              isEditing ? 'Xabarni tahrirlang…'
                : hasStaged ? 'Izoh qo‘shing (ixtiyoriy)…'
                : textBlocked ? 'Bu guruhda matn taqiqlangan' : 'Xabar yozing…'
            }
            className="chat-scroll max-h-32 flex-1 resize-none rounded-2xl border border-slate-200 bg-surface-soft px-4 py-2.5 text-sm text-brand-900 placeholder:text-slate-400 focus:border-accent-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />

          {showSendBtn ? (
            <button
              onClick={primaryAction}
              disabled={uploading || savingEdit}
              className={cn(
                'btn-lift flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-glow-accent disabled:opacity-60',
                isEditing ? 'bg-iris-600 hover:bg-iris-700' : 'bg-accent-500 hover:bg-accent-600',
              )}
              aria-label={isEditing ? 'Saqlash' : 'Yuborish'}
            >
              {uploading || savingEdit ? <Loader2 className="h-5 w-5 animate-spin" />
                : isEditing ? <Check className="h-5 w-5" />
                : <Send className="h-5 w-5" />}
            </button>
          ) : (
            <>
              {!roundBlocked && (
                <button
                  onClick={() => void startRec('video')}
                  aria-label="Dumaloq video"
                  title="Dumaloq video"
                  className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-iris-500 to-iris-700 text-white shadow-glow-iris transition-transform hover:scale-105 active:scale-95"
                >
                  <span className="absolute inset-0 rounded-full ring-2 ring-iris-300/50 ring-offset-2 ring-offset-white opacity-0 transition-opacity group-hover:opacity-100" />
                  <Video className="h-[18px] w-[18px]" />
                </button>
              )}
              {!voiceBlocked && (
                <button
                  onClick={() => void startRec('audio')}
                  aria-label="Ovozli xabar"
                  title="Ovozli xabar"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-500 text-white shadow-glow-accent transition-transform hover:scale-105 active:scale-95 hover:bg-accent-600"
                >
                  <Mic className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" multiple accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" className="hidden" onChange={onPickFiles} />
    </div>
  );
}
