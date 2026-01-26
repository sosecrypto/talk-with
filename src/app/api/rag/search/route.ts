import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { generateEmbedding } from '@/lib/openai'

export interface RAGChunk {
  id: string
  content: string
  documentTitle: string | null
  similarity: number
  metadata: Record<string, unknown> | null
}

export interface RAGSearchResult {
  success: boolean
  chunks: RAGChunk[]
  query: string
  personaSlug: string
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<RAGSearchResult>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, chunks: [], query: '', personaSlug: '', error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { query, personaSlug, topK = 5, threshold = 0.65 } = await request.json()

    if (!query || !personaSlug) {
      return NextResponse.json(
        { success: false, chunks: [], query: '', personaSlug: '', error: 'Query and personaSlug are required' },
        { status: 400 }
      )
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Call the match_chunks function in Supabase
    const supabase = getSupabaseAdmin()

    const { data: chunks, error } = await supabase.rpc('match_chunks', {
      query_embedding: queryEmbedding,
      persona_slug: personaSlug,
      match_threshold: threshold,
      match_count: topK,
    })

    if (error) {
      console.error('Supabase RPC error:', error)
      return NextResponse.json(
        { success: false, chunks: [], query, personaSlug, error: 'Search failed' },
        { status: 500 }
      )
    }

    const formattedChunks: RAGChunk[] = (chunks || []).map((chunk: {
      id: string
      content: string
      document_title: string | null
      similarity: number
      metadata?: Record<string, unknown> | null
    }) => ({
      id: chunk.id,
      content: chunk.content,
      documentTitle: chunk.document_title,
      similarity: chunk.similarity,
      metadata: chunk.metadata || null,
    }))

    return NextResponse.json({
      success: true,
      chunks: formattedChunks,
      query,
      personaSlug,
    })
  } catch (error) {
    console.error('RAG search error:', error)
    return NextResponse.json(
      { success: false, chunks: [], query: '', personaSlug: '', error: 'Internal server error' },
      { status: 500 }
    )
  }
}
