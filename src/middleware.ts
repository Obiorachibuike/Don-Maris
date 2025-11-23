
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('token')?.value || ''

  // Paths that are public and accessible to everyone
  const isPublicPath = 
    path.startsWith('/api') || 
    path === '/login' || 
    path === '/signup' || 
    path === '/verify-email' || 
    path === '/forgot-password' ||
    path === '/reset-password' ||
    path === '/' || 
    path.startsWith('/products') || 
    path === '/cart' || 
    path === '/about' || 
    path === '/contact' || 
    path === '/recommendations' ||
    path.startsWith('/admin');

  // Paths that require authentication
  const isProtectedRoute = 
    path.startsWith('/profile') ||
    path.startsWith('/checkout') ||
    path.startsWith('/payment') ||
    path.startsWith('/invoice') ||
    path.startsWith('/orders/') ||
    path.startsWith('/settings');


  // If trying to access a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // If logged in, redirect away from login/signup pages
  if (token && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/',
    '/profile/:path*',
    '/products/:path*',
    '/orders/:path*',
    '/login',
    '/signup',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/admin/:path*',
    '/cart',
    '/checkout',
    '/payment',
    '/invoice',
    '/recommendations',
    '/about',
    '/contact',
    '/settings',
    '/api/:path*', // Ensure middleware runs on API routes
  ]
}
