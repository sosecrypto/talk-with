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

import { GET } from '@/app/api/admin/analytics/route'

const ADMIN_SESSION = { user: { id: 'admin-1', role: 'admin', name: 'Admin', email: 'admin@test.com' } }

describe('GET /api/admin/analytics', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  it('admin이면 분석 데이터를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.conversation.groupBy.mockResolvedValue([
      { personaId: 'p1', _count: { id: 50 } },
    ] as never)
    mockPrisma.persona.findMany.mockResolvedValue([
      { id: 'p1', name: 'Elon Musk', slug: 'elon-musk', totalConversations: 50 },
    ] as never)

    const req = new NextRequest('http://localhost:3000/api/admin/analytics')
    const response = await GET(req)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.personaStats).toBeDefined()
  })
})
