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
  '/profile',
  '/admin',
  '/notifications',
  '/settings',
  '/messages',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('sh_token')?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  // Kirgan foydalanuvchi auth sahifalariga kirmasin
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Himoyalangan sahifalar uchun token majburiy — qaytib kelish uchun ?next=
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
