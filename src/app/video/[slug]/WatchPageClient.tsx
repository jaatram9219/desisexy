'use client'

import React, { useEffect, useState } from 'react'
import { Heart, Eye, Calendar, Tag, Link as LinkIcon, Check, ThumbsUp, ThumbsDown, Flame } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import CustomPlayer from '@/components/CustomPlayer'
import Link from 'next/link'
import { Video } from '@/lib/dbService'

interface WatchPageClientProps {
  video: Video
  relatedVideos: Video[]
  categoryName: string
}

export default function WatchPageClient({ video, relatedVideos, categoryName }: WatchPageClientProps) {
  const { favorites, toggleFavorite, addToHistory, isTheaterMode, setIsTheaterMode } = useApp()
  const [isCopied, setIsCopied] = useState(false)
  const [currentViews, setCurrentViews] = useState(video.views)

  // Interactive likes and dislikes state (seeded deterministically from views)
  const baseLikes = Math.max(10, Math.floor(video.views * 0.08))
  const baseDislikes = Math.max(1, Math.floor(video.views * 0.002))
  const [likes, setLikes] = useState(baseLikes)
  const [dislikes, setDislikes] = useState(baseDislikes)
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null)

  const isFavorited = favorites.includes(video.id)

  // Increment views and add to history on mount
  useEffect(() => {
    addToHistory(video.id)
    
    // Call views increment API
    fetch(`/api/videos/views?id=${video.id}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCurrentViews(data.views)
        }
      })
      .catch(err => console.error('Failed to increment views:', err))
  }, [video.id])

  const copyToClipboard = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Watching "${video.title}" on DesiSexy!`)
    const url = encodeURIComponent(window.location.href)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }

  const formatDuration = (sec: number): string => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = Math.floor(sec % 60)
    const pad = (n: number) => String(n).padStart(2, '0')
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
    return `${m}:${pad(s)}`
  }

  const handleLike = () => {
    if (userVote === 'like') {
      setLikes(prev => prev - 1)
      setUserVote(null)
    } else if (userVote === 'dislike') {
      setLikes(prev => prev + 1)
      setDislikes(prev => prev - 1)
      setUserVote('like')
    } else {
      setLikes(prev => prev + 1)
      setUserVote('like')
    }
  }

  const handleDislike = () => {
    if (userVote === 'dislike') {
      setDislikes(prev => prev - 1)
      setUserVote(null)
    } else if (userVote === 'like') {
      setDislikes(prev => prev + 1)
      setLikes(prev => prev - 1)
      setUserVote('dislike')
    } else {
      setDislikes(prev => prev + 1)
      setUserVote('dislike')
    }
  }

  const ratingPercent = Math.round((likes / (likes + dislikes)) * 100) || 100

  return (
    <div className="w-full">
      {/* Conditionally render player above the main columns if in Theater Mode */}
      {isTheaterMode && (
        <div className="w-full bg-[#000] border-b border-white/5 py-4 mb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="aspect-video w-full bg-black overflow-hidden rounded-xl border border-white/5">
              <CustomPlayer 
                url={video.url}
                format={video.format}
                thumbnail={video.thumbnail}
                isTheaterMode={isTheaterMode}
                onTheaterModeToggle={() => setIsTheaterMode(!isTheaterMode)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Column: Player (if not theater) & Details */}
        <div className="lg:col-span-2 space-y-6">
          {!isTheaterMode && (
            <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 aspect-video">
              <CustomPlayer 
                url={video.url}
                format={video.format}
                thumbnail={video.thumbnail}
                isTheaterMode={isTheaterMode}
                onTheaterModeToggle={() => setIsTheaterMode(!isTheaterMode)}
              />
            </div>
          )}

          {/* Details Card */}
          <div className="bg-brand-card rounded-xl border border-white/5 p-4 sm:p-6 space-y-4">
            <span className="inline-block text-xs uppercase font-extrabold tracking-widest text-brand-accent">
              {categoryName}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight tracking-tight">
              {video.title}
            </h1>

            {/* Date, Actions row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-b border-white/5 py-4 text-xs text-gray-400 font-semibold">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {new Date(video.createdAt).toLocaleDateString()}</span>
                
                {/* Rating Meter */}
                <div className="flex items-center space-x-2">
                  <span className="flex items-center text-brand-accent font-extrabold">
                    <ThumbsUp className="w-3.5 h-3.5 mr-1 fill-brand-accent" /> {ratingPercent}%
                  </span>
                  <div className="w-20 h-1.5 bg-neutral-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-brand-accent" style={{ width: `${ratingPercent}%` }} />
                    <div className="h-full bg-neutral-600 flex-1" />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                {/* Vote Buttons */}
                <button 
                  onClick={handleLike}
                  className={`px-3 py-1.5 rounded-lg border transition flex items-center space-x-1 cursor-pointer ${
                    userVote === 'like' 
                      ? 'bg-brand-accent/20 border-brand-accent text-white' 
                      : 'bg-white/5 border-white/5 hover:border-brand-accent/40 text-gray-400 hover:text-white'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{likes}</span>
                </button>

                <button 
                  onClick={handleDislike}
                  className={`px-3 py-1.5 rounded-lg border transition flex items-center space-x-1 cursor-pointer ${
                    userVote === 'dislike' 
                      ? 'bg-red-500/20 border-red-500 text-white' 
                      : 'bg-white/5 border-white/5 hover:border-red-500/40 text-gray-400 hover:text-white'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>{dislikes}</span>
                </button>

                {/* Favorite Toggle */}
                <button 
                  onClick={() => toggleFavorite(video.id)}
                  className={`px-3 py-1.5 rounded-lg border transition flex items-center space-x-1.5 cursor-pointer ${
                    isFavorited 
                      ? 'bg-brand-accent/25 border-brand-accent text-brand-accent' 
                      : 'bg-white/5 border-white/5 hover:border-brand-accent/40 text-gray-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-brand-accent' : ''}`} />
                  <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
                </button>

                {/* Share buttons group */}
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={shareOnTwitter}
                    className="p-2 bg-white/5 border border-white/5 hover:border-brand-accent/40 rounded-lg hover:text-white transition cursor-pointer flex items-center justify-center"
                    title="Share on X"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </button>
                  <button 
                    onClick={shareOnFacebook}
                    className="p-2 bg-white/5 border border-white/5 hover:border-brand-accent/40 rounded-lg hover:text-white transition cursor-pointer flex items-center justify-center"
                    title="Share on Facebook"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </button>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 bg-white/5 border border-white/5 hover:border-brand-accent/40 rounded-lg hover:text-white transition cursor-pointer flex items-center justify-center"
                    title="Copy Link"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-brand-accent" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Description</h3>
              <p className="text-sm text-gray-300 leading-relaxed font-semibold">
                {video.description || 'No description provided for this video.'}
              </p>
            </div>

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {video.tags.map(tag => (
                    <Link 
                      key={tag} 
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="px-2.5 py-1 bg-neutral-900 hover:bg-brand-accent hover:text-white border border-white/5 rounded-lg text-xs font-bold text-gray-400 transition"
                    >
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-brand-accent" /> {tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column: Related Videos */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest border-l-4 border-brand-accent pl-2.5">
            Related Videos
          </h2>

          {relatedVideos.length === 0 ? (
            <p className="text-xs text-gray-600 font-semibold p-4 text-center bg-brand-card rounded-xl border border-white/5">
              No related videos in this category.
            </p>
          ) : (
            <div className="flex flex-col space-y-3">
              {relatedVideos.map(rel => (
                <div 
                  key={rel.id} 
                  className="flex bg-brand-card border border-white/5 rounded-xl overflow-hidden hover:border-brand-accent/30 transition group"
                >
                  {/* Compact Thumbnail */}
                  <Link href={`/video/${rel.slug}`} className="relative w-32 aspect-video shrink-0 bg-black/40 overflow-hidden">
                    <img 
                      src={rel.thumbnail} 
                      alt={rel.title} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-[9px] font-bold text-white px-1.5 py-0.2 rounded font-mono">
                      {formatDuration(rel.duration)}
                    </span>
                  </Link>

                  {/* Meta Details */}
                  <div className="p-2 flex flex-col justify-between overflow-hidden">
                    <Link href={`/video/${rel.slug}`}>
                      <h4 className="text-xs font-bold text-white group-hover:text-brand-accent transition-colors line-clamp-2 leading-tight">
                        {rel.title}
                      </h4>
                    </Link>
                    <div className="flex items-center text-[10px] text-gray-500 font-bold mt-1">
                      <span>{rel.views.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
