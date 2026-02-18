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

import { POST } from '@/app/api/admin/sources/route'

const ADMIN_SESSION = {
  user: { id: 'admin-1', role: 'admin', name: 'Admin', email: 'admin@test.com' },
}

const USER_SESSION = {
  user: { id: 'user-1', role: 'user', name: 'User', email: 'user@test.com' },
}

describe('POST /api/admin/sources', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  it('미인증이면 401을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/admin/sources', {
      method: 'POST',
      body: JSON.stringify({ personaId: 'p1', type: 'BLOG', name: 'Test' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)
    expect(response.status).toBe(401)
  })

  it('admin이 아니면 403을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)

    const req = new NextRequest('http://localhost:3000/api/admin/sources', {
      method: 'POST',
      body: JSON.stringify({ personaId: 'p1', type: 'BLOG', name: 'Test' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)
    expect(response.status).toBe(403)
  })

  it('필수 필드 누락 시 400을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)

    const req = new NextRequest('http://localhost:3000/api/admin/sources', {
      method: 'POST',
      body: JSON.stringify({ type: 'BLOG', name: 'Test' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('personaId is required')
  })

  it('잘못된 type이면 400을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)

    const req = new NextRequest('http://localhost:3000/api/admin/sources', {
      method: 'POST',
      body: JSON.stringify({ personaId: 'p1', type: 'INVALID_TYPE', name: 'Test' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('Invalid source type')
  })

  it('유효한 요청이면 201과 생성된 소스를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.source.create.mockResolvedValue(MOCK_SOURCE as never)

    const req = new NextRequest('http://localhost:3000/api/admin/sources', {
      method: 'POST',
      body: JSON.stringify({
        personaId: 'persona-1',
        type: 'YOUTUBE_CHANNEL',
        name: 'Tesla Official',
        url: 'https://youtube.com/@tesla',
        config: { channelId: 'UC5WjFrtBdufl6CZojX3D8dQ' },
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.id).toBe('source-1')
    expect(data.name).toBe('Tesla Official')
  })

  it('기본값으로 status=PENDING, priority=0이 설정된다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.source.create.mockResolvedValue(MOCK_SOURCE as never)

    const req = new NextRequest('http://localhost:3000/api/admin/sources', {
      method: 'POST',
      body: JSON.stringify({
        personaId: 'persona-1',
        type: 'YOUTUBE_CHANNEL',
        name: 'Tesla Official',
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    await POST(req)

    expect(mockPrisma.source.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'PENDING',
        priority: 0,
      }),
    })
  })

  it('에러 발생 시 500을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
    mockPrisma.source.create.mockRejectedValue(new Error('DB error'))

    const req = new NextRequest('http://localhost:3000/api/admin/sources', {
      method: 'POST',
      body: JSON.stringify({
        personaId: 'persona-1',
        type: 'BLOG',
        name: 'Test Blog',
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)
    expect(response.status).toBe(500)
  })
})
