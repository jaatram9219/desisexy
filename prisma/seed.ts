import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import * as bcrypt from 'bcryptjs'
import https from 'node:https'
import { writeFile, mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

// Resolve local SQLite file to an absolute path for @libsql/client
function resolveDbUrl(): string {
  const raw = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db'
  if (raw.startsWith('libsql://') || raw.startsWith('http')) return raw
  const filePath = raw.replace(/^file:/, '')
  const absPath = resolve(process.cwd(), filePath)
  return `file:${absPath}`
}

const url = resolveDbUrl()
const authToken = process.env.TURSO_AUTH_TOKEN

// PrismaLibSql is a factory — pass config directly
const adapter = new PrismaLibSql({ url, authToken: authToken || undefined })
const prisma = new PrismaClient({ adapter })


// --- DoH Helper Functions to Bypass ISP Block inside Seeder ---

async function resolveHostIpsDoH(host: string): Promise<string[]> {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=A`, {
      headers: { 'accept': 'application/dns-json' },
      signal: AbortSignal.timeout(3000)
    })
    if (!res.ok) return []
    const data: any = await res.json()
    return data.Answer?.map((ans: any) => ans.data).filter(Boolean) || []
  } catch (err) {
    return []
  }
}

async function fetchViaDoH(targetUrl: string, responseType: 'text' | 'buffer' = 'text'): Promise<any> {
  const parsed = new URL(targetUrl)
  const host = parsed.hostname
  const requestPath = parsed.pathname + parsed.search

  const realIps = await resolveHostIpsDoH(host)
  if (realIps.length === 0) {
    throw new Error(`Failed to resolve IP for host: ${host}`)
  }

  for (const ip of realIps) {
    try {
      const data = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: ip,
          port: 443,
          path: requestPath,
          method: 'GET',
          rejectUnauthorized: false,
          timeout: 5000,
          headers: {
            'Host': host,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
          }
        }, (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Status ${res.statusCode}`))
            return
          }
          const chunks: any[] = []
          res.on('data', c => chunks.push(c))
          res.on('end', () => {
            const buffer = Buffer.concat(chunks)
            resolve(responseType === 'buffer' ? buffer : buffer.toString('utf8'))
          })
        })
        req.on('error', reject)
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); })
        req.end()
      })
      return data
    } catch (e) {
      // Try next IP
    }
  }
  throw new Error(`All IPs failed for ${host}`)
}

