import { NextResponse } from 'next/server'
import { dbService } from '@/lib/dbService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      const allSettings = await dbService.getSettings()
      // Convert list of setting objects to a nice key-value dictionary for frontend ease
      const config: Record<string, string> = {}
      allSettings.forEach(s => {
        config[s.key] = s.value
      })
      return NextResponse.json(config)
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
    // Try to parse body first if it is JSON
    let key: string | null = null
    let value: string | null = null

    try {
      const body = await request.json()
      if (body) {
        if (body.settings && typeof body.settings === 'object') {
          // Bulk update
          for (const [k, v] of Object.entries(body.settings)) {
            await dbService.updateSetting(k, String(v))
          }
          return NextResponse.json({ success: true })
        }
        key = body.key || null
        value = body.value !== undefined ? String(body.value) : null
      }
    } catch {
      // Fallback to query params if not JSON
      const { searchParams } = new URL(request.url)
      key = searchParams.get('key')
      value = searchParams.get('value')
    }

    if (!key || value === null) {
      return NextResponse.json({ error: 'Missing key or value' }, { status: 400 })
    }

    await dbService.updateSetting(key, value)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('API update setting error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
