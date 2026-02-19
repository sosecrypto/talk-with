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

import { GET } from '@/app/api/admin/quality/route'

const ADMIN_SESSION = { user: { id: 'admin-1', role: 'admin', name: 'Admin', email: 'admin@test.com' } }
const USER_SESSION = { user: { id: 'user-1', role: 'user', name: 'User', email: 'user@test.com' } }

describe('GET /api/admin/quality', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  it('인증되지 않으면 401을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/admin/quality')
    const response = await GET(req)
    expect(response.status).toBe(401)
  })

  it('admin이 아니면 403을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)
    const req = new NextRequest('http://localhost:3000/api/admin/quality')
    const response = await GET(req)
    expect(response.status).toBe(403)
  })

  it('품질 데이터를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.conversationFeedback.count.mockResolvedValue(100 as never)
    mockPrisma.conversationFeedback.aggregate.mockResolvedValue({
      _avg: { rating: 4.2 },
    } as never)
    mockPrisma.conversationFeedback.count
      .mockResolvedValueOnce(100 as never)  // total
      .mockResolvedValueOnce(75 as never)   // thumbsUp
      .mockResolvedValueOnce(25 as never)   // thumbsDown
    mockPrisma.$queryRaw.mockResolvedValue([] as never)
    mockPrisma.conversationFeedback.groupBy.mockResolvedValue([] as never)

    const req = new NextRequest('http://localhost:3000/api/admin/quality?period=30d')
    const response = await GET(req)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('overallQuality')
    expect(data).toHaveProperty('personaQuality')
    expect(data).toHaveProperty('feedbackTrend')
    expect(data).toHaveProperty('typeDistribution')
  })

  it('period 파라미터를 처리한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.conversationFeedback.count.mockResolvedValue(0 as never)
    mockPrisma.conversationFeedback.aggregate.mockResolvedValue({
      _avg: { rating: null },
    } as never)
    mockPrisma.$queryRaw.mockResolvedValue([] as never)
    mockPrisma.conversationFeedback.groupBy.mockResolvedValue([] as never)

    const req = new NextRequest('http://localhost:3000/api/admin/quality?period=7d')
    const response = await GET(req)
    expect(response.status).toBe(200)
  })

  it('피드백이 없으면 빈 데이터를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.conversationFeedback.count.mockResolvedValue(0 as never)
    mockPrisma.conversationFeedback.aggregate.mockResolvedValue({
      _avg: { rating: null },
    } as never)
    mockPrisma.$queryRaw.mockResolvedValue([] as never)
    mockPrisma.conversationFeedback.groupBy.mockResolvedValue([] as never)

    const req = new NextRequest('http://localhost:3000/api/admin/quality')
    const response = await GET(req)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.overallQuality.totalFeedbackCount).toBe(0)
    expect(data.overallQuality.thumbsUpRate).toBe(0)
    expect(data.personaQuality).toEqual([])
    expect(data.feedbackTrend).toEqual([])
  })

  it('period가 유효하지 않으면 기본값 30d를 사용한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.conversationFeedback.count.mockResolvedValue(0 as never)
    mockPrisma.conversationFeedback.aggregate.mockResolvedValue({
      _avg: { rating: null },
    } as never)
    mockPrisma.$queryRaw.mockResolvedValue([] as never)
    mockPrisma.conversationFeedback.groupBy.mockResolvedValue([] as never)

    const req = new NextRequest('http://localhost:3000/api/admin/quality?period=invalid')
    const response = await GET(req)
    expect(response.status).toBe(200)
  })

  it('overallQuality에 thumbsUpCount와 thumbsDownCount를 포함한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.conversationFeedback.count
      .mockResolvedValueOnce(50 as never)   // total
      .mockResolvedValueOnce(35 as never)   // thumbsUp
      .mockResolvedValueOnce(15 as never)   // thumbsDown
    mockPrisma.conversationFeedback.aggregate.mockResolvedValue({
      _avg: { rating: 3.8 },
    } as never)
    mockPrisma.$queryRaw.mockResolvedValue([] as never)
    mockPrisma.conversationFeedback.groupBy.mockResolvedValue([] as never)

    const req = new NextRequest('http://localhost:3000/api/admin/quality')
    const response = await GET(req)
    const data = await response.json()
    expect(data.overallQuality.totalFeedbackCount).toBe(50)
    expect(data.overallQuality.thumbsUpCount).toBe(35)
    expect(data.overallQuality.thumbsDownCount).toBe(15)
    expect(data.overallQuality.thumbsUpRate).toBeCloseTo(0.7)
  })
})
