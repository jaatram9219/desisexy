import { NextResponse } from 'next/server'
import { dbService } from '@/lib/dbService'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const updatedVideo = await dbService.updateVideo(id, {
      title: body.title,
      slug: body.slug,
      description: body.description,
      url: body.url,
      duration: body.duration ? parseInt(body.duration) : undefined,
      format: body.format,
      source: body.source,
      thumbnail: body.thumbnail,
      isFeatured: body.isFeatured === true,
      categoryId: body.categoryId,
      tags: body.tags,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      ogImage: body.ogImage,
      schemaMarkup: body.schemaMarkup
    })

    if (!updatedVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json(updatedVideo)
  } catch (err: any) {
    console.error('API update video error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    // Handle bulk delete if id is "bulk"
    if (id === 'bulk') {
      const { searchParams } = new URL(request.url)
      const idsStr = searchParams.get('ids')
      if (!idsStr) {
        return NextResponse.json({ error: 'Missing ids parameter for bulk delete' }, { status: 400 })
      }
      
      const ids = idsStr.split(',')
      let deletedCount = 0
      for (const videoId of ids) {
        const ok = await dbService.deleteVideo(videoId)
        if (ok) deletedCount++
      }
      return NextResponse.json({ success: true, count: deletedCount })
    }

    const success = await dbService.deleteVideo(id)
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete video or video not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API delete video error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
