import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useConversations } from '@/hooks/useConversations'

const MOCK_CONVERSATIONS = [
  { id: 'c-1', title: 'Chat 1', userId: 'u-1', messages: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'c-2', title: 'Chat 2', userId: 'u-1', messages: [], createdAt: new Date(), updatedAt: new Date() },
]

describe('useConversations', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('마운트 시 자동으로 conversations를 fetch한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_CONVERSATIONS),
    })

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.conversations).toEqual(MOCK_CONVERSATIONS)
  })

  it('fetch 실패 시 error를 설정한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed' }),
    })

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch conversations')
  })

  it('fetchConversation으로 개별 대화를 조회한다', async () => {
    const singleConv = { id: 'c-1', title: 'Chat 1', messages: [] }
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(singleConv) })

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let conversation
    await act(async () => {
      conversation = await result.current.fetchConversation('c-1')
    })

    expect(conversation).toEqual(singleConv)
  })

  it('fetchConversation 실패 시 null을 반환한다', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: false })

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let conversation
    await act(async () => {
      conversation = await result.current.fetchConversation('nonexistent')
    })

    expect(conversation).toBeNull()
  })

  it('deleteConversation으로 대화를 삭제한다', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(MOCK_CONVERSATIONS) })
      .mockResolvedValueOnce({ ok: true })

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.conversations).toHaveLength(2)
    })

    await act(async () => {
      await result.current.deleteConversation('c-1')
    })

    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations[0].id).toBe('c-2')
  })

  it('addConversation으로 대화를 추가한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const newConv = { id: 'c-new', title: 'New', userId: 'u-1', messages: [], createdAt: new Date(), updatedAt: new Date() }

    act(() => {
      result.current.addConversation(newConv)
    })

    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations[0].id).toBe('c-new')
  })

  it('updateConversation으로 대화를 업데이트한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_CONVERSATIONS),
    })

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.conversations).toHaveLength(2)
    })

    act(() => {
      result.current.updateConversation('c-1', { title: 'Updated Title' })
    })

    expect(result.current.conversations[0].title).toBe('Updated Title')
  })
})
