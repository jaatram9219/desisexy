'use client'

import React from 'react'
import Link from 'next/link'
import { Play, Eye, Calendar, Sparkles, ThumbsUp } from 'lucide-react'
import { motion } from 'framer-motion'

export interface VideoCardProps {
  video: {
    id: string
    title: string
    slug: string
    description?: string | null
    url: string
    duration: number
    format: string
    source: string
    thumbnail: string
    views: number
    createdAt: string | Date
    category?: {
      name: string
      slug: string
    } | null
  }
}

// Utility to format duration (seconds -> hh:mm:ss or mm:ss)
const formatDuration = (sec: number): string => {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)

  const pad = (num: number) => String(num).padStart(2, '0')

  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`
  }
  return `${m}:${pad(s)}`
}

// Utility to format view count (e.g., 1.2M, 94.5K)
const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return String(views)
}

// Utility to calculate relative date
const getRelativeDate = (dateVal: string | Date): string => {
  const now = new Date()
  const past = new Date(dateVal)
  const diffMs = now.getTime() - past.getTime()
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffHrs / 24)

  if (diffHrs < 1) {
    return 'Just now'
  }
  if (diffHrs < 24) {
    return `${diffHrs}h ago`
  }
  if (diffDays === 1) {
    return 'Yesterday'
  }
  if (diffDays < 30) {
    return `${diffDays} days ago`
  }
  
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
}

export default function VideoCard({ video }: VideoCardProps) {
  const { title, slug, thumbnail, duration, views, createdAt, category } = video
  const [isHovered, setIsHovered] = React.useState(false)

  // Calculate a deterministic mock rating percentage
  const rating = 92 + (views % 8)

  // Parse Eporner Video ID to fetch the live hover preview stream
  let epornerId = ''
  if (video.url.includes('eporner.com')) {
    const match = video.url.match(/(?:embed\/|video-)([a-zA-Z0-9]+)/)
    if (match) epornerId = match[1]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative flex flex-col w-full bg-brand-card rounded-xl overflow-hidden border border-white/5 hover:border-brand-accent/50 hover:shadow-[0_0_15px_rgba(255,61,0,0.15)] transition-all duration-300"
    >
      <Link 
        href={`/video/${slug}`} 
        className="block relative aspect-video w-full overflow-hidden bg-black/40"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hover preview video clip */}
        {isHovered && epornerId ? (
          <video
            src={`https://preview.eporner.com/${epornerId}.mp4`}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-10"
            onError={(e) => {
              // If preview fails (e.g. adblocker / no preview file), hide it
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : null}

        {/* Thumbnail Image */}
        <img
          src={thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Play Button Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 z-20">
          <div className="w-10 h-10 rounded-full bg-brand-accent text-white flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-brand-accent/45">
            <Play className="w-4 h-4 fill-white ml-0.5" />
          </div>
        </div>

        {/* Badges Overlays */}
        {/* HD Badge (Left) */}
        <div className="absolute top-2 left-2 bg-brand-accent text-[9px] font-black uppercase text-white px-1.5 py-0.5 rounded tracking-wider flex items-center gap-0.5 shadow z-20">
          <Sparkles className="w-2.5 h-2.5" /> HD
        </div>

        {/* Duration Badge (Right) */}
        <div className="absolute bottom-2 right-2 bg-black/85 text-[9px] font-bold text-white px-1.5 py-0.5 rounded font-mono tracking-wider z-20">
          {formatDuration(duration)}
        </div>
      </Link>

      {/* Card Info Content */}
      <div className="p-2.5 flex flex-col flex-1 bg-[#121212]">
        {/* Video Title */}
        <Link href={`/video/${slug}`} className="block flex-1">
          <h3 className="text-xs sm:text-xs font-extrabold text-gray-200 group-hover:text-brand-accent transition-colors line-clamp-2 leading-snug tracking-tight">
            {title}
          </h3>
        </Link>

        {/* Metadata: Views, Ratings & Date */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-extrabold mt-2.5 pt-2 border-t border-white/5">
          <div className="flex items-center space-x-2">
            <span className="flex items-center">
              {formatViews(views)} views
            </span>
            <span className="text-gray-700 font-normal">|</span>
            <span className="flex items-center text-brand-accent text-[9px]">
              <ThumbsUp className="w-2.5 h-2.5 mr-0.5 fill-brand-accent" /> {rating}%
            </span>
          </div>
          <span className="text-gray-600 font-semibold">{getRelativeDate(createdAt)}</span>
        </div>
      </div>
    </motion.div>
  )
}
