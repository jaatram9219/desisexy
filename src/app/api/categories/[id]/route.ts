import { NextResponse } from 'next/server'
import { dbService } from '@/lib/dbService'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const updated = await dbService.updateCategory(id, {
      name: body.name,
      slug: body.slug,
      description: body.description,
      thumbnail: body.thumbnail,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription
    })

    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (err: any) {
    console.error('API update category error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const ok = await dbService.deleteCategory(id)
    if (!ok) {
      return NextResponse.json({ error: 'Failed to delete category or category not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API delete category error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
