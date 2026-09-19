'use client';

import { createContext, useCallback, useContext } from 'react';

/**
 * Kategoriya nomi → joriy tildagi yorliq.
 *
 * Kontentda (startap, muammo) kategoriya KANONIK nom bilan saqlanadi
 * ("Ta'lim") — filtr va bazadagi qiymat o'zgarmaydi. Ko'rsatiladigan matn
 * esa tilga bog'liq: admin panelda har kategoriyaga ruscha/inglizcha nom
 * beriladi, server uni `Accept-Language` bo'yicha qaytaradi.
 *
 * Xarita ildiz layout'da SERVERDA bir marta olinadi (Next data-keshi, 5 daq) va
 * shu kontekst orqali tarqatiladi — SSR HTML allaqachon to'g'ri tilda bo'ladi
 * (qidiruv tizimi ruscha sahifada o'zbekcha kategoriya ko'rmaydi), har karta
 * alohida so'rov yubormaydi. Xaritada yo'q nom (nofaol/o'chirilgan) — o'zicha.
 */
const CategoryLabelsContext = createContext<Record<string, string>>({});

export function CategoryLabelsProvider({
  labels,
  children,
}: {
  labels: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <CategoryLabelsContext.Provider value={labels}>{children}</CategoryLabelsContext.Provider>
  );
}

/** `const label = useCategoryLabel(); label(startup.category)` */
export function useCategoryLabel(): (name: string | null | undefined) => string {
  const labels = useContext(CategoryLabelsContext);
  return useCallback((name) => (name ? labels[name] ?? name : ''), [labels]);
}
