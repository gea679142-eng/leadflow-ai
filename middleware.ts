import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'leadflow-secret-key-change-in-production-2026'
);

const PROTECTED_PREFIXES = ['/dashboard', '/tasks', '/leads', '/messages', '/records', '/settings'];
const AUTH_PREFIXES = ['/auth/login', '/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('lf_token')?.value;
  let isLoggedIn = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isLoggedIn = true;
    } catch {
      isLoggedIn = false;
    }
  }

  // Auth pages: redirect to dashboard if logged in
  if (AUTH_PREFIXES.some(p => pathname.startsWith(p))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected pages: redirect to login if not logged in
  if (PROTECTED_PREFIXES.some(p => pathname.startsWith(p))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
