import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  const isAdmin = hostname.startsWith('admin.') || hostname.includes('admin.');
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  
  if (isLocalhost) {
    const adminParam = url.searchParams.get('admin');
    if (adminParam === 'true') {
      if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api')) {
        url.pathname = `/admin${url.pathname}`;
        return NextResponse.rewrite(url);
      }
    }
    return NextResponse.next();
  }

  if (isAdmin) {
    if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next')) {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
