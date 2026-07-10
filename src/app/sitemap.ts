import { MetadataRoute } from 'next'
import { dbService } from '@/lib/dbService'

export const revalidate = 3600 // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://desisexy.in'

  try {
    const videos = await dbService.getVideos()
    const categories = await dbService.getCategories()

    // 1. Static Pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/trending`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/latest`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/popular`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
    ]

    // 2. Category Dynamic Pages
    const categoryPages = categories.map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date(cat.createdAt),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    // 3. Video Watch Dynamic Pages
    const videoPages = videos.map((video) => ({
      url: `${baseUrl}/video/${video.slug}`,
      lastModified: new Date(video.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    return [...staticPages, ...categoryPages, ...videoPages]
  } catch (err) {
    console.error('Failed to generate sitemap:', err)
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ]
  }
}
