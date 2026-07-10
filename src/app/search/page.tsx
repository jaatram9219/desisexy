import React from 'react'
import { dbService } from '@/lib/dbService'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import VideoCard from '@/components/VideoCard'
import Link from 'next/link'
import { Search, Flame, Tag, Grid } from 'lucide-react'

export const revalidate = 0

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''
  const catSlug = params.category || ''
  const sortBy = params.sort || 'latest'

  let videos = await dbService.getVideos({ search: query })
  const categories = await dbService.getCategories()

  // Filter by category if slug is provided
  if (catSlug) {
    const matchedCat = categories.find(c => c.slug === catSlug)
    if (matchedCat) {
      videos = videos.filter(v => v.categoryId === matchedCat.id)
    }
  }

  // Sort videos
  if (sortBy === 'popular') {
    videos.sort((a, b) => b.views - a.views)
  } else {
    // default: latest
    videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const trendingSearches = ['lofi', 'sci-fi', 'animation', 'offroad', 'tears of steel']

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search Metadata & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
              <Search className="w-5 h-5 text-brand-primary" /> 
              {query ? `Search Results for "${query}"` : 'Advanced Search'}
            </h1>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              Found {videos.length} videos matching your criteria
            </p>
          </div>

          {/* Filtering controls (SSR friendly using URL search params) */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Category Filter */}
            <div className="flex items-center space-x-1.5 bg-brand-card px-3 py-1.5 rounded-full border border-white/5 text-xs text-gray-400 font-bold">
              <Grid className="w-3.5 h-3.5" />
              <span>Category:</span>
              <select 
                defaultValue={catSlug} 
                onChange={(e) => {
                  const url = new URL(window.location.href)
                  if (e.target.value) url.searchParams.set('category', e.target.value)
                  else url.searchParams.delete('category')
                  window.location.href = url.pathname + url.search
                }}
                className="bg-transparent text-white border-none outline-none font-bold cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug} className="bg-black text-white">{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center space-x-1.5 bg-brand-card px-3 py-1.5 rounded-full border border-white/5 text-xs text-gray-400 font-bold">
              <Flame className="w-3.5 h-3.5" />
              <span>Sort:</span>
              <select 
                defaultValue={sortBy} 
                onChange={(e) => {
                  const url = new URL(window.location.href)
                  url.searchParams.set('sort', e.target.value)
                  window.location.href = url.pathname + url.search
                }}
                className="bg-transparent text-white border-none outline-none font-bold cursor-pointer"
              >
                <option value="latest" className="bg-black text-white">Latest Uploads</option>
                <option value="popular" className="bg-black text-white">Most Viewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Results Display */}
        {videos.length === 0 ? (
          <div className="text-center py-20 bg-brand-card rounded-3xl border border-white/5 p-8 max-w-xl mx-auto space-y-4">
            <p className="text-gray-400 font-bold">No results found matching your search.</p>
            <p className="text-xs text-gray-600">Try checking your spelling or search for one of our trending topics:</p>
            
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {trendingSearches.map(term => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-brand-primary hover:text-black border border-white/5 text-xs font-semibold text-gray-300 transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {videos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
