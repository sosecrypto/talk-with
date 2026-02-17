import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock TextEncoder/TextDecoder if not available
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(str: string): Uint8Array {
      return new Uint8Array(Buffer.from(str))
    }
  } as unknown as typeof globalThis.TextEncoder
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(input?: Uint8Array): string {
      if (!input) return ''
      return Buffer.from(input).toString()
    }
  } as unknown as typeof globalThis.TextDecoder
}
