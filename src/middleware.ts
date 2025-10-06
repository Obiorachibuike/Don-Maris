
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/login' 
    || path === '/signup' 
    || path === '/verify-email' 
    || path === '/' 
    || path.startsWith('/products') 
    || path.startsWith('/admin') 
    || path.startsWith('/profile')
    || path === '/cart'
    || path === '/checkout'
    || path === '/payment'
    || path === '/invoice';

  const token = request.cookies.get('token')?.value || ''

  if(isPublicPath && token && path !== '/') {
    // If user is logged in and tries to access login/signup, redirect to home.
    // But allow them to see their profile and admin pages.
    if (path === '/login' || path === '/signup') {
        return NextResponse.redirect(new URL('/', request.nextUrl));
    }
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/',
    '/profile',
    '/products/:path*',
    '/login',
    '/signup',
    '/verify-email',
    '/admin/:path*',
    '/cart',
    '/checkout',
    '/payment',
    '/invoice',
  ]
}
