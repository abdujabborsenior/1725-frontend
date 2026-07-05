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
];
// Joylash niyati (guest CTA) — bu yo'llarga kirmagan foydalanuvchi LOGIN emas,
// REGISTER sahifasiga yo'naltiriladi (ro'yxatdan o'tib maqsadiga qaytadi).
const CREATE_INTENT_PATHS = ['/problems/create', '/startups/create'];
const EDIT_RE = /^\/startups\/[^/]+\/edit$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('sh_token')?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isProtected =
    PROTECTED_PATHS.some((p) => pathname.startsWith(p)) || EDIT_RE.test(pathname);

  // Kirgan foydalanuvchi auth sahifalariga kirmasin
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Himoyalangan sahifalar uchun token majburiy — qaytib kelish uchun ?next=
  if (isProtected && !token) {
    const isCreateIntent = CREATE_INTENT_PATHS.some((p) => pathname.startsWith(p));
    const authUrl = new URL(isCreateIntent ? '/register' : '/login', request.url);
    authUrl.searchParams.set('next', pathname + request.nextUrl.search);
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
