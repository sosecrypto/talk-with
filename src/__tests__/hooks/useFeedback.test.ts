import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFeedback } from '@/hooks/useFeedback'

describe('useFeedback', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('초기 상태가 올바르다', () => {
    const { result } = renderHook(() => useFeedback('conv-1'))
    expect(result.current.feedbackMap).toEqual({})
    expect(result.current.isSubmitting).toBe(false)
  })

  it('피드백을 성공적으로 제출한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'fb-1', thumbsUp: true, messageId: 'msg-1' }),
    })

    const { result } = renderHook(() => useFeedback('conv-1'))

    await act(async () => {
      await result.current.submitFeedback('msg-1', { thumbsUp: true })
    })

    expect(result.current.feedbackMap['msg-1']).toEqual({ thumbsUp: true })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/conversations/conv-1/feedback',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ messageId: 'msg-1', thumbsUp: true }),
      })
    )
  })

  it('피드백 제출 실패를 처리한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' }),
    })

    const { result } = renderHook(() => useFeedback('conv-1'))

    await act(async () => {
      await result.current.submitFeedback('msg-1', { thumbsUp: true })
    })

    expect(result.current.feedbackMap['msg-1']).toBeUndefined()
  })

  it('이미 피드백이 있는 메시지에 대해 중복 요청을 방지한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'fb-1', thumbsUp: true, messageId: 'msg-1' }),
    })

    const { result } = renderHook(() => useFeedback('conv-1'))

    await act(async () => {
      await result.current.submitFeedback('msg-1', { thumbsUp: true })
    })

    await act(async () => {
      await result.current.submitFeedback('msg-1', { thumbsUp: false })
    })

    // 두 번째 호출은 무시되어야 함
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})
