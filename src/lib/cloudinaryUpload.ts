import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'jaat',
  api_key: process.env.CLOUDINARY_API_KEY || '695293672966725',
  api_secret: process.env.CLOUDINARY_API_SECRET || '6TS_CG9zA3367W_Lk6I_6REwK5U',
  secure: true,
})

/**
 * Upload an image from a remote URL to Cloudinary.
 * Returns the hosted Cloudinary URL on success, or the original URL as fallback.
 */
export async function uploadThumbnailToCloudinary(imageUrl: string): Promise<string> {
  // Already a Cloudinary URL — return as-is
  if (imageUrl.includes('cloudinary.com')) return imageUrl
  // Not an http URL — return as-is
  if (!imageUrl.startsWith('http')) return imageUrl

  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'desisexy/thumbnails',
      resource_type: 'image',
      fetch_format: 'auto',
      quality: 'auto',
      // Use URL hash as public_id to avoid re-uploading duplicates
      public_id: `thumb_${Buffer.from(imageUrl).toString('base64').substring(0, 40).replace(/[^a-zA-Z0-9]/g, '_')}`,
      overwrite: false,
    })
    console.log(`Cloudinary upload success: ${result.secure_url}`)
    return result.secure_url
  } catch (err: any) {
    // If already exists (duplicate), extract the URL from error
    if (err?.error?.http_code === 400 && err?.error?.message?.includes('already exists')) {
      console.log('Cloudinary: image already uploaded, reusing existing URL')
    }
    console.warn(`Cloudinary upload failed for ${imageUrl}: ${err?.message || err}. Using original URL.`)
    return imageUrl
  }
}
