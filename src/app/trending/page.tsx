import React from 'react'
import { dbService } from '@/lib/dbService'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import VideoCard from '@/components/VideoCard'
import { Flame } from 'lucide-react'

export const revalidate = 0

export default async function TrendingPage() {
  const allVideos = await dbService.getVideos()
  
  // Sort by views desc
  const trendingVideos = [...allVideos].sort((a, b) => b.views - a.views)

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white border-l-4 border-brand-accent pl-3 flex items-center gap-2">
          <Flame className="w-5 h-5 text-brand-accent animate-pulse" />
          Trending Videos
        </h1>

        {trendingVideos.length === 0 ? (
          <div className="w-full text-center py-20 bg-brand-card rounded-3xl border border-white/5 p-8">
            <p className="text-gray-400 font-bold">No videos trending at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trendingVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
