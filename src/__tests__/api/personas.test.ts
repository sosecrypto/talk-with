import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MOCK_PERSONA_LIST } from '../fixtures/persona'

const mocks = vi.hoisted(() => ({
  listPublicPersonas: vi.fn(),
}))

vi.mock('@/lib/prompt-generator', () => ({
  listPublicPersonas: mocks.listPublicPersonas,
}))

import { GET } from '@/app/api/personas/route'

describe('GET /api/personas', () => {
  beforeEach(() => {
    mocks.listPublicPersonas.mockReset()
  })

  it('public persona 목록을 반환한다', async () => {
    mocks.listPublicPersonas.mockResolvedValue(MOCK_PERSONA_LIST)

    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.personas).toHaveLength(2)
    expect(json.personas[0].slug).toBe('elon-musk')
  })

  it('빈 목록이면 빈 배열을 반환한다', async () => {
    mocks.listPublicPersonas.mockResolvedValue([])

    const response = await GET()
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.personas).toEqual([])
  })

  it('에러 발생 시 500을 반환한다', async () => {
    mocks.listPublicPersonas.mockRejectedValue(new Error('DB error'))

    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error).toBe('Failed to fetch personas')
  })
})
