import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const persona = await prisma.persona.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        nameKo: true,
        title: true,
        bio: true,
        bioShort: true,
        imageUrl: true,
        sketchUrl: true,
        thumbnailUrl: true,
        color: true,
        accentColor: true,
        birthDate: true,
        nationality: true,
        occupation: true,
        companies: true,
        industries: true,
        twitterHandle: true,
        linkedinUrl: true,
        wikipediaUrl: true,
        officialWebsite: true,
        keyPhrases: true,
        values: true,
        expertise: true,
        visibility: true,
        totalDocuments: true,
        totalChunks: true,
        totalConversations: true,
        avgRating: true,
        topics: {
          select: {
            topic: true,
            sentiment: true,
            documentCount: true,
          },
          orderBy: { documentCount: 'desc' },
          take: 10,
        },
        aliases: {
          select: {
            alias: true,
            language: true,
          },
        },
        _count: {
          select: {
            sources: true,
            documents: true,
            characteristics: true,
          },
        },
      },
    })

    if (!persona) {
      return NextResponse.json(
        { success: false, error: 'Persona not found' },
        { status: 404 }
      )
    }

    // Check visibility
    if (persona.visibility === 'DRAFT' || persona.visibility === 'ARCHIVED') {
      return NextResponse.json(
        { success: false, error: 'Persona not available' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      persona,
    })
  } catch (error) {
    console.error('Persona API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch persona' },
      { status: 500 }
    )
  }
}
