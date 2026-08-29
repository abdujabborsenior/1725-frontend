'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Paperclip, Mic, ArrowUp, X, Check, Video, Spinner, Trash2, ShieldAlert,
  FileText, Pencil, Plus, Images, Camera,
} from '@/components/icons';
import { chatApi, getErrorMessage, type SendMessagePayload } from '@/lib/api';
import { useMediaRecorder } from '@/lib/use-media-recorder';
import {
  DISABLED_CHAT_REASON, ROUND_VIDEO_ENABLED, VOICE_ENABLED, VIDEO_ENABLED,
  fileAccept, isChatTypeDisabled,
} from '@/lib/chat-features';
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
  /**
   * Tashqaridan matn qo'yish (bo'sh suhbatdagi tayyor jumlalar).
   * `n` — har bosishda o'zgaradigan hisoblagich: bir xil matn qayta
   * tanlansa ham effekt ishga tushadi.
   */
  presetDraft?: { text: string; n: number } | null;
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
  presetDraft = null,
}: Props) {
  const [text, setText] = useState('');
  const [staged, setStaged] = useState<Staged[]>([]);
  const [uploading, setUploading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const attachRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const rec = useMediaRecorder();
  const lastTyping = useRef(0);

  const isEditing = !!editing;

  // Cheklovlar — faqat oddiy a'zolarga ta'sir qiladi
  const blocked = canBypassRestrictions ? new Set<MessageType>() : new Set(blockedMessageTypes);
  const textBlocked = blocked.has('text');
  // Guruh cheklovi YOKI platforma darajasida vaqtincha o'chirilgan tur
  const voiceBlocked = blocked.has('voice') || !VOICE_ENABLED;
  const roundBlocked = blocked.has('round_video') || !ROUND_VIDEO_ENABLED;
  const restrictionList = blockedMessageTypes.filter((t) => !canBypassRestrictions);

  // Edit rejimiga kirganda — matnni oldindan to'ldiramiz; chiqqanda tozalaymiz
  useEffect(() => {
    if (editing) setText(editing.content ?? '');
    else setText('');
  }, [editing]);

  // Bo'sh suhbatdagi tayyor jumla tanlandi — matn maydoniga qo'yiladi
  // (YUBORILMAYDI: foydalanuvchi tahrirlab, o'zi yuboradi).
  useEffect(() => {
    if (presetDraft?.text) setText(presetDraft.text);
  }, [presetDraft]);

  // Round video live preview
  useEffect(() => {
    if (rec.kind === 'video' && rec.stream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = rec.stream;
      void videoPreviewRef.current.play().catch(() => undefined);
    }
  }, [rec.kind, rec.stream]);

  // Object URL'larni tozalash (memory leak oldini olish)
  useEffect(() => () => { staged.forEach((s) => s.preview && URL.revokeObjectURL(s.preview)); }, [staged]);

  // Attach-menyu — tashqi bosishda yopiladi
  useEffect(() => {
    if (!attachOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!attachRef.current?.contains(e.target as Node)) setAttachOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [attachOpen]);

  /** Menyudan manba tanlash: galereya / kamera / fayl (Telegram uslubi).
   *  Galereya/kamera ruxsatini brauzer-OS'ning o'zi shu bosishda so'raydi. */
  function pickFrom(ref: React.RefObject<HTMLInputElement>) {
    setAttachOpen(false);
    ref.current?.click();
  }

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
      if (isChatTypeDisabled(type)) {
        toast.error(DISABLED_CHAT_REASON[type] ?? 'Bu fayl turi vaqtincha o‘chirilgan');
        continue;
      }
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
  const hasQuickRecord = !voiceBlocked || !roundBlocked;
  // Yuborish tugmasi FAQAT yuboriladigan narsa bo'lganda ko'rinadi (spring
  // bilan chiqadi). Ilgari bo'sh maydonda o'chirilgan "arvoh" tugma turardi —
  // hech narsa qilmaydigan boshqaruv interfeysda qolmasin.
  const showSendBtn = isEditing || hasStaged || !!text.trim();

  // z-30: `material-bar` dagi backdrop-filter YANGI stacking context ochadi —
  // busiz biriktirish menyusi (z-20) xabar pufaklari (z-10) OSTIDA qolardi.
  return (
    <div
      className="material-bar hairline-t relative z-30 px-3 py-2.5"
      style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}
    >
      {/* Cheklov banneri */}
      {restrictionList.length > 0 && !isEditing && (
        <div className="mb-2 flex items-center gap-2 rounded-ios-md bg-rose-50 px-3 py-2 text-footnote font-medium text-rose-600">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Bu guruhda taqiqlangan: {restrictionList.map((t) => RESTRICTION_LABEL[t] ?? t).join(', ')}</span>
        </div>
      )}

      {/* Edit banneri */}
      {isEditing && (
        <div className="mb-2 flex items-center gap-2 rounded-ios-md border-l-[3px] border-iris-500 bg-iris-50 px-3 py-2">
          <Pencil className="h-3.5 w-3.5 shrink-0 text-iris-600" />
          <div className="min-w-0 flex-1">
            <p className="text-footnote font-semibold text-iris-700">Xabarni tahrirlash</p>
            <p className="truncate text-footnote text-slate-500">{editing?.content ?? 'Media izohi'}</p>
          </div>
          <button onClick={() => { setText(''); onCancelEdit?.(); }} className="text-slate-400 hover:text-rose-500"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Reply preview */}
      {replyTo && !isEditing && (
        <div className="mb-2 flex items-center gap-2 rounded-ios-md border-l-[3px] border-accent-500 bg-fill-tertiary px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-footnote font-semibold text-accent-700">{replyTo.sender?.fullName ?? 'Xabar'}</p>
            <p className="flex items-center gap-1 truncate text-footnote text-slate-500">
              {replyTo.content ?? (<><Paperclip className="h-3 w-3 shrink-0" /> Biriktirma</>)}
            </p>
          </div>
          <button onClick={onCancelReply} className="text-slate-400 hover:text-rose-500"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Biriktirmalar tray'i — yuborishdan oldin (Telegram uslubi) */}
      {hasStaged && !isEditing && (
        <div className="chat-scroll mb-2 flex gap-2 overflow-x-auto rounded-ios-lg bg-fill-tertiary p-2">
          {staged.map((s) => (
            <div key={s.id} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-ios-md bg-white">
              {s.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.preview} alt={s.file.name} className="h-full w-full object-cover" />
              ) : s.type === 'video' ? (
                <video src={s.preview} muted className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1.5 text-center">
                  <FileText className="h-6 w-6 text-slate-400" />
                  <span className="line-clamp-2 text-caption-2 leading-tight text-slate-500">{s.file.name}</span>
                </div>
              )}
              <button
                onClick={() => removeStaged(s.id)}
                aria-label="O'chirish"
                className="material-dark absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {/* Yana qo'shish */}
          <button
            onClick={() => fileRef.current?.click()}
            className="tappable flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-ios-md bg-white text-slate-400"
          >
            <Plus className="h-5 w-5" />
            <span className="text-caption-2">Qo&apos;shish</span>
          </button>
        </div>
      )}

      {/* Round video recording overlay */}
      {rec.kind === 'video' && (
        <div className="mb-2 flex flex-col items-center gap-4 rounded-ios-2xl bg-brand-900 p-5">
          <div className="relative">
            <div className="rounded-full bg-accent-500 p-[3px]">
              <video ref={videoPreviewRef} muted playsInline className="h-44 w-44 rounded-full object-cover ring-2 ring-brand-900" />
            </div>
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-caption-2 font-semibold text-white">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" /> REC
            </span>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-2.5 py-0.5 text-caption-1 font-semibold tabular-nums text-brand-900 shadow-card">{mmss}</span>
          </div>
          <p className="text-footnote text-slate-400">Dumaloq video yozilmoqda…</p>
          <div className="flex items-center gap-5">
            <button onClick={rec.cancel} title="Bekor qilish" className="tappable flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white"><Trash2 className="h-5 w-5" /></button>
            <button onClick={finishRecording} disabled={uploading} title="Yuborish" className="tappable-scale tappable flex h-16 w-16 items-center justify-center rounded-full bg-accent-500 text-white">
              {uploading ? <Spinner className="h-7 w-7 animate-spin" /> : <ArrowUp className="h-7 w-7" strokeWidth={3} />}
            </button>
          </div>
        </div>
      )}

      {/* Voice recording bar */}
      {rec.kind === 'audio' ? (
        <div className="composer-field flex items-center gap-3 !rounded-full px-2 py-1.5">
          <button
            onClick={rec.cancel}
            aria-label="Bekor qilish"
            className="rec-pulse flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="flex h-7 min-w-0 flex-1 items-center gap-[3px] overflow-hidden">
            {rec.waveform.map((h, i) => (
              <span
                key={i}
                className="w-[3px] shrink-0 rounded-full bg-accent-500/80"
                style={{ height: `${Math.max(15, h)}%` }}
              />
            ))}
          </div>
          <span className="shrink-0 text-subhead font-semibold tabular-nums text-brand-900">{mmss}</span>
          <button
            onClick={finishRecording}
            disabled={uploading}
            aria-label="Yuborish"
            className="btn-send flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          >
            {uploading ? (
              <Spinner className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-[19px] w-[19px]" strokeWidth={3} />
            )}
          </button>
        </div>
      ) : rec.kind === 'video' ? null : (
        <div className="flex items-end gap-2">
          {/* Yagona kapsula: biriktirish + matn + yuborish bitta sirtda —
              ilgari uchtasi qatorda alohida "suzib" turardi. */}
          <div className="composer-field flex min-w-0 flex-1 items-end gap-1 p-1">
            {/* Biriktirish — edit rejimida yashiringan */}
            {!isEditing && (
              <div ref={attachRef} className="relative shrink-0">
                <button
                  onClick={() => setAttachOpen((o) => !o)}
                  disabled={uploading}
                  aria-label="Biriktirish"
                  aria-expanded={attachOpen}
                  className={cn(
                    'btn-round flex h-9 w-9 items-center justify-center rounded-full text-slate-500',
                    attachOpen && 'bg-fill-tertiary text-accent-600',
                  )}
                >
                  {uploading ? (
                    <Spinner className="h-5 w-5 animate-spin" />
                  ) : (
                    <Plus
                      className={cn(
                        'h-[22px] w-[22px] transition-transform duration-250 ease-ios',
                        attachOpen && 'rotate-45',
                      )}
                      strokeWidth={2.2}
                    />
                  )}
                </button>

                {/* Manba menyusi — Telegram uslubi */}
                {attachOpen && (
                  <div className="material-menu absolute bottom-12 left-0 z-20 w-56 origin-bottom-left animate-scale-in rounded-ios-lg p-1 shadow-modal ring-1 ring-black/[0.06]">
                    <button
                      onClick={() => pickFrom(galleryRef)}
                      className="flex w-full items-center gap-3 rounded-[9px] px-2.5 py-2 text-left transition-colors duration-150 hover:bg-fill-quaternary active:bg-fill-tertiary"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-accent-500 text-white">
                        <Images className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-body text-brand-900">Galereya</span>
                        <span className="block text-caption-1 text-slate-500">
                          {VIDEO_ENABLED ? 'Rasm va video' : 'Rasm'}
                        </span>
                      </span>
                    </button>
                    {/* Kamera — faqat sensorli qurilmalarda (desktop'da capture ishlamaydi) */}
                    <button
                      onClick={() => pickFrom(cameraRef)}
                      className="hidden w-full items-center gap-3 rounded-[9px] px-2.5 py-2 text-left transition-colors duration-150 hover:bg-fill-quaternary active:bg-fill-tertiary [@media(pointer:coarse)]:flex"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-iris-500 text-white">
                        <Camera className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-body text-brand-900">Kamera</span>
                        <span className="block text-caption-1 text-slate-500">Suratga olish</span>
                      </span>
                    </button>
                    <button
                      onClick={() => pickFrom(fileRef)}
                      className="flex w-full items-center gap-3 rounded-[9px] px-2.5 py-2 text-left transition-colors duration-150 hover:bg-fill-quaternary active:bg-fill-tertiary"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-slate-400 text-white">
                        <FileText className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-body text-brand-900">Fayl</span>
                        <span className="block text-caption-1 text-slate-500">
                          {VOICE_ENABLED ? 'Hujjat, audio, arxiv' : 'Hujjat, arxiv'}
                        </span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
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
              className="chat-scroll max-h-32 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-2 text-body leading-snug text-brand-900 placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />

            {showSendBtn && (
              <button
                onClick={primaryAction}
                disabled={uploading || savingEdit}
                className={cn(
                  'btn-send flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  isEditing && 'bg-none bg-iris-600',
                )}
                aria-label={isEditing ? 'Saqlash' : 'Yuborish'}
              >
                {uploading || savingEdit ? (
                  <Spinner className="h-[18px] w-[18px] animate-spin" />
                ) : isEditing ? (
                  <Check className="h-[18px] w-[18px]" strokeWidth={3} />
                ) : (
                  <ArrowUp className="h-[19px] w-[19px]" strokeWidth={3} />
                )}
              </button>
            )}
          </div>

          {/* Tez yozib yuborish — kapsuladan tashqarida (yozilayotgan matn bo'lsa
              yuborish tugmasi o'rnini oladi) */}
          {!showSendBtn && hasQuickRecord && (
            <>
              {!roundBlocked && (
                <button
                  onClick={() => void startRec('video')}
                  aria-label="Dumaloq video"
                  title="Dumaloq video"
                  className="btn-round flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500"
                >
                  <Video className="h-[22px] w-[22px]" />
                </button>
              )}
              {!voiceBlocked && (
                <button
                  onClick={() => void startRec('audio')}
                  aria-label="Ovozli xabar"
                  title="Ovozli xabar"
                  className="btn-round flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500"
                >
                  <Mic className="h-[22px] w-[22px]" />
                </button>
              )}
            </>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" multiple accept={fileAccept('all')} className="hidden" onChange={onPickFiles} />
      {/* Galereya — rasm (video vaqtincha o'chirilgan bo'lsa chiqmaydi) */}
      <input ref={galleryRef} type="file" multiple accept={fileAccept('media')} className="hidden" onChange={onPickFiles} />
      {/* Kamera — capture: to'g'ridan-to'g'ri suratga olish (mobil) */}
      <input ref={cameraRef} type="file" accept={fileAccept('media')} capture="environment" className="hidden" onChange={onPickFiles} />
    </div>
  );
}
