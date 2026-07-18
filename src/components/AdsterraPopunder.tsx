'use client'

import { useEffect } from 'react'

export default function AdsterraPopunder() {
  useEffect(() => {
    const smartLink = 'https://www.effectivecpmnetwork.com/yk113u61zs?key=c502b3fd6619d7f7325bf902b53077b2'
    
    const triggerPopunder = () => {
      try {
        const win = window.open(smartLink, '_blank')
        if (win) {
          window.focus()
        }
      } catch (e) {
        console.error("Popup blocked:", e)
      }
    }

    // 1. Global Page Click Interceptor (First interactive click opens the popunder)
    let hasClickedPage = false
    const handlePageClick = (e: MouseEvent) => {
      if (hasClickedPage) return
      
      const target = e.target as HTMLElement
      const isInteractive = target.closest('a, button, select, input, textarea, [role="button"]')
      
      if (isInteractive) {
        hasClickedPage = true
        triggerPopunder()
        sessionStorage.setItem('popunder_triggered_page', 'true')
        document.removeEventListener('click', handlePageClick, true)
      }
    }

    if (!sessionStorage.getItem('popunder_triggered_page')) {
      document.addEventListener('click', handlePageClick, true)
    }

    // 2. Global Video Card Link Interceptor (First click opens popunder, second navigates)
    const handleVideoCardClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const videoLink = target.closest('a[href^="/video/"]') as HTMLAnchorElement
      
      if (videoLink) {
        const href = videoLink.getAttribute('href') || ''
        const key = `popunder_triggered_video_${href}`
        
        if (!sessionStorage.getItem(key)) {
          e.preventDefault()
          e.stopPropagation()
          sessionStorage.setItem(key, 'true')
          triggerPopunder()
        }
      }
    }
    document.addEventListener('click', handleVideoCardClick, true)

    // 3. Player Play Blocker Handler
    const handlePlayerPlayClick = (e: CustomEvent) => {
      triggerPopunder()
    }
    window.addEventListener('adsterra_player_play', handlePlayerPlayClick as any)

    return () => {
      document.removeEventListener('click', handlePageClick, true)
      document.removeEventListener('click', handleVideoCardClick, true)
      window.removeEventListener('adsterra_player_play', handlePlayerPlayClick as any)
    }
  }, [])

  return null
}
