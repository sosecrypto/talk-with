import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { mockPrisma, resetPrismaMocks } from '../mocks/prisma'
import { MOCK_FETCH_LOG_LIST } from '../fixtures/source'

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
}))

vi.mock('next-auth', () => ({
  getServerSession: mocks.getServerSession,
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

import { GET } from '@/app/api/admin/pipeline/route'

const ADMIN_SESSION = {
  user: { id: 'admin-1', role: 'admin', name: 'Admin', email: 'admin@test.com' },
}

const USER_SESSION = {
  user: { id: 'user-1', role: 'user', name: 'User', email: 'user@test.com' },
}

function setupPipelineMocks() {
  mockPrisma.document.count.mockResolvedValue(100 as never)
  mockPrisma.document.groupBy.mockResolvedValue([
    { status: 'READY', _count: { id: 80 } },
    { status: 'PENDING_FETCH', _count: { id: 15 } },
    { status: 'FAILED', _count: { id: 5 } },
  ] as never)

  mockPrisma.chunk.count
    .mockResolvedValueOnce(2000 as never)
    .mockResolvedValueOnce(1800 as never)

  mockPrisma.source.groupBy.mockResolvedValue([
    { status: 'ACTIVE', _count: { id: 20 } },
    { status: 'PENDING', _count: { id: 5 } },
    { status: 'PAUSED', _count: { id: 3 } },
  ] as never)

  mockPrisma.fetchLog.findMany.mockResolvedValue(MOCK_FETCH_LOG_LIST as never)
}

describe('GET /api/admin/pipeline', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  it('admin이 아니면 403을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)

    const req = new NextRequest('http://localhost:3000/api/admin/pipeline')
    const response = await GET(req)
    expect(response.status).toBe(403)
  })

  it('admin이면 파이프라인 상태를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    setupPipelineMocks()

    const req = new NextRequest('http://localhost:3000/api/admin/pipeline')
    const response = await GET(req)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.documents).toBeDefined()
    expect(data.documents.total).toBe(100)
    expect(data.documents.byStatus).toHaveLength(3)
    expect(data.chunks).toBeDefined()
    expect(data.chunks.total).toBe(2000)
    expect(data.chunks.embedded).toBe(1800)
    expect(data.sources).toBeDefined()
    expect(data.sources.byStatus).toHaveLength(3)
    expect(data.recentFetchLogs).toHaveLength(2)
  })

  it('에러 발생 시 500을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.document.count.mockRejectedValue(new Error('DB error') as never)

    const req = new NextRequest('http://localhost:3000/api/admin/pipeline')
    const response = await GET(req)
    expect(response.status).toBe(500)
  })
})
