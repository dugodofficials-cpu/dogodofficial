import { NextResponse } from 'next/server';

export function successResponse(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ success: false, message }, { status });
}

export function parseBody(request: Request) {
  return request.json();
}

export function getCookieValue(request: Request, name: string): string | null {
  const cookies = request.headers.get('cookie');
  if (!cookies) return null;
  
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  return getCookieValue(request, 'dugo-auth-token');
}
