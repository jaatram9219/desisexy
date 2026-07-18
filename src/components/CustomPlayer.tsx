'use client'

import React, { useRef, useState, useEffect } from 'react'
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  Settings, RotateCcw, Tv, Volume, Eye, Sparkles, X, Activity
} from 'lucide-react'
import Hls from 'hls.js'
import { motion, AnimatePresence } from 'framer-motion'

interface CustomPlayerProps {
  url: string
  format: string // 'mp4' | 'm3u8' | 'webm' | 'embed'
  thumbnail: string
  onPauseChange?: (paused: boolean) => void
  isTheaterMode: boolean
  onTheaterModeToggle: () => void
}

export default function CustomPlayer({ 
  url, 
  format, 
  thumbnail,
  onPauseChange,
  isTheaterMode,
  onTheaterModeToggle
}: CustomPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1) // 0 to 1
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [quality, setQuality] = useState('Auto')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  
  // Pause Ad Overlay States
  const [showPauseAd, setShowPauseAd] = useState(false)
  const [pauseAdData, setPauseAdData] = useState<{ id: string; name: string; code: string } | null>(null)
  const [countdown, setCountdown] = useState(5)
  const [canCloseAd, setCanCloseAd] = useState(false)

  // Fetch pause advertisement
  useEffect(() => {
    async function loadPauseAd() {
      try {
        const res = await fetch('/api/ads?placement=PAUSE')
        const data = await res.json()
        if (data && data.length > 0) {
          setPauseAdData(data[0])
        }
      } catch (err) {
        console.error('Failed to load pause ad:', err)
      }
    }
    loadPauseAd()
  }, [])

  // Setup HLS.js for .m3u8 streaming
  useEffect(() => {
    let hls: Hls | null = null
    const video = videoRef.current

    if (video && format === 'm3u8') {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        })
        hls.loadSource(url)
        hls.attachMedia(video)
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Ready
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url
      }
    } else if (video) {
      video.src = url
    }

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [url, format])

  // Countdown timer for Pause Ad
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showPauseAd && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (showPauseAd && countdown === 0) {
      setCanCloseAd(true)
    }
    return () => clearTimeout(timer)
  }, [showPauseAd, countdown])

  // Auto-hide controls when mouse is idle
  useEffect(() => {
    let hideTimer: NodeJS.Timeout
    const handleMouseMove = () => {
      setControlsVisible(true)
      clearTimeout(hideTimer)
      hideTimer = setTimeout(() => {
        if (isPlaying) {
          setControlsVisible(false)
        }
      }, 3000)
    }
    
    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
      }
      clearTimeout(hideTimer)
    }
  }, [isPlaying])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
      if (onPauseChange) onPauseChange(true)
      
      // Trigger Pause Ad
      if (pauseAdData) {
        setShowPauseAd(true)
        setCountdown(5)
        setCanCloseAd(false)
        // Log ad impression
        fetch(`/api/ads/track?id=${pauseAdData.id}&type=impression`, { method: 'POST' }).catch(() => {})
      }
    } else {
      // Smartlink Popunder click-interceptor for video play action
      const popunderKey = `popunder_triggered_play_${url}`
      if (typeof window !== 'undefined' && !sessionStorage.getItem(popunderKey)) {
        sessionStorage.setItem(popunderKey, 'true')
        const event = new CustomEvent('adsterra_player_play', { detail: { videoId: url } })
        window.dispatchEvent(event)
        return // Exit: do not play video on this click
      }

      video.play()
      setIsPlaying(false)
      setIsPlaying(true)
      if (onPauseChange) onPauseChange(false)
      
      // Hide Pause Ad
      setShowPauseAd(false)
    }
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return
    setCurrentTime(video.currentTime)
  }

  const handleLoadedMetadata = () => {
    const video = videoRef.current
    if (!video) return
    setDuration(video.duration || 0)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const newTime = parseFloat(e.target.value)
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const newVol = parseFloat(e.target.value)
    video.volume = newVol
    setVolume(newVol)
    setIsMuted(newVol === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    const nextMute = !isMuted
    video.muted = nextMute
    setIsMuted(nextMute)
  }

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = speed
    setPlaybackSpeed(speed)
    setShowSpeedMenu(false)
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true))
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false))
    }
  }

  // Format time (seconds -> mm:ss)
  const formatTime = (time: number): string => {
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  // Handle Pause Ad click
  const handleAdClick = () => {
    if (pauseAdData) {
      fetch(`/api/ads/track?id=${pauseAdData.id}&type=click`, { method: 'POST' }).catch(() => {})
    }
  }

  // Render iframe for embedded videos
  if (format === 'embed') {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-black">
        {/* Custom top bar: Crops out original iframe title bar and blocks click events */}
        <div 
          className="absolute top-0 left-0 right-0 h-[48px] bg-[#0c0c0c] z-30 flex items-center px-4 select-none pointer-events-auto border-b border-white/5"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <span className="text-[10px] font-black tracking-widest text-brand-primary uppercase">DESISEXY PLAYER</span>
        </div>

        {/* Bottom Logo Masking Overlay (hides Eporner hosted logo next to fullscreen icon) */}
        <div 
          className="absolute bottom-0 right-[45px] w-[120px] h-[36px] bg-[#0c0c0c] z-30 select-none pointer-events-auto"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        />

        <iframe
          src={url}
          title="Embedded Video Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-[calc(100%+48px)] -mt-[48px] border-none relative z-10"
        />
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black shadow-2xl group/player transition-all duration-300 ${
        isTheaterMode && !isFullscreen ? 'max-w-none aspect-[21/9]' : ''
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        poster={thumbnail}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* PAUSE OVERLAY ADVERTISEMENT */}
      <AnimatePresence>
        {showPauseAd && pauseAdData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 z-40"
          >
            <div className="relative max-w-sm w-full mx-auto" onClick={handleAdClick}>
              {/* Close Button / Countdown */}
              <div className="absolute -top-10 right-0 flex items-center space-x-2">
                {!canCloseAd && (
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase bg-black/80 px-2.5 py-1 rounded-full border border-white/10">
                    Close in {countdown}s
                  </span>
                )}
                <button
                  disabled={!canCloseAd}
                  onClick={() => setShowPauseAd(false)}
                  className={`p-2 rounded-full border transition-all ${
                    canCloseAd
                      ? 'bg-brand-primary border-brand-primary text-black hover:bg-amber-600 cursor-pointer'
                      : 'bg-black/50 border-white/10 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Render Ad Content */}
              <div dangerouslySetInnerHTML={{ __html: pauseAdData.code }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Overlays */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col space-y-3 z-30 transition-opacity duration-300 ${
          controlsVisible || showPauseAd ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Timeline Slider */}
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 rounded-full bg-white/20 appearance-none outline-none cursor-pointer accent-brand-primary focus:ring-1 focus:ring-brand-primary"
          />
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-white">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="hover:text-brand-primary transition cursor-pointer">
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-2 group/volume">
              <button onClick={toggleMute} className="hover:text-brand-primary transition cursor-pointer">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 rounded-full bg-white/20 appearance-none outline-none cursor-pointer accent-brand-primary transition-all duration-300"
              />
            </div>

            {/* Time Stamp */}
            <span className="text-xs text-gray-300 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-white relative">
            {/* Speed Control */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu)
                  setShowQualityMenu(false)
                }}
                className="text-xs font-black uppercase hover:text-brand-primary transition tracking-widest bg-white/5 border border-white/10 px-2.5 py-1 rounded cursor-pointer"
              >
                Speed ({playbackSpeed}x)
              </button>
              
              <AnimatePresence>
                {showSpeedMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-9 right-0 bg-[#161616] border border-white/10 rounded-lg p-1.5 shadow-2xl flex flex-col space-y-1 w-24"
                  >
                    {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`text-left px-2 py-1.5 rounded hover:bg-brand-primary hover:text-black text-xs font-bold transition ${
                          playbackSpeed === speed ? 'text-brand-primary' : 'text-gray-300'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quality Selector */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu)
                  setShowSpeedMenu(false)
                }}
                className="text-xs font-black uppercase hover:text-brand-primary transition tracking-widest bg-white/5 border border-white/10 px-2.5 py-1 rounded cursor-pointer"
              >
                Quality ({quality})
              </button>

              <AnimatePresence>
                {showQualityMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-9 right-0 bg-[#161616] border border-white/10 rounded-lg p-1.5 shadow-2xl flex flex-col space-y-1 w-24"
                  >
                    {['Auto', '1080p', '720p', '480p'].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setQuality(q)
                          setShowQualityMenu(false)
                        }}
                        className={`text-left px-2 py-1.5 rounded hover:bg-brand-primary hover:text-black text-xs font-bold transition ${
                          quality === q ? 'text-brand-primary' : 'text-gray-300'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theater Mode */}
            <button 
              onClick={onTheaterModeToggle}
              className={`hover:text-brand-primary transition cursor-pointer ${isTheaterMode ? 'text-brand-primary' : 'text-white'}`}
              title="Theater Mode"
            >
              <Tv className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="hover:text-brand-primary transition cursor-pointer">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
