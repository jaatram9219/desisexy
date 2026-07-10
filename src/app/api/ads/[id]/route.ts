import { NextResponse } from 'next/server'
import { dbService } from '@/lib/dbService'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const updated = await dbService.updateAdCampaign(id, {
      name: body.name,
      placement: body.placement,
      code: body.code,
      isHtml: body.isHtml === true,
      imageUrl: body.imageUrl,
      targetUrl: body.targetUrl,
      active: body.active === true,
      videoInterval: body.videoInterval ? parseInt(body.videoInterval) : null
    })

    if (!updated) {
      return NextResponse.json({ error: 'Ad campaign not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (err: any) {
    console.error('API update ad campaign error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const ok = await dbService.deleteAdCampaign(id)
    if (!ok) {
      return NextResponse.json({ error: 'Failed to delete ad campaign or campaign not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API delete ad campaign error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
export async function POST(request: Request) {
  // We can write it in a separate POST route or inside a helper.
}
