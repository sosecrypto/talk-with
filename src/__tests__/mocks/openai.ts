import { vi } from 'vitest'

export const MOCK_EMBEDDING = Array.from({ length: 1536 }, (_, i) => Math.sin(i) * 0.1)

export function setupOpenAIMock() {
  vi.mock('@/lib/openai', () => ({
    generateEmbedding: vi.fn().mockResolvedValue(MOCK_EMBEDDING),
    generateEmbeddings: vi.fn().mockImplementation((texts: string[]) =>
      Promise.resolve(texts.map(() => [...MOCK_EMBEDDING]))
    ),
    getOpenAIClient: vi.fn(),
  }))
}
