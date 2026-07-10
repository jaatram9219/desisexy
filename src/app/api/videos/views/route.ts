import { NextResponse } from 'next/server'
import { dbService } from '@/lib/dbService'

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing id query parameter' }, { status: 400 })
    }

    const updatedViews = await dbService.incrementViews(id)
    return NextResponse.json({ success: true, views: updatedViews })
  } catch (err) {
    console.error('API views increment error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
