import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // For now just pass everything through
  // Auth is handled client-side in each page
  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*'],
};
