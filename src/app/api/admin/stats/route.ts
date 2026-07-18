import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbService } from '@/lib/dbService'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSessionToken = cookieStore.get('admin_session')?.value
    const adminKey = process.env.ADMIN_SECRET_KEY || 'edb1e1d2340985f9b5c86dfafa10d5c3cbfb1fede40ee17097e4c35111aae50f'

    // Verify Admin authentication
    if (!adminSessionToken || adminSessionToken !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Get real unique daily visitor logs
    const visitorStats = await dbService.getVisitorStats()

    // 2. Calculate real total video views
    const allVideos = await dbService.getVideos()
    const totalViews = allVideos.reduce((acc, curr) => acc + curr.views, 0)

    // 3. Get CPM rate from settings (default to 1.50 USD per 1000 views)
    const cpmRateSetting = await dbService.getSetting('cpm_rate', '1.50')
    const cpmRate = parseFloat(cpmRateSetting) || 1.50

    // 4. Calculate estimated revenue
    const estimatedRevenue = ((totalViews / 1000) * cpmRate).toFixed(2)

    return NextResponse.json({
      todayUnique: visitorStats.todayUnique,
      totalUnique: visitorStats.totalUnique,
      totalViews,
      cpmRate,
      estimatedRevenue
    })
  } catch (err: any) {
    console.error('API admin stats error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
