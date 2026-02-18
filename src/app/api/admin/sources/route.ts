import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'
import { validateCreateSource } from '@/lib/validators/source-validator'

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

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const validationError = validateCreateSource(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const source = await prisma.source.create({
      data: {
        personaId: body.personaId,
        type: body.type,
        name: body.name,
        description: body.description ?? null,
        url: body.url ?? null,
        config: body.config ?? null,
        fetchFrequency: body.fetchFrequency ?? null,
        status: 'PENDING',
        priority: 0,
      },
    })

    return NextResponse.json(source, { status: 201 })
  } catch (err) {
    console.error('Admin create source error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
