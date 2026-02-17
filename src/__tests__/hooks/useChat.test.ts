import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChat } from '@/hooks/useChat'
import { MOCK_CONVERSATION, MOCK_MESSAGES } from '../fixtures/conversation'

function createSSEStream(events: Array<{ data: Record<string, unknown> }>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event.data)}\n\n`))
      }
      controller.close()
    },
  })
}

function mockFetchResponse(events: Array<{ data: Record<string, unknown> }>, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    body: ok ? createSSEStream(events) : null,
    headers: new Headers({ 'Content-Type': 'text/event-stream' }),
  })
}

describe('useChat', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('초기 상태', () => {
    it('messages가 빈 배열이다', () => {
      const { result } = renderHook(() => useChat())
      expect(result.current.messages).toEqual([])
    })

    it('isStreaming이 false이다', () => {
      const { result } = renderHook(() => useChat())
      expect(result.current.isStreaming).toBe(false)
    })

    it('conversationId가 null이다', () => {
      const { result } = renderHook(() => useChat())
      expect(result.current.conversationId).toBeNull()
    })

    it('title이 null이다', () => {
      const { result } = renderHook(() => useChat())
      expect(result.current.title).toBeNull()
    })

    it('personaSlug이 null이다', () => {
      const { result } = renderHook(() => useChat())
      expect(result.current.personaSlug).toBeNull()
    })
  })

  describe('sendMessage', () => {
    it('user 메시지와 빈 assistant 메시지를 즉시 추가한다', async () => {
      const sseEvents = [
        { data: { text: 'Hello!', conversationId: 'conv-new' } },
        { data: { done: true } },
      ]
      global.fetch = mockFetchResponse(sseEvents)

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('Hi there')
      })

      expect(result.current.messages).toHaveLength(2)
      expect(result.current.messages[0].role).toBe('user')
      expect(result.current.messages[0].content).toBe('Hi there')
      expect(result.current.messages[1].role).toBe('assistant')
    })

    it('SSE 스트림을 파싱하여 assistant 메시지를 점진적으로 업데이트한다', async () => {
      const sseEvents = [
        { data: { text: 'Hello', conversationId: 'conv-1' } },
        { data: { text: ' World', conversationId: 'conv-1' } },
        { data: { done: true } },
      ]
      global.fetch = mockFetchResponse(sseEvents)

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('Test message')
      })

      const assistantMsg = result.current.messages.find(m => m.role === 'assistant')
      expect(assistantMsg?.content).toBe('Hello World')
    })

    it('conversationId를 SSE에서 받아 설정한다', async () => {
      const sseEvents = [
        { data: { text: 'Hi', conversationId: 'new-conv-123' } },
        { data: { done: true } },
      ]
      global.fetch = mockFetchResponse(sseEvents)

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('Hello')
      })

      expect(result.current.conversationId).toBe('new-conv-123')
    })

    it('title을 SSE에서 받아 설정한다', async () => {
      const sseEvents = [
        { data: { text: 'Response', conversationId: 'conv-1' } },
        { data: { title: 'AI Discussion', done: true } },
      ]
      global.fetch = mockFetchResponse(sseEvents)

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('Test')
      })

      expect(result.current.title).toBe('AI Discussion')
    })

    it('personaSlug를 SSE에서 받아 설정한다', async () => {
      const sseEvents = [
        { data: { text: 'I am Elon', conversationId: 'conv-1', personaSlug: 'elon-musk' } },
        { data: { done: true } },
      ]
      global.fetch = mockFetchResponse(sseEvents)

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('Hello Elon')
      })

      expect(result.current.personaSlug).toBe('elon-musk')
    })

    it('빈 문자열을 보내면 무시한다', async () => {
      global.fetch = vi.fn()

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('')
      })

      expect(global.fetch).not.toHaveBeenCalled()
      expect(result.current.messages).toEqual([])
    })

    it('공백만 있는 문자열을 보내면 무시한다', async () => {
      global.fetch = vi.fn()

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('   ')
      })

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('스트리밍 중 중복 요청을 방지한다', async () => {
      // 느린 스트림을 시뮬레이션
      let resolveStream: () => void
      const slowStream = new ReadableStream<Uint8Array>({
        start(controller) {
          const encoder = new TextEncoder()
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: 'Hi', conversationId: 'c-1' })}\n\n`))
          // Don't close immediately - simulate slow stream
          new Promise<void>(resolve => { resolveStream = resolve }).then(() => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
            controller.close()
          })
        },
      })

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: slowStream,
      })

      const { result } = renderHook(() => useChat())

      // First message starts streaming
      act(() => {
        result.current.sendMessage('First')
      })

      // Wait for isStreaming to be true
      await waitFor(() => {
        expect(result.current.isStreaming).toBe(true)
      })

      // Second message should be ignored
      await act(async () => {
        await result.current.sendMessage('Second')
      })

      // Only one fetch call
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Cleanup
      resolveStream!()
    })

    it('fetch 실패 시 에러를 처리한다', async () => {
      global.fetch = mockFetchResponse([], false, 500)
      const onError = vi.fn()

      const { result } = renderHook(() => useChat({ onError }))

      await act(async () => {
        await result.current.sendMessage('Test')
      })

      expect(onError).toHaveBeenCalledWith('Failed to send message')
      expect(result.current.isStreaming).toBe(false)
    })

    it('fetch 에러 시 마지막 assistant 메시지를 제거한다', async () => {
      global.fetch = mockFetchResponse([], false, 500)

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('Test')
      })

      // Only user message should remain after error removes assistant message
      expect(result.current.messages).toHaveLength(1)
      expect(result.current.messages[0].role).toBe('user')
    })

    it('SSE에서 error 이벤트를 받으면 onError를 호출한다', async () => {
      const sseEvents = [
        { data: { error: 'Stream error occurred' } },
      ]
      global.fetch = mockFetchResponse(sseEvents)
      const onError = vi.fn()

      const { result } = renderHook(() => useChat({ onError }))

      await act(async () => {
        await result.current.sendMessage('Test')
      })

      expect(onError).toHaveBeenCalledWith('Stream error occurred')
    })

    it('personaSlug를 fetch body에 포함한다', async () => {
      const sseEvents = [
        { data: { text: 'Hi', conversationId: 'c-1' } },
        { data: { done: true } },
      ]
      global.fetch = mockFetchResponse(sseEvents)

      const { result } = renderHook(() => useChat())

      await act(async () => {
        result.current.setActivePersona('elon-musk')
      })

      await act(async () => {
        await result.current.sendMessage('Hello', 'elon-musk')
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
        body: expect.stringContaining('"personaSlug":"elon-musk"'),
      }))
    })
  })

  describe('loadConversation', () => {
    it('대화를 로드하면 messages, conversationId, title을 설정한다', () => {
      const { result } = renderHook(() => useChat())

      act(() => {
        result.current.loadConversation(MOCK_CONVERSATION)
      })

      expect(result.current.messages).toEqual(MOCK_MESSAGES)
      expect(result.current.conversationId).toBe('conv-1')
      expect(result.current.title).toBe('AI Discussion')
    })
  })

  describe('resetChat', () => {
    it('채팅을 초기화하면 messages, conversationId, title을 리셋한다', async () => {
      const sseEvents = [
        { data: { text: 'Hi', conversationId: 'c-1' } },
        { data: { title: 'Test', done: true } },
      ]
      global.fetch = mockFetchResponse(sseEvents)

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('Test')
      })

      act(() => {
        result.current.resetChat()
      })

      expect(result.current.messages).toEqual([])
      expect(result.current.conversationId).toBeNull()
      expect(result.current.title).toBeNull()
    })
  })

  describe('setActivePersona', () => {
    it('personaSlug을 설정한다', () => {
      const { result } = renderHook(() => useChat())

      act(() => {
        result.current.setActivePersona('steve-jobs')
      })

      expect(result.current.personaSlug).toBe('steve-jobs')
    })

    it('null로 설정하면 persona를 해제한다', () => {
      const { result } = renderHook(() => useChat())

      act(() => {
        result.current.setActivePersona('elon-musk')
      })

      act(() => {
        result.current.setActivePersona(null)
      })

      expect(result.current.personaSlug).toBeNull()
    })
  })
})
