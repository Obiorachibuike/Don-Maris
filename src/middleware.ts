
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/login' 
    || path === '/signup' 
    || path === '/verify-email' 
    || path === '/' 
    || path.startsWith('/products')
    || path === '/cart'
    || path === '/about'
    || path === '/contact'
    || path === '/recommendations'
    || path.startsWith('/admin');
    
  const token = request.cookies.get('token')?.value || ''

  if (isPublicPath && token && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }
  
  if (!token && path.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/',
    '/profile/:path*',
    '/products/:path*',
    '/login',
    '/signup',
    '/verify-email',
    '/admin/:path*',
    '/cart',
    '/checkout',
    '/payment',
    '/invoice',
    '/recommendations',
    '/about',
    '/contact',
  ]
}
