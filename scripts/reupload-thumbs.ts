import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'
import { resolve } from 'path'

function resolveDbUrl() {
  const raw = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db'
  if (raw.startsWith('libsql://') || raw.startsWith('http')) return raw
  return `file:${resolve(process.cwd(), raw.replace(/^file:/, ''))}`
}

const adapter = new PrismaLibSql({ url: resolveDbUrl(), authToken: process.env.TURSO_AUTH_TOKEN || undefined })
const prisma = new PrismaClient({ adapter })

// Direct CDN URLs scraped from EPorner og:image
const fixes = [
  {
    slugMatch: 'thick-ass-blonde',
    thumbnail: 'https://static-eu-cdn.eporner.com/thumbs/static4/1/17/175/17529740/9_240.jpg',
  },
  {
    slugMatch: 'bbl-overdose',
    thumbnail: 'https://static-eu-cdn.eporner.com/thumbs/static4/1/17/175/17564532/14_240.jpg',
  },
]

async function main() {
  console.log('🔧 Fixing thumbnail URLs in database...')

  const videos = await prisma.video.findMany({ select: { id: true, title: true, slug: true, thumbnail: true } })
  console.log(`Found ${videos.length} videos`)

  for (const video of videos) {
    const fix = fixes.find(f => video.slug.includes(f.slugMatch))
    if (!fix) {
      console.log(`✅ No fix needed: ${video.title} (${video.thumbnail.substring(0, 50)})`)
      continue
    }
    await prisma.video.update({ where: { id: video.id }, data: { thumbnail: fix.thumbnail } })
    console.log(`✅ Fixed: ${video.title} → ${fix.thumbnail}`)
  }

  console.log('\n✅ Done!')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
