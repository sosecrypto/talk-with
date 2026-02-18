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

function setupAllMocks() {
  mockPrisma.conversation.groupBy.mockResolvedValue([
    { personaId: 'p1', _count: { id: 50 } },
  ] as never)
  mockPrisma.persona.findMany.mockResolvedValue([
    { id: 'p1', name: 'Elon Musk', slug: 'elon-musk', totalConversations: 50, avgRating: 4.2 },
  ] as never)
  mockPrisma.$queryRaw = vi.fn().mockResolvedValue([
    { date: '2026-02-15', count: BigInt(10) },
  ]) as never
  mockPrisma.message.aggregate.mockResolvedValue({
    _sum: { inputTokens: 50000, outputTokens: 150000 },
    _avg: { inputTokens: 500, outputTokens: 1500 },
  } as never)
  mockPrisma.conversationFeedback.aggregate.mockResolvedValue({
    _avg: { rating: 4.1 },
    _count: { id: 20 },
  } as never)
  mockPrisma.conversationFeedback.groupBy.mockResolvedValue([
    { feedbackType: 'accuracy', _count: { id: 10 } },
  ] as never)
  mockPrisma.conversationFeedback.count.mockResolvedValue(15 as never)
  mockPrisma.user.findMany.mockResolvedValue([
    { id: 'u1', name: 'Top User', email: 'top@test.com', _count: { conversations: 20 } },
  ] as never)
}

describe('GET /api/admin/analytics', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  it('admin이면 분석 데이터를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    setupAllMocks()

    const req = new NextRequest('http://localhost:3000/api/admin/analytics')
    const response = await GET(req)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.personaStats).toBeDefined()
  })
})
