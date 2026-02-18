import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const [
      documentTotal,
      documentsByStatus,
      chunksTotal,
      chunksEmbedded,
      sourcesByStatus,
      recentFetchLogs,
    ] = await Promise.all([
      prisma.document.count(),
      prisma.document.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.chunk.count(),
      prisma.chunk.count({ where: { embeddedAt: { not: null } } }),
      prisma.source.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.fetchLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { source: { select: { name: true, type: true } } },
      }),
    ])

    return NextResponse.json({
      documents: {
        total: documentTotal,
        byStatus: documentsByStatus,
      },
      chunks: {
        total: chunksTotal,
        embedded: chunksEmbedded,
      },
      sources: {
        byStatus: sourcesByStatus,
      },
      recentFetchLogs,
    })
  } catch (err) {
    console.error('Admin pipeline error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
