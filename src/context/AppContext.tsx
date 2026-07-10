'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface User {
  id: string
  email: string
  name: string
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'USER'
}

interface AppContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  favorites: string[] // video IDs
  toggleFavorite: (videoId: string) => void
  watchHistory: string[] // video IDs
  addToHistory: (videoId: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
  isTheaterMode: boolean
  setIsTheaterMode: (mode: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [watchHistory, setWatchHistory] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isTheaterMode, setIsTheaterMode] = useState(false)

  // Hydrate states from localStorage
  useEffect(() => {
    // No auto-login — visitors are anonymous by default

    const storedFavs = localStorage.getItem('apex_favorites')
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs))
    }

    const storedHistory = localStorage.getItem('apex_history')
    if (storedHistory) {
      setWatchHistory(JSON.parse(storedHistory))
    }

    const storedTheme = localStorage.getItem('apex_theme') as 'dark' | 'light'
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [])

  const toggleFavorite = (videoId: string) => {
    setFavorites(prev => {
      const next = prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
      localStorage.setItem('apex_favorites', JSON.stringify(next))
      return next
    })
  }

  const addToHistory = (videoId: string) => {
    setWatchHistory(prev => {
      // Filter out existing to put it at top (most recent)
      const next = [videoId, ...prev.filter(id => id !== videoId)].slice(0, 50)
      localStorage.setItem('apex_history', JSON.stringify(next))
      return next
    })
  }

  const handleSetTheme = (nextTheme: 'dark' | 'light') => {
    setTheme(nextTheme)
    localStorage.setItem('apex_theme', nextTheme)
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: (user) => {
          setCurrentUser(user)
          if (user) {
            localStorage.setItem('apex_user', JSON.stringify(user))
          } else {
            localStorage.removeItem('apex_user')
          }
        },
        favorites,
        toggleFavorite,
        watchHistory,
        addToHistory,
        searchQuery,
        setSearchQuery,
        theme,
        setTheme: handleSetTheme,
        isTheaterMode,
        setIsTheaterMode
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
