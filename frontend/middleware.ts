// frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  // 1. Define public paths
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/profile',
    '/admin/profile',
    '/api/(.*)',
    '/_next/(.*)',
    '/favicon.ico',
  ];

  // 2. Check if current path is public
  const isPublicPath = publicPaths.some((path) => {
    if (path.includes('(.*)')) {
      const regex = new RegExp(path.replace('(.*)', '.*'));
      return regex.test(pathname);
    }
    return pathname === path;
  });

  // 3. Allow /signup and /login unconditionally
  if (pathname === '/signup' || pathname === '/login') {
    return NextResponse.next();
  }

  // 4. Handle other public paths
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 5. Handle protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 6. Validate token for protected routes
  try {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Invalid token');
    }

    // Role-based access control
    const user = await res.json();
    if (pathname.startsWith('/admin') && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

  } catch (error) {
    console.error('Middleware auth failed:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};