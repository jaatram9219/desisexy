import { prisma } from './prisma'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  thumbnail?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  createdAt: Date
}

export interface Video {
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
  createdAt: Date
  updatedAt: Date
  tags: string[]
  categoryId: string
  seoTitle?: string | null
  seoDescription?: string | null
  ogImage?: string | null
  schemaMarkup?: any
}

export interface AdCampaign {
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
  createdAt: Date
}

export interface User {
  id: string
  email: string
  passwordHash: string
  name: string
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'USER'
  createdAt: Date
}

export interface Setting {
  id: string
  key: string
  value: string
}

export const dbService = {
  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return await prisma.category.findUnique({
      where: { slug }
    })
  },

  async createCategory(data: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    return await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        thumbnail: data.thumbnail,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription
      }
    })
  },

  async updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<Category> {
    return await prisma.category.update({
      where: { id },
      data
    })
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await prisma.category.delete({
        where: { id }
      })
      return true
    } catch (e) {
      console.error('Delete category error:', e)
      return false
    }
  },

  // --- VIDEOS ---
  async getVideos(params?: { categoryId?: string; isFeatured?: boolean; search?: string }): Promise<Video[]> {
    const where: any = {}
    if (params?.categoryId) where.categoryId = params.categoryId
    if (params?.isFeatured !== undefined) where.isFeatured = params.isFeatured
    if (params?.search) {
      where.OR = [
        { title: { contains: params.search } },
        { description: { contains: params.search } },
        { tags: { contains: params.search } }
      ]
    }
    
    const vids = await prisma.video.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return vids.map(v => ({
      ...v,
      tags: v.tags ? v.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      schemaMarkup: v.schemaMarkup ? JSON.parse(v.schemaMarkup) : undefined
    }))
  },

  async getVideoBySlug(slug: string): Promise<Video | null> {
    const v = await prisma.video.findUnique({
      where: { slug }
    })
    if (!v) return null
    return {
      ...v,
      tags: v.tags ? v.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      schemaMarkup: v.schemaMarkup ? JSON.parse(v.schemaMarkup) : undefined
    }
  },

  async createVideo(data: Omit<Video, 'id' | 'views' | 'createdAt' | 'updatedAt'>): Promise<Video> {
    let finalSlug = data.slug
    let isUnique = false
    let counter = 0

    while (!isUnique) {
      const check = await prisma.video.findUnique({
        where: { slug: finalSlug }
      })
      if (!check) {
        isUnique = true
      } else {
        counter++
        finalSlug = `${data.slug}-${counter}`
      }
    }

    const created = await prisma.video.create({
      data: {
        title: data.title,
        slug: finalSlug,
        description: data.description,
        url: data.url,
        duration: data.duration,
        format: data.format,
        source: data.source,
        thumbnail: data.thumbnail,
        isFeatured: data.isFeatured,
        tags: Array.isArray(data.tags) ? data.tags.join(',') : (data.tags || ''),
        categoryId: data.categoryId,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        ogImage: data.ogImage,
        schemaMarkup: data.schemaMarkup ? JSON.stringify(data.schemaMarkup) : null
      }
    })
    return {
      ...created,
      tags: created.tags ? created.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      schemaMarkup: created.schemaMarkup ? JSON.parse(created.schemaMarkup) : undefined
    }
  },

  async updateVideo(id: string, data: Partial<Omit<Video, 'id' | 'views' | 'createdAt' | 'updatedAt'>>): Promise<Video> {
    const updateData: any = { ...data }
    if (data.tags) {
      updateData.tags = Array.isArray(data.tags) ? data.tags.join(',') : data.tags
    }
    if (data.schemaMarkup !== undefined) {
      updateData.schemaMarkup = data.schemaMarkup ? JSON.stringify(data.schemaMarkup) : null
    }

    const updated = await prisma.video.update({
      where: { id },
      data: updateData
    })
    return {
      ...updated,
      tags: updated.tags ? updated.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      schemaMarkup: updated.schemaMarkup ? JSON.parse(updated.schemaMarkup) : undefined
    }
  },

  async deleteVideo(id: string): Promise<boolean> {
    try {
      await prisma.video.delete({
        where: { id }
      })
      return true
    } catch (e) {
      console.error('Delete video error:', e)
      return false
    }
  },

  async incrementViews(id: string): Promise<number> {
    const updated = await prisma.video.update({
      where: { id },
      data: { views: { increment: 1 } }
    })
    return updated.views
  },

  // --- AD CAMPAIGNS ---
  async getAdCampaigns(): Promise<AdCampaign[]> {
    return (await prisma.adCampaign.findMany()) as AdCampaign[]
  },

  async getAdCampaignsByPlacement(placement: AdCampaign['placement']): Promise<AdCampaign[]> {
    return (await prisma.adCampaign.findMany({
      where: { placement, active: true }
    })) as AdCampaign[]
  },

  async createAdCampaign(data: Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'createdAt'>): Promise<AdCampaign> {
    return (await prisma.adCampaign.create({
      data: {
        name: data.name,
        placement: data.placement,
        code: data.code,
        isHtml: data.isHtml,
        imageUrl: data.imageUrl,
        targetUrl: data.targetUrl,
        active: data.active,
        videoInterval: data.videoInterval
      }
    })) as AdCampaign
  },

  async updateAdCampaign(id: string, data: Partial<Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'createdAt'>>): Promise<AdCampaign> {
    return (await prisma.adCampaign.update({
      where: { id },
      data
    })) as AdCampaign
  },

  async deleteAdCampaign(id: string): Promise<boolean> {
    try {
      await prisma.adCampaign.delete({
        where: { id }
      })
      return true
    } catch (e) {
      console.error('Delete ad campaign error:', e)
      return false
    }
  },

  async logAdImpression(id: string): Promise<void> {
    await prisma.adCampaign.update({
      where: { id },
      data: { impressions: { increment: 1 } }
    })
  },

  async logAdClick(id: string): Promise<void> {
    await prisma.adCampaign.update({
      where: { id },
      data: { clicks: { increment: 1 } }
    })
  },

  // --- SETTINGS ---
  async getSettings(): Promise<Setting[]> {
    return await prisma.setting.findMany()
  },

  async getSetting(key: string, defaultValue: string): Promise<string> {
    const set = await prisma.setting.findUnique({
      where: { key }
    })
    return set ? set.value : defaultValue
  },

  async updateSetting(key: string, value: string): Promise<void> {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })
  },

  // --- USER PROFILE ---
  async getUserByEmail(email: string): Promise<User | null> {
    return (await prisma.user.findUnique({
      where: { email }
    })) as User | null
  },

  async getFavorites(userId: string): Promise<Video[]> {
    const favs = await prisma.favorite.findMany({
      where: { userId },
      include: { video: true }
    })
    return favs.map(f => ({
      ...f.video,
      tags: f.video.tags ? f.video.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      schemaMarkup: f.video.schemaMarkup ? JSON.parse(f.video.schemaMarkup) : undefined
    }))
  },

  async toggleFavorite(userId: string, videoId: string): Promise<boolean> {
    const existing = await prisma.favorite.findUnique({
      where: { userId_videoId: { userId, videoId } }
    })
    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id }
      })
      return false
    } else {
      await prisma.favorite.create({
        data: { userId, videoId }
      })
      return true
    }
  },

  async getHistory(userId: string): Promise<Video[]> {
    const hist = await prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { watchedAt: 'desc' },
      include: { video: true },
      take: 50
    })
    return hist.map(h => ({
      ...h.video,
      tags: h.video.tags ? h.video.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      schemaMarkup: h.video.schemaMarkup ? JSON.parse(h.video.schemaMarkup) : undefined
    }))
  },

  async addToHistory(userId: string, videoId: string): Promise<void> {
    await prisma.watchHistory.create({
      data: { userId, videoId }
    })
  },

  async logVisit(ip: string): Promise<void> {
    try {
      const crypto = require('crypto')
      const date = new Date().toISOString().split('T')[0]
      const ipHash = crypto.createHash('sha256').update(ip).digest('hex')

      await prisma.visitorLog.upsert({
        where: {
          date_ipHash: { date, ipHash }
        },
        create: { date, ipHash },
        update: {}
      })
    } catch (err) {
      // Ignore concurrency conflicts
    }
  },

  async getVisitorStats(): Promise<{ todayUnique: number; totalUnique: number }> {
    try {
      const date = new Date().toISOString().split('T')[0]
      const todayUnique = await prisma.visitorLog.count({
        where: { date }
      })
      // Total unique combinations of date + ipHash (representing sum of daily unique visits)
      const totalUnique = await prisma.visitorLog.count()
      return { todayUnique, totalUnique }
    } catch (err) {
      console.error('Error getting visitor stats:', err)
      return { todayUnique: 0, totalUnique: 0 }
    }
  }
}
