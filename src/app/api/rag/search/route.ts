import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { generateEmbedding } from '@/lib/openai'
import { rerankChunks } from '@/lib/reranker'

const isDev = process.env.NODE_ENV === 'development'

export interface RAGChunk {
  id: string
  content: string
  documentTitle: string | null
  similarity: number
  keywordRank: number | null
  combinedScore: number | null
  rerankScore: number | null
  metadata: Record<string, unknown> | null
}

export interface RAGSearchResult {
  success: boolean
  chunks: RAGChunk[]
  query: string
  personaSlug: string
  searchMode: 'hybrid+rerank' | 'hybrid' | 'vector'
  error?: string
}

interface HybridChunkRow {
  id: string
  content: string
  document_title: string | null
  similarity: number
  keyword_rank?: number | null
  combined_score?: number | null
  metadata?: Record<string, unknown> | null
}

export async function POST(request: NextRequest): Promise<NextResponse<RAGSearchResult>> {
  try {
    const session = await getServerSession(authOptions)

    if (!isDev && !session?.user?.id) {
      return NextResponse.json(
        { success: false, chunks: [], query: '', personaSlug: '', searchMode: 'hybrid', error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      query,
      personaSlug,
      topK = 5,
      threshold = 0.65,
      useHybrid = true,
      useRerank = true,
      keywordWeight = 0.3,
    } = await request.json()

    if (!query || !personaSlug) {
      return NextResponse.json(
        { success: false, chunks: [], query: '', personaSlug: '', searchMode: 'hybrid', error: 'Query and personaSlug are required' },
        { status: 400 }
      )
    }

    const queryEmbedding = await generateEmbedding(query)
    const supabase = getSupabaseAdmin()

    const fetchCount = useRerank ? topK * 3 : topK

    const { data: chunks, error } = useHybrid
      ? await supabase.rpc('hybrid_search_chunks', {
          query_embedding: queryEmbedding,
          query_text: query,
          persona_slug: personaSlug,
          match_count: fetchCount,
          vector_threshold: threshold,
          keyword_weight: keywordWeight,
          rrf_k: 60,
        })
      : await supabase.rpc('match_chunks', {
          query_embedding: queryEmbedding,
          persona_slug: personaSlug,
          match_threshold: threshold,
          match_count: fetchCount,
        })

    if (error) {
      console.error('Supabase RPC error:', error)
      return NextResponse.json(
        { success: false, chunks: [], query, personaSlug, searchMode: 'hybrid', error: 'Search failed' },
        { status: 500 }
      )
    }

    const formattedChunks: RAGChunk[] = (chunks || []).map((chunk: HybridChunkRow) => ({
      id: chunk.id,
      content: chunk.content,
      documentTitle: chunk.document_title,
      similarity: chunk.similarity,
      keywordRank: chunk.keyword_rank ?? null,
      combinedScore: chunk.combined_score ?? null,
      rerankScore: null,
      metadata: chunk.metadata || null,
    }))

    if (useRerank && formattedChunks.length > 0) {
      const reranked = await rerankChunks(query, formattedChunks, topK)

      const searchMode: RAGSearchResult['searchMode'] = useHybrid ? 'hybrid+rerank' : 'vector'

      return NextResponse.json({
        success: true,
        chunks: reranked,
        query,
        personaSlug,
        searchMode,
      })
    }

    const searchMode: RAGSearchResult['searchMode'] = useHybrid ? 'hybrid' : 'vector'

    return NextResponse.json({
      success: true,
      chunks: formattedChunks,
      query,
      personaSlug,
      searchMode,
    })
  } catch (error) {
    console.error('RAG search error:', error)
    return NextResponse.json(
      { success: false, chunks: [], query: '', personaSlug: '', searchMode: 'hybrid', error: 'Internal server error' },
      { status: 500 }
    )
  }
}
