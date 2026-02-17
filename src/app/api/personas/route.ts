import { NextResponse } from 'next/server'
import { listPublicPersonas } from '@/lib/prompt-generator'

export interface PersonaListItem {
  id: string
  slug: string
  name: string
  nameKo: string | null
  imageUrl: string | null
  bioShort: string | null
  color: string | null
  accentColor: string | null
  totalDocuments: number
  totalConversations: number
}

export async function GET() {
  try {
    const personas = await listPublicPersonas()

    return NextResponse.json({
      success: true,
      personas: personas as PersonaListItem[],
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Personas API error:', error)
    return NextResponse.json(
      { success: false, personas: [], error: 'Failed to fetch personas' },
      { status: 500 }
    )
  }
}
