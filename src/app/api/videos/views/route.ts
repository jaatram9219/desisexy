import { NextResponse } from 'next/server'
import { dbService } from '@/lib/dbService'

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing id query parameter' }, { status: 400 })
    }

    const { cookies } = require('next/headers')
    const cookieStore = await cookies()
    const adminSessionToken = cookieStore.get('admin_session')?.value
    const adminKey = process.env.ADMIN_SECRET_KEY || 'edb1e1d2340985f9b5c86dfafa10d5c3cbfb1fede40ee17097e4c35111aae50f'
    
    // Skip incrementing views if the visitor is the Admin/Owner
    if (adminSessionToken && adminSessionToken === adminKey) {
      const { prisma } = require('@/lib/prisma')
      const video = await prisma.video.findUnique({
        where: { id },
        select: { views: true }
      })
      return NextResponse.json({ success: true, views: video?.views || 0 })
    }

    const updatedViews = await dbService.incrementViews(id)
    return NextResponse.json({ success: true, views: updatedViews })
  } catch (err) {
    console.error('API views increment error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
