import { NextResponse } from 'next/server'
import { dbService } from '@/lib/dbService'

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type') // 'impression' | 'click'

    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type parameters' }, { status: 400 })
    }

    if (type === 'impression') {
      await dbService.logAdImpression(id)
    } else if (type === 'click') {
      await dbService.logAdClick(id)
    } else {
      return NextResponse.json({ error: 'Invalid tracking type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Ad tracking error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
