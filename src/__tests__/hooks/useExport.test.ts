import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useExport } from '@/hooks/useExport'

describe('useExport', () => {
  const originalCreateObjectURL = global.URL.createObjectURL
  const originalRevokeObjectURL = global.URL.revokeObjectURL

  beforeEach(() => {
    vi.mocked(global.fetch).mockReset()
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    global.URL.createObjectURL = originalCreateObjectURL
    global.URL.revokeObjectURL = originalRevokeObjectURL
  })

  it('isExporting이 초기에 false이다', () => {
    const { result } = renderHook(() => useExport())
    expect(result.current.isExporting).toBe(false)
  })

  it('exportConversation이 올바른 URL로 fetch를 호출한다', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/json' })
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
      headers: new Headers({ 'Content-Disposition': 'attachment; filename="test.json"' }),
    } as Response)

    const { result } = renderHook(() => useExport())

    // Mock createElement after renderHook to avoid breaking jsdom
    const mockClick = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return { href: '', download: '', click: mockClick, style: {} } as unknown as HTMLAnchorElement
      }
      return originalCreateElement(tag)
    })

    await act(async () => {
      await result.current.exportConversation('conv-1', 'json')
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/conversations/conv-1/export?format=json')
    expect(mockClick).toHaveBeenCalled()

    createElementSpy.mockRestore()
  })

  it('fetch 실패 시 에러를 throw한다', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    const { result } = renderHook(() => useExport())

    await expect(
      act(async () => {
        await result.current.exportConversation('conv-1', 'json')
      })
    ).rejects.toThrow('Export failed')
  })
})
