import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  embeddingsCreate: vi.fn(),
}))

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      embeddings = { create: mocks.embeddingsCreate }
    },
  }
})

// Reset singleton between tests
let openaiModule: typeof import('@/lib/openai')

describe('openai', () => {
  beforeEach(async () => {
    mocks.embeddingsCreate.mockReset()
    // Re-import to reset singleton
    vi.resetModules()
    openaiModule = await import('@/lib/openai')
  })

  describe('generateEmbedding', () => {
    it('1536차원 embedding 벡터를 생성한다', async () => {
      const mockEmbedding = Array(1536).fill(0.1)
      mocks.embeddingsCreate.mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      })

      const result = await openaiModule.generateEmbedding('Hello world')

      expect(result).toEqual(mockEmbedding)
      expect(result).toHaveLength(1536)
    })

    it('text-embedding-3-small 모델을 사용한다', async () => {
      mocks.embeddingsCreate.mockResolvedValue({
        data: [{ embedding: Array(1536).fill(0) }],
      })

      await openaiModule.generateEmbedding('test')

      expect(mocks.embeddingsCreate).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'test',
        dimensions: 1536,
      })
    })
  })

  describe('generateEmbeddings', () => {
    it('여러 텍스트의 embedding을 배치로 생성한다', async () => {
      const emb1 = Array(1536).fill(0.1)
      const emb2 = Array(1536).fill(0.2)
      mocks.embeddingsCreate.mockResolvedValue({
        data: [{ embedding: emb1 }, { embedding: emb2 }],
      })

      const results = await openaiModule.generateEmbeddings(['Hello', 'World'])

      expect(results).toHaveLength(2)
      expect(results[0]).toEqual(emb1)
      expect(results[1]).toEqual(emb2)
    })

    it('올바른 파라미터로 API를 호출한다', async () => {
      mocks.embeddingsCreate.mockResolvedValue({
        data: [{ embedding: Array(1536).fill(0) }],
      })

      await openaiModule.generateEmbeddings(['text1'])

      expect(mocks.embeddingsCreate).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: ['text1'],
        dimensions: 1536,
      })
    })
  })
})
