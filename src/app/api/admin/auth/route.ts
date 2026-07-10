import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// POST /api/admin/login — verify key and set session cookie
export async function POST(request: NextRequest) {
  const { key } = await request.json()
  const adminKey = process.env.ADMIN_SECRET_KEY || 'edb1e1d2340985f9b5c86dfafa10d5c3cbfb1fede40ee17097e4c35111aae50f'

  if (!key || key !== adminKey) {
    return NextResponse.json({ error: 'Invalid access key' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  
  // Set httpOnly secure cookie — expires in 24 hours
  response.cookies.set('admin_session', adminKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  return response
}

// POST /api/admin/logout — clear session cookie
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_session')
  return response
}
