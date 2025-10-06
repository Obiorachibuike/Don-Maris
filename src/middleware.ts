
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/login' || path === '/signup' || path === '/verify-email' || path === '/' || path === '/products'

  const token = request.cookies.get('token')?.value || ''

  if(isPublicPath && token && path !== '/') {
    // Allow going to profile page even if it's considered "public" by this rule
    if (path.startsWith('/profile')) return NextResponse.next();
    return NextResponse.redirect(new URL('/', request.nextUrl))
  }

  if (!isPublicPath && !token) {
    if (path.startsWith('/profile')) {
       return NextResponse.redirect(new URL('/login', request.nextUrl));
    }
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }
    
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/',
    '/profile',
    '/products',
    '/login',
    '/signup',
    '/verify-email',
    '/admin/:path*',
    '/cart',
    '/checkout',
    '/payment',
  ]
}
