import React from 'react'
import { dbService } from '@/lib/dbService'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WatchPageClient from './WatchPageClient'
import { notFound } from 'next/navigation'

export const revalidate = 0

interface VideoPageProps {
  params: Promise<{ slug: string }>
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: VideoPageProps) {
  const { slug } = await params
  const video = await dbService.getVideoBySlug(slug)
  if (!video) return {}

  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://apexstream.com'}/video/${video.slug}`
  
  return {
    title: video.seoTitle || `${video.title} - Watch on ApexStream`,
    description: video.seoDescription || video.description || 'Watch premium curated videos in high definition.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: video.seoTitle || video.title,
      description: video.seoDescription || video.description || undefined,
      url: canonicalUrl,
      images: [
        {
          url: video.ogImage || video.thumbnail,
          width: 800,
          height: 450,
          alt: video.title,
        },
      ],
      type: 'video.other',
    },
  }
}

export default async function VideoWatchPage({ params }: VideoPageProps) {
  const { slug } = await params
  const video = await dbService.getVideoBySlug(slug)

  if (!video) {
    notFound()
  }

  // Fetch related videos (same category, excluding the current video)
  const relatedVideos = (await dbService.getVideos({ categoryId: video.categoryId }))
    .filter(v => v.id !== video.id)
    .slice(0, 10)

  // Fetch categories to resolve the category name
  const categories = await dbService.getCategories()
  const currentCategory = categories.find(c => c.id === video.categoryId) || null

  // Generate structured schema markup (JSON-LD)
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": video.description || 'Watch premium video content.',
    "thumbnailUrl": video.thumbnail,
    "uploadDate": video.createdAt,
    "duration": `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S`,
    "embedUrl": video.format === 'embed' ? video.url : undefined,
    "contentUrl": video.format !== 'embed' ? video.url : undefined,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": { "@type": "WatchAction" },
      "userInteractionCount": video.views
    }
  }

  const schemaMarkup = video.schemaMarkup || defaultSchema

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Header />

      <WatchPageClient 
        video={video} 
        relatedVideos={relatedVideos} 
        categoryName={currentCategory ? currentCategory.name : 'Uncategorized'} 
      />

      <Footer />
    </div>
  )
}
