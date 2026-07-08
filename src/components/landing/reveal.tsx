'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * Skroll bilan sahnaga chiqadigan bloklar — framer-motion O'RNIGA
 * CSS transition + IntersectionObserver (globals.css `.reveal`).
 * Sabab: framer butun landing'ni og'ir JS bilan hydrate qilib TBT'ni
 * oshirardi; bu variant bir necha bayt JS + kompozitor-do'st CSS.
 * API avvalgidek: Reveal / RevealGroup / RevealItem.
 */

/** Element ko'rinish maydoniga birinchi marta kirganini kuzatadi. */
export function useInViewOnce<T extends HTMLElement>(margin = '-60px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // IO bo'lmasa (juda eski brauzer) — darhol ko'rsatamiz (fail-open)
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return { ref, inView };
}

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>('-80px');
  return (
    <div
      ref={ref}
      className={cn('reveal', inView && 'reveal-in', className)}
      style={
        {
          '--reveal-y': `${y}px`,
          '--reveal-delay': delay ? `${delay}s` : undefined,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

const GroupCtx = createContext<{ inView: boolean; stagger: number } | null>(null);

/** Bolalarini ketma-ket (stagger) sahnaga chiqaruvchi konteyner. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>('-60px');
  return (
    <GroupCtx.Provider value={{ inView, stagger }}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </GroupCtx.Provider>
  );
}

/** RevealGroup ichidagi har bir element — DOM tartibiga ko'ra kechikadi. */
export function RevealItem({
  children,
  className,
  y = 22,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const ctx = useContext(GroupCtx);
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (el?.parentElement) {
      setIndex(Array.prototype.indexOf.call(el.parentElement.children, el));
    }
  }, []);

  const inView = ctx?.inView ?? true;
  const stagger = ctx?.stagger ?? 0.08;

  return (
    <div
      ref={ref}
      className={cn('reveal', inView && 'reveal-in', className)}
      style={
        {
          '--reveal-y': `${y}px`,
          '--reveal-delay': `${Math.min(index * stagger, 0.6)}s`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
