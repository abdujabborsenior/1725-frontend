'use client';

import { useQuery } from '@tanstack/react-query';

import { categoriesApi } from '@/lib/api';
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

/**
 * Kategoriya nomlari (faol, admin belgilagan tartibda).
 *
 * Ro'yxat kam o'zgaradi → uzoq `staleTime`: sahifadan sahifaga o'tishда
 * qayta so'ralmaydi (100k yukда keraksiz so'rov bo'lmasin).
 */
export function useCategoryNames(type: CategoryType): string[] {
  const { data } = useQuery({
    queryKey: ['categories', type],
    queryFn: () => categoriesApi.list(type),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return data && data.length > 0 ? data.map((c) => c.name) : FALLBACK[type];
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
): string[] {
  const names = useCategoryNames(type);
  if (current && !names.includes(current)) return [...names, current];
  return names;
}
