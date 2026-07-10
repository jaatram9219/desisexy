import { NextResponse } from 'next/server'
import { dbService } from '@/lib/dbService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      const allSettings = await dbService.getSettings()
      return NextResponse.json(allSettings)
    }

    const value = await dbService.getSetting(key, '')
    return new NextResponse(value, { status: 200, headers: { 'Content-Type': 'text/plain' } })
  } catch (err) {
    console.error('API get settings error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const value = searchParams.get('value')

    if (!key || value === null) {
      return NextResponse.json({ error: 'Missing key or value query parameters' }, { status: 400 })
    }

    await dbService.updateSetting(key, value)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('API update setting error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
