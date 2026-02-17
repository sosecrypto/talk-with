import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePersonas } from '@/hooks/usePersonas'
import { MOCK_PERSONA_LIST } from '../fixtures/persona'

describe('usePersonas', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('마운트 시 자동으로 personas를 fetch한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, personas: MOCK_PERSONA_LIST }),
    })

    const { result } = renderHook(() => usePersonas())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.personas).toEqual(MOCK_PERSONA_LIST)
    expect(global.fetch).toHaveBeenCalledWith('/api/personas')
  })

  it('초기 상태는 isLoading=true이다', () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, personas: [] }),
    })

    const { result } = renderHook(() => usePersonas())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.personas).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('fetch 실패 시 error를 설정한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ success: false, error: 'Server error' }),
    })

    const { result } = renderHook(() => usePersonas())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Server error')
    expect(result.current.personas).toEqual([])
  })

  it('selectPersona로 persona를 선택한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, personas: MOCK_PERSONA_LIST }),
    })

    const { result } = renderHook(() => usePersonas())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.selectPersona(MOCK_PERSONA_LIST[0] as never)
    })

    expect(result.current.selectedPersona).toEqual(MOCK_PERSONA_LIST[0])
  })

  it('selectPersona(null)로 선택을 해제한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, personas: MOCK_PERSONA_LIST }),
    })

    const { result } = renderHook(() => usePersonas())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.selectPersona(MOCK_PERSONA_LIST[0] as never)
    })

    act(() => {
      result.current.selectPersona(null)
    })

    expect(result.current.selectedPersona).toBeNull()
  })

  it('fetchPersonas로 수동 리페치가 가능하다', async () => {
    let callCount = 0
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, personas: callCount === 1 ? [] : MOCK_PERSONA_LIST }),
      })
    })

    const { result } = renderHook(() => usePersonas())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.personas).toEqual([])

    await act(async () => {
      await result.current.fetchPersonas()
    })

    expect(result.current.personas).toEqual(MOCK_PERSONA_LIST)
  })

  it('네트워크 에러 시 에러 메시지를 설정한다', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => usePersonas())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
  })
})
