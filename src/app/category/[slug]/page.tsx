import React from 'react'
import { dbService } from '@/lib/dbService'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import VideoCard from '@/components/VideoCard'
import { notFound } from 'next/navigation'
import { Grid, Film } from 'lucide-react'

export const revalidate = 0

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const cat = await dbService.getCategoryBySlug(slug)
  if (!cat) return {}
  return {
    title: cat.seoTitle || `${cat.name} - Stream Online`,
    description: cat.seoDescription || cat.description,
  }
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await dbService.getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  // Fetch videos in this category
  const videos = await dbService.getVideos({ categoryId: category.id })

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Category Header Banner */}
        <div className="relative w-full rounded-3xl overflow-hidden aspect-[21/6] min-h-[160px] border border-white/5 shadow-2xl flex flex-col justify-end p-6 sm:p-10">
          {/* Background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${category.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=60'})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-black/25" />

          {/* Banner Meta */}
          <div className="relative z-10 space-y-2 max-w-2xl">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-brand-accent text-white font-extrabold text-[9px] uppercase tracking-wider">
              Category
            </span>
            <h1 className="text-xl sm:text-3xl font-black text-white leading-tight uppercase tracking-wide">
              {category.name}
            </h1>
            <p className="text-xs text-gray-300 leading-relaxed font-semibold">
              {category.description}
            </p>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Film className="w-4.5 h-4.5 text-brand-primary" />
            {category.name} Collection ({videos.length})
          </h2>

          {videos.length === 0 ? (
            <div className="w-full text-center py-20 bg-brand-card rounded-3xl border border-white/5 p-8">
              <p className="text-gray-400 font-bold mb-2">No videos found under this category yet.</p>
              <p className="text-xs text-gray-600">Access the Admin Panel to import or re-categorize videos into {category.name}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {videos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
