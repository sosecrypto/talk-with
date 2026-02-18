import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSettings } from '@/hooks/useSettings'

describe('useSettings', () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset()
  })

  it('초기 상태는 로딩 중이다', () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ theme: 'system', defaultPersona: null, language: 'ko' }),
    } as Response)

    const { result } = renderHook(() => useSettings())
    expect(result.current.isLoading).toBe(true)
  })

  it('설정을 성공적으로 로드한다', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ theme: 'dark', defaultPersona: 'elon-musk', language: 'ko' }),
    } as Response)

    const { result } = renderHook(() => useSettings())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.settings.theme).toBe('dark')
    expect(result.current.settings.defaultPersona).toBe('elon-musk')
  })

  it('fetch 실패 시 기본값을 유지한다', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    const { result } = renderHook(() => useSettings())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.settings.theme).toBe('system')
  })

  it('updateSettings를 호출하면 PATCH 요청을 보낸다', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ theme: 'system', defaultPersona: null, language: 'ko' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ theme: 'dark', defaultPersona: null, language: 'ko' }),
      } as Response)

    const { result } = renderHook(() => useSettings())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      await result.current.updateSettings({ theme: 'dark' })
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: 'dark' }),
    })
    expect(result.current.settings.theme).toBe('dark')
  })

  it('updateProfile을 호출하면 profile PATCH 요청을 보낸다', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ theme: 'system', defaultPersona: null, language: 'ko' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: 'New Name' }),
      } as Response)

    const { result } = renderHook(() => useSettings())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      await result.current.updateProfile({ name: 'New Name' })
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/settings/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Name' }),
    })
  })

  it('deleteAllConversations를 호출하면 DELETE 요청을 보낸다', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ theme: 'system', defaultPersona: null, language: 'ko' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ deletedCount: 3 }),
      } as Response)

    const { result } = renderHook(() => useSettings())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    let deletedCount: number | undefined
    await act(async () => {
      deletedCount = await result.current.deleteAllConversations()
    })

    expect(deletedCount).toBe(3)
    expect(global.fetch).toHaveBeenCalledWith('/api/settings/conversations', { method: 'DELETE' })
  })
})
