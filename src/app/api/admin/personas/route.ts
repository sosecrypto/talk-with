import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const personas = await prisma.persona.findMany({
      orderBy: { priority: 'desc' },
      select: {
        id: true,
        slug: true,
        name: true,
        nameKo: true,
        visibility: true,
        isActive: true,
        totalDocuments: true,
        totalChunks: true,
        totalConversations: true,
        avgRating: true,
        imageUrl: true,
        accentColor: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(personas)
  } catch (err) {
    console.error('Admin personas GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { slug, name, ...rest } = body

    if (!slug || !name) {
      return NextResponse.json({ error: 'slug and name are required' }, { status: 400 })
    }

    const persona = await prisma.persona.create({
      data: { slug, name, ...rest },
    })

    return NextResponse.json(persona, { status: 201 })
  } catch (err) {
    console.error('Admin personas POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
