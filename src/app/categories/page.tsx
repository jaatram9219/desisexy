import React from 'react'
import { dbService } from '@/lib/dbService'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Award, Film } from 'lucide-react'

export const revalidate = 0

export default async function CategoriesPage() {
  const categories = await dbService.getCategories()
  const videos = await dbService.getVideos()

  // Calculate video counts per category
  const categoriesWithCount = categories.map(cat => {
    const count = videos.filter(v => v.categoryId === cat.id).length
    return { ...cat, videoCount: count }
  })

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white border-l-4 border-brand-primary pl-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-primary" />
          Browse Categories
        </h1>

        {categoriesWithCount.length === 0 ? (
          <div className="w-full text-center py-20 bg-brand-card rounded-3xl border border-white/5 p-8">
            <p className="text-gray-400 font-bold">No categories configured yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoriesWithCount.map(cat => (
              <Link 
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative flex flex-col aspect-video bg-brand-card rounded-2xl overflow-hidden border border-white/5 hover:border-brand-primary/40 hover:shadow-[0_0_20px_rgba(255,176,0,0.15)] transition-all duration-300"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                  style={{ backgroundImage: `url(${cat.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60'})` }}
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <span className="text-[10px] uppercase font-black tracking-widest text-brand-primary mb-1 flex items-center gap-1">
                    <Film className="w-3.5 h-3.5" /> {cat.videoCount} Videos
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-primary transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-1.5 leading-relaxed font-semibold">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
