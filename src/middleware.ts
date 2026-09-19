import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isAppLocale,
  localizePath,
  splitLocale,
} from '@/i18n/locales';

/**
 * Marshrut ro'yxatlari PREFIKSSIZ yo'l bilan yoziladi (`/profile`) — til
 * prefiksi (`/ru`, `/en`) tekshiruvdan oldin ajratib olinadi, shuning uchun
 * himoya har tilda bir xil ishlaydi.
 */
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
];
const PROTECTED_PATHS = [
  '/problems/create',
  '/startups/create',
  '/profile',
  '/notifications',
  '/settings',
  '/messages',
  // Investor kabineti — butunlay shaxsiy (lenta, shortlist, so'rovlar)
  '/investor',
];
// Joylash niyati (guest CTA) — bu yo'llarga kirmagan foydalanuvchi LOGIN emas,
// REGISTER sahifasiga yo'naltiriladi (ro'yxatdan o'tib maqsadiga qaytadi).
// `/investor` ham "niyat" yo'li: mehmon investor bo'lmoqchi bo'lsa, uni
// LOGIN emas, REGISTER sahifasiga yuborish to'g'ri (hisobi hali yo'q).
const CREATE_INTENT_PATHS = [
  '/problems/create',
  '/startups/create',
  '/investor',
];
const EDIT_RE = /^\/startups\/[^/]+\/edit$/;

/** Segment chegarasi bilan moslik: `/profile` → `/profile`, `/profile/...`. */
function matchesAny(path: string, list: string[]): boolean {
  return list.some((p) => path === p || path.startsWith(`${p}/`));
}

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Cookie'dagi JWT hali amal qilyaptimi (exp bo'yicha)? Cookie 30 kun yashaydi,
 * ichidagi access token esa tez eskiradi — shuning uchun "cookie bor" degani
 * "kirgan" degani EMAS. Eskirgan/buzuq token guest deb qaraladi, aks holda
 * guest auth sahifalaridan bosh sahifaga qaytarilib qulflanib qoladi.
 */
function tokenIsLive(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
    ) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/**
 * Redirect uchun TASHQI origin. `request.url` ISHLATILMAYDI: Next standalone
 * nginx ortida uni ichki host (localhost:3330) deb ko'radi va foydalanuvchi
 * prod'da localhost'ga otiladi (jonli serverda kuzatilgan KRITIK bug; nisbiy
 * Location ham bo'lmaydi — Next middleware adapteri uni NextURL bilan parse
 * qilib yiqiladi). Yechim: origin forwarded header'lardan quriladi; host
 * baribir localhost bo'lib chiqsa — build-time PUBLIC sayt manzili (yoki API
 * domenidan chiqarilgan front domeni) oxirgi qalqon bo'ladi.
 */
function externalOrigin(request: NextRequest): string {
  const host =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    request.nextUrl.host;
  const proto =
    request.headers.get('x-forwarded-proto') ??
    request.nextUrl.protocol.replace(':', '');
  if (!/^(localhost|127\.|0\.0\.0\.0)/i.test(host)) return `${proto}://${host}`;

  // Proxy Host'ni bermagan — prod'da hech qachon localhost'ga otmaymiz.
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) return site.replace(/\/$/, '');
  const api = process.env.NEXT_PUBLIC_API_URL; // https://backend.mymarkaz.uz/api
  if (api && !api.includes('localhost')) {
    try {
      const apiHost = new URL(api).hostname; // backend.mymarkaz.uz → mymarkaz.uz
      return `https://${apiHost.replace(/^backend\./, '')}`;
    } catch { /* pastdagi lokal fallback */ }
  }
  return `${proto}://${host}`; // lokal dev — o'zi to'g'ri
}

/**
 * So'rov spekulyativ PREFETCH'mi?
 *
 * Prefetch'ga redirect qaytarish xavfli: javob mijoz keshiga yozilib qoladi
 * va keyinchalik foydalanuvchi holati o'zgargach (masalan kirgach) ESKI
 * qaror qayta ijro etiladi.
 *
 * ⚠️ QAMROV (o'lchab tekshirilgan, 2026-08-31): brauzerning O'Z spekulyativ
 * prefetch'i (`purpose` / `x-purpose` / `x-moz`) bu qorovulga TUSHADI va
 * redirect qilinmaydi. Next'ning `<Link>` prefetch'i esa `Next-Router-Prefetch: 1`
 * yuborsa ham, ishlatilayotgan Next versiyasi bu sarlavhani middleware'ga
 * BERMAYDI (curl bilan tasdiqlangan: `purpose: prefetch` → 200,
 * `Next-Router-Prefetch: 1` → 307). Shuning uchun Next Router Cache'ining
 * zaharlanishi bu yerda EMAS, `lib/auth-navigation.ts` da — auth holati
 * o'zgarganda to'liq yuklash bilan — yopiladi. Sarlavha ro'yxatда qoldirilgan:
 * kelajak versiyada uzatilsa, himoya o'zidan-o'zi kuchga kiradi.
 */
function isPrefetch(request: NextRequest): boolean {
  return (
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('x-purpose') === 'prefetch' ||
    request.headers.get('x-moz') === 'prefetch'
  );
}

/**
 * Brauzerning TO'LIQ hujjat navigatsiyasimi (manzil satriga yozish, tashqi
 * havola)? Client-side (RSC) so'rovlarga til redirect'i qo'llanmaydi — Next
 * routeri ularni o'zi boshqaradi.
 */
