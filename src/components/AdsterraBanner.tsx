'use client'

import React, { useEffect, useRef } from 'react'

interface AdsterraBannerProps {
  idKey: string
  format: string
  height: number
  width: number
}

export default function AdsterraBanner({ idKey, format, height, width }: AdsterraBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Lazy-load banner scripts after 800ms to prioritize site layout and media assets loading speed
    const loadTimer = setTimeout(() => {
      const banner = bannerRef.current
      if (!banner) return

      // Clear existing contents to prevent duplicated banners on re-renders
      banner.innerHTML = ''

      // Define option configuration unique to this key
      const atOptionsName = `atOptions_${idKey}`
      ;(window as any)[atOptionsName] = {
        key: idKey,
        format: format,
        height: height,
        width: width,
        params: {}
      }

      // Container with matching dimensions to prevent layout shifts
      const container = document.createElement('div')
      container.style.width = `${width}px`
      container.style.height = `${height}px`
      container.style.margin = '0 auto'
      container.style.display = 'flex'
      container.style.alignItems = 'center'
      container.style.justifyContent = 'center'
      container.id = `adsterra-container-${idKey}`

      // Load Adsterra invoke.js script
      const script = document.createElement('script')
      script.src = `https://www.highperformanceformat.com/${idKey}/invoke.js`
      script.async = true

      // Map global atOptions before executing the script
      const configScript = document.createElement('script')
      configScript.innerHTML = `window.atOptions = window.${atOptionsName};`

      banner.appendChild(container)
      banner.appendChild(configScript)
      banner.appendChild(script)
    }, 800)

    return () => clearTimeout(loadTimer)
  }, [idKey, format, height, width])

  return (
    <div 
      ref={bannerRef} 
      className="w-full flex items-center justify-center overflow-hidden my-4 py-2 border-t border-b border-white/5 bg-black/20"
      style={{ minHeight: `${height}px` }}
    />
  )
}
