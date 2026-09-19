'use client';

import { useQuery } from '@tanstack/react-query';

import { categoriesApi } from '@/lib/api';
import { useCategoryLabel } from '@/lib/category-labels';
import { PROBLEM_CATEGORIES, STARTUP_CATEGORIES } from '@/lib/constants';
import type { CategoryType } from '@/types';

/**
 * Server javob bermaguncha (yoki bermasa) ishlatiladigan zaxira ro'yxat.
 *
 * Kategoriyalar endi bazadan keladi va admin paneldan boshqariladi, lekin
 * forma HECH QACHON bo'sh kategoriya ro'yxati bilan qolmasligi kerak —
 * `CacheService` dagi fail-open tamoyilining frontenddagi ko'rinishi.
 */
const FALLBACK: Record<CategoryType, string[]> = {
  startup: STARTUP_CATEGORIES,
  problem: PROBLEM_CATEGORIES,
};

export interface CategoryOption {
  /** Kanonik nom — bazaga shu yoziladi */
  value: string;
  /** Joriy tildagi yorliq */
  label: string;
}

/**
 * Kategoriyalar (faol, admin belgilagan tartibda) — `{ value, label }`.
 *
 * Ro'yxat kam o'zgaradi → uzoq `staleTime`: sahifadan sahifaga o'tishда
 * qayta so'ralmaydi (100k yukда keraksiz so'rov bo'lmasin). So'rov
 * `Accept-Language` bilan ketadi — `label` joriy tilda qaytadi.
 */
export function useCategoryList(type: CategoryType): CategoryOption[] {
  const labelOf = useCategoryLabel();
  const { data } = useQuery({
    queryKey: ['categories', type],
    queryFn: () => categoriesApi.list(type),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  if (data && data.length > 0) {
    return data.map((c) => ({ value: c.name, label: c.label ?? labelOf(c.name) }));
  }
  return FALLBACK[type].map((name) => ({ value: name, label: labelOf(name) }));
}

/**
 * Tanlov ro'yxati + JORIY qiymat.
 *
 * Tahrirlanayotgan yozuvning kategoriyasi ro'yxatда bo'lmasligi mumkin
 * (admin uni nofaol qilgan yoki o'chirgan) — bunday qiymat jimgina
 * yo'qolmasligi uchun ro'yxat oxiriga qo'shiladi.
 */
export function useCategoryOptions(
  type: CategoryType,
  current?: string | null,
): CategoryOption[] {
  const labelOf = useCategoryLabel();
  const list = useCategoryList(type);
  if (current && !list.some((o) => o.value === current)) {
    return [...list, { value: current, label: labelOf(current) }];
  }
  return list;
}
