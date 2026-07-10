import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ktn67p2e',
  api_key: process.env.CLOUDINARY_API_KEY || '558679935651993',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'qSIV_aag74ALGXTV_vd6Z38OSMs',
  secure: true,
})

/**
 * Upload a thumbnail from a remote URL to Cloudinary.
 * Falls back to the original URL if upload fails.
 */
export async function uploadThumbnailToCloudinary(imageUrl: string): Promise<string> {
  if (!imageUrl || !imageUrl.startsWith('http')) return imageUrl
  if (imageUrl.includes('cloudinary.com')) return imageUrl

  try {
    const publicId = `thumb_${Buffer.from(imageUrl).toString('base64').substring(0, 40).replace(/[^a-zA-Z0-9]/g, '_')}`
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'desisexy/thumbnails',
      resource_type: 'image',
      fetch_format: 'auto',
      quality: 'auto',
      public_id: publicId,
      overwrite: false,
    })
    console.log(`Cloudinary upload OK: ${result.secure_url}`)
    return result.secure_url
  } catch (err: any) {
    console.warn(`Cloudinary upload failed: ${err?.message}. Using direct CDN URL.`)
    return imageUrl
  }
}
