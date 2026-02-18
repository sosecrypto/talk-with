import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { mockPrisma, resetPrismaMocks } from '../mocks/prisma'

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
}))

vi.mock('next-auth', () => ({
  getServerSession: mocks.getServerSession,
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

import { GET } from '@/app/api/admin/sources/route'

const ADMIN_SESSION = { user: { id: 'admin-1', role: 'admin', name: 'Admin', email: 'admin@test.com' } }

describe('GET /api/admin/sources', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  it('admin이면 소스 현황을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.source.findMany.mockResolvedValue([
      { id: 's1', name: 'YouTube', type: 'YOUTUBE_VIDEO', status: 'ACTIVE', lastFetchedAt: new Date(), persona: { name: 'Elon Musk' } },
    ] as never)

    const req = new NextRequest('http://localhost:3000/api/admin/sources')
    const response = await GET(req)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveLength(1)
  })
})
