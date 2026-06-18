'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';

/**
 * Ko'rinish maydoniga kirganda 0 dan qiymatgacha sanaydigan raqam.
 * Statistikani jonli his qildiradi.
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
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || value === undefined) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {value === undefined ? '—' : display.toLocaleString('uz')}
      {value !== undefined && suffix}
    </span>
  );
}
