import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { mockPrisma, resetPrismaMocks } from '../mocks/prisma'
import { MOCK_SOURCE } from '../fixtures/source'

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
}))

vi.mock('next-auth', () => ({
  getServerSession: mocks.getServerSession,
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

import { POST } from '@/app/api/admin/sources/[id]/trigger/route'

const ADMIN_SESSION = {
  user: { id: 'admin-1', role: 'admin', name: 'Admin', email: 'admin@test.com' },
}

const USER_SESSION = {
  user: { id: 'user-1', role: 'user', name: 'User', email: 'user@test.com' },
}

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) })

describe('POST /api/admin/sources/[id]/trigger', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  it('admin이 아니면 403을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)

    const req = new NextRequest('http://localhost:3000/api/admin/sources/source-1/trigger', {
      method: 'POST',
    })
    const response = await POST(req, makeParams('source-1'))
    expect(response.status).toBe(403)
  })

  it('존재하지 않는 소스이면 404를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.source.findUnique.mockResolvedValue(null as never)

    const req = new NextRequest('http://localhost:3000/api/admin/sources/nonexistent/trigger', {
      method: 'POST',
    })
    const response = await POST(req, makeParams('nonexistent'))
    expect(response.status).toBe(404)
  })

  it('ARCHIVED 소스이면 400을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.source.findUnique.mockResolvedValue({
      ...MOCK_SOURCE,
      status: 'ARCHIVED',
    } as never)

    const req = new NextRequest('http://localhost:3000/api/admin/sources/source-1/trigger', {
      method: 'POST',
    })
    const response = await POST(req, makeParams('source-1'))
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('Cannot trigger')
  })

  it('유효한 소스이면 nextFetchAt을 현재 시각으로 업데이트한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.source.findUnique.mockResolvedValue(MOCK_SOURCE as never)
    mockPrisma.source.update.mockResolvedValue({
      ...MOCK_SOURCE,
      nextFetchAt: new Date(),
    } as never)

    const req = new NextRequest('http://localhost:3000/api/admin/sources/source-1/trigger', {
      method: 'POST',
    })
    const response = await POST(req, makeParams('source-1'))
    expect(response.status).toBe(200)

    expect(mockPrisma.source.update).toHaveBeenCalledWith({
      where: { id: 'source-1' },
      data: { nextFetchAt: expect.any(Date) },
    })

    const data = await response.json()
    expect(data.message).toContain('triggered')
  })
})
