import { NextResponse } from 'next/server'
import { fetchViaDoH } from '@/lib/dohFetch'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  // Pre-parse metadata directly from the URL structure as a secondary fallback
  let parsedTitle = ''
  let parsedThumbnail = ''
  let parsedDuration = 900
  let isEporner = url.includes('eporner.com')
  let isXhamster = url.includes('xhamster.com')
  let isBeeg = url.includes('beeg.com')
  let videoId = ''

  if (isEporner) {
    const match = url.match(/video-([a-zA-Z0-9]+)/)
    videoId = match ? match[1] : ''
    let slugPart = ''
    try {
      const pathParts = new URL(url).pathname.split('/').filter(Boolean)
      const found = pathParts.find(p => !p.startsWith('video-'))
      if (found) slugPart = found
    } catch (_) {}
    parsedTitle = slugPart ? slugPart.replace(/[-_]/g, ' ') : (videoId ? `EPorner Video ${videoId}` : 'EPorner Video')
    if (videoId) {
      parsedThumbnail = `https://static-hw.eporner.com/thumbs/${videoId}/1.jpg`
    }
  } else if (isXhamster) {
    const match = url.match(/(xh[a-zA-Z0-9]+)/)
    videoId = match ? match[1] : ''
    let slugPart = ''
    try {
      const pathParts = new URL(url).pathname.split('/').filter(Boolean)
      const found = pathParts.find(p => p.includes(videoId)) || pathParts[pathParts.length - 1] || ''
      slugPart = found.replace(videoId, '').replace(/[-_]+$/g, '')
    } catch (_) {}
    parsedTitle = slugPart ? slugPart.replace(/[-_]/g, ' ') : (videoId ? `xHamster Video ${videoId}` : 'xHamster Video')
    parsedThumbnail = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=60'
  } else if (isBeeg) {
    const match = url.match(/beeg\.com\/([0-9]+)/)
    videoId = match ? match[1] : ''
    parsedTitle = videoId ? `Beeg Video ${videoId}` : 'Beeg Video'
    parsedThumbnail = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=60'
  }

  // Capitalize pre-parsed title
  if (parsedTitle) {
    parsedTitle = parsedTitle
      .trim()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }

  try {
    // 1. Fetch external webpage HTML using DoH IP-rotated fetch
    const html = await fetchViaDoH(url, 'text')

    // 2. Extract Real Thumbnail (og:image)
    let thumbnail = ''
    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/) || 
                         html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/) ||
                         html.match(/<link\s+rel="image_src"\s+href="([^"]+)"/)
    if (ogImageMatch) {
      thumbnail = ogImageMatch[1]
    } else {
      thumbnail = parsedThumbnail
    }

    // 3. Extract Real Title
    let title = ''
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/) ||
                         html.match(/<title>([^<]+)<\/title>/)
    if (ogTitleMatch) {
      title = ogTitleMatch[1]
        .replace(/ - EPorner.*/i, '')
        .replace(/ - xHamster.*/i, '')
        .replace(/ \| Beeg.*/i, '')
        .replace(/ - YouTube.*/i, '')
        .trim()
    } else {
      title = parsedTitle
    }

    // 4. Extract Real Duration (in seconds)
    let duration = parsedDuration
    const durationMatch = html.match(/<meta\s+property="video:duration"\s+content="([0-9]+)"/) ||
                          html.match(/"duration":\s*([0-9]+)/) ||
                          html.match(/"durationInSeconds":\s*([0-9]+)/)
    if (durationMatch) {
      duration = parseInt(durationMatch[1], 10)
    }

    // 5. Extract Real Categories and Tags (EPorner specific)
    let categories: string[] = []
    let tags: string[] = []

    if (isEporner) {
      const categoryMatches = [...html.matchAll(/<li[^>]*class="vit-category"[^>]*><a[^>]*>([^<]+)<\/a><\/li>/gi)]
      categories = categoryMatches.map(m => m[1].trim())

      const tagMatches = [...html.matchAll(/<li[^>]*class="vit-tag"[^>]*><a[^>]*>([^<]+)<\/a><\/li>/gi)]
      tags = tagMatches.map(m => m[1].trim())
    }

    if (categories.length === 0) {
      categories = ['Amateur']
    }

    return NextResponse.json({
      success: true,
      title,
      thumbnail,
      duration,
      categories,
      tags
    })
  } catch (error: any) {
    // Fall back to pre-parsed metadata in case of severe proxy failures
    if (parsedTitle) {
      return NextResponse.json({
        success: true,
        title: parsedTitle,
        thumbnail: parsedThumbnail,
        duration: parsedDuration,
        categories: ['Amateur'],
        tags: ['Amateur', 'eporner']
      })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
