import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  stream: vi.fn(),
  create: vi.fn(),
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { stream: mocks.stream, create: mocks.create }
  },
}))

let anthropicModule: typeof import('@/lib/anthropic')

describe('anthropic', () => {
  beforeEach(async () => {
    mocks.stream.mockReset()
    mocks.create.mockReset()
    vi.resetModules()
    anthropicModule = await import('@/lib/anthropic')
  })

  describe('streamChat', () => {
    it('Claude API에 올바른 파라미터로 스트리밍을 요청한다', async () => {
      mocks.stream.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } }
        },
      })

      const messages = [{ role: 'user' as const, content: 'Hi' }]
      const gen = anthropicModule.streamChat(messages, 'You are helpful.')

      const chunks: string[] = []
      for await (const chunk of gen) {
        chunks.push(chunk)
      }

      expect(mocks.stream).toHaveBeenCalledWith(expect.objectContaining({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: 'You are helpful.',
        messages: [{ role: 'user', content: 'Hi' }],
      }))
      expect(chunks).toEqual(['Hello'])
    })

    it('system prompt가 없으면 기본값을 사용한다', async () => {
      mocks.stream.mockResolvedValue({
        async *[Symbol.asyncIterator]() { /* empty */ },
      })

      const gen = anthropicModule.streamChat([{ role: 'user', content: 'Hi' }])
      for await (const _ of gen) { /* consume */ }

      expect(mocks.stream).toHaveBeenCalledWith(expect.objectContaining({
        system: 'You are a helpful assistant.',
      }))
    })

    it('text_delta 이벤트만 yield한다', async () => {
      mocks.stream.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          yield { type: 'content_block_start', content_block: { type: 'text' } }
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } }
          yield { type: 'content_block_delta', delta: { type: 'input_json_delta', partial_json: '{}' } }
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: ' World' } }
          yield { type: 'message_stop' }
        },
      })

      const chunks: string[] = []
      for await (const chunk of anthropicModule.streamChat([{ role: 'user', content: 'test' }])) {
        chunks.push(chunk)
      }

      expect(chunks).toEqual(['Hello', ' World'])
    })

    it('여러 메시지를 올바르게 전달한다', async () => {
      mocks.stream.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Reply' } }
        },
      })

      const messages = [
        { role: 'user' as const, content: 'First message' },
        { role: 'assistant' as const, content: 'First reply' },
        { role: 'user' as const, content: 'Second message' },
      ]

      for await (const _ of anthropicModule.streamChat(messages)) { /* consume */ }

      expect(mocks.stream).toHaveBeenCalledWith(expect.objectContaining({
        messages: [
          { role: 'user', content: 'First message' },
          { role: 'assistant', content: 'First reply' },
          { role: 'user', content: 'Second message' },
        ],
      }))
    })
  })

  describe('generateTitle', () => {
    it('짧은 타이틀을 생성한다', async () => {
      mocks.create.mockResolvedValue({
        content: [{ type: 'text', text: 'AI Discussion' }],
      })

      const title = await anthropicModule.generateTitle('What is artificial intelligence?')

      expect(title).toBe('AI Discussion')
    })

    it('text 블록이 없으면 기본 타이틀을 반환한다', async () => {
      mocks.create.mockResolvedValue({
        content: [],
      })

      const title = await anthropicModule.generateTitle('Hello')

      expect(title).toBe('New Conversation')
    })
  })
})
