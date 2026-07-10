'use client'

import React, { useState, useEffect } from 'react'

interface AdCampaign {
  id: string
  name: string
  placement: string
  code: string
  isHtml: boolean
  imageUrl?: string | null
  targetUrl?: string | null
}

interface AdBannerProps {
  placement: 'HEADER' | 'FOOTER' | 'CONTENT' | 'PAUSE'
  className?: string
}

export default function AdBanner({ placement, className = '' }: AdBannerProps) {
  const [ad, setAd] = useState<AdCampaign | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadAd() {
      try {
        const res = await fetch(`/api/ads?placement=${placement}`)
        if (!res.ok) throw new Error('Ad API failed')
        const data = await res.json()
        if (active && data && data.length > 0) {
          // Select a random active campaign from the list
          const selectedAd = data[Math.floor(Math.random() * data.length)]
          setAd(selectedAd)
          
          // Log impression asynchronously
          fetch(`/api/ads/track?id=${selectedAd.id}&type=impression`, { method: 'POST' }).catch(() => {})
        }
      } catch (err) {
        console.error(`Failed to load ad banner for ${placement}:`, err)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAd()

    return () => {
      active = false
    }
  }, [placement])

  const handleAdClick = () => {
    if (ad) {
      fetch(`/api/ads/track?id=${ad.id}&type=click`, { method: 'POST' }).catch(() => {})
    }
  }

  if (loading || !ad) {
    return null
  }

  return (
    <div className={`w-full overflow-hidden my-4 transition-all duration-300 ${className}`} onClick={handleAdClick}>
      {ad.isHtml ? (
        <div dangerouslySetInnerHTML={{ __html: ad.code }} />
      ) : (
        <a 
          href={ad.targetUrl || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full overflow-hidden rounded-lg border border-white/5 hover:border-brand-primary/30 transition-all"
        >
          {ad.imageUrl && (
            <img 
              src={ad.imageUrl} 
              alt={ad.name} 
              className="w-full h-auto object-cover max-h-48 sm:max-h-60"
            />
          )}
        </a>
      )}
    </div>
  )
}
