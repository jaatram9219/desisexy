/**
 * Thumbnail URL resolver for video imports.
 * 
 * Strategy: Store the direct EPorner CDN URL as-is.
 * - EPorner's static CDN (static-eu-cdn.eporner.com) allows direct image access
 * - Next.js is configured with unoptimized: true + domain whitelist
 * - These URLs are stable permanent links
 * 
 * If Cloudinary is configured and working, it will be used as a CDN layer.
 * Otherwise falls back to direct CDN URL.
 */

let cloudinaryConfigured = false

async function tryConfigureCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return false
  }
  try {
    const { v2: cloudinary } = await import('cloudinary')
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })
    cloudinaryConfigured = true
    return true
  } catch {
    return false
  }
}

/**
 * Returns the best available CDN URL for a thumbnail.
 * Tries Cloudinary first if configured, falls back to the direct URL.
 */
export async function uploadThumbnailToCloudinary(imageUrl: string): Promise<string> {
  // Empty or non-http URL — return as-is
  if (!imageUrl || !imageUrl.startsWith('http')) return imageUrl
  // Already on Cloudinary — keep it
  if (imageUrl.includes('cloudinary.com')) return imageUrl

  // Try Cloudinary upload if credentials available
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    await tryConfigureCloudinary()
    if (cloudinaryConfigured) {
      try {
        const { v2: cloudinary } = await import('cloudinary')
        const publicId = `thumb_${Buffer.from(imageUrl).toString('base64').substring(0, 40).replace(/[^a-zA-Z0-9]/g, '_')}`
        const result = await cloudinary.uploader.upload(imageUrl, {
          folder: 'desisexy/thumbnails',
          resource_type: 'image',
          fetch_format: 'auto',
          quality: 'auto',
          public_id: publicId,
          overwrite: false,
        })
        console.log(`Cloudinary upload success: ${result.secure_url}`)
        return result.secure_url
      } catch (err: any) {
        console.warn(`Cloudinary upload failed: ${err?.message}. Using direct CDN URL.`)
      }
    }
  }

  // Fallback: direct CDN URL (EPorner static CDN is publicly accessible)
  console.log(`Using direct CDN URL: ${imageUrl}`)
  return imageUrl
}
