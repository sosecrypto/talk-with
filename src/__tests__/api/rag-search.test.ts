import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  generateEmbedding: vi.fn(),
  rpc: vi.fn(),
  rerankChunks: vi.fn(),
}))

vi.mock('next-auth', () => ({ getServerSession: mocks.getServerSession }))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))
vi.mock('@/lib/openai', () => ({ generateEmbedding: mocks.generateEmbedding }))
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin: () => ({ rpc: mocks.rpc }) }))
vi.mock('@/lib/reranker', () => ({ rerankChunks: mocks.rerankChunks }))

import { POST } from '@/app/api/rag/search/route'

const MOCK_SESSION = { user: { id: 'user-1' }, expires: '2099-01-01' }
const MOCK_EMBEDDING = Array(1536).fill(0.1)

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/rag/search', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/rag/search', () => {
  beforeEach(() => {
    Object.values(mocks).forEach(m => m.mockReset())
    mocks.generateEmbedding.mockResolvedValue(MOCK_EMBEDDING)
    // 기본적으로 reranker는 입력을 그대로 반환 (rerankScore 추가)
    mocks.rerankChunks.mockImplementation((_q: string, chunks: Array<{ id: string }>) =>
      Promise.resolve(chunks.map((c: { id: string }) => ({ ...c, rerankScore: 0.9 })))
    )
  })

  it('인증 없으면 401을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(null)

    const req = createRequest({ query: 'test', personaSlug: 'elon-musk' })
    const response = await POST(req)

    expect(response.status).toBe(401)
  })

  it('query가 없으면 400을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)

    const req = createRequest({ personaSlug: 'elon-musk' })
    const response = await POST(req)

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toContain('required')
  })

  it('personaSlug가 없으면 400을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)

    const req = createRequest({ query: 'test' })
    const response = await POST(req)

    expect(response.status).toBe(400)
  })

  it('정상 요청 시 RAG 검색 결과를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
    mocks.rpc.mockResolvedValue({
      data: [
        { id: 'c-1', content: 'AI is important', document_title: 'Interview', similarity: 0.9, metadata: null },
      ],
      error: null,
    })

    const req = createRequest({ query: 'Tell me about AI', personaSlug: 'elon-musk' })
    const response = await POST(req)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.chunks).toHaveLength(1)
    expect(json.chunks[0].documentTitle).toBe('Interview')
  })

  it('Supabase RPC에 올바른 파라미터를 전달한다 (rerank 시 topK*3 over-fetch)', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
    mocks.rpc.mockResolvedValue({ data: [], error: null })

    const req = createRequest({ query: 'test', personaSlug: 'elon-musk', topK: 3, threshold: 0.7 })
    await POST(req)

    expect(mocks.rpc).toHaveBeenCalledWith('hybrid_search_chunks', expect.objectContaining({
      query_embedding: MOCK_EMBEDDING,
      query_text: 'test',
      persona_slug: 'elon-musk',
      vector_threshold: 0.7,
      match_count: 9,
    }))
  })

  it('기본 topK=5, threshold=0.65를 사용한다 (rerank 시 match_count=15)', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
    mocks.rpc.mockResolvedValue({ data: [], error: null })

    const req = createRequest({ query: 'test', personaSlug: 'elon-musk' })
    await POST(req)

    expect(mocks.rpc).toHaveBeenCalledWith('hybrid_search_chunks', expect.objectContaining({
      vector_threshold: 0.65,
      match_count: 15,
    }))
  })

  it('Supabase RPC 에러 시 500을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'DB error' } })

    const req = createRequest({ query: 'test', personaSlug: 'elon-musk' })
    const response = await POST(req)

    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.success).toBe(false)
  })

  it('빈 결과 시 빈 chunks 배열을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
    mocks.rpc.mockResolvedValue({ data: [], error: null })

    const req = createRequest({ query: 'test', personaSlug: 'elon-musk' })
    const response = await POST(req)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.chunks).toEqual([])
  })

  it('null data 시 빈 chunks 배열을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
    mocks.rpc.mockResolvedValue({ data: null, error: null })

    const req = createRequest({ query: 'test', personaSlug: 'elon-musk' })
    const response = await POST(req)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.chunks).toEqual([])
  })

  it('document_title을 documentTitle로 변환한다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
    mocks.rpc.mockResolvedValue({
      data: [{ id: 'c-1', content: 'test', document_title: 'My Doc', similarity: 0.8 }],
      error: null,
    })

    const req = createRequest({ query: 'test', personaSlug: 'elon-musk' })
    const response = await POST(req)
    const json = await response.json()

    expect(json.chunks[0].documentTitle).toBe('My Doc')
    expect(json.chunks[0]).not.toHaveProperty('document_title')
  })

  it('잘못된 JSON body면 500을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)

    const req = new NextRequest('http://localhost:3000/api/rag/search', {
      method: 'POST',
      body: 'bad json',
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)

    expect(response.status).toBe(500)
  })

  describe('하이브리드 검색', () => {
    it('기본 요청 시 hybrid_search_chunks RPC를 호출한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.rpc.mockResolvedValue({
        data: [
          { id: 'c-1', content: 'Tesla info', document_title: 'Doc', similarity: 0.85, keyword_rank: 1, combined_score: 0.016, metadata: null },
        ],
        error: null,
      })

      const req = createRequest({ query: 'Tesla', personaSlug: 'elon-musk' })
      await POST(req)

      expect(mocks.rpc).toHaveBeenCalledWith('hybrid_search_chunks', expect.objectContaining({
        query_embedding: MOCK_EMBEDDING,
        query_text: 'Tesla',
        persona_slug: 'elon-musk',
      }))
    })

    it('hybrid_search_chunks에 keyword_weight와 rrf_k 파라미터를 전달한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.rpc.mockResolvedValue({ data: [], error: null })

      const req = createRequest({ query: 'test', personaSlug: 'elon-musk', keywordWeight: 0.5 })
      await POST(req)

      expect(mocks.rpc).toHaveBeenCalledWith('hybrid_search_chunks', expect.objectContaining({
        keyword_weight: 0.5,
        rrf_k: 60,
      }))
    })

    it('기본 keywordWeight=0.3을 사용한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.rpc.mockResolvedValue({ data: [], error: null })

      const req = createRequest({ query: 'test', personaSlug: 'elon-musk' })
      await POST(req)

      expect(mocks.rpc).toHaveBeenCalledWith('hybrid_search_chunks', expect.objectContaining({
        keyword_weight: 0.3,
      }))
    })

    it('응답에 keywordRank, combinedScore 필드를 포함한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.rpc.mockResolvedValue({
        data: [
          { id: 'c-1', content: 'test', document_title: 'Doc', similarity: 0.85, keyword_rank: 2, combined_score: 0.016, metadata: null },
        ],
        error: null,
      })

      const req = createRequest({ query: 'test', personaSlug: 'elon-musk' })
      const response = await POST(req)
      const json = await response.json()

      expect(json.chunks[0].keywordRank).toBe(2)
      expect(json.chunks[0].combinedScore).toBe(0.016)
    })

    it('응답에 searchMode: "hybrid"를 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.rpc.mockResolvedValue({ data: [], error: null })

      const req = createRequest({ query: 'test', personaSlug: 'elon-musk' })
      const response = await POST(req)
      const json = await response.json()

      expect(json.searchMode).toBe('hybrid')
    })

    it('useHybrid=false 시 기존 match_chunks를 호출한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.rpc.mockResolvedValue({ data: [], error: null })

      const req = createRequest({ query: 'test', personaSlug: 'elon-musk', useHybrid: false })
      await POST(req)

      expect(mocks.rpc).toHaveBeenCalledWith('match_chunks', expect.objectContaining({
        query_embedding: MOCK_EMBEDDING,
        persona_slug: 'elon-musk',
      }))
    })

    it('useHybrid=false 시 searchMode: "vector"를 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.rpc.mockResolvedValue({ data: [], error: null })

      const req = createRequest({ query: 'test', personaSlug: 'elon-musk', useHybrid: false })
      const response = await POST(req)
      const json = await response.json()

      expect(json.searchMode).toBe('vector')
    })

    it('keyword_rank가 null이면 keywordRank를 null로 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.rpc.mockResolvedValue({
        data: [
          { id: 'c-1', content: 'test', document_title: 'Doc', similarity: 0.8, keyword_rank: null, combined_score: 0.011, metadata: null },
        ],
        error: null,
      })

      const req = createRequest({ query: 'test', personaSlug: 'elon-musk' })
      const response = await POST(req)
      const json = await response.json()

      expect(json.chunks[0].keywordRank).toBeNull()
    })
  })

  describe('Reranking', () => {
    it('기본 요청 시 rerankChunks를 호출한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.rpc.mockResolvedValue({
        data: [
          { id: 'c-1', content: 'AI content', document_title: 'Doc', similarity: 0.9, metadata: null },
          { id: 'c-2', content: 'ML content', document_title: 'Doc2', similarity: 0.8, metadata: null },
        ],
        error: null,
      })
      mocks.rerankChunks.mockResolvedValue([
        { id: 'c-2', content: 'ML content', documentTitle: 'Doc2', similarity: 0.8, keywordRank: null, combinedScore: null, metadata: null, rerankScore: 0.95 },
        { id: 'c-1', content: 'AI content', documentTitle: 'Doc', similarity: 0.9, keywordRank: null, combinedScore: null, metadata: null, rerankScore: 0.85 },
      ])

      const req = createRequest({ query: 'machine learning', personaSlug: 'elon-musk' })
      const response = await POST(req)
      const json = await response.json()

      expect(mocks.rerankChunks).toHaveBeenCalledWith(
        'machine learning',
        expect.arrayContaining([
          expect.objectContaining({ id: 'c-1' }),
          expect.objectContaining({ id: 'c-2' }),
        ]),
        5,
      )
      expect(json.chunks[0].id).toBe('c-2')
      expect(json.searchMode).toBe('hybrid+rerank')
    })

    it('useRerank=false 시 rerankChunks를 호출하지 않는다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.rpc.mockResolvedValue({
        data: [
          { id: 'c-1', content: 'test', document_title: 'Doc', similarity: 0.9, metadata: null },
        ],
        error: null,
      })

      const req = createRequest({ query: 'test', personaSlug: 'elon-musk', useRerank: false })
      const response = await POST(req)
      const json = await response.json()

      expect(mocks.rerankChunks).not.toHaveBeenCalled()
      expect(json.searchMode).toBe('hybrid')
    })

    it('useRerank=false 시 DB에서 topK개만 가져온다 (over-fetch 안 함)', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.rpc.mockResolvedValue({ data: [], error: null })

      const req = createRequest({ query: 'test', personaSlug: 'elon-musk', topK: 3, useRerank: false })
      await POST(req)

      expect(mocks.rpc).toHaveBeenCalledWith('hybrid_search_chunks', expect.objectContaining({
        match_count: 3,
      }))
    })

    it('응답에 rerankScore 필드를 포함한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.rpc.mockResolvedValue({
        data: [
          { id: 'c-1', content: 'test', document_title: 'Doc', similarity: 0.9, metadata: null },
        ],
        error: null,
      })
      mocks.rerankChunks.mockResolvedValue([
        { id: 'c-1', content: 'test', documentTitle: 'Doc', similarity: 0.9, keywordRank: null, combinedScore: null, metadata: null, rerankScore: 0.95 },
      ])

      const req = createRequest({ query: 'test', personaSlug: 'elon-musk' })
      const response = await POST(req)
      const json = await response.json()

      expect(json.chunks[0].rerankScore).toBe(0.95)
    })

    it('Cohere 실패 시에도 검색 결과를 정상 반환한다 (fallback)', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mocks.rpc.mockResolvedValue({
        data: [
          { id: 'c-1', content: 'test', document_title: 'Doc', similarity: 0.9, metadata: null },
        ],
        error: null,
      })
      // rerankChunks는 내부적으로 fallback 처리하여 원본+rerankScore:0을 반환
      mocks.rerankChunks.mockResolvedValue([
        { id: 'c-1', content: 'test', documentTitle: 'Doc', similarity: 0.9, keywordRank: null, combinedScore: null, metadata: null, rerankScore: 0 },
      ])

      const req = createRequest({ query: 'test', personaSlug: 'elon-musk' })
      const response = await POST(req)
      const json = await response.json()

      expect(json.success).toBe(true)
      expect(json.chunks).toHaveLength(1)
    })
  })
})
