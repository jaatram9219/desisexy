import { NextResponse } from 'next/server'
import { dbService } from '@/lib/dbService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const placement = searchParams.get('placement')

    if (!placement) {
      const ads = await dbService.getAdCampaigns()
      return NextResponse.json(ads)
    }

    if (!['HEADER', 'FOOTER', 'CONTENT', 'PAUSE'].includes(placement)) {
      return NextResponse.json({ error: 'Invalid placement' }, { status: 400 })
    }

    const ads = await dbService.getAdCampaignsByPlacement(placement as any)
    return NextResponse.json(ads)
  } catch (err) {
    console.error('API Ads error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, placement, code, isHtml, imageUrl, targetUrl, active, videoInterval } = body

    if (!name || !placement || !code) {
      return NextResponse.json({ error: 'Missing required fields (name, placement, code)' }, { status: 400 })
    }

    const created = await dbService.createAdCampaign({
      name,
      placement,
      code,
      isHtml: isHtml === true,
      imageUrl,
      targetUrl,
      active: active === true,
      videoInterval: videoInterval ? parseInt(videoInterval) : null
    })

    return NextResponse.json(created)
  } catch (err: any) {
    console.error('API create ad error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
