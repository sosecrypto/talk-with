import { vi } from 'vitest'

export const mockRpc = vi.fn()

export function setupSupabaseMock() {
  vi.mock('@/lib/supabase', () => ({
    getSupabaseAdmin: vi.fn(() => ({
      rpc: mockRpc,
    })),
    getSupabaseClient: vi.fn(),
    supabase: {},
    supabaseAdmin: {},
  }))
}
