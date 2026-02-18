import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const sources = await prisma.source.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        lastFetchedAt: true,
        totalDocuments: true,
        totalFetches: true,
        successFetches: true,
        failedFetches: true,
        consecutiveFailures: true,
        lastError: true,
        persona: { select: { name: true, slug: true } },
      },
    })

    return NextResponse.json(sources)
  } catch (err) {
    console.error('Admin sources error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