function isDocumentNavigation(request: NextRequest): boolean {
  if (request.headers.get('rsc') === '1') return false;
  const dest = request.headers.get('sec-fetch-dest');
  if (dest) return dest === 'document';
  return (request.headers.get('accept') ?? '').includes('text/html');
}

function redirectTo(request: NextRequest, target: string, status?: number): NextResponse {
  return NextResponse.redirect(new URL(target, externalOrigin(request)), status);
}

/**
 * `next-intl` middleware'i o'z redirect'larini `request.url` asosida quradi
 * (nginx ortida — ichki localhost). Bizda uning redirect holatlari deyarli
 * uchramaydi (`/uz/...` pastda oldindan ushlanadi), lekin qalqon UMUMIY:
 * har qanday `Location` tashqi origin bilan qayta yoziladi — prod hech qachon
 * localhost'ga otmaydi.
 */
function withExternalLocation(request: NextRequest, response: NextResponse): NextResponse {
  const location = response.headers.get('location');
  if (!location) return response;
  try {
    const external = new URL(externalOrigin(request));
    const url = new URL(location, external);
    url.protocol = external.protocol;
    url.host = external.host;
    response.headers.set('location', url.toString());
  } catch {
    /* buzuq Location — o'zgartirmaymiz */
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Spekulyativ prefetch — o'z redirect'larimizni qilmaymiz (keshga yozilib
  // qolmasin). Til qatlami (ichki rewrite) esa baribir kerak.
  if (isPrefetch(request)) {
    return withExternalLocation(request, intlMiddleware(request));
  }

  const { locale, path, prefixed } = splitLocale(pathname);

  // `/uz/...` — asosiy til prefikssiz yashaydi: dublikat URL bo'lmasin
  // (bitta sahifa = bitta kanonik manzil). 308 — doimiy, qidiruv tizimi
  // eski manzil vaznini yangisiga o'tkazadi.
  if (prefixed && locale === DEFAULT_LOCALE) {
    // ⚠️ Open-redirect qalqoni: `/uz//evil.com` → `//evil.com` protocol-relative
    // URL bo'lib TASHQI hostga aylanardi. Boshidagi `/` va `\` lar bittaga
    // yig'iladi — natija har doim o'z domenimizdagi yo'l.
    const safe = path.replace(/^[/\\]+/, '/');
    return redirectTo(request, `${safe}${search}`, 308);
  }

  // Saqlangan til tanlovi — FAQAT bosh sahifada (`mymarkaz.uz` ni yozgan
  // foydalanuvchi o'zi tanlagan tilda kutib olinadi). Chuqur havolalar
  // (ulashilgan, qidiruvdan kelgan) — URL'dagi til HURMAT qilinadi, ular
  // o'rniga nozik taklif bandi chiqadi. Botlarda cookie yo'q → ta'sir nol.
  if (!prefixed && path === '/' && isDocumentNavigation(request)) {
    const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
    if (isAppLocale(preferred) && preferred !== DEFAULT_LOCALE) {
      return redirectTo(request, `${localizePath(preferred, '/')}${search}`);
    }
  }

  const token = request.cookies.get('sh_token')?.value;
  const isPublic = matchesAny(path, PUBLIC_PATHS);
  const isProtected = matchesAny(path, PROTECTED_PATHS) || EDIT_RE.test(path);

  // Kirgan (tokeni HALI AMALDAGI) foydalanuvchi auth sahifalariga kirmasin.
  // Eskirgan token — sahifaga kiritamiz, cookie'ga TEGMAYMIZ: sessiya
  // localStorage'da (refresh token bilan) hali tirik bo'lishi mumkin — cookie
  // o'chirilsa kirgan foydalanuvchi keyingi protected sahifada register'ga
  // otilib qoladi (2026-07-11 bugi). Haqiqiy guest'ning qoldiq cookie'sini
  // auth.store hydrate() o'zi tozalaydi; kirganникini esa qayta tiklaydi.
  if (isPublic && token && tokenIsLive(token)) {
    return redirectTo(request, localizePath(locale, '/'));
  }

  // Himoyalangan sahifalar uchun token majburiy — qaytib kelish uchun ?next=
  // (Mavjud, lekin eskirgan token bilan KIRITAMIZ: client axios refresh orqali
  // sessiyani o'zi yangilaydi — har 15 daqiqada login'ga otib yubormaymiz.)
  // Auth sahifasi ham, `next` ham — foydalanuvchi turgan TILDA.
  if (isProtected && !token) {
    const isCreateIntent = matchesAny(path, CREATE_INTENT_PATHS);
    const authUrl = new URL(
      localizePath(locale, isCreateIntent ? '/register' : '/login'),
      externalOrigin(request),
    );
    authUrl.searchParams.set('next', pathname + search);
    return NextResponse.redirect(authUrl);
  }

  return withExternalLocation(request, intlMiddleware(request));
}

export const config = {
  // Nuqtali yo'llar (sitemap.xml, robots.txt, icon.svg, shriftlar) va
  // ichki/API yo'llar middleware'dan o'tmaydi. Ilova marshrutlarida nuqta
  // bo'lmaydi: username `[a-z0-9_]`, identifikatorlar UUID, slug `[a-z0-9-]`.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
