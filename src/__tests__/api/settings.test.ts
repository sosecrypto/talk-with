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

const USER_SESSION = {
  user: { id: 'user-1', name: 'Test User', email: 'test@test.com', role: 'user' },
}

describe('Settings API', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  describe('GET /api/settings', () => {
    let GET: typeof import('@/app/api/settings/route').GET

    beforeEach(async () => {
      const mod = await import('@/app/api/settings/route')
      GET = mod.GET
    })

    it('미인증 사용자는 401을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(null)
      const req = new NextRequest('http://localhost:3000/api/settings')
      const res = await GET(req)
      expect(res.status).toBe(401)
    })

    it('인증된 사용자의 설정을 반환한다 (기존 설정)', async () => {
      mocks.getServerSession.mockResolvedValue(USER_SESSION)
      mockPrisma.userPreference.findUnique.mockResolvedValue({
        id: 'pref-1',
        userId: 'user-1',
        theme: 'dark',
        defaultPersona: 'elon-musk',
        language: 'ko',
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never)

      const req = new NextRequest('http://localhost:3000/api/settings')
      const res = await GET(req)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.theme).toBe('dark')
      expect(data.defaultPersona).toBe('elon-musk')
      expect(data.language).toBe('ko')
    })

    it('설정이 없으면 기본값을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(USER_SESSION)
      mockPrisma.userPreference.findUnique.mockResolvedValue(null as never)

      const req = new NextRequest('http://localhost:3000/api/settings')
      const res = await GET(req)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.theme).toBe('system')
      expect(data.defaultPersona).toBeNull()
      expect(data.language).toBe('ko')
    })
  })

  describe('PATCH /api/settings', () => {
    let PATCH: typeof import('@/app/api/settings/route').PATCH

    beforeEach(async () => {
      const mod = await import('@/app/api/settings/route')
      PATCH = mod.PATCH
    })

    it('미인증 사용자는 401을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(null)
      const req = new NextRequest('http://localhost:3000/api/settings', {
        method: 'PATCH',
        body: JSON.stringify({ theme: 'dark' }),
      })
      const res = await PATCH(req)
      expect(res.status).toBe(401)
    })

    it('유효한 theme 값으로 설정을 업데이트한다', async () => {
      mocks.getServerSession.mockResolvedValue(USER_SESSION)
      mockPrisma.userPreference.upsert.mockResolvedValue({
        id: 'pref-1',
        userId: 'user-1',
        theme: 'dark',
        defaultPersona: null,
        language: 'ko',
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never)

      const req = new NextRequest('http://localhost:3000/api/settings', {
        method: 'PATCH',
        body: JSON.stringify({ theme: 'dark' }),
      })
      const res = await PATCH(req)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.theme).toBe('dark')
    })

    it('유효하지 않은 theme 값은 400을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(USER_SESSION)
      const req = new NextRequest('http://localhost:3000/api/settings', {
        method: 'PATCH',
        body: JSON.stringify({ theme: 'rainbow' }),
      })
      const res = await PATCH(req)
      expect(res.status).toBe(400)
    })

    it('defaultPersona를 업데이트한다', async () => {
      mocks.getServerSession.mockResolvedValue(USER_SESSION)
      mockPrisma.userPreference.upsert.mockResolvedValue({
        id: 'pref-1',
        userId: 'user-1',
        theme: 'system',
        defaultPersona: 'steve-jobs',
        language: 'ko',
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never)

      const req = new NextRequest('http://localhost:3000/api/settings', {
        method: 'PATCH',
        body: JSON.stringify({ defaultPersona: 'steve-jobs' }),
      })
      const res = await PATCH(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.defaultPersona).toBe('steve-jobs')
    })
  })

  describe('PATCH /api/settings/profile', () => {
    let PATCH: typeof import('@/app/api/settings/profile/route').PATCH

    beforeEach(async () => {
      const mod = await import('@/app/api/settings/profile/route')
      PATCH = mod.PATCH
    })

    it('미인증 사용자는 401을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(null)
      const req = new NextRequest('http://localhost:3000/api/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Name' }),
      })
      const res = await PATCH(req)
      expect(res.status).toBe(401)
    })

    it('이름을 업데이트한다', async () => {
      mocks.getServerSession.mockResolvedValue(USER_SESSION)
      mockPrisma.user.update.mockResolvedValue({
        id: 'user-1',
        name: 'New Name',
        email: 'test@test.com',
        image: null,
      } as never)

      const req = new NextRequest('http://localhost:3000/api/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Name' }),
      })
      const res = await PATCH(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.name).toBe('New Name')
    })

    it('빈 이름은 400을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(USER_SESSION)
      const req = new NextRequest('http://localhost:3000/api/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: '' }),
      })
      const res = await PATCH(req)
      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /api/settings/conversations', () => {
    let DELETE: typeof import('@/app/api/settings/conversations/route').DELETE

    beforeEach(async () => {
      const mod = await import('@/app/api/settings/conversations/route')
      DELETE = mod.DELETE
    })

    it('미인증 사용자는 401을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(null)
      const req = new NextRequest('http://localhost:3000/api/settings/conversations', {
        method: 'DELETE',
      })
      const res = await DELETE(req)
      expect(res.status).toBe(401)
    })

    it('사용자의 모든 대화를 soft delete한다', async () => {
      mocks.getServerSession.mockResolvedValue(USER_SESSION)
      mockPrisma.conversation.updateMany = vi.fn().mockResolvedValue({ count: 5 }) as never

      const req = new NextRequest('http://localhost:3000/api/settings/conversations', {
        method: 'DELETE',
      })
      const res = await DELETE(req)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.deletedCount).toBe(5)
    })
  })
})
