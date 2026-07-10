'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Search, Heart, History,
  LogOut, ChevronDown, Flame, Compass, 
  Clock, Award, Sun, Moon, Film, Sparkles, Menu, X
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const router = useRouter()
  const { 
    currentUser, setCurrentUser, favorites, watchHistory, 
    searchQuery, setSearchQuery, theme, setTheme 
  } = useApp()

  const [inputFocused, setInputFocused] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [headerAd, setHeaderAd] = useState<{ id: string; name: string; code: string } | null>(null)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const trendingSearches = ['lofi', 'sci-fi', 'animation', 'offroad', 'tears of steel']

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setInputFocused(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch Header ad campaign
  useEffect(() => {
    async function fetchAd() {
      try {
        const res = await fetch('/api/ads?placement=HEADER')
        const data = await res.json()
        if (data && data.length > 0) {
          setHeaderAd(data[0])
          // Log impression
          fetch(`/api/ads/track?id=${data[0].id}&type=impression`, { method: 'POST' })
        }
      } catch (err) {
        console.error('Failed to load header ad:', err)
      }
    }
    fetchAd()
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setInputFocused(false)
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSuggestionClick = (term: string) => {
    setSearchQuery(term)
    setInputFocused(false)
    router.push(`/search?q=${encodeURIComponent(term)}`)
  }



  return (
    <header className="w-full z-50 flex flex-col border-b border-white/5 bg-[#0B0B0B]/90 backdrop-blur-md sticky top-0">
      {/* Top Banner (Header Ad) */}
      {headerAd && (
        <div className="w-full bg-[#121212] px-4 py-2 border-b border-white/5">
          <div 
            className="max-w-7xl mx-auto cursor-pointer"
            onClick={() => fetch(`/api/ads/track?id=${headerAd.id}&type=click`, { method: 'POST' })}
            dangerouslySetInnerHTML={{ __html: headerAd.code }}
          />
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-accent to-red-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
            <Film className="w-5 h-5 text-white font-extrabold" />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-brand-accent transition-colors">
            DESI<span className="text-brand-accent">SEXY</span>
          </span>
        </Link>

        {/* Center: Large Search Bar */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl relative">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setInputFocused(true)}
                placeholder="Search videos, categories, tags..."
                className="w-full h-11 pl-11 pr-4 bg-brand-card hover:bg-neutral-900 focus:bg-black rounded-full border border-white/10 focus:border-brand-accent outline-none text-sm text-white placeholder-gray-500 transition-all focus:ring-1 focus:ring-brand-accent/30"
              />
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
            </div>
          </form>

          {/* Autocomplete & Suggestions Drawer */}
          <AnimatePresence>
            {inputFocused && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-13 left-0 right-0 w-full bg-[#161616] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 glass-effect"
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                    <Flame className="w-3.5 h-3.5 mr-1 text-brand-accent" /> Trending Searches
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trendingSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSuggestionClick(term)}
                        className="px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-brand-accent hover:text-white border border-white/5 transition text-xs font-semibold text-gray-300"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {searchQuery.trim().length > 0 && (
                  <div className="border-t border-white/5 pt-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-primary" /> Suggestions
                    </h4>
                    <button 
                      onClick={() => handleSuggestionClick(searchQuery)}
                      className="w-full text-left py-2 px-3 rounded-lg hover:bg-white/5 text-sm font-semibold flex items-center justify-between text-brand-primary"
                    >
                      <span>Search for "{searchQuery}"</span>
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Actions (Theme, User, Menu) */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Light/Dark mode placeholder */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-full bg-brand-card hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Moon className="w-5 h-5 text-brand-primary" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* User profile with dropdown */}
          {currentUser ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-1.5 p-1.5 pr-2.5 sm:pr-3 bg-brand-card hover:bg-neutral-800 rounded-full border border-white/5 hover:border-brand-primary/30 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-black font-extrabold text-sm uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left shrink-0">
                  <p className="text-xs font-bold text-white line-clamp-1 leading-3">{currentUser.name}</p>
                  <span className="text-[9px] uppercase tracking-wider text-brand-primary font-black">{currentUser.role}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-3 w-64 bg-[#161616] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 glass-effect"
                  >
                    <div className="p-3 border-b border-white/5">
                      <p className="text-sm font-bold text-white">{currentUser.name}</p>
                      <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                        Role: {currentUser.role}
                      </div>
                    </div>

                    <div className="py-1">
                      
                      <Link
                        href="/favorites"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-3 py-2 text-sm font-semibold rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition"
                      >
                        <Heart className="w-4 h-4 mr-2.5 text-red-500" /> Favorites
                        <span className="ml-auto text-xs px-2 py-0.5 bg-neutral-800 rounded-full font-bold">{favorites.length}</span>
                      </Link>

                      <Link
                        href="/history"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-3 py-2 text-sm font-semibold rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition"
                      >
                        <History className="w-4 h-4 mr-2.5 text-blue-500" /> History
                        <span className="ml-auto text-xs px-2 py-0.5 bg-neutral-800 rounded-full font-bold">{watchHistory.length}</span>
                      </Link>
                    </div>

                    <div className="border-t border-white/5 pt-1 mt-1">
                      <button
                        onClick={() => {
                          setCurrentUser(null)
                          setProfileDropdownOpen(false)
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm font-semibold rounded-lg text-brand-accent hover:bg-brand-accent/10 transition text-left"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" /> Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 rounded-lg bg-brand-card hover:bg-neutral-800 text-gray-400 hover:text-white"
          >
            {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Header (Hidden on Mobile) */}
      <nav className="hidden md:block w-full border-t border-white/5 bg-[#0e0e0e]/50 py-3">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex space-x-6">
            <Link href="/" className="flex items-center text-sm font-bold text-gray-300 hover:text-brand-accent transition">
              <Compass className="w-4 h-4 mr-1.5" /> Home
            </Link>
            <Link href="/trending" className="flex items-center text-sm font-bold text-gray-300 hover:text-brand-accent transition">
              <Flame className="w-4 h-4 mr-1.5 text-brand-accent animate-pulse" /> Trending
            </Link>
            <Link href="/categories" className="flex items-center text-sm font-bold text-gray-300 hover:text-brand-accent transition">
              <Award className="w-4 h-4 mr-1.5" /> Categories
            </Link>
            <Link href="/latest" className="flex items-center text-sm font-bold text-gray-300 hover:text-brand-accent transition">
              <Clock className="w-4 h-4 mr-1.5" /> Latest
            </Link>
            <Link href="/popular" className="flex items-center text-sm font-bold text-gray-300 hover:text-brand-accent transition">
              <Sparkles className="w-4 h-4 mr-1.5 text-brand-accent" /> Popular
            </Link>
          </div>

          <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-brand-card px-3 py-1 rounded-full border border-white/5">
            <Play className="w-3 h-3 mr-1.5 text-brand-accent" /> desisexy.in - HD Video CMS
          </div>
        </div>
      </nav>

      {/* Horizontal Hot Tags bar (eporner-style, hidden on mobile) */}
      <div className="hidden md:block w-full border-t border-white/5 bg-[#080808] py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-8 flex items-center space-x-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-brand-accent pr-2 border-r border-white/5 mr-2 flex items-center shrink-0">
            <Flame className="w-3.5 h-3.5 mr-1" /> Hot Tags:
          </span>
          {[
            { name: 'Indian', q: 'Indian' },
            { name: 'Hindi Audio', q: 'Hindi' },
            { name: 'Bhabhi', q: 'Bhabhi' },
            { name: 'Homemade', q: 'Homemade' },
            { name: 'College Girls', q: 'College' },
            { name: 'Romance', q: 'Romance' },
            { name: 'Teens', q: 'Teens' },
            { name: 'Viral Clips', q: 'Viral' },
            { name: 'Hardcore', q: 'Hardcore' },
            { name: 'Full HD', q: 'HD' }
          ].map((tag) => (
            <Link 
              key={tag.name} 
              href={`/search?q=${tag.q}`}
              className="px-2.5 py-0.5 bg-white/5 hover:bg-neutral-900 border border-white/5 hover:border-brand-accent/40 rounded text-[10px] font-extrabold text-gray-400 hover:text-brand-accent transition shrink-0 uppercase tracking-wide"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[#0B0B0B] p-4 flex flex-col space-y-4"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full h-10 pl-10 pr-4 bg-brand-card rounded-full border border-white/10 outline-none text-sm text-white placeholder-gray-500"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
            </form>

            {/* Mobile Links */}
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center py-1.5 text-sm font-bold text-gray-300 hover:text-brand-primary transition"
              >
                <Compass className="w-4 h-4 mr-2" /> Home
              </Link>
              <Link 
                href="/trending" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center py-1.5 text-sm font-bold text-gray-300 hover:text-brand-primary transition"
              >
                <Flame className="w-4 h-4 mr-2 text-brand-accent" /> Trending
              </Link>
              <Link 
                href="/categories" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center py-1.5 text-sm font-bold text-gray-300 hover:text-brand-primary transition"
              >
                <Award className="w-4 h-4 mr-2" /> Categories
              </Link>
              <Link 
                href="/latest" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center py-1.5 text-sm font-bold text-gray-300 hover:text-brand-primary transition"
              >
                <Clock className="w-4 h-4 mr-2" /> Latest
              </Link>
              <Link 
                href="/popular" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center py-1.5 text-sm font-bold text-gray-300 hover:text-brand-primary transition"
              >
                <Sparkles className="w-4 h-4 mr-2 text-brand-primary" /> Popular
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
