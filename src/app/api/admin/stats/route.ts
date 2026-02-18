import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const [userCount, conversationCount, messageCount, sourceCount, documentCount, chunkCount, tokenAgg] =
      await Promise.all([
        prisma.user.count(),
        prisma.conversation.count(),
        prisma.message.count(),
        prisma.source.count(),
        prisma.document.count(),
        prisma.chunk.count(),
        prisma.conversation.aggregate({ _sum: { totalTokens: true } }),
      ])

    return NextResponse.json({
      userCount,
      conversationCount,
      messageCount,
      totalTokens: tokenAgg._sum.totalTokens || 0,
      sourceCount,
      documentCount,
      chunkCount,
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
