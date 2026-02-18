import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'
import { validateSourceStatus } from '@/lib/validators/source-validator'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.source.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    if (body.status && !validateSourceStatus(body.status)) {
      return NextResponse.json(
        { error: `Invalid source status: ${body.status}` },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (body.name) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.url !== undefined) updateData.url = body.url
    if (body.config !== undefined) updateData.config = body.config
    if (body.status) updateData.status = body.status
    if (body.fetchFrequency !== undefined) updateData.fetchFrequency = body.fetchFrequency
    if (body.priority !== undefined) updateData.priority = body.priority

    const updated = await prisma.source.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('Admin update source error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params

    const updated = await prisma.source.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        deletedAt: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('Admin delete source error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
