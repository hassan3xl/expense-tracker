import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'finance-tracker-super-secret-key-at-least-32-chars'
);

const COOKIE_NAME = 'finance_tracker_session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths
  if (pathname === '/login' || pathname === '/register') {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (e) {
        // Invalid token, proceed
      }
    }
    return NextResponse.next();
  }

  // Protected paths
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/transactions') ||
    pathname.startsWith('/debts') ||
    pathname === '/'
  ) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      await jwtVerify(token, JWT_SECRET);
      
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      return NextResponse.next();
    } catch (e) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
