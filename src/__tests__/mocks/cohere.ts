import { vi } from 'vitest'

export const mockRerank = vi.fn()

export function setupCohereMock() {
  vi.mock('@/lib/cohere', () => ({
    getCohereClient: () => ({
      v2: { rerank: mockRerank },
    }),
  }))
}
