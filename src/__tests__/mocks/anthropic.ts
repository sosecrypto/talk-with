import { vi } from 'vitest'

export interface MockStreamEvent {
  type: string
  delta?: { type: string; text?: string }
  usage?: { output_tokens: number }
}

export function createMockStream(chunks: string[], inputTokens = 100, outputTokens = 50) {
  const events: MockStreamEvent[] = chunks.map(text => ({
    type: 'content_block_delta',
    delta: { type: 'text_delta', text },
  }))

  events.push({
    type: 'message_delta',
    usage: { output_tokens: outputTokens },
  })

  return {
    async *[Symbol.asyncIterator]() {
      for (const event of events) {
        yield event
      }
    },
    finalMessage: vi.fn().mockResolvedValue({
      usage: { input_tokens: inputTokens, output_tokens: outputTokens },
    }),
  }
}

export function createMockErrorStream(errorMessage: string) {
  return {
    async *[Symbol.asyncIterator]() {
      throw new Error(errorMessage)
    },
    finalMessage: vi.fn().mockRejectedValue(new Error(errorMessage)),
  }
}
