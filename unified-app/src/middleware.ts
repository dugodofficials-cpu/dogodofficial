import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  // Anchored to the start of the hostname only — an unanchored `.includes('admin.')`
  // would also match unintended hosts like `superadmin.example.com` or a
  // spoofed Host header containing that substring anywhere.
  const isAdmin = hostname.startsWith('admin.');
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot|css|js|map|json|xml|txt|mp4|webm)$).*)',
  ],
};
