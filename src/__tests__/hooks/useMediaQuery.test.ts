import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMediaQuery } from '@/hooks/useMediaQuery'

describe('useMediaQuery', () => {
  let changeCallbacks: Array<() => void> = []
  let currentMatches = false

  function setupMatchMedia(initialMatches: boolean) {
    currentMatches = initialMatches
    changeCallbacks = []

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        get matches() { return currentMatches },
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((_event: string, cb: () => void) => {
          changeCallbacks.push(cb)
        }),
        removeEventListener: vi.fn((_event: string, cb: () => void) => {
          changeCallbacks = changeCallbacks.filter(c => c !== cb)
        }),
        dispatchEvent: vi.fn(),
      })),
    })
  }

  beforeEach(() => {
    setupMatchMedia(false)
  })

  it('초기 matchMedia 결과를 반환한다 (true)', () => {
    setupMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(true)
  })

  it('초기 false를 반환한다', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('미디어 쿼리 변경에 반응한다', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)

    act(() => {
      currentMatches = true
      changeCallbacks.forEach(cb => cb())
    })

    expect(result.current).toBe(true)
  })

  it('언마운트 시 리스너를 제거한다', () => {
    const removeEventListener = vi.fn()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener,
        dispatchEvent: vi.fn(),
      })),
    })

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    unmount()

    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
