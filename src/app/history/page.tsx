'use client'

import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import VideoCard from '@/components/VideoCard'
import { useApp } from '@/context/AppContext'
import { History, Trash2 } from 'lucide-react'
import { Video } from '@/lib/dbService'

export default function HistoryPage() {
  const { watchHistory, setCurrentUser } = useApp()
  const [historyVideos, setHistoryVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVideos() {
      try {
        const res = await fetch('/api/videos')
        const data: Video[] = await res.json()
        
        // Map videos keeping the order of IDs in watchHistory
        const mapped = watchHistory
          .map(id => data.find(v => v.id === id))
          .filter((v): v is Video => !!v)
          
        setHistoryVideos(mapped)
      } catch (err) {
        console.error('Failed to load history:', err)
      } finally {
        setLoading(false)
      }
    }
    loadVideos()
  }, [watchHistory])

  const clearHistory = () => {
    localStorage.removeItem('apex_history')
    setHistoryVideos([])
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white border-l-4 border-blue-500 pl-3 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            Watch History
          </h1>

          {historyVideos.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-4 py-2 bg-brand-accent/15 hover:bg-brand-accent text-brand-accent hover:text-white transition rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Watch History</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="w-full flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
          </div>
        ) : historyVideos.length === 0 ? (
          <div className="w-full text-center py-20 bg-brand-card rounded-3xl border border-white/5 p-8 max-w-md mx-auto space-y-3">
            <p className="text-gray-400 font-bold">Your watch history is empty.</p>
            <p className="text-xs text-gray-600">Videos you play on this platform will automatically appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {historyVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
