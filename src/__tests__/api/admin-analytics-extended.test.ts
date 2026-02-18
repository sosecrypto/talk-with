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
const USER_SESSION = { user: { id: 'user-1', role: 'user', name: 'User', email: 'user@test.com' } }

describe('GET /api/admin/analytics (extended)', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  function setupBasicMocks() {
    mockPrisma.conversation.groupBy.mockResolvedValue([
      { personaId: 'p1', _count: { id: 50 } },
    ] as never)
    mockPrisma.persona.findMany.mockResolvedValue([
      { id: 'p1', name: 'Elon Musk', slug: 'elon-musk', totalConversations: 50, avgRating: 4.2 },
    ] as never)
    mockPrisma.conversation.findMany.mockResolvedValue([
      { date: '2026-02-15', count: 10 },
    ] as never)
    mockPrisma.message.groupBy.mockResolvedValue([
      { _sum: { inputTokens: 5000, outputTokens: 15000 }, createdAt: new Date('2026-02-15') },
    ] as never)
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
      { feedbackType: 'style', _count: { id: 8 } },
    ] as never)
    mockPrisma.conversationFeedback.count.mockResolvedValue(15 as never)
    mockPrisma.user.findMany.mockResolvedValue([
      { id: 'u1', name: 'Top User', email: 'top@test.com', _count: { conversations: 20 } },
    ] as never)

    // Prisma.$queryRaw mock
    mockPrisma.$queryRaw = vi.fn().mockResolvedValue([
      { date: '2026-02-15', count: BigInt(10) },
    ]) as never
  }

  it('미인증 사용자는 401을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/admin/analytics')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('일반 사용자는 403을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)
    const req = new NextRequest('http://localhost:3000/api/admin/analytics')
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('admin이면 확장 분석 데이터를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    setupBasicMocks()

    const req = new NextRequest('http://localhost:3000/api/admin/analytics')
    const res = await GET(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.personaStats).toBeDefined()
    expect(data.dailyConversations).toBeDefined()
    expect(data.tokenStats).toBeDefined()
    expect(data.feedbackStats).toBeDefined()
    expect(data.topUsers).toBeDefined()
  })

  it('period=7d 쿼리 파라미터를 처리한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    setupBasicMocks()

    const req = new NextRequest('http://localhost:3000/api/admin/analytics?period=7d')
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it('period=90d 쿼리 파라미터를 처리한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    setupBasicMocks()

    const req = new NextRequest('http://localhost:3000/api/admin/analytics?period=90d')
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it('feedbackStats에 avgRating과 typeDistribution이 포함된다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    setupBasicMocks()

    const req = new NextRequest('http://localhost:3000/api/admin/analytics')
    const res = await GET(req)
    const data = await res.json()

    expect(data.feedbackStats.avgRating).toBeDefined()
    expect(data.feedbackStats.totalCount).toBeDefined()
    expect(data.feedbackStats.typeDistribution).toBeDefined()
  })

  it('tokenStats에 총 입력/출력 토큰이 포함된다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    setupBasicMocks()

    const req = new NextRequest('http://localhost:3000/api/admin/analytics')
    const res = await GET(req)
    const data = await res.json()

    expect(data.tokenStats.totalInput).toBeDefined()
    expect(data.tokenStats.totalOutput).toBeDefined()
  })
})
