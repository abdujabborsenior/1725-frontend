'use client';

import { useRef, useState } from 'react';
import { Play, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Startap muqovasi — rasm YOKI video.
 *
 * Qoidalar (2026-07-24 direktivasi):
 *  • `videoUrl` bo'lsa muqova o'rnida VIDEO turadi (rasm muqova ham qolaveradi —
 *    u poster sifatida ishlatiladi).
 *  • Avtoplay YO'Q: birinchi kadr (yoki YouTube prevyusi) muqova bo'lib turadi,
 *    ijro FAQAT foydalanuvchi "play" bosganda boshlanadi — ro'yxatda ham, detalda ham.
 *  • YouTube havolasi sayt ichida ko'rsatiladi (iframe), tashqi saytga olib chiqmaydi.
 */

/** YouTube havolasidan video ID ni ajratib oladi (watch / youtu.be / shorts / embed). */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0];
      return isYtId(id) ? id : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') {
        const id = u.searchParams.get('v') ?? '';
        return isYtId(id) ? id : null;
      }
      const m = /^\/(embed|shorts|v|live)\/([^/?#]+)/.exec(u.pathname);
      if (m && isYtId(m[2])) return m[2];
    }
    return null;
  } catch {
    return null;
  }
}

function isYtId(id: string): boolean {
  return /^[\w-]{11}$/.test(id);
}

/** Havola video-muqova sifatida ishlatila oladimi (YouTube yoki to'g'ridan fayl) */
export function isPlayableVideo(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  if (youtubeId(url)) return true;
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url.trim());
}

export function CoverMedia({
  coverUrl,
  videoUrl,
  title,
  /** Fold ichidagi birinchi kartalar uchun eager yuklash */
  priority = false,
  className,
  /** Play tugmasining o'lchami — kartada kichik, detalda katta */
  size = 'sm',
}: {
  coverUrl?: string | null;
  videoUrl?: string | null;
  title?: string;
  priority?: boolean;
  className?: string;
  size?: 'sm' | 'lg';
}) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const ytId = videoUrl ? youtubeId(videoUrl) : null;
  const isFileVideo = !ytId && isPlayableVideo(videoUrl);
  const hasVideo = !!ytId || isFileVideo;

  // YouTube prevyusi — rasm muqova berilmagan bo'lsa poster o'rnida
  const poster = coverUrl || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null);

  function start(e: React.MouseEvent) {
    // Karta <Link> ichida bo'lishi mumkin — bosish sahifaga o'tkazmasin
    e.preventDefault();
    e.stopPropagation();
    setPlaying(true);
    // <video> uchun: keyingi kadrda ref tayyor bo'ladi
    requestAnimationFrame(() => void videoRef.current?.play());
  }

  /* ── Video ijro rejimi ─────────────────────────────────────── */
  if (hasVideo && playing) {
    return (
      <div
        className={cn('relative h-full w-full overflow-hidden bg-black', className)}
        // Ijro paytida karta ichidagi bosishlar navigatsiya qilmasin
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        {ytId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={title ? `${title} — video` : 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            ref={videoRef}
            src={videoUrl ?? undefined}
            poster={coverUrl ?? undefined}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full bg-black object-contain"
          />
        )}
      </div>
    );
  }

  /* ── Muqova (poster) rejimi ────────────────────────────────── */
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-gradient-brand', className)}>
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          className={cn(
            'h-full w-full object-cover opacity-90 transition-transform duration-300',
            !hasVideo && 'group-hover:scale-105',
          )}
        />
      ) : isFileVideo ? (
        // Rasm muqova yo'q — videoning BIRINCHI KADRI muqova bo'lib turadi
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={`${videoUrl}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Rocket className={cn(size === 'lg' ? 'h-12 w-12' : 'h-8 w-8', 'text-white/20')} />
        </div>
      )}

      {hasVideo && (
        <button
          type="button"
          onClick={start}
          aria-label={title ? `${title} videosini ijro etish` : 'Videoni ijro etish'}
          className="group/play absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
        >
          <span
            className={cn(
              'flex items-center justify-center rounded-full bg-white/95 text-brand-900 shadow-lg ring-1 ring-black/5 transition-transform duration-200 group-hover/play:scale-110',
              size === 'lg' ? 'h-16 w-16' : 'h-10 w-10',
            )}
          >
            <Play
              className={cn('translate-x-[1px] fill-current', size === 'lg' ? 'h-7 w-7' : 'h-4 w-4')}
            />
          </span>
        </button>
      )}
    </div>
  );
}
