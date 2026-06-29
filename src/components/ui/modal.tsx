'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  // Portal faqat brauzerda — SSR paytida document mavjud emas.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  if (!open || !mounted) return null;

  // body'ga portal — transform/overflow'li ota-elementlar (masalan, chat)
  // ichida ham modal to'g'ri markazlashadi va kesilmaydi.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-modal p-6',
          'animate-slide-up max-h-[90vh] overflow-y-auto',
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-brand-900">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Yopish"
              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-brand-900 hover:bg-slate-100 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
