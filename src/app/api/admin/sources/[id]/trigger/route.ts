import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params

    const source = await prisma.source.findUnique({ where: { id } })
    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    if (source.status === 'ARCHIVED') {
      return NextResponse.json(
        { error: 'Cannot trigger an archived source' },
        { status: 400 }
      )
    }

    await prisma.source.update({
      where: { id },
      data: { nextFetchAt: new Date() },
    })

    return NextResponse.json({
      message: `Source "${source.name}" triggered for immediate fetch`,
    })
  } catch (err) {
    console.error('Admin trigger source error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
