import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('sh_token')?.value;

  // Spekulyativ prefetch — redirect qilmaymiz (keshga yozilib qolmasin).
  // Sahifalarning o'z klient qorovullari (`hasHydrated && !token`) mehmonni
  // baribir to'g'ri joyga yuboradi, faqat haqiqiy bosishda.
  if (isPrefetch(request)) return NextResponse.next();

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isProtected =
    PROTECTED_PATHS.some((p) => pathname.startsWith(p)) || EDIT_RE.test(pathname);

  // Kirgan (tokeni HALI AMALDAGI) foydalanuvchi auth sahifalariga kirmasin.
  if (isPublic && token) {
    if (tokenIsLive(token)) {
      return NextResponse.redirect(new URL('/', externalOrigin(request)));
    }
    // Eskirgan token — sahifaga kiritamiz, lekin cookie'ga TEGMAYMIZ: sessiya
    // localStorage'da (refresh token bilan) hali tirik bo'lishi mumkin — cookie
    // o'chirilsa kirgan foydalanuvchi keyingi protected sahifada register'ga
    // otilib qoladi (2026-07-11 bugi). Haqiqiy guest'ning qoldiq cookie'sini
    // auth.store hydrate() o'zi tozalaydi; kirganникini esa qayta tiklaydi.
    return NextResponse.next();
  }

  // Himoyalangan sahifalar uchun token majburiy — qaytib kelish uchun ?next=
  // (Mavjud, lekin eskirgan token bilan KIRITAMIZ: client axios refresh orqali
  // sessiyani o'zi yangilaydi — har 15 daqiqada login'ga otib yubormaymiz.)
  if (isProtected && !token) {
    const isCreateIntent = CREATE_INTENT_PATHS.some((p) => pathname.startsWith(p));
    const authUrl = new URL(
      isCreateIntent ? '/register' : '/login',
      externalOrigin(request),
    );
    authUrl.searchParams.set('next', pathname + request.nextUrl.search);
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
