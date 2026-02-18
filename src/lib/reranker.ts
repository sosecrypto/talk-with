import { getCohereClient } from '@/lib/cohere'

interface RerankableChunk {
  id: string
  content: string
}

type RerankedChunk<T extends RerankableChunk> = T & {
  rerankScore: number
}

export async function rerankChunks<T extends RerankableChunk>(
  query: string,
  chunks: T[],
  topN?: number,
): Promise<RerankedChunk<T>[]> {
  if (chunks.length === 0) return []

  const effectiveTopN = topN ?? chunks.length

  try {
    const cohere = getCohereClient()

    const response = await cohere.v2.rerank({
      model: 'rerank-v3.5',
      query,
      documents: chunks.map(c => c.content),
      topN: effectiveTopN,
    })

    const sorted = [...response.results].sort(
      (a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0),
    )

    return sorted.map(result => ({
      ...chunks[result.index],
      rerankScore: result.relevanceScore ?? 0,
    }))
  } catch (error) {
    console.error('Cohere rerank failed, returning original order:', error)

    return chunks.slice(0, effectiveTopN).map(chunk => ({
      ...chunk,
      rerankScore: 0,
    }))
  }
}
