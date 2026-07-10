'use client'

import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import VideoCard from '@/components/VideoCard'
import { useApp } from '@/context/AppContext'
import { Heart } from 'lucide-react'
import { Video } from '@/lib/dbService'

export default function FavoritesPage() {
  const { favorites } = useApp()
  const [favoriteVideos, setFavoriteVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVideos() {
      try {
        const res = await fetch('/api/videos')
        const data: Video[] = await res.json()
        // Filter videos that are marked as favorites
        const filtered = data.filter(v => favorites.includes(v.id))
        setFavoriteVideos(filtered)
      } catch (err) {
        console.error('Failed to load favorites:', err)
      } finally {
        setLoading(false)
      }
    }
    loadVideos()
  }, [favorites])

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white border-l-4 border-red-500 pl-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          My Favorites
        </h1>

        {loading ? (
          <div className="w-full flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
          </div>
        ) : favoriteVideos.length === 0 ? (
          <div className="w-full text-center py-20 bg-brand-card rounded-3xl border border-white/5 p-8 max-w-md mx-auto space-y-3">
            <p className="text-gray-400 font-bold">You haven't favorited any videos yet.</p>
            <p className="text-xs text-gray-600">While watching any video, click the heart button to save it here for quick access.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favoriteVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
