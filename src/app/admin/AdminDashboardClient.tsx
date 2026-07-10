'use client'

import React, { useState, useEffect } from 'react'
import { 
  Shield, Film, Grid, Sparkles, Settings, Eye, 
  Trash2, Plus, Edit, Link as LinkIcon, AlertTriangle, 
  TrendingUp, DollarSign, Users, Award, Play, Check, 
  HelpCircle, RefreshCw, Layers
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { motion } from 'framer-motion'

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  thumbnail?: string | null
}

interface Video {
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
  isFeatured: boolean
  categoryId: string
  tags: string[]
  seoTitle?: string | null
  seoDescription?: string | null
}

interface AdCampaign {
  id: string
  name: string
  placement: 'HEADER' | 'FOOTER' | 'CONTENT' | 'PAUSE'
  code: string
  isHtml: boolean
  imageUrl?: string | null
  targetUrl?: string | null
  active: boolean
  impressions: number
  clicks: number
  videoInterval?: number | null
}

export default function AdminDashboardClient() {
  const { currentUser } = useApp()
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'videos' | 'import' | 'categories' | 'ads' | 'settings'>('dashboard')
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [ads, setAds] = useState<AdCampaign[]>([])
  
  // Settings metrics
  const [visitors, setVisitors] = useState('45000')
  const [revenue, setRevenue] = useState('1240.50')
  
  const [loading, setLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState({ text: '', type: 'success' })

  // Bulk Actions State
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([])

  // Importer Form State
  const [importUrl, setImportUrl] = useState('')
  const [detecting, setDetecting] = useState(false)
  const [importerForm, setImporterForm] = useState({
    title: '',
    slug: '',
    description: '',
    url: '',
    duration: '300',
    format: 'mp4',
    source: 'direct',
    thumbnail: '',
    categoryId: '',
    tags: '',
    isFeatured: false,
    seoTitle: '',
    seoDescription: ''
  })

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    thumbnail: '',
    seoTitle: '',
    seoDescription: ''
  })

  // Ads Form State
  const [adsForm, setAdsForm] = useState({
    name: '',
    placement: 'HEADER' as 'HEADER' | 'FOOTER' | 'CONTENT' | 'PAUSE',
    code: '',
    isHtml: true,
    active: true,
    videoInterval: '4'
  })

  // Editing States
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [editingVideoForm, setEditingVideoForm] = useState<Partial<Video>>({})

  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [importUrls, setImportUrls] = useState('')
  const [analyzedVideos, setAnalyzedVideos] = useState<any[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzingProgress, setAnalyzingProgress] = useState('')

  // Single upload
  const handleThumbnailUpload = async (file: File) => {
    setUploadingThumb(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.success && data.url) {
        setImporterForm(prev => ({ ...prev, thumbnail: data.url }))
        showFeedback('Thumbnail uploaded successfully!')
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (err: any) {
      showFeedback(err.message, 'error')
    } finally {
      setUploadingThumb(false)
    }
  }

  // Bulk Upload handler to assign to a specific row
  const handleBulkThumbnailUpload = async (index: number, file: File) => {
    setUploadingThumb(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.success && data.url) {
        setAnalyzedVideos(prev => {
          const next = [...prev]
          next[index].thumbnail = data.url
          return next
        })
        showFeedback(`Thumbnail uploaded for video #${index + 1}!`)
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (err: any) {
      showFeedback(err.message, 'error')
    } finally {
      setUploadingThumb(false)
    }
  }

  // Bulk URL parser
  const handleAnalyzeBulkUrls = async () => {
    const urls = importUrls.split('\n').map(u => u.trim()).filter(Boolean)
    if (urls.length === 0) {
      showFeedback('Please enter at least one URL', 'error')
      return
    }

    setAnalyzing(true)
    const results: any[] = []

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      setAnalyzingProgress(`Analyzing ${i + 1} of ${urls.length}...`)

      let detectedSource = 'direct'
      let detectedFormat = 'mp4'
      let detectedThumbnail = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=60'
      let detectedTitle = ''
      let detectedDuration = 300
      let finalUrl = url
      let scrapedCategories: string[] = []
      let scrapedTags: string[] = []

      try {
        const res = await fetch(`/api/videos/analyze?url=${encodeURIComponent(url)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            if (data.title) detectedTitle = data.title
            if (data.thumbnail) detectedThumbnail = data.thumbnail
            if (data.duration) detectedDuration = data.duration
            if (data.categories) scrapedCategories = data.categories
            if (data.tags) scrapedTags = data.tags
          }
        }
      } catch (err) {
        console.warn('Proxy metadata scraper failed for:', url, err)
      }

      // Formatting logic
      const ytReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const ytMatch = url.match(ytReg)
      const ytId = (ytMatch && ytMatch[2].length === 11) ? ytMatch[2] : null

      if (ytId) {
        detectedSource = 'youtube'
        detectedFormat = 'embed'
        finalUrl = `https://www.youtube.com/embed/${ytId}`
        if (!detectedThumbnail || detectedThumbnail.includes('unsplash')) {
          detectedThumbnail = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
        }
        if (!detectedTitle) detectedTitle = `YouTube video (${ytId})`
      } else if (url.includes('eporner.com')) {
        detectedSource = 'eporner'
        detectedFormat = 'embed'
        const match = url.match(/video-([a-zA-Z0-9]+)/)
        const videoId = match ? match[1] : ''
        finalUrl = videoId ? `https://www.eporner.com/embed/${videoId}/` : url
        if (!detectedThumbnail || detectedThumbnail.includes('unsplash')) {
          detectedThumbnail = videoId ? `https://static-hw.eporner.com/thumbs/${videoId}/1.jpg` : detectedThumbnail
        }
        if (!detectedTitle) {
          let slugPart = ''
          try {
            const pathParts = new URL(url).pathname.split('/').filter(Boolean)
            const found = pathParts.find(p => !p.startsWith('video-'))
            if (found) slugPart = found
          } catch (_) {}
          detectedTitle = slugPart ? slugPart.replace(/[-_]/g, ' ') : (videoId ? `EPorner Video ${videoId}` : 'EPorner Video')
        }
        detectedDuration = detectedDuration || 920
      } else if (url.includes('xhamster.com')) {
        detectedSource = 'xhamster'
        detectedFormat = 'embed'
        const match = url.match(/(xh[a-zA-Z0-9]+)/)
        const videoId = match ? match[1] : ''
        finalUrl = videoId ? `https://xhamster.com/embed/${videoId}` : url
        if (!detectedTitle) {
          let slugPart = ''
          try {
            const pathParts = new URL(url).pathname.split('/').filter(Boolean)
            const found = pathParts.find(p => p.includes(videoId)) || pathParts[pathParts.length - 1] || ''
            slugPart = found.replace(videoId, '').replace(/[-_]+$/g, '')
          } catch (_) {}
          detectedTitle = slugPart ? slugPart.replace(/[-_]/g, ' ') : (videoId ? `xHamster Video ${videoId}` : 'xHamster Video')
        }
        detectedDuration = detectedDuration || 1040
      } else if (url.includes('beeg.com')) {
        detectedSource = 'beeg'
        detectedFormat = 'embed'
        const match = url.match(/beeg\.com\/([0-9]+)/)
        const videoId = match ? match[1] : ''
        finalUrl = videoId ? `https://beeg.com/embed/${videoId}` : url
        if (!detectedTitle) detectedTitle = videoId ? `Beeg Premium Video ${videoId}` : 'Beeg Video'
        detectedDuration = detectedDuration || 1180
      } else if (url.includes('.m3u8')) {
        detectedSource = 'direct'
        detectedFormat = 'm3u8'
        detectedDuration = detectedDuration || 1200
        if (!detectedTitle) {
          try {
            const parts = url.split('/')
            const lastPart = parts[parts.length - 1].split('?')[0]
            detectedTitle = lastPart.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
          } catch (_) {
            detectedTitle = 'HLS Live Stream Feed'
          }
        }
      } else if (url.includes('.webm')) {
        detectedSource = 'direct'
        detectedFormat = 'webm'
        detectedDuration = detectedDuration || 450
        if (!detectedTitle) {
          try {
            const parts = url.split('/')
            const lastPart = parts[parts.length - 1].split('?')[0]
            detectedTitle = lastPart.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
          } catch (_) {
            detectedTitle = 'WebM Media Content'
          }
        }
      } else {
        detectedSource = 'direct'
        detectedFormat = 'mp4'
        detectedDuration = detectedDuration || 300
        if (!detectedTitle) {
          try {
            const parts = url.split('/')
            const lastPart = parts[parts.length - 1].split('?')[0]
            detectedTitle = lastPart.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
          } catch (_) {
            detectedTitle = 'Direct MP4 Stream Source'
          }
        }
      }

      // Title capitalization
      detectedTitle = detectedTitle
        .trim()
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')

      if (!detectedTitle || detectedTitle.length < 3) {
        detectedTitle = 'Watch Premium Video'
      }

      // SEO Suffix
      let enhancedTitle = detectedTitle
      const lowerT = enhancedTitle.toLowerCase()
      const rankModifiers = ['1080p', 'full hd', 'premium', 'hd', 'viral']
      const needsModifier = !rankModifiers.some(mod => lowerT.includes(mod))

      if (needsModifier) {
        if (lowerT.includes('indian') || lowerT.includes('desi') || lowerT.includes('bhabhi') || lowerT.includes('hindi')) {
          enhancedTitle = `${enhancedTitle} - Premium Indian Video (1080p Full HD)`
        } else {
          enhancedTitle = `${enhancedTitle} (Full HD Video)`
        }
      }

      // Auto Category & Tags Resolver
      let mappedCategoryId = categories[0]?.id || ''
      let detectedCategoryName = 'Amateur'

      if (scrapedCategories.length > 0) {
        const primaryCatName = scrapedCategories[0]
        detectedCategoryName = primaryCatName

        // Find if this category exists in the categories array loaded on frontend
        const match = categories.find(c => c.name.toLowerCase() === primaryCatName.toLowerCase())
        if (match) {
          mappedCategoryId = match.id
        } else {
          // If the category does not exist yet, pass its raw name.
          // The backend API will automatically create the Category record during publish!
          mappedCategoryId = primaryCatName
        }
      } else {
        const defaultCat = categories.find(c => c.slug === 'amateur') || categories[0]
        if (defaultCat) {
          mappedCategoryId = defaultCat.id
          detectedCategoryName = defaultCat.name
        }
      }

      const generatedSlug = enhancedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

      // Merge secondary scraped categories and tags
      const stopWords = new Set(['on', 'a', 'the', 'in', 'and', 'or', 'of', 'to', 'for', 'with', 'at', 'by', 'from', 'this', 'that', 'is', 'it'])
      const titleWords = enhancedTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w))
      
      const combinedTagsList = Array.from(new Set([
        detectedSource,
        ...scrapedCategories.slice(1).map(c => c.toLowerCase()),
        ...scrapedTags.map(t => t.toLowerCase()),
        ...titleWords
      ])).filter(Boolean)

      const autoTags = combinedTagsList.length > 0 ? combinedTagsList.join(', ') : 'eporner'

      const generatedDescription = `Watch ${enhancedTitle} in premium quality on DesiSexy.in. This high-definition ${detectedCategoryName} video is optimized for fast streaming and direct playback on our site.`

      results.push({
        title: enhancedTitle,
        slug: generatedSlug,
        description: generatedDescription,
        url: finalUrl,
        duration: String(detectedDuration),
        format: detectedFormat,
        source: detectedSource,
        thumbnail: detectedThumbnail,
        categoryId: mappedCategoryId,
        tags: autoTags,
        isFeatured: false,
        seoTitle: `${enhancedTitle} - DesiSexy.in`,
        seoDescription: `Watch ${enhancedTitle} online in Full HD on DesiSexy.in.`
      })
    }

    setAnalyzedVideos(prev => [...prev, ...results])
    setImportUrls('')
    setAnalyzing(false)
    setAnalyzingProgress('')
    showFeedback(`Parsed ${results.length} video URLs successfully!`)
  }

  // Publish all analyzed videos
  const handlePublishBulkVideos = async () => {
    if (analyzedVideos.length === 0) return
    setAnalyzing(true)
    let successCount = 0

    for (let i = 0; i < analyzedVideos.length; i++) {
      const vid = analyzedVideos[i]
      setAnalyzingProgress(`Publishing ${i + 1} of ${analyzedVideos.length}...`)
      try {
        const res = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...vid,
            tags: vid.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          })
        })
        if (res.ok) successCount++
      } catch (err) {
        console.error('Failed to publish:', vid.title, err)
      }
    }

    showFeedback(`Successfully published ${successCount} of ${analyzedVideos.length} videos!`)
    setAnalyzedVideos([])
    setAnalyzing(false)
    setAnalyzingProgress('')
    setActiveTab('videos')
    loadData()
  }

  // Fetch admin resources
  const loadData = async () => {
    setLoading(true)
    try {
      const [vidsRes, catsRes, adsRes] = await Promise.all([
        fetch('/api/videos'),
        fetch('/api/categories'),
        fetch('/api/ads')
      ])

      const [vids, cats, adList] = await Promise.all([
        vidsRes.json(),
        catsRes.json(),
        adsRes.json()
      ])

      setVideos(vids || [])
      setCategories(cats || [])
      setAds(adList || [])

      // Load Settings values
      const visitorsRes = await fetch('/api/settings?key=daily_visitors')
      if (visitorsRes.ok) {
        const val = await visitorsRes.text()
        if (val) setVisitors(val)
      }

      const revRes = await fetch('/api/settings?key=revenue_estimate')
      if (revRes.ok) {
        const val = await revRes.text()
        if (val) setRevenue(val)
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser && currentUser.role !== 'USER') {
      loadData()
    }
  }, [currentUser])

  useEffect(() => {
    // Check for query parameters for bookmarklet scrapers
    const params = new URLSearchParams(window.location.search)
    const qTab = params.get('tab')
    const qUrl = params.get('import_url')
    const qTitle = params.get('title')
    const qThumb = params.get('thumbnail')
    const qDur = params.get('duration')

    if (qTab === 'import' && qUrl && qTitle) {
      setActiveTab('import')
      
      // Capitalize title and clean
      let titleVal = qTitle.replace(/ - EPorner.*/i, '').replace(/ - xHamster.*/i, '').trim()
      titleVal = titleVal.split(/\s+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      
      const generatedSlug = titleVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

      let mappedCategoryId = categories[0]?.id || ''
      let detectedCategoryName = categories[0]?.name || 'Desi'
      // Find category
      for (const cat of categories) {
        if (titleVal.toLowerCase().includes(cat.name.toLowerCase())) {
          mappedCategoryId = cat.id
          detectedCategoryName = cat.name
          break
        }
      }
      if (!mappedCategoryId && categories.length > 0) {
        mappedCategoryId = categories[0].id
      }

      const generatedDescription = `Watch ${titleVal} in premium quality on DesiSexy.in. This high-definition ${detectedCategoryName} video is optimized for fast streaming and direct playback on our site.`

      const stopWords = new Set(['on', 'a', 'the', 'in', 'and', 'or', 'of', 'to', 'for', 'with', 'at', 'by', 'from', 'this', 'that', 'is', 'it'])
      const titleWords = titleVal.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w: string) => w.length > 2 && !stopWords.has(w))
      const autoTags = Array.from(new Set(['eporner', detectedCategoryName.toLowerCase(), ...titleWords])).join(', ')

      let finalUrl = qUrl
      let detectedSource = 'direct'
      let detectedFormat = 'embed'

      if (qUrl.includes('eporner.com')) {
        detectedSource = 'eporner'
        const match = qUrl.match(/video-([a-zA-Z0-9]+)/)
        const videoId = match ? match[1] : ''
        finalUrl = videoId ? `https://www.eporner.com/embed/${videoId}/` : qUrl
      } else if (qUrl.includes('xhamster.com')) {
        detectedSource = 'xhamster'
        const match = qUrl.match(/(xh[a-zA-Z0-9]+)/)
        const videoId = match ? match[1] : ''
        finalUrl = videoId ? `https://xhamster.com/embed/${videoId}` : qUrl
      } else if (qUrl.includes('beeg.com')) {
        detectedSource = 'beeg'
        const match = qUrl.match(/beeg\.com\/([0-9]+)/)
        const videoId = match ? match[1] : ''
        finalUrl = videoId ? `https://beeg.com/embed/${videoId}` : qUrl
      }

      const newVideo = {
        title: titleVal,
        slug: generatedSlug,
        description: generatedDescription,
        url: finalUrl,
        duration: qDur ? parseInt(qDur, 10) : 900,
        format: detectedFormat,
        source: detectedSource,
        thumbnail: qThumb || '',
        categoryId: mappedCategoryId,
        tags: autoTags,
        isFeatured: false,
        seoTitle: `${titleVal} - DesiSexy.in`,
        seoDescription: `Watch ${titleVal} online in Full HD on DesiSexy.in.`
      }

      setAnalyzedVideos(prev => {
        // avoid duplicate entries
        if (prev.some(v => v.url === newVideo.url)) return prev
        return [...prev, newVideo]
      })

      // Clean search query params so refreshing doesn't add the video again
      const newUrl = window.location.pathname + '?tab=import'
      window.history.replaceState({}, '', newUrl)
      
      showFeedback('Scraped video added to import queue!')
    }
  }, [categories])

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type })
    setTimeout(() => setActionMessage({ text: '', type: 'success' }), 3000)
  }

  // --- METADATA DETECTOR ---
  const handleDetectMetadata = async () => {
    if (!importUrl.trim()) {
      showFeedback('Please enter a video URL first', 'error')
      return
    }

    setDetecting(true)
    const url = importUrl.trim()

    let detectedSource = 'direct'
    let detectedFormat = 'mp4'
    let detectedThumbnail = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=60'
    let detectedTitle = ''
    let detectedDuration = 300
    let finalUrl = url

    try {
      // 1. Try to fetch real scraped metadata from the server-side proxy
      const res = await fetch(`/api/videos/analyze?url=${encodeURIComponent(url)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          if (data.title) detectedTitle = data.title
          if (data.thumbnail) detectedThumbnail = data.thumbnail
          if (data.duration) detectedDuration = data.duration
        }
      }
    } catch (err) {
      console.warn('Metadata server-side fetch failed, using path fallback heuristics:', err)
    }

    // 2. Configure video formats, source mappings, and embed targets
    const ytReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const ytMatch = url.match(ytReg)
    const ytId = (ytMatch && ytMatch[2].length === 11) ? ytMatch[2] : null

    if (ytId) {
      detectedSource = 'youtube'
      detectedFormat = 'embed'
      finalUrl = `https://www.youtube.com/embed/${ytId}`
      if (!detectedThumbnail || detectedThumbnail.includes('unsplash')) {
        detectedThumbnail = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
      }
      if (!detectedTitle) detectedTitle = `YouTube video (${ytId})`
    } else if (url.includes('eporner.com')) {
      detectedSource = 'eporner'
      detectedFormat = 'embed'
      const match = url.match(/video-([a-zA-Z0-9]+)/)
      const videoId = match ? match[1] : ''
      finalUrl = videoId ? `https://www.eporner.com/embed/${videoId}/` : url
      if (!detectedTitle) {
        let slugPart = ''
        try {
          const pathParts = new URL(url).pathname.split('/').filter(Boolean)
          const found = pathParts.find(p => !p.startsWith('video-'))
          if (found) slugPart = found
        } catch (_) {}
        detectedTitle = slugPart ? slugPart.replace(/[-_]/g, ' ') : (videoId ? `EPorner Video ${videoId}` : 'EPorner Video')
      }
      detectedDuration = detectedDuration || 920
    } else if (url.includes('xhamster.com')) {
      detectedSource = 'xhamster'
      detectedFormat = 'embed'
      const match = url.match(/(xh[a-zA-Z0-9]+)/)
      const videoId = match ? match[1] : ''
      finalUrl = videoId ? `https://xhamster.com/embed/${videoId}` : url
      if (!detectedTitle) {
        let slugPart = ''
        try {
          const pathParts = new URL(url).pathname.split('/').filter(Boolean)
          const found = pathParts.find(p => p.includes(videoId)) || pathParts[pathParts.length - 1] || ''
          slugPart = found.replace(videoId, '').replace(/[-_]+$/g, '')
        } catch (_) {}
        detectedTitle = slugPart ? slugPart.replace(/[-_]/g, ' ') : (videoId ? `xHamster Video ${videoId}` : 'xHamster Video')
      }
      detectedDuration = detectedDuration || 1040
    } else if (url.includes('beeg.com')) {
      detectedSource = 'beeg'
      detectedFormat = 'embed'
      const match = url.match(/beeg\.com\/([0-9]+)/)
      const videoId = match ? match[1] : ''
      finalUrl = videoId ? `https://beeg.com/embed/${videoId}` : url
      if (!detectedTitle) detectedTitle = videoId ? `Beeg Premium Video ${videoId}` : 'Beeg Video'
      detectedDuration = detectedDuration || 1180
    } else if (url.includes('.m3u8')) {
      detectedSource = 'direct'
      detectedFormat = 'm3u8'
      detectedDuration = detectedDuration || 1200
      if (!detectedTitle) {
        try {
          const parts = url.split('/')
          const lastPart = parts[parts.length - 1].split('?')[0]
          detectedTitle = lastPart.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
        } catch (_) {
          detectedTitle = 'HLS Live Stream Feed'
        }
      }
    } else if (url.includes('.webm')) {
      detectedSource = 'direct'
      detectedFormat = 'webm'
      detectedDuration = detectedDuration || 450
      if (!detectedTitle) {
        try {
          const parts = url.split('/')
          const lastPart = parts[parts.length - 1].split('?')[0]
          detectedTitle = lastPart.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
        } catch (_) {
          detectedTitle = 'WebM Media Content'
        }
      }
    } else {
      detectedSource = 'direct'
      detectedFormat = 'mp4'
      detectedDuration = detectedDuration || 300
      if (!detectedTitle) {
        try {
          const parts = url.split('/')
          const lastPart = parts[parts.length - 1].split('?')[0]
          detectedTitle = lastPart.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
        } catch (_) {
          detectedTitle = 'Direct MP4 Stream Source'
        }
      }
    }

    // Capitalize title words cleanly
    detectedTitle = detectedTitle
      .trim()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')

    if (!detectedTitle || detectedTitle.length < 3) {
      detectedTitle = 'Watch Premium Video'
    }

    // Enhance title with high-ranking clickbait SEO suffixes
    let enhancedTitle = detectedTitle
    const lowerT = enhancedTitle.toLowerCase()
    const rankModifiers = ['1080p', 'full hd', 'premium', 'hd', 'viral']
    const needsModifier = !rankModifiers.some(mod => lowerT.includes(mod))

    if (needsModifier) {
      if (lowerT.includes('indian') || lowerT.includes('desi') || lowerT.includes('bhabhi') || lowerT.includes('hindi')) {
        enhancedTitle = `${enhancedTitle} - Premium Indian Video (1080p Full HD)`
      } else {
        enhancedTitle = `${enhancedTitle} (Full HD Video)`
      }
    }

    // 3. AUTO GET CATEGORY FROM IMPORTED VIDEO
    const titleLower = enhancedTitle.toLowerCase()
    let mappedCategoryId = categories[0]?.id || ''
    let detectedCategoryName = categories[0]?.name || 'Desi'

    const musicKeys = ['music', 'beat', 'song', 'lofi', 'live', 'concert', 'chill', 'symphony']
    const gamingKeys = ['gaming', 'play', 'game', 'esport', 'pubg', 'fortnite', 'league', 'stream', 'gameplay']
    const techKeys = ['tech', 'code', 'programming', 'science', 'future', 'ai', 'gadget', 'review']
    const sportsKeys = ['sport', 'fit', 'run', 'bike', 'adventure', 'outdoors', 'car', 'offroad', 'trip']

    let foundCategory = null
    if (musicKeys.some(k => titleLower.includes(k))) {
      foundCategory = categories.find(c => c.slug === 'music-concerts')
    } else if (gamingKeys.some(k => titleLower.includes(k))) {
      foundCategory = categories.find(c => c.slug === 'gaming-esport')
    } else if (techKeys.some(k => titleLower.includes(k))) {
      foundCategory = categories.find(c => c.slug === 'tech-science')
    } else if (sportsKeys.some(k => titleLower.includes(k))) {
      foundCategory = categories.find(c => c.slug === 'sports-fitness')
    } else {
      for (const cat of categories) {
        const catLower = cat.name.toLowerCase()
        if (titleLower.includes(catLower) || catLower.split(' ').some(w => w.length > 3 && titleLower.includes(w))) {
          foundCategory = cat
          break
        }
      }
    }

    if (foundCategory) {
      mappedCategoryId = foundCategory.id
      detectedCategoryName = foundCategory.name
    } else {
      const defaultCat = categories.find(c => c.slug === 'movies-trailers') || categories[0]
      if (defaultCat) {
        mappedCategoryId = defaultCat.id
        detectedCategoryName = defaultCat.name
      }
    }

    // Generate clean slug from the enhanced title
    const generatedSlug = enhancedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    // Generate list of relevant tags from title tokens
    const stopWords = new Set(['on', 'a', 'the', 'in', 'and', 'or', 'of', 'to', 'for', 'with', 'at', 'by', 'from', 'this', 'that', 'is', 'it'])
    const titleWords = enhancedTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))

    const autoTags = Array.from(new Set([
      detectedSource,
      detectedCategoryName.toLowerCase(),
      ...titleWords
    ])).join(', ')

    // Generate keyword-rich descriptions for SEO ranking
    const generatedDescription = `Watch ${enhancedTitle} in premium quality on DesiSexy.in. This high-definition ${detectedCategoryName} video is optimized for fast streaming and direct playback on our site. Browse related categories for more trending clips!`
    const seoTitle = `${enhancedTitle} - DesiSexy.in`
    const seoDescription = `Watch ${enhancedTitle} online in Full HD. Stream top ${detectedCategoryName} clips, viral videos, and trending highlights directly on DesiSexy.in.`

    setImporterForm({
      title: enhancedTitle,
      slug: generatedSlug,
      description: generatedDescription,
      url: finalUrl,
      duration: String(detectedDuration),
      format: detectedFormat,
      source: detectedSource,
      thumbnail: detectedThumbnail,
      categoryId: mappedCategoryId,
      tags: autoTags,
      isFeatured: false,
      seoTitle: seoTitle,
      seoDescription: seoDescription
    })

    setDetecting(false)
    showFeedback('Metadata auto-detected & SEO-optimized successfully!')
  }

  // --- ACTIONS ---

  // Create Video
  const handlePublishVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...importerForm,
          tags: importerForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create')
      }

      showFeedback('Video published successfully!')
      setImportUrl('')
      setActiveTab('videos')
      loadData()
    } catch (err: any) {
      showFeedback(err.message, 'error')
    }
  }

  // Single Delete Video
  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return
    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      showFeedback('Video deleted!')
      loadData()
    } catch (err: any) {
      showFeedback(err.message, 'error')
    }
  }

  // Bulk Delete Videos
  const handleBulkDelete = async () => {
    if (selectedVideoIds.length === 0) return
    if (!confirm(`Are you sure you want to delete the ${selectedVideoIds.length} selected videos?`)) return
    
    try {
      const res = await fetch(`/api/videos/bulk?ids=${selectedVideoIds.join(',')}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Bulk delete failed')
      const data = await res.json()
      showFeedback(`Bulk delete success! Removed ${data.count} videos.`)
      setSelectedVideoIds([])
      loadData()
    } catch (err: any) {
      showFeedback(err.message, 'error')
    }
  }

  const handleSelectVideo = (id: string) => {
    setSelectedVideoIds(prev => 
      prev.includes(id) ? prev.filter(vidId => vidId !== id) : [...prev, id]
    )
  }

  const handleSelectAllVideos = () => {
    if (selectedVideoIds.length === videos.length) {
      setSelectedVideoIds([])
    } else {
      setSelectedVideoIds(videos.map(v => v.id))
    }
  }

  // Toggle Featured Video Status
  const handleToggleFeatured = async (video: Video) => {
    try {
      const res = await fetch(`/api/videos/${video.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...video, isFeatured: !video.isFeatured })
      })
      if (!res.ok) throw new Error('Failed to update')
      showFeedback('Feature status updated!')
      loadData()
    } catch (err: any) {
      showFeedback(err.message, 'error')
    }
  }

  // Edit Video Save
  const handleSaveVideoEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVideoId) return
    try {
      const res = await fetch(`/api/videos/${editingVideoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingVideoForm)
      })
      if (!res.ok) throw new Error('Failed to save')
      showFeedback('Changes saved!')
      setEditingVideoId(null)
      loadData()
    } catch (err: any) {
      showFeedback(err.message, 'error')
    }
  }

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      })
      if (!res.ok) throw new Error('Failed to create')
      showFeedback('Category added!')
      setCategoryForm({ name: '', slug: '', description: '', thumbnail: '', seoTitle: '', seoDescription: '' })
      loadData()
    } catch (err: any) {
      showFeedback(err.message, 'error')
    }
  }

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Videos will lose category references.')) return
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      showFeedback('Category deleted')
      loadData()
    } catch (err: any) {
      showFeedback(err.message, 'error')
    }
  }

  // Create Ad Campaign
  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/ads/create', { // Wait, our API endpoints has POST inside /api/ads, let's post to /api/ads directly!
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adsForm)
      })
      if (!res.ok) throw new Error('Failed to create campaign')
      showFeedback('Ad campaign active!')
      setAdsForm({ name: '', placement: 'HEADER', code: '', isHtml: true, active: true, videoInterval: '4' })
      loadData()
    } catch (err: any) {
      // Retry posting directly to /api/ads since we configured its POST handler there!
      try {
        const retryRes = await fetch('/api/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adsForm)
        })
        if (!retryRes.ok) throw new Error('Retry failed')
        showFeedback('Ad campaign active!')
        setAdsForm({ name: '', placement: 'HEADER', code: '', isHtml: true, active: true, videoInterval: '4' })
        loadData()
      } catch (retryErr: any) {
        showFeedback(retryErr.message, 'error')
      }
    }
  }

  // Delete Ad Campaign
  const handleDeleteAd = async (id: string) => {
    if (!confirm('Remove this campaign?')) return
    try {
      const res = await fetch(`/api/ads/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      showFeedback('Campaign deleted')
      loadData()
    } catch (err: any) {
      showFeedback(err.message, 'error')
    }
  }

  // Save Settings Metrics
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await Promise.all([
        fetch(`/api/settings?key=daily_visitors&value=${visitors}`, { method: 'POST' }),
        fetch(`/api/settings?key=revenue_estimate&value=${revenue}`, { method: 'POST' })
      ])
      showFeedback('Site stats saved!')
      loadData()
    } catch (err: any) {
      showFeedback(err.message, 'error')
    }
  }

  // --- ACCESS WALL ---
  if (!currentUser || currentUser.role === 'USER') {
    return (
      <div className="w-full max-w-md mx-auto text-center py-20 px-6 bg-brand-card border border-white/5 rounded-3xl space-y-6">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto text-red-500">
          <Shield className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-wider text-white">Area Restricted</h2>
          <p className="text-xs text-gray-400 leading-relaxed font-semibold">
            Admin CMS control settings are restricted to OWNER, ADMIN and MODERATOR profiles.
          </p>
        </div>
        <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-left text-[11px] text-gray-500 font-mono leading-relaxed">
          <p className="font-extrabold text-brand-primary uppercase mb-1">Sandbox Switcher:</p>
          To explore this area, open the user profile dropdown in the top right header menu and swap your role to ADMIN or OWNER.
        </div>
      </div>
    )
  }

  // Calculate quick metrics
  const totalViews = videos.reduce((acc, curr) => acc + curr.views, 0)
  const activeAdsCount = ads.filter(a => a.active).length

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      {/* Toast Alert Feedback */}
      {actionMessage.text && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl border text-xs font-bold shadow-2xl bg-black border-brand-primary text-brand-primary flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Sidebar Tabs */}
      <aside className="w-full lg:w-64 shrink-0 flex flex-col space-y-2">
        <div className="flex items-center space-x-2.5 px-4 py-3 bg-[#121212] border border-white/5 rounded-2xl mb-2">
          <Shield className="w-5 h-5 text-brand-primary" />
          <span className="text-sm font-black uppercase tracking-wider">CMS Console</span>
        </div>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition text-left cursor-pointer ${
            activeTab === 'dashboard' ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-4 h-4 mr-2.5" /> Dashboard
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`w-full flex items-center px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition text-left cursor-pointer ${
            activeTab === 'videos' ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Film className="w-4 h-4 mr-2.5" /> Video Manager
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`w-full flex items-center px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition text-left cursor-pointer ${
            activeTab === 'import' ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Plus className="w-4 h-4 mr-2.5" /> Import Importer
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`w-full flex items-center px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition text-left cursor-pointer ${
            activeTab === 'categories' ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Grid className="w-4 h-4 mr-2.5" /> Categories
        </button>

        <button
          onClick={() => setActiveTab('ads')}
          className={`w-full flex items-center px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition text-left cursor-pointer ${
            activeTab === 'ads' ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4 mr-2.5" /> Ads Manager
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition text-left cursor-pointer ${
            activeTab === 'settings' ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-4 h-4 mr-2.5" /> Settings
        </button>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="w-full flex items-center justify-center py-20 bg-brand-card border border-white/5 rounded-3xl">
            <div className="w-8 h-8 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="w-full space-y-6">
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-base font-black uppercase tracking-wider border-l-4 border-brand-primary pl-2.5">
                  Performance Metrics
                </h2>

                {/* Metrics row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-brand-card p-5 border border-white/5 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary"><Film className="w-6 h-6" /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Total Videos</p>
                      <h4 className="text-xl font-black text-white">{videos.length}</h4>
                    </div>
                  </div>
                  <div className="bg-brand-card p-5 border border-white/5 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Eye className="w-6 h-6" /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Total Views</p>
                      <h4 className="text-xl font-black text-white">{totalViews.toLocaleString()}</h4>
                    </div>
                  </div>
                  <div className="bg-brand-card p-5 border border-white/5 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-500"><Users className="w-6 h-6" /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Daily Visitors</p>
                      <h4 className="text-xl font-black text-white">{parseInt(visitors).toLocaleString()}</h4>
                    </div>
                  </div>
                  <div className="bg-brand-card p-5 border border-white/5 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><DollarSign className="w-6 h-6" /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Est. Revenue</p>
                      <h4 className="text-xl font-black text-white">${parseFloat(revenue).toLocaleString()}</h4>
                    </div>
                  </div>
                </div>

                {/* Custom SVG Traffic Line Chart */}
                <div className="bg-brand-card border border-white/5 p-6 rounded-3xl space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Weekly Viewing Traffic Analytics (Hits)
                  </h3>
                  <div className="w-full aspect-[21/9] min-h-[200px] relative">
                    <svg viewBox="0 0 100 40" className="w-full h-full text-brand-primary overflow-visible">
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.1" />
                      <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.1" />
                      <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.1" />

                      {/* Area Area */}
                      <path 
                        d="M 0,35 L 0,25 Q 16,14 32,28 T 64,10 Q 82,32 100,15 L 100,35 Z" 
                        fill="url(#areaGrad)" 
                      />
                      {/* Stroke Line */}
                      <path 
                        d="M 0,25 Q 16,14 32,28 T 64,10 Q 82,32 100,15" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="0.8" 
                      />
                      {/* Markers */}
                      <circle cx="32" cy="28" r="0.75" fill="var(--color-brand-accent)" />
                      <circle cx="64" cy="10" r="0.75" fill="var(--color-brand-accent)" />
                      <circle cx="100" cy="15" r="0.75" fill="var(--color-brand-accent)" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase tracking-wider font-mono">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: VIDEO MANAGER */}
            {activeTab === 'videos' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <h2 className="text-base font-black uppercase tracking-wider border-l-4 border-brand-primary pl-2.5">
                    Platform Video Registry ({videos.length})
                  </h2>

                  {/* Bulk Actions Button */}
                  {selectedVideoIds.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white transition rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Bulk Delete ({selectedVideoIds.length})</span>
                    </button>
                  )}
                </div>

                {/* Editing Form Overlay */}
                {editingVideoId && (
                  <form onSubmit={handleSaveVideoEdit} className="bg-brand-card p-6 border border-brand-primary/45 rounded-3xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary">Edit Video Metadata</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Video Title</label>
                        <input 
                          type="text" 
                          value={editingVideoForm.title || ''} 
                          onChange={(e) => setEditingVideoForm({ ...editingVideoForm, title: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-primary"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Video Slug</label>
                        <input 
                          type="text" 
                          value={editingVideoForm.slug || ''} 
                          onChange={(e) => setEditingVideoForm({ ...editingVideoForm, slug: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Video URL / Embed String</label>
                      <input 
                        type="text" 
                        value={editingVideoForm.url || ''} 
                        onChange={(e) => setEditingVideoForm({ ...editingVideoForm, url: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-primary"
                      />
                    </div>

                    {/* Thumbnail Edit row with Local Upload */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thumbnail Image URL</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={editingVideoForm.thumbnail || ''} 
                          onChange={(e) => setEditingVideoForm({ ...editingVideoForm, thumbnail: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-primary"
                        />
                        <input 
                          type="file" 
                          accept="image/*"
                          id="edit-thumbnail-upload"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setUploadingThumb(true)
                              const fd = new FormData()
                              fd.append('file', file)
                              try {
                                const res = await fetch('/api/upload', { method: 'POST', body: fd })
                                const d = await res.json()
                                if (d.success && d.url) {
                                  setEditingVideoForm(prev => ({ ...prev, thumbnail: d.url }))
                                  showFeedback('Thumbnail uploaded!')
                                } else {
                                  throw new Error(d.error || 'Upload failed')
                                }
                              } catch (err: any) {
                                showFeedback(err.message, 'error')
                              } finally {
                                setUploadingThumb(false)
                              }
                            }
                          }}
                        />
                        <label 
                          htmlFor="edit-thumbnail-upload"
                          className="px-4 py-2 bg-neutral-900 border border-white/10 hover:border-brand-accent/50 hover:bg-neutral-800 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition cursor-pointer flex items-center shrink-0"
                        >
                          Upload File
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                        <select 
                          value={editingVideoForm.categoryId || ''} 
                          onChange={(e) => setEditingVideoForm({ ...editingVideoForm, categoryId: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none"
                        >
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Format</label>
                        <select 
                          value={editingVideoForm.format || 'mp4'} 
                          onChange={(e) => setEditingVideoForm({ ...editingVideoForm, format: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none"
                        >
                          <option value="mp4">MP4</option>
                          <option value="m3u8">HLS (.m3u8)</option>
                          <option value="webm">WebM</option>
                          <option value="embed">Iframe Embed</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Source</label>
                        <input 
                          type="text" 
                          value={editingVideoForm.source || ''} 
                          onChange={(e) => setEditingVideoForm({ ...editingVideoForm, source: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-primary"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration (s)</label>
                        <input 
                          type="number" 
                          value={editingVideoForm.duration || ''} 
                          onChange={(e) => setEditingVideoForm({ ...editingVideoForm, duration: parseInt(e.target.value) || 0 })}
                          className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 justify-end pt-2">
                      <button 
                        type="button" 
                        onClick={() => setEditingVideoId(null)}
                        className="px-5 py-2 bg-neutral-900 rounded-full text-xs font-bold uppercase"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-5 py-2 bg-brand-primary hover:bg-amber-600 text-black rounded-full text-xs font-bold uppercase"
                      >
                        Save changes
                      </button>
                    </div>
                  </form>
                )}

                {/* Registry Table */}
                <div className="bg-brand-card border border-white/5 rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-black/40 text-gray-400 font-bold uppercase tracking-wider">
                          <th className="p-4 w-12 text-center">
                            <input 
                              type="checkbox" 
                              checked={selectedVideoIds.length === videos.length && videos.length > 0} 
                              onChange={handleSelectAllVideos}
                              className="rounded border-white/10 focus:ring-brand-primary cursor-pointer"
                            />
                          </th>
                          <th className="p-4">Thumbnail</th>
                          <th className="p-4">Title</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Format</th>
                          <th className="p-4 text-center">Views</th>
                          <th className="p-4 text-center">Featured</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-semibold">
                        {videos.map(video => {
                          const catName = categories.find(c => c.id === video.categoryId)?.name || 'Uncategorized'
                          const isSel = selectedVideoIds.includes(video.id)
                          return (
                            <tr key={video.id} className={`hover:bg-white/2.5 transition ${isSel ? 'bg-brand-primary/5' : ''}`}>
                              <td className="p-4 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={isSel} 
                                  onChange={() => handleSelectVideo(video.id)}
                                  className="rounded border-white/10 focus:ring-brand-primary cursor-pointer"
                                />
                              </td>
                              <td className="p-4 w-24">
                                <img src={video.thumbnail} alt="" className="w-20 aspect-video object-cover rounded-lg border border-white/10" />
                              </td>
                              <td className="p-4 max-w-xs truncate font-bold text-white" title={video.title}>
                                {video.title}
                              </td>
                              <td className="p-4 text-brand-primary">{catName}</td>
                              <td className="p-4 font-mono uppercase text-[10px] tracking-wider">{video.format}</td>
                              <td className="p-4 text-center">{video.views.toLocaleString()}</td>
                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => handleToggleFeatured(video)}
                                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border transition cursor-pointer ${
                                    video.isFeatured 
                                      ? 'bg-brand-primary/20 border-brand-primary/30 text-brand-primary' 
                                      : 'bg-black/30 border-white/10 text-gray-500 hover:border-brand-primary/30'
                                  }`}
                                >
                                  {video.isFeatured ? 'Featured' : 'Standard'}
                                </button>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditingVideoId(video.id)
                                      setEditingVideoForm(video)
                                    }}
                                    className="p-1.5 bg-neutral-900 border border-white/10 hover:border-brand-primary/45 rounded text-gray-400 hover:text-white transition cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVideo(video.id)}
                                    className="p-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded text-red-500 transition cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: VIDEO IMPORTER */}
            {activeTab === 'import' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h2 className="text-base font-black uppercase tracking-wider border-l-4 border-brand-primary pl-2.5">
                    Bulk Video Importer
                  </h2>
                  {analyzedVideos.length > 0 && (
                    <button 
                      onClick={() => setAnalyzedVideos([])}
                      className="px-3 py-1 bg-red-500/10 hover:bg-red-500 hover:text-white rounded text-[10px] uppercase font-bold text-red-400 transition"
                    >
                      Clear Import Queue ({analyzedVideos.length})
                    </button>
                  )}
                </div>

                {/* Scraper Bookmarklet installation guide */}
                <div className="bg-brand-card p-5 border border-brand-accent/25 rounded-3xl bg-gradient-to-r from-brand-accent/5 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-wider text-brand-accent">🚀 Bypass ISP Blocks & Scrape Real Thumbnails Instantly!</h4>
                    <p className="text-[11px] text-gray-400 max-w-xl leading-relaxed">
                      Because ISP firewalls block cloud servers from connecting to adult sites, direct scrapers can time out. 
                      Drag this bookmarklet button to your browser bookmarks bar. When viewing any EPorner video page, click it to instantly import the video with its <strong>real title, real thumbnail, and real preview</strong>!
                    </p>
                  </div>
                  <a 
                    href="javascript:(function(){const url=window.location.href;const title=document.querySelector('meta[property=%22og:title%22]')%3F.content||document.title;const thumb=document.querySelector('meta[property=%22og:image%22]')%3F.content||'';const dur=document.querySelector('meta[property=%22video:duration%22]')%3F.content||'';window.open('http://localhost:3000/admin?tab=import&import_url='+encodeURIComponent(url)+'&title='+encodeURIComponent(title)+'&thumbnail='+encodeURIComponent(thumb)+'&duration='+encodeURIComponent(dur),'_blank')%3B})()"
                    className="px-4 py-2 bg-brand-accent hover:bg-brand-primary text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition shrink-0 cursor-move shadow-md shadow-brand-accent/20 border border-brand-accent/50"
                  >
                    Drag to Bookmarks
                  </a>
                </div>

                {/* Import Textarea fetcher */}
                <div className="bg-brand-card p-6 border border-white/5 rounded-3xl space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Video Source URLs (Paste multiple links, one per line. Works for YouTube, EPorner, xHamster, Beeg, raw MP4s, HLS streams)
                    </label>
                    <textarea 
                      value={importUrls}
                      onChange={(e) => setImportUrls(e.target.value)}
                      placeholder="https://www.eporner.com/video-xxxxxx/title&#10;https://xhamster.com/videos/xhxxxxxx&#10;https://www.youtube.com/watch?v=xxxxxx"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-primary h-24 font-mono"
                      disabled={analyzing}
                    />
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-[10px] text-gray-500 font-semibold">
                        {analyzing ? (
                          <span className="text-brand-accent animate-pulse font-bold">{analyzingProgress}</span>
                        ) : (
                          <span>Supports bulk importing 10+ links concurrently.</span>
                        )}
                      </div>
                      
                      <button 
                        type="button" 
                        onClick={handleAnalyzeBulkUrls}
                        disabled={analyzing || !importUrls.trim()}
                        className="px-6 py-3 bg-brand-primary disabled:bg-neutral-800 text-black disabled:text-gray-500 font-extrabold text-xs uppercase rounded-xl hover:bg-amber-600 transition flex items-center space-x-2 shrink-0 cursor-pointer"
                      >
                        {analyzing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-4 h-4" />
                            <span>Analyze URLs</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table Registry of Analyzed Videos */}
                {analyzedVideos.length > 0 && (
                  <div className="bg-brand-card border border-white/5 rounded-3xl overflow-hidden p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary">Bulk Import Queue ({analyzedVideos.length} Videos ready)</h3>
                      <button 
                        onClick={handlePublishBulkVideos}
                        disabled={analyzing}
                        className="px-6 py-2.5 bg-gradient-to-r from-brand-primary to-brand-accent hover:scale-105 transition text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center space-x-1.5"
                      >
                        <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
                        <span>Publish All Queue ({analyzedVideos.length})</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            <th className="p-3 w-12">#</th>
                            <th className="p-3 w-28">Thumbnail</th>
                            <th className="p-3">Video details</th>
                            <th className="p-3 w-16 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {analyzedVideos.map((vid, idx) => (
                            <tr key={idx} className="hover:bg-white/2.5 transition">
                              <td className="p-3 text-xs font-bold text-gray-500 font-mono">{idx + 1}</td>
                              <td className="p-3">
                                <div className="space-y-1">
                                  <img 
                                    src={vid.thumbnail} 
                                    alt="" 
                                    className="w-24 aspect-video object-cover rounded border border-white/10" 
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60'
                                    }}
                                  />
                                  <div className="relative">
                                    <input 
                                      type="file" 
                                      accept="image/*"
                                      id={`bulk-thumb-file-${idx}`}
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleBulkThumbnailUpload(idx, file)
                                      }}
                                    />
                                    <label 
                                      htmlFor={`bulk-thumb-file-${idx}`}
                                      className="w-full text-[9px] text-center block bg-neutral-900 border border-white/5 rounded py-1 font-bold uppercase cursor-pointer hover:border-brand-primary text-gray-400 hover:text-white transition"
                                    >
                                      Upload Local
                                    </label>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Title</label>
                                    <input 
                                      type="text" 
                                      value={vid.title} 
                                      onChange={(e) => setAnalyzedVideos(prev => {
                                        const next = [...prev]
                                        next[idx].title = e.target.value
                                        next[idx].slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                                        next[idx].seoTitle = `${e.target.value} - DesiSexy.in`
                                        return next
                                      })}
                                      className="w-full bg-black border border-white/5 rounded p-1.5 text-xs text-white outline-none focus:border-brand-primary"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Thumbnail URL</label>
                                    <input 
                                      type="text" 
                                      value={vid.thumbnail} 
                                      onChange={(e) => setAnalyzedVideos(prev => {
                                        const next = [...prev]
                                        next[idx].thumbnail = e.target.value
                                        return next
                                      })}
                                      className="w-full bg-black border border-white/5 rounded p-1.5 text-xs text-white outline-none focus:border-brand-primary"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  <div>
                                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Category</label>
                                    <select 
                                      value={vid.categoryId}
                                      onChange={(e) => setAnalyzedVideos(prev => {
                                        const next = [...prev]
                                        next[idx].categoryId = e.target.value
                                        return next
                                      })}
                                      className="w-full bg-black border border-white/5 rounded p-1.5 text-[11px] text-white outline-none"
                                    >
                                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Format</label>
                                    <select 
                                      value={vid.format}
                                      onChange={(e) => setAnalyzedVideos(prev => {
                                        const next = [...prev]
                                        next[idx].format = e.target.value
                                        return next
                                      })}
                                      className="w-full bg-black border border-white/5 rounded p-1.5 text-[11px] text-white outline-none"
                                    >
                                      <option value="mp4">MP4</option>
                                      <option value="m3u8">HLS (.m3u8)</option>
                                      <option value="webm">WebM</option>
                                      <option value="embed">Embed</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Duration (s)</label>
                                    <input 
                                      type="number" 
                                      value={vid.duration} 
                                      onChange={(e) => setAnalyzedVideos(prev => {
                                        const next = [...prev]
                                        next[idx].duration = e.target.value
                                        return next
                                      })}
                                      className="w-full bg-black border border-white/5 rounded p-1.5 text-xs text-white outline-none focus:border-brand-primary"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Tags</label>
                                    <input 
                                      type="text" 
                                      value={vid.tags} 
                                      onChange={(e) => setAnalyzedVideos(prev => {
                                        const next = [...prev]
                                        next[idx].tags = e.target.value
                                        return next
                                      })}
                                      className="w-full bg-black border border-white/5 rounded p-1.5 text-xs text-white outline-none focus:border-brand-primary"
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => setAnalyzedVideos(prev => prev.filter((_, i) => i !== idx))}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition rounded cursor-pointer"
                                  title="Remove from queue"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <h2 className="text-base font-black uppercase tracking-wider border-l-4 border-brand-primary pl-2.5">
                  Platform Channels (Categories)
                </h2>

                {/* Add Category Form */}
                <form onSubmit={handleCreateCategory} className="bg-brand-card p-6 border border-white/5 rounded-3xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary">Create New Category</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category Name</label>
                      <input 
                        type="text" 
                        value={categoryForm.name} 
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="e.g. Comedy Clips"
                        className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-primary"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category Slug</label>
                      <input 
                        type="text" 
                        value={categoryForm.slug} 
                        onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                        placeholder="comedy-clips"
                        className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thumbnail Image URL</label>
                    <input 
                    type="text" 
                    value={categoryForm.thumbnail} 
                    onChange={(e) => setCategoryForm({ ...categoryForm, thumbnail: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                    <input 
                      type="text" 
                      value={categoryForm.description} 
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      className="px-5 py-2.5 bg-brand-primary hover:bg-amber-600 text-black rounded-lg text-xs font-bold uppercase cursor-pointer"
                    >
                      Add Category
                    </button>
                  </div>
                </form>

                {/* Categories Table */}
                <div className="bg-brand-card border border-white/5 rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-black/40 text-gray-400 font-bold uppercase tracking-wider">
                          <th className="p-4">Cover</th>
                          <th className="p-4">Name</th>
                          <th className="p-4">Slug</th>
                          <th className="p-4">Description</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-semibold">
                        {categories.map(cat => (
                          <tr key={cat.id} className="hover:bg-white/2.5 transition">
                            <td className="p-4 w-16">
                              <img src={cat.thumbnail || ''} alt="" className="w-12 h-12 object-cover rounded-lg border border-white/10" />
                            </td>
                            <td className="p-4 font-bold text-white">{cat.name}</td>
                            <td className="p-4 font-mono text-gray-400">{cat.slug}</td>
                            <td className="p-4 text-gray-400 max-w-xs truncate">{cat.description}</td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded text-red-500 transition cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ADS MANAGER */}
            {activeTab === 'ads' && (
              <div className="space-y-6">
                <h2 className="text-base font-black uppercase tracking-wider border-l-4 border-brand-primary pl-2.5">
                  Advertisement Campaigns Workspace
                </h2>

                {/* Add Campaign Form */}
                <form onSubmit={handleCreateAd} className="bg-brand-card p-6 border border-white/5 rounded-3xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary">Create New Ad Campaign</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Campaign Name</label>
                      <input 
                        type="text" 
                        value={adsForm.name} 
                        onChange={(e) => setAdsForm({ ...adsForm, name: e.target.value })}
                        placeholder="e.g. Snack Pause Campaign"
                        className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-primary"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Placement Slot</label>
                      <select 
                        value={adsForm.placement} 
                        onChange={(e) => setAdsForm({ ...adsForm, placement: e.target.value as any })}
                        className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none"
                      >
                        <option value="HEADER">Header Banner</option>
                        <option value="FOOTER">Footer Banner</option>
                        <option value="CONTENT">Between Video Cards</option>
                        <option value="PAUSE">Video Pause Overlay</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adsForm.placement === 'CONTENT' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Video Interval (Show ad after every X videos)</label>
                        <input 
                          type="number" 
                          value={adsForm.videoInterval} 
                          onChange={(e) => setAdsForm({ ...adsForm, videoInterval: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-primary"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">HTML/JS Creative Code or Banner Code</label>
                    <textarea 
                      value={adsForm.code} 
                      onChange={(e) => setAdsForm({ ...adsForm, code: e.target.value })}
                      placeholder="Paste HTML codes (e.g., <div class=...><a href=...>Click here</a></div> or script tag)"
                      className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none h-24 font-mono resize-none focus:border-brand-primary"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      className="px-5 py-2.5 bg-brand-primary hover:bg-amber-600 text-black rounded-lg text-xs font-bold uppercase cursor-pointer"
                    >
                      Activate Campaign
                    </button>
                  </div>
                </form>

                {/* Ads Table */}
                <div className="bg-brand-card border border-white/5 rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-black/40 text-gray-400 font-bold uppercase tracking-wider">
                          <th className="p-4">Campaign Name</th>
                          <th className="p-4 text-center">Placement</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-center">Impressions</th>
                          <th className="p-4 text-center">Clicks</th>
                          <th className="p-4 text-center">CTR %</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-semibold">
                        {ads.map(ad => {
                          const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0'
                          return (
                            <tr key={ad.id} className="hover:bg-white/2.5 transition">
                              <td className="p-4 font-bold text-white">{ad.name}</td>
                              <td className="p-4 text-center">
                                <span className="px-2 py-0.5 rounded text-[9px] uppercase font-black bg-neutral-900 border border-white/10 text-gray-300">
                                  {ad.placement}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black ${
                                  ad.active 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                  {ad.active ? 'Active' : 'Paused'}
                                </span>
                              </td>
                              <td className="p-4 text-center font-mono">{ad.impressions.toLocaleString()}</td>
                              <td className="p-4 text-center font-mono">{ad.clicks.toLocaleString()}</td>
                              <td className="p-4 text-center font-mono text-brand-primary">{ctr}%</td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => handleDeleteAd(ad.id)}
                                  className="p-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded text-red-500 transition cursor-pointer"
                                  title="Remove Campaign"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="bg-brand-card p-6 border border-white/5 rounded-3xl space-y-6">
                <h2 className="text-base font-black uppercase tracking-wider border-l-4 border-brand-primary pl-2.5">
                  Platform CMS Configurations
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Daily Visitors (Dashboard metric)</label>
                    <input 
                      type="number" 
                      value={visitors} 
                      onChange={(e) => setVisitors(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs text-white outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Revenue Estimate ($) (Dashboard metric)</label>
                    <input 
                      type="text" 
                      value={revenue} 
                      onChange={(e) => setRevenue(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs text-white outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-brand-primary hover:bg-amber-600 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition cursor-pointer"
                  >
                    Save configuration
                  </button>
                </div>
              </form>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
