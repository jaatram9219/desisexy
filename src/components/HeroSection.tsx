'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { Play, Flame, ChevronLeft, ChevronRight, Award, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import VideoCard from './VideoCard'
import { Video, Category } from '@/lib/dbService'
import { getThumbnailUrl } from '@/lib/imageProxy'

interface HeroSectionProps {
  featuredVideo: Video | null
  trendingVideos: Video[]
  categories: Category[]
}

export default function HeroSection({ featuredVideo, trendingVideos, categories }: HeroSectionProps) {
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current
      const scrollAmount = clientWidth * 0.75
      carouselRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="w-full flex flex-col space-y-8 pb-8">
      {/* Featured Video Jumbo Banner */}
      {featuredVideo && (
        <div className="relative w-full rounded-3xl overflow-hidden aspect-[21/9] min-h-[300px] border border-white/5 shadow-2xl group">
          {/* Background Poster Overlay */}
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${getThumbnailUrl(featuredVideo.thumbnail)})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/30 to-transparent" />

          {/* Banner Info */}
          <div className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-end max-w-2xl space-y-3 sm:space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-brand-accent text-white w-max">
              <Award className="w-3.5 h-3.5 mr-1" /> Featured
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {featuredVideo.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 leading-relaxed drop-shadow">
              {featuredVideo.description}
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <Link
                href={`/video/${featuredVideo.slug}`}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-brand-accent to-red-600 hover:scale-105 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition shadow-lg shadow-brand-accent/20 cursor-pointer"
              >
                <Play className="w-4.5 h-4.5 fill-white" />
                <span>Watch Now</span>
              </Link>
              <Link
                href={`/video/${featuredVideo.slug}`}
                className="flex items-center space-x-2 px-5 py-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition cursor-pointer"
              >
                <Info className="w-4 h-4" />
                <span>Details</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Popular Categories Chips */}
      <div className="w-full">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
          Popular Categories
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/category/${cat.slug}`}
                className="px-4 py-2.5 rounded-2xl bg-brand-card hover:bg-neutral-900 border border-white/5 hover:border-brand-accent/30 flex items-center space-x-2 text-xs font-bold text-gray-300 hover:text-white transition shadow-sm"
              >
                {cat.thumbnail && (
                  <img src={getThumbnailUrl(cat.thumbnail)} alt={cat.name} className="w-5 h-5 rounded-full object-cover border border-white/10" />
                )}
                <span>{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trending Carousel Slider */}
      {trendingVideos.length > 0 && (
        <div className="w-full flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center">
              <Flame className="w-4 h-4 mr-1.5 text-brand-accent animate-bounce" /> Trending Right Now
            </h2>
            <div className="flex space-x-1.5">
              <button
                onClick={() => scrollCarousel('left')}
                className="p-2 bg-brand-card hover:bg-neutral-800 rounded-full border border-white/5 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="p-2 bg-brand-card hover:bg-neutral-800 rounded-full border border-white/5 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel Viewport */}
          <div
            ref={carouselRef}
            className="w-full flex space-x-4 overflow-x-auto scrollbar-none scroll-smooth pb-4 px-1"
          >
            {trendingVideos.map((video) => (
              <div key={video.id} className="w-[280px] sm:w-[320px] shrink-0">
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
