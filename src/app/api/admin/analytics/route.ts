import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'

function getPeriodDate(period: string): Date {
  const now = new Date()
  switch (period) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case '30d':
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const period = request.nextUrl.searchParams.get('period') || '30d'
    const sinceDate = getPeriodDate(period)

    const [
      conversationsByPersona,
      personas,
      dailyConversations,
      tokenAggregate,
      feedbackAggregate,
      feedbackByType,
      thumbsUpCount,
      topUsers,
    ] = await Promise.all([
      // Persona stats
      prisma.conversation.groupBy({
        by: ['personaId'],
        _count: { id: true },
        where: { personaId: { not: null } },
      }),
      prisma.persona.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          totalConversations: true,
          avgRating: true,
        },
      }),
      // Daily conversations (raw query for date grouping)
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM conversations
        WHERE created_at >= ${sinceDate} AND deleted_at IS NULL
        GROUP BY DATE(created_at)
        ORDER BY date
      `,
      // Token stats
      prisma.message.aggregate({
        _sum: { inputTokens: true, outputTokens: true },
        _avg: { inputTokens: true, outputTokens: true },
        where: { createdAt: { gte: sinceDate } },
      }),
      // Feedback aggregate
      prisma.conversationFeedback.aggregate({
        _avg: { rating: true },
        _count: { id: true },
        where: { createdAt: { gte: sinceDate } },
      }),
      // Feedback by type
      prisma.conversationFeedback.groupBy({
        by: ['feedbackType'],
        _count: { id: true },
        where: { createdAt: { gte: sinceDate } },
      }),
      // Thumbs up count
      prisma.conversationFeedback.count({
        where: { thumbsUp: true, createdAt: { gte: sinceDate } },
      }),
      // Top users
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          _count: { select: { conversations: true } },
        },
        orderBy: { conversations: { _count: 'desc' } },
        take: 10,
      }),
    ])

    // Build persona stats
    const personaMap = new Map(personas.map(p => [p.id, p]))
    const personaStats = conversationsByPersona.map(group => {
      const persona = personaMap.get(group.personaId!)
      return {
        personaId: group.personaId,
        name: persona?.name || 'Unknown',
        slug: persona?.slug || '',
        conversationCount: group._count.id,
        avgRating: persona?.avgRating,
      }
    }).sort((a, b) => b.conversationCount - a.conversationCount)

    // Format daily conversations (handle BigInt from raw query)
    const formattedDailyConversations = (dailyConversations as Array<{ date: string | Date; count: number | bigint }>).map(row => ({
      date: typeof row.date === 'string' ? row.date : new Date(row.date).toISOString().split('T')[0],
      count: typeof row.count === 'bigint' ? Number(row.count) : row.count,
    }))

    // Token stats
    const tokenStats = {
      totalInput: tokenAggregate._sum.inputTokens || 0,
      totalOutput: tokenAggregate._sum.outputTokens || 0,
      avgInput: Math.round(tokenAggregate._avg.inputTokens || 0),
      avgOutput: Math.round(tokenAggregate._avg.outputTokens || 0),
    }

    // Feedback stats
    const totalFeedbackCount = feedbackAggregate._count.id
    const typeDistribution = feedbackByType.map(group => ({
      type: group.feedbackType || 'other',
      count: group._count.id,
    }))

    const feedbackStats = {
      avgRating: feedbackAggregate._avg.rating ? Number(feedbackAggregate._avg.rating.toFixed(1)) : null,
      totalCount: totalFeedbackCount,
      thumbsUpCount,
      thumbsUpRate: totalFeedbackCount > 0 ? Number((thumbsUpCount / totalFeedbackCount * 100).toFixed(1)) : 0,
      typeDistribution,
    }

    // Top users
    const formattedTopUsers = topUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      conversationCount: u._count.conversations,
    }))

    return NextResponse.json({
      personaStats,
      dailyConversations: formattedDailyConversations,
      tokenStats,
      feedbackStats,
      topUsers: formattedTopUsers,
    })
  } catch (err) {
    console.error('Admin analytics error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
