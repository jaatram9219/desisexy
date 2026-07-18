'use client'

import React from 'react'
import { Grid, Flame } from 'lucide-react'

interface SearchFiltersProps {
  query: string
  catSlug: string
  sortBy: string
  categories: Array<{ id: string; name: string; slug: string }>
}

export default function SearchFilters({ query, catSlug, sortBy, categories }: SearchFiltersProps) {
  const handleCategoryChange = (val: string) => {
    const url = new URL(window.location.href)
    if (val) {
      url.searchParams.set('category', val)
    } else {
      url.searchParams.delete('category')
    }
    window.location.href = url.pathname + url.search
  }

  const handleSortChange = (val: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('sort', val)
    window.location.href = url.pathname + url.search
  }

  return (
    <div className="flex flex-wrap gap-2.5 items-center">
      {/* Category Filter */}
      <div className="flex items-center space-x-1.5 bg-brand-card px-3 py-1.5 rounded-full border border-white/5 text-xs text-gray-400 font-bold">
        <Grid className="w-3.5 h-3.5" />
        <span>Category:</span>
        <select 
          defaultValue={catSlug} 
          onChange={(e) => handleCategoryChange(e.target.value)}
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
          onChange={(e) => handleSortChange(e.target.value)}
          className="bg-transparent text-white border-none outline-none font-bold cursor-pointer"
        >
          <option value="latest" className="bg-black text-white">Latest Uploads</option>
          <option value="popular" className="bg-black text-white">Most Viewed</option>
        </select>
      </div>
    </div>
  )
}
