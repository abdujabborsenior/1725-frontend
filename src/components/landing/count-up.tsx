'use client';

import { useEffect, useState } from 'react';
import { useInViewOnce } from './reveal';

/**
 * Ko'rinish maydoniga kirganda 0 dan qiymatgacha sanaydigan raqam.
 * framer-motion'siz — requestAnimationFrame + IntersectionObserver.
 */
export function CountUp({
  value,
  duration = 1.4,
  className,
  suffix = '',
}: {
  value: number | undefined;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const { ref, inView } = useInViewOnce<HTMLSpanElement>('-40px');
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || value === undefined) return;
    let raf = 0;
    const start = performance.now();
    const total = duration * 1000;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / total);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {value === undefined ? '—' : display.toLocaleString('uz')}
      {value !== undefined && suffix}
    </span>
  );
}
