import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  generateEmbedding: vi.fn(),
  rpc: vi.fn(),
}))

vi.mock('next-auth', () => ({ getServerSession: mocks.getServerSession }))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))
vi.mock('@/lib/openai', () => ({ generateEmbedding: mocks.generateEmbedding }))
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin: () => ({ rpc: mocks.rpc }) }))

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

  it('Supabase RPC에 올바른 파라미터를 전달한다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
    mocks.rpc.mockResolvedValue({ data: [], error: null })

    const req = createRequest({ query: 'test', personaSlug: 'elon-musk', topK: 3, threshold: 0.7 })
    await POST(req)

    expect(mocks.rpc).toHaveBeenCalledWith('match_chunks', {
      query_embedding: MOCK_EMBEDDING,
      persona_slug: 'elon-musk',
      match_threshold: 0.7,
      match_count: 3,
    })
  })

  it('기본 topK=5, threshold=0.65를 사용한다', async () => {
    mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
    mocks.rpc.mockResolvedValue({ data: [], error: null })

    const req = createRequest({ query: 'test', personaSlug: 'elon-musk' })
    await POST(req)

    expect(mocks.rpc).toHaveBeenCalledWith('match_chunks', expect.objectContaining({
      match_threshold: 0.65,
      match_count: 5,
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
})
