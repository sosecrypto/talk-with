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

import { PATCH, DELETE } from '@/app/api/admin/sources/[id]/route'

const ADMIN_SESSION = {
  user: { id: 'admin-1', role: 'admin', name: 'Admin', email: 'admin@test.com' },
}

const USER_SESSION = {
  user: { id: 'user-1', role: 'user', name: 'User', email: 'user@test.com' },
}

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) })

describe('PATCH /api/admin/sources/[id]', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  it('미인증이면 401을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/admin/sources/source-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACTIVE' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams('source-1'))
    expect(response.status).toBe(401)
  })

  it('admin이 아니면 403을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)

    const req = new NextRequest('http://localhost:3000/api/admin/sources/source-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACTIVE' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams('source-1'))
    expect(response.status).toBe(403)
  })

  it('존재하지 않는 소스이면 404를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.source.findUnique.mockResolvedValue(null as never)

    const req = new NextRequest('http://localhost:3000/api/admin/sources/nonexistent', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACTIVE' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams('nonexistent'))
    expect(response.status).toBe(404)
  })

  it('잘못된 status이면 400을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.source.findUnique.mockResolvedValue(MOCK_SOURCE as never)

    const req = new NextRequest('http://localhost:3000/api/admin/sources/source-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'INVALID_STATUS' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams('source-1'))
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('Invalid source status')
  })

  it('유효한 요청이면 200과 수정된 소스를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.source.findUnique.mockResolvedValue(MOCK_SOURCE as never)
    const updatedSource = { ...MOCK_SOURCE, status: 'PAUSED' }
    mockPrisma.source.update.mockResolvedValue(updatedSource as never)

    const req = new NextRequest('http://localhost:3000/api/admin/sources/source-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'PAUSED' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams('source-1'))
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.status).toBe('PAUSED')
  })

  it('status 없이 다른 필드만 수정할 수 있다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.source.findUnique.mockResolvedValue(MOCK_SOURCE as never)
    const updatedSource = { ...MOCK_SOURCE, name: 'Updated Name' }
    mockPrisma.source.update.mockResolvedValue(updatedSource as never)

    const req = new NextRequest('http://localhost:3000/api/admin/sources/source-1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated Name' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams('source-1'))
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.name).toBe('Updated Name')
  })
})

describe('DELETE /api/admin/sources/[id]', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  it('admin이 아니면 403을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)

    const req = new NextRequest('http://localhost:3000/api/admin/sources/source-1', {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams('source-1'))
    expect(response.status).toBe(403)
  })

  it('soft delete로 ARCHIVED 상태로 변경한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    const archivedSource = { ...MOCK_SOURCE, status: 'ARCHIVED', deletedAt: new Date() }
    mockPrisma.source.update.mockResolvedValue(archivedSource as never)

    const req = new NextRequest('http://localhost:3000/api/admin/sources/source-1', {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams('source-1'))
    expect(response.status).toBe(200)

    expect(mockPrisma.source.update).toHaveBeenCalledWith({
      where: { id: 'source-1' },
      data: expect.objectContaining({
        status: 'ARCHIVED',
        deletedAt: expect.any(Date),
      }),
    })
  })
})
