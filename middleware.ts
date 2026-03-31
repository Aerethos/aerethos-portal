import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Protect all /portal routes except the login page itself
  const isPortalRoute = pathname.startsWith('/portal') && pathname !== '/portal';
  const isAdminRoute = pathname.startsWith('/admin');

  if ((isPortalRoute || isAdminRoute) && !session) {
    return NextResponse.redirect(new URL('/portal', req.url));
  }

  // If already logged in and visiting login page, redirect to dashboard
  if (pathname === '/portal' && session) {
    return NextResponse.redirect(new URL('/portal/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*'],
};