async function downloadThumbnailLocally(imageUrl: string): Promise<string> {
  try {
    const buffer = await fetchViaDoH(imageUrl, 'buffer')
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    const ext = imageUrl.split('.').pop()?.split('?')[0] || 'jpg'
    const filename = `thumb-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
    const filePath = join(uploadDir, filename)
    await writeFile(filePath, buffer)
    return `/uploads/${filename}`
  } catch (err: any) {
    console.error(`Failed to download seed thumbnail ${imageUrl}: ${err.message}`)
    return 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60'
  }
}

// --- Main Seeder ---

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Create Default Users
  const passwordHash = await bcrypt.hash('admin123', 12)
  
  const owner = await prisma.user.upsert({
    where: { email: 'owner@video.cms' },
    update: {},
    create: {
      email: 'owner@video.cms',
      passwordHash,
      name: 'System Owner',
      role: 'OWNER',
    },
  })
  console.log(`Created user: ${owner.email}`)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@video.cms' },
    update: {},
    create: {
      email: 'admin@video.cms',
      passwordHash,
      name: 'Platform Admin',
      role: 'ADMIN',
    },
  })
  console.log(`Created user: ${admin.email}`)

  // 2. Create Categories
  const categoriesData = [
    {
      id: 'cat-amateur',
      name: 'Amateur',
      slug: 'amateur',
      description: 'Real amateur videos and home-made uploads.',
      thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60',
      seoTitle: 'Watch Amateur Videos Online - DesiSexy.in',
      seoDescription: 'Stream and watch the best amateur videos in HD quality.',
    },
    {
      id: 'cat-pov',
      name: 'POV',
      slug: 'pov',
      description: 'Point-of-view perspective video uploads.',
      thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60',
      seoTitle: 'Watch POV Videos Online - DesiSexy.in',
      seoDescription: 'Experience realistic point-of-view perspective clips in HD.',
    },
    {
      id: 'cat-homemade',
      name: 'Homemade',
      slug: 'homemade',
      description: 'Self-made home videos from real couples.',
      thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60',
      seoTitle: 'Watch Homemade Videos Online - DesiSexy.in',
      seoDescription: 'Browse the largest library of authentic homemade video uploads.',
    },
    {
      id: 'cat-brunette',
      name: 'Brunette',
      slug: 'brunette',
      description: 'Premium videos featuring stunning brunette stars.',
      thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60',
      seoTitle: 'Watch Brunette Videos - DesiSexy.in',
      seoDescription: 'Stream hot brunette videos and channels online.',
    },
    {
      id: 'cat-big-ass',
      name: 'Big Ass',
      slug: 'big-ass',
      description: 'HD videos featuring big booty girls.',
      thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60',
      seoTitle: 'Watch Big Ass Videos - DesiSexy.in',
      seoDescription: 'Browse premium high-definition big ass categories.',
    },
    {
      id: 'cat-lesbian',
      name: 'Lesbian',
      slug: 'lesbian',
      description: 'Sensual lesbian romance and video clips.',
      thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60',
      seoTitle: 'Watch Lesbian Videos - DesiSexy.in',
      seoDescription: 'The best HD lesbian streams and categories.',
    },
    {
      id: 'cat-milf',
      name: 'MILF',
      slug: 'milf',
      description: 'Stunning mature women and MILF videos.',
      thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60',
      seoTitle: 'Watch MILF Videos - DesiSexy.in',
      seoDescription: 'Stream premium hot mature and MILF clips.',
    },
    {
      id: 'cat-teen',
      name: 'Teen',
      slug: 'teen',
      description: 'Cute amateur teen style video uploads.',
      thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60',
      seoTitle: 'Watch Teen Style Videos - DesiSexy.in',
      seoDescription: 'Browse the latest amateur teen categories online.',
    }
  ]

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        thumbnail: cat.thumbnail,
        seoTitle: cat.seoTitle,
        seoDescription: cat.seoDescription,
      },
      create: cat,
    })
    console.log(`Upserted category: ${created.name}`)
  }

  // 3. Create Settings
  await prisma.setting.upsert({
    where: { key: 'daily_visitors' },
    update: {},
    create: { key: 'daily_visitors', value: '45000' },
  })
  await prisma.setting.upsert({
    where: { key: 'revenue_estimate' },
    update: {},
    create: { key: 'revenue_estimate', value: '1240.50' },
  })
  console.log('Upserted platform settings')

  // 4. Create Ad Campaigns
  const adsData = [
    {
      id: 'ad-header-banner',
      name: 'Header Adult Singles Banner',
      placement: 'HEADER' as const,
      code: `<div class="w-full bg-gradient-to-r from-brand-accent/15 via-[#161616] to-[#FF3D00]/10 border border-brand-accent/30 rounded-lg p-4 flex items-center justify-between text-white shadow-lg">
        <div class="flex items-center space-x-3">
          <span class="px-2 py-0.5 text-xs uppercase bg-[#FF3D00] text-white font-extrabold rounded">AD</span>
          <div>
            <h4 class="font-bold text-sm text-brand-primary">🔞 Hot Local Singles Near You</h4>
            <p class="text-xs text-gray-400">14 Active girls online right now in your city. Click to start chatting instantly!</p>
          </div>
        </div>
        <a href="https://google.com" target="_blank" class="px-4 py-1.5 bg-[#FF3D00] hover:bg-brand-primary transition text-white font-bold text-xs rounded uppercase tracking-wider">Meet Girls</a>
      </div>`,
      isHtml: true,
      active: true,
    },
    {
      id: 'ad-footer-banner',
      name: 'Footer Adult Game Ad',
      placement: 'FOOTER' as const,
      code: `<div class="w-full bg-[#161616] border border-white/5 rounded p-6 flex flex-col md:flex-row items-center justify-between text-gray-300">
        <div class="flex items-center">
          <span class="px-1.5 py-0.5 text-[10px] uppercase bg-red-600 text-white font-bold rounded mr-3">SPONSORED</span>
          <span class="text-sm font-semibold">💦 Play the Hottest RPG Adult Game of 2026 - Free Signup & Instant Play!</span>
        </div>
        <a href="https://google.com" target="_blank" class="mt-4 md:mt-0 px-4 py-1.5 bg-brand-accent hover:bg-brand-primary text-white font-bold text-xs uppercase rounded transition-all">Play Free &rarr;</a>
      </div>`,
      isHtml: true,
      active: true,
    },
    {
      id: 'ad-grid-content',
      name: 'Grid Live Cam Banner',
      placement: 'CONTENT' as const,
      code: `<div class="col-span-full bg-gradient-to-r from-brand-primary/10 via-[#161616] to-[#FF3D00]/10 border border-brand-primary/20 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden my-4 min-h-[160px]">
        <div class="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] uppercase bg-brand-primary/30 text-brand-primary font-bold rounded">LIVE SHOWS</div>
        <h3 class="text-lg font-bold text-white tracking-tight">💋 10,000+ Hot Cam Girls Live Online Now</h3>
        <p class="text-xs text-gray-400 max-w-md">No credit card required. Free chat rooms, private shows, and interactive toys.</p>
        <a href="https://google.com" target="_blank" class="px-6 py-2 bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-accent hover:to-brand-primary transition text-white font-extrabold text-xs uppercase rounded-full tracking-wide">Enter Live Cams</a>
      </div>`,
      isHtml: true,
      active: true,
      videoInterval: 4,
    },
    {
      id: 'ad-pause-overlay',
      name: 'Video Pause Live Cam Ad',
      placement: 'PAUSE' as const,
      code: `<div class="bg-[#111111] border border-[#FF3D00]/40 p-6 rounded-lg max-w-sm text-center shadow-2xl relative">
        <h3 class="text-lg font-bold text-[#FF3D00] mb-2">⏸️ Video Paused?</h3>
        <p class="text-xs text-gray-300 mb-4">Chat with real cam girls live in full HD while you wait! Free entrance, 100% anonymous.</p>
        <a href="https://google.com" target="_blank" class="inline-block w-full py-2 bg-brand-accent hover:bg-brand-primary text-white font-bold text-xs uppercase rounded transition">Watch Live Now</a>
      </div>`,
      isHtml: true,
      active: true,
    },
  ]

  for (const ad of adsData) {
    await prisma.adCampaign.upsert({
      where: { id: ad.id },
      update: ad,
      create: ad,
    })
    console.log(`Upserted ad campaign: ${ad.name}`)
  }

  // 5. Scrape and Seed Real Adult Videos from EPorner
  console.log('🌱 Scraping and seeding real adult videos from EPorner via DoH...')
  const seedVideoUrls = [
    'https://www.eporner.com/video-72BNRO0RIjN/thick-ass-blonde/',
    'https://www.eporner.com/video-AHNviqQpADC/bbl-overdose/',
    'https://www.eporner.com/video-sLwK96uW8Jj/teen-pool-party/',
    'https://www.eporner.com/video-3o7FjJ8gL1f/amateur-lesbian-fun/'
  ]

  for (const url of seedVideoUrls) {
    try {
      console.log(`Scraping: ${url}`)
      const html = await fetchViaDoH(url, 'text')

      // Extract title
      const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/) ||
                           html.match(/<title>([^<]+)<\/title>/)
      let title = ogTitleMatch ? ogTitleMatch[1].replace(/ - EPorner.*/i, '').trim() : 'Premium EPorner Video'
      title = title.split(/\s+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')

      // Extract duration
      const durationMatch = html.match(/<meta\s+property="video:duration"\s+content="([0-9]+)"/) ||
                            html.match(/"duration":\s*([0-9]+)/)
      const duration = durationMatch ? parseInt(durationMatch[1], 10) : 600

      // Extract thumbnail
      const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/)
      const rawThumbnail = ogImageMatch ? ogImageMatch[1] : ''
      const localThumbnail = rawThumbnail ? await downloadThumbnailLocally(rawThumbnail) : 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60'

      // Extract video ID
      const match = url.match(/video-([a-zA-Z0-9]+)/)
      const videoId = match ? match[1] : ''
      const embedUrl = videoId ? `https://www.eporner.com/embed/${videoId}/` : url

      // Get categories and tags
      const categoryMatches = [...html.matchAll(/<li[^>]*class="vit-category"[^>]*><a[^>]*>([^<]+)<\/a><\/li>/gi)]
      const scrapedCategories = categoryMatches.map(m => m[1].trim())
      const primaryCatName = scrapedCategories[0] || 'Amateur'

      const tagMatches = [...html.matchAll(/<li[^>]*class="vit-tag"[^>]*><a[^>]*>([^<]+)<\/a><\/li>/gi)]
      const scrapedTags = tagMatches.map(m => m[1].trim())

      // Find or create category
      const cleanSlug = primaryCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      const category = await prisma.category.upsert({
        where: { slug: cleanSlug },
        update: {},
        create: {
          name: primaryCatName,
          slug: cleanSlug,
          description: `Watch premium videos in the ${primaryCatName} category on DesiSexy.in.`,
          thumbnail: localThumbnail,
          seoTitle: `Watch ${primaryCatName} Videos Online - DesiSexy.in`,
          seoDescription: `Stream the best high-definition ${primaryCatName} videos on DesiSexy.in.`
        }
      })

      // Create unique slug
      const videoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${videoId}`

      // Create video
      const createdVid = await prisma.video.upsert({
        where: { slug: videoSlug },
        update: {},
        create: {
          title,
          slug: videoSlug,
          description: `Watch ${title} in premium quality on DesiSexy.in. This high-definition ${primaryCatName} video is optimized for fast streaming and direct playback on our site.`,
          url: embedUrl,
          duration,
          format: 'embed',
          source: 'eporner',
          thumbnail: localThumbnail,
          categoryId: category.id,
          tags: Array.from(new Set(['eporner', primaryCatName.toLowerCase(), ...scrapedTags.map(t => t.toLowerCase())])).join(', '),
          isFeatured: true,
          seoTitle: `${title} - DesiSexy.in`,
          seoDescription: `Watch ${title} online in Full HD on DesiSexy.in.`
        }
      })

      console.log(`Successfully seeded video: ${createdVid.title}`)
    } catch (e: any) {
      console.warn(`Failed to seed video from URL ${url}: ${e.message}`)
    }
  }

  console.log('✅ Seeding completed successfully!')
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
