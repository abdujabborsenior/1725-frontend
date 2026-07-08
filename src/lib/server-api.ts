import { API_URL } from './constants';

/**
 * Server component'lardan backend'ga boshlang'ich (SSR) ma'lumot so'rovi.
 * Maqsad: LCP kontenti (ro'yxat kartalari) HTML'da kelsin — client fetch'ни
 * kutmasin (mobilda 2–10 s tejaydi).
 *
 * Xavfsizlik / yuk siyosati:
 *  - `next.revalidate` — natija Next data-keshida saqlanadi: backend'ga har
 *    instansiya uchun ~30 s da bitta so'rov (100k trafikda ham yuk nol).
 *  - Timeout 3 s + har qanday xatoda `null` — backend yotsa ham sahifa
 *    bugungidek client-fetch rejimida ishlayveradi (fail-open).
 *  - Faqat PUBLIC endpointlar uchun (token yuborilmaydi); shaxsiylashtirilgan
 *    maydonlar (likedByMe...) client'da background refetch bilan yangilanadi.
 */
export async function fetchInitial<T>(
  path: string,
  revalidate = 30,
): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate },
      headers: { 'Accept-Language': 'uz' },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T };
    return json?.data ?? null;
  } catch {
    return null;
  }
}
