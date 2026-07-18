import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    
    // Check if logged in as Admin first via secure admin_session
    const adminSessionToken = cookieStore.get('admin_session')?.value
    const adminKey = process.env.ADMIN_SECRET_KEY || 'edb1e1d2340985f9b5c86dfafa10d5c3cbfb1fede40ee17097e4c35111aae50f'
    
    if (adminSessionToken && adminSessionToken === adminKey) {
      const response = NextResponse.json({
        user: {
          id: 'admin-system',
          email: 'admin@desisexy.in',
          name: 'System Administrator',
          role: 'ADMIN'
        }
      })
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      return response
    }

    const sessionToken = cookieStore.get('user_session')?.value

    if (!sessionToken) {
      const response = NextResponse.json({ user: null })
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      return response
    }

    const payload = await verifyJWT(sessionToken)
    if (!payload || !payload.userId) {
      const response = NextResponse.json({ user: null })
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      return response
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      const response = NextResponse.json({ user: null })
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      return response
    }

    const response = NextResponse.json({ user })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    return response
  } catch (error) {
    console.error('Auth check error:', error)
    const response = NextResponse.json({ user: null })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    return response
  }
}
