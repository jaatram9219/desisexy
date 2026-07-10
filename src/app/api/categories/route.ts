import { NextResponse } from 'next/server'
import { dbService } from '@/lib/dbService'

export async function GET() {
  try {
    const categories = await dbService.getCategories()
    return NextResponse.json(categories)
  } catch (err) {
    console.error('API get categories error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, slug, description, thumbnail, seoTitle, seoDescription } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Missing name or slug' }, { status: 400 })
    }

    const createdCat = await dbService.createCategory({
      name,
      slug,
      description,
      thumbnail,
      seoTitle,
      seoDescription
    })

    return NextResponse.json(createdCat)
  } catch (err: any) {
    console.error('API create category error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
