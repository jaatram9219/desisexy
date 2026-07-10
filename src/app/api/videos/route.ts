import { NextResponse } from 'next/server'
import { dbService } from '@/lib/dbService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId') || undefined
    const isFeatured = searchParams.get('isFeatured') === 'true' ? true : searchParams.get('isFeatured') === 'false' ? false : undefined
    const search = searchParams.get('search') || undefined

    const videos = await dbService.getVideos({ categoryId, isFeatured, search })
    return NextResponse.json(videos)
  } catch (err) {
    console.error('API Videos error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, slug, description, url, duration, format, source, thumbnail, categoryId, tags, seoTitle, seoDescription, ogImage, schemaMarkup } = body

    if (!title || !slug || !url || !duration || !format || !source || !thumbnail || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Support categoryId being either UUID or a raw Category Name
    let finalCategoryId = categoryId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const isUuid = uuidRegex.test(categoryId)

    let categoryRecord = null
    if (isUuid) {
      const allCategories = await dbService.getCategories()
      categoryRecord = allCategories.find(c => c.id === categoryId)
    }

    if (!categoryRecord) {
      const allCategories = await dbService.getCategories()
      categoryRecord = allCategories.find(c => c.name.toLowerCase() === categoryId.toLowerCase())

      if (!categoryRecord) {
        const cleanName = categoryId.trim()
        const cleanSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        categoryRecord = await dbService.createCategory({
          name: cleanName,
          slug: cleanSlug,
          description: `Watch premium videos in the ${cleanName} category on DesiSexy.in.`,
          thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60',
          seoTitle: `Watch ${cleanName} Videos Online - DesiSexy.in`,
          seoDescription: `Stream the best high-definition ${cleanName} videos on DesiSexy.in.`
        })
      }
    }
    finalCategoryId = categoryRecord.id

    // Store thumbnail as CDN URL directly — no local download needed.
    // The browser fetches thumbnails straight from EPorner CDN, zero server load.
    const createdVideo = await dbService.createVideo({
      title,
      slug,
      description,
      url,
      duration: parseInt(duration),
      format,
      source,
      thumbnail, // Direct CDN URL — lightweight!
      categoryId: finalCategoryId,
      tags: typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : (tags || []),
      isFeatured: body.isFeatured === true,
      seoTitle,
      seoDescription,
      ogImage,
      schemaMarkup
    })

    return NextResponse.json(createdVideo)
  } catch (err: any) {
    console.error('API create video error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
