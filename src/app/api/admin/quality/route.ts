import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'

const VALID_PERIODS = ['7d', '30d', '90d', '365d']

function getPeriodDays(period: string): number {
  switch (period) {
    case '7d': return 7
    case '90d': return 90
    case '365d': return 365
    default: return 30
  }
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const periodParam = searchParams.get('period') || '30d'
    const period = VALID_PERIODS.includes(periodParam) ? periodParam : '30d'
    const days = getPeriodDays(period)
    const since = new Date()
    since.setDate(since.getDate() - days)

    const [totalCount, thumbsUpCount, thumbsDownCount, avgResult] = await Promise.all([
      prisma.conversationFeedback.count({
        where: { createdAt: { gte: since } },
      }),
      prisma.conversationFeedback.count({
        where: { createdAt: { gte: since }, thumbsUp: true },
      }),
      prisma.conversationFeedback.count({
        where: { createdAt: { gte: since }, thumbsUp: false },
      }),
      prisma.conversationFeedback.aggregate({
        where: { createdAt: { gte: since } },
        _avg: { rating: true },
      }),
    ])

    const thumbsUpRate = totalCount > 0 ? thumbsUpCount / totalCount : 0

    const personaQuality = await prisma.$queryRaw`
      SELECT
        p.id as "personaId",
        p.name as "personaName",
        p.slug as "personaSlug",
        COUNT(cf.id)::int as "totalFeedback",
        COUNT(CASE WHEN cf.thumbs_up = true THEN 1 END)::int as "thumbsUpCount",
        AVG(cf.rating) as "avgRating"
      FROM conversation_feedbacks cf
      JOIN conversations c ON cf.conversation_id = c.id
      JOIN personas p ON c.persona_id = p.id
      WHERE cf.created_at >= ${since}
      GROUP BY p.id, p.name, p.slug
      ORDER BY COUNT(cf.id) DESC
    `

    const feedbackTrend = await prisma.$queryRaw`
      SELECT
        DATE(cf.created_at) as "date",
        COUNT(CASE WHEN cf.thumbs_up = true THEN 1 END)::int as "thumbsUpCount",
        COUNT(CASE WHEN cf.thumbs_up = false THEN 1 END)::int as "thumbsDownCount"
      FROM conversation_feedbacks cf
      WHERE cf.created_at >= ${since}
      GROUP BY DATE(cf.created_at)
      ORDER BY DATE(cf.created_at) ASC
    `

    const typeDistribution = await prisma.conversationFeedback.groupBy({
      by: ['feedbackType'],
      where: { createdAt: { gte: since }, feedbackType: { not: null } },
      _count: { id: true },
    })

    return NextResponse.json({
      overallQuality: {
        thumbsUpRate,
        avgRating: avgResult._avg.rating || 0,
        totalFeedbackCount: totalCount,
        thumbsUpCount,
        thumbsDownCount,
      },
      personaQuality: (personaQuality as Array<Record<string, unknown>>).map(p => ({
        ...p,
        thumbsUpRate: Number(p.totalFeedback) > 0
          ? Number(p.thumbsUpCount) / Number(p.totalFeedback)
          : 0,
      })),
      feedbackTrend: (feedbackTrend as Array<Record<string, unknown>>).map(t => ({
        ...t,
        thumbsUpRate: (Number(t.thumbsUpCount) + Number(t.thumbsDownCount)) > 0
          ? Number(t.thumbsUpCount) / (Number(t.thumbsUpCount) + Number(t.thumbsDownCount))
          : 0,
      })),
      typeDistribution: typeDistribution.map(t => ({
        type: t.feedbackType,
        count: t._count.id,
      })),
    })
  } catch (error) {
    console.error('Quality analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
