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

import { GET } from '@/app/api/admin/stats/route'

const ADMIN_SESSION = { user: { id: 'admin-1', role: 'admin', name: 'Admin', email: 'admin@test.com' } }
const USER_SESSION = { user: { id: 'user-1', role: 'user', name: 'User', email: 'user@test.com' } }

describe('GET /api/admin/stats', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  it('인증되지 않으면 401을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/admin/stats')
    const response = await GET(req)
    expect(response.status).toBe(401)
  })

  it('admin이 아니면 403을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)
    const req = new NextRequest('http://localhost:3000/api/admin/stats')
    const response = await GET(req)
    expect(response.status).toBe(403)
  })

  it('admin이면 통계를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.user.count.mockResolvedValue(150 as never)
    mockPrisma.conversation.count.mockResolvedValue(1200 as never)
    mockPrisma.message.count.mockResolvedValue(15000 as never)
    mockPrisma.persona.findMany.mockResolvedValue([] as never)
    mockPrisma.source.count.mockResolvedValue(45 as never)
    mockPrisma.document.count.mockResolvedValue(3000 as never)
    mockPrisma.chunk.count.mockResolvedValue(25000 as never)
    mockPrisma.conversation.aggregate.mockResolvedValue({ _sum: { totalTokens: 5000000 } } as never)

    const req = new NextRequest('http://localhost:3000/api/admin/stats')
    const response = await GET(req)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.userCount).toBe(150)
    expect(data.conversationCount).toBe(1200)
    expect(data.messageCount).toBe(15000)
  })
})
