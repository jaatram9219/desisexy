import React from 'react'
import { dbService } from '@/lib/dbService'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSection from '@/components/HeroSection'
import VideoCard from '@/components/VideoCard'
import AdBanner from '@/components/AdBanner'

export const revalidate = 0 // Disable caching for development so imports show up immediately

export default async function HomePage() {
  // Fetch data directly on the server
  const categories = await dbService.getCategories()
  const allVideos = await dbService.getVideos()
  
  // Extract featured video (first with isFeatured = true, or first overall)
  const featuredVideo = allVideos.find(v => v.isFeatured) || allVideos[0] || null
  
  // Extract trending videos (highest view counts)
  const trendingVideos = [...allVideos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)

  // Fetch content ad campaign to know the interval
  const contentCampaigns = await dbService.getAdCampaignsByPlacement('CONTENT')
  const adInterval = contentCampaigns[0]?.videoInterval || 4 // Fallback to every 4 videos

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-white">
      {/* Header component */}
      <Header />

      {/* Main Grid Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Hero Area */}
        <HeroSection 
          featuredVideo={featuredVideo} 
          trendingVideos={trendingVideos} 
          categories={categories} 
        />

        {/* Video Grid Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-black uppercase tracking-widest text-white border-l-4 border-brand-accent pl-3 flex items-center justify-between">
            <span>Explore All Videos</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{allVideos.length} Videos Available</span>
          </h2>

          {allVideos.length === 0 ? (
            <div className="w-full text-center py-20 bg-brand-card rounded-3xl border border-white/5 p-8">
              <p className="text-gray-400 font-bold mb-4">No videos found on the platform.</p>
              <p className="text-xs text-gray-600">Use the admin panel to import videos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allVideos.map((video, idx) => {
                const renderCard = <VideoCard key={video.id} video={video} />
                const showAd = (idx + 1) % adInterval === 0

                if (showAd) {
                  return (
                    <React.Fragment key={`frag-${video.id}`}>
                      {renderCard}
                      {/* Inject Full-Width Ad */}
                      <div className="col-span-full w-full">
                        <AdBanner placement="CONTENT" />
                      </div>
                    </React.Fragment>
                  )
                }

                return renderCard
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer component */}
      <Footer />
    </div>
  )
}
