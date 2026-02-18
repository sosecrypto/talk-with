import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  rerank: vi.fn(),
}))

vi.mock('@/lib/cohere', () => ({
  getCohereClient: () => ({
    v2: { rerank: mocks.rerank },
  }),
}))

import { rerankChunks } from '@/lib/reranker'

const MOCK_CHUNKS = [
  { id: 'c-1', content: 'Tesla autopilot is advancing rapidly.' },
  { id: 'c-2', content: 'SpaceX launched Starship successfully.' },
  { id: 'c-3', content: 'Tesla energy division is growing fast.' },
  { id: 'c-4', content: 'AI will transform transportation.' },
  { id: 'c-5', content: 'Electric vehicles are the future of mobility.' },
]

describe('rerankChunks', () => {
  beforeEach(() => {
    mocks.rerank.mockReset()
  })

  it('Cohere v2.rerank를 올바른 파라미터로 호출한다', async () => {
    mocks.rerank.mockResolvedValue({
      results: [
        { index: 0, relevanceScore: 0.95 },
        { index: 2, relevanceScore: 0.85 },
        { index: 4, relevanceScore: 0.70 },
      ],
    })

    await rerankChunks('Tesla autopilot', MOCK_CHUNKS, 3)

    expect(mocks.rerank).toHaveBeenCalledWith({
      model: 'rerank-v3.5',
      query: 'Tesla autopilot',
      documents: MOCK_CHUNKS.map(c => c.content),
      topN: 3,
    })
  })

  it('relevanceScore 내림차순으로 정렬된 결과를 반환한다', async () => {
    mocks.rerank.mockResolvedValue({
      results: [
        { index: 2, relevanceScore: 0.60 },
        { index: 0, relevanceScore: 0.95 },
        { index: 1, relevanceScore: 0.80 },
      ],
    })

    const result = await rerankChunks('test query', MOCK_CHUNKS)

    expect(result[0].rerankScore).toBe(0.95)
    expect(result[1].rerankScore).toBe(0.80)
    expect(result[2].rerankScore).toBe(0.60)
  })

  it('topN 파라미터로 반환 개수를 제한한다', async () => {
    mocks.rerank.mockResolvedValue({
      results: [
        { index: 0, relevanceScore: 0.95 },
        { index: 1, relevanceScore: 0.85 },
      ],
    })

    const result = await rerankChunks('test', MOCK_CHUNKS, 2)

    expect(mocks.rerank).toHaveBeenCalledWith(
      expect.objectContaining({ topN: 2 })
    )
    expect(result).toHaveLength(2)
  })

  it('topN을 지정하지 않으면 전체 chunks 수를 topN으로 사용한다', async () => {
    mocks.rerank.mockResolvedValue({
      results: MOCK_CHUNKS.map((_, i) => ({ index: i, relevanceScore: 0.9 - i * 0.1 })),
    })

    await rerankChunks('test', MOCK_CHUNKS)

    expect(mocks.rerank).toHaveBeenCalledWith(
      expect.objectContaining({ topN: MOCK_CHUNKS.length })
    )
  })

  it('index로 원본 chunk를 올바르게 매핑한다', async () => {
    mocks.rerank.mockResolvedValue({
      results: [
        { index: 3, relevanceScore: 0.95 },
        { index: 0, relevanceScore: 0.80 },
      ],
    })

    const result = await rerankChunks('AI', MOCK_CHUNKS, 2)

    expect(result[0].id).toBe('c-4')
    expect(result[0].content).toBe('AI will transform transportation.')
    expect(result[1].id).toBe('c-1')
    expect(result[1].content).toBe('Tesla autopilot is advancing rapidly.')
  })

  it('rerankScore 필드가 결과에 추가된다', async () => {
    mocks.rerank.mockResolvedValue({
      results: [{ index: 0, relevanceScore: 0.92 }],
    })

    const result = await rerankChunks('test', MOCK_CHUNKS, 1)

    expect(result[0]).toHaveProperty('rerankScore', 0.92)
    expect(result[0]).toHaveProperty('id', 'c-1')
    expect(result[0]).toHaveProperty('content')
  })

  it('Cohere API 실패 시 원래 순서 그대로 반환한다 (graceful fallback)', async () => {
    mocks.rerank.mockRejectedValue(new Error('API error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await rerankChunks('test', MOCK_CHUNKS, 3)

    expect(result).toHaveLength(3)
    expect(result[0].id).toBe('c-1')
    expect(result[1].id).toBe('c-2')
    expect(result[2].id).toBe('c-3')
    expect(result[0].rerankScore).toBe(0)

    consoleSpy.mockRestore()
  })

  it('빈 chunks 입력 시 빈 배열을 반환한다', async () => {
    const result = await rerankChunks('test', [])

    expect(result).toEqual([])
    expect(mocks.rerank).not.toHaveBeenCalled()
  })

  it('원본 chunk의 추가 필드를 보존한다', async () => {
    const chunksWithExtra = [
      { id: 'c-1', content: 'test content', similarity: 0.85, metadata: { source: 'youtube' } },
    ]
    mocks.rerank.mockResolvedValue({
      results: [{ index: 0, relevanceScore: 0.90 }],
    })

    const result = await rerankChunks('test', chunksWithExtra, 1)

    expect(result[0].similarity).toBe(0.85)
    expect(result[0].metadata).toEqual({ source: 'youtube' })
    expect(result[0].rerankScore).toBe(0.90)
  })
})
