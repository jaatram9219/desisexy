/**
 * Utility functions to bypass ISP-level block of Eporner domains in regions like India.
 * Proxies thumbnails via Images.Weserv.nl CDN and maps embeds to the unblocked .xxx mirror.
 */

export function getThumbnailUrl(url: string | null | undefined): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'
  }
  
  // If the thumbnail is hosted on blocked Eporner CDN, route it through our local server proxy endpoint
  if (url.includes('eporner.com') || url.includes('eporner-img.com')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`
  }
  
  return url
}

export function getEmbedUrl(url: string | null | undefined): string {
  if (!url) return ''
  
  // Replace blocked eporner.com with their working unblocked .xxx mirror for seamless play in India
  if (url.includes('eporner.com')) {
    return url.replace('www.eporner.com', 'eporner.xxx').replace('eporner.com', 'eporner.xxx')
  }
  
  return url
}

export function getPreviewUrl(epornerId: string | null | undefined): string {
  if (!epornerId) return ''
  return `https://preview.eporner.xxx/${epornerId}.mp4`
}
