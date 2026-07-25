'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@/components/icons';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * iOS modal.
 *  · Mobil — pastdan ko'tariluvchi **sheet**: yuqori burchaklari yumaloq,
 *    tepasida "grabber", barmoq bilan pastga sudrab yopiladi.
 *  · Desktop — markazlashgan dialog (iOS alert kirish egri chizig'i bilan).
 * Props API o'zgarmadi — barcha mavjud chaqiruvlar shundayligicha ishlaydi.
 */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  // Portal faqat brauzerda — SSR paytida document mavjud emas.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ startY: 0, startedAt: 0, active: false });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  /* ── Sudrab yopish (faqat mobil sheet) ─────────────────────────────── */
  const setOffset = useCallback((y: number) => {
    const el = panelRef.current;
    if (el) el.style.transform = y > 0 ? `translateY(${y}px)` : '';
  }, []);

  function onTouchStart(e: React.TouchEvent) {
    if (window.innerWidth >= 640) return;
    drag.current = { startY: e.touches[0].clientY, startedAt: Date.now(), active: true };
    const el = panelRef.current;
    if (el) el.style.transition = 'none';
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!drag.current.active) return;
    setOffset(e.touches[0].clientY - drag.current.startY);
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!drag.current.active) return;
    const dy = e.changedTouches[0].clientY - drag.current.startY;
    const velocity = dy / Math.max(1, Date.now() - drag.current.startedAt);
    drag.current.active = false;
    const el = panelRef.current;
    if (el) el.style.transition = '';
    // Yetarlicha uzoq sudralgan yoki tez silkitilgan bo'lsa — yopiladi
    if (dy > 96 || velocity > 0.6) onClose();
    else setOffset(0);
  }

  if (!open || !mounted) return null;

  // body'ga portal — transform/overflow'li ota-elementlar (masalan, chat)
  // ichida ham modal to'g'ri joylashadi va kesilmaydi.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full bg-white shadow-modal',
          'max-h-[92dvh] overflow-y-auto overscroll-contain',
          // Mobil: sheet (pastdan) — yuqori burchaklar yumaloq
          'animate-sheet-up rounded-t-ios-3xl pb-[env(safe-area-inset-bottom)]',
          // Desktop: markazlashgan dialog
          'sm:max-w-md sm:animate-alert-in sm:rounded-ios-2xl sm:pb-0',
          'transition-transform duration-300 ease-ios',
          className,
        )}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Grabber — faqat mobil sheet'da (iOS) */}
        <div className="sticky top-0 z-10 sm:hidden">
          <div className="bg-white pt-1.5">
            <div className="sheet-grabber" />
          </div>
        </div>

        {title ? (
          <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-5 pb-3 pt-1 sm:pt-5">
            <h3 className="min-w-0 flex-1 truncate text-headline font-semibold text-brand-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              aria-label="Yopish"
              className="tappable flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fill-tertiary text-slate-500"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        ) : null}

        <div className={cn('px-5 pb-5', title ? 'pt-1' : 'pt-5')}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
