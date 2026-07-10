import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  // Allow the login page itself through
  if (pathname === '/admin/login') return NextResponse.next()

  // Check for valid admin session cookie
  const sessionToken = request.cookies.get('admin_session')?.value
  const adminKey = process.env.ADMIN_SECRET_KEY || 'edb1e1d2340985f9b5c86dfafa10d5c3cbfb1fede40ee17097e4c35111aae50f'

  if (!sessionToken || sessionToken !== adminKey) {
    // Redirect to login with original destination
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
