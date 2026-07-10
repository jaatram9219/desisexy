import { v2 as cloudinary } from 'cloudinary'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'
import { resolve } from 'path'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ktn67p2e',
  api_key: process.env.CLOUDINARY_API_KEY || '558679935651993',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'qSIV_aag74ALGXTV_vd6Z38OSMs',
  secure: true,
})

function resolveDbUrl() {
  const raw = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db'
  if (raw.startsWith('libsql://') || raw.startsWith('http')) return raw
  return `file:${resolve(process.cwd(), raw.replace(/^file:/, ''))}`
}

const adapter = new PrismaLibSql({ url: resolveDbUrl(), authToken: process.env.TURSO_AUTH_TOKEN || undefined })
const prisma = new PrismaClient({ adapter })

async function uploadToCloudinary(url: string, id: string): Promise<string> {
  if (!url || url.includes('cloudinary.com')) return url
  if (!url.startsWith('http')) return url
  const publicId = `thumb_${id.replace(/-/g, '_')}`
  const result = await cloudinary.uploader.upload(url, {
    folder: 'desisexy/thumbnails',
    resource_type: 'image',
    fetch_format: 'auto',
    quality: 'auto',
    public_id: publicId,
    overwrite: true,
  })
  return result.secure_url
}

async function main() {
  console.log('🌩️  Uploading thumbnails to Cloudinary ktn67p2e...')
  const videos = await prisma.video.findMany({ select: { id: true, title: true, thumbnail: true } })
  console.log(`Found ${videos.length} videos\n`)

  for (const video of videos) {
    if (video.thumbnail.includes('cloudinary.com')) {
      console.log(`✅ Already on Cloudinary: ${video.title}`)
      continue
    }
    console.log(`Uploading: ${video.title}`)
    console.log(`  Source: ${video.thumbnail}`)
    try {
      const cloudUrl = await uploadToCloudinary(video.thumbnail, video.id)
      await prisma.video.update({ where: { id: video.id }, data: { thumbnail: cloudUrl } })
      console.log(`  ✅ Done: ${cloudUrl}\n`)
    } catch (e: any) {
      console.error(`  ❌ Failed: ${e.message}\n`)
    }
  }

  console.log('✅ All thumbnails processed!')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
