'use client';

import type { ReactNode } from 'react';
import { useInViewOnce } from './reveal';

/**
 * Below-fold bo'lim: kontenti viewport'ga ~600px qolganda mount bo'ladi.
 * Landing'dagi og'ir kartalar (startup/muammo/guruh/poll) boshlang'ich
 * hydration'да render qilinmaydi → TBT past; foydalanuvchi yetib borgunicha
 * kontent allaqachon tayyor (600px zaxira). `id` (anchor) doim DOM'da qoladi.
 */
export function LazySection({
  children,
  className,
  id,
  minHeight = 480,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  minHeight?: number;
}) {
  const { ref, inView } = useInViewOnce<HTMLElement>('600px');
  return (
    <section
      ref={ref}
      id={id}
      className={className}
      style={inView ? undefined : { minHeight }}
    >
      {inView ? children : null}
    </section>
  );
}
