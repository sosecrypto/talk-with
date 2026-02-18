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

import { GET, POST } from '@/app/api/admin/personas/route'
import { PATCH, DELETE } from '@/app/api/admin/personas/[slug]/route'

const ADMIN_SESSION = { user: { id: 'admin-1', role: 'admin', name: 'Admin', email: 'admin@test.com' } }
const USER_SESSION = { user: { id: 'user-1', role: 'user', name: 'User', email: 'user@test.com' } }

describe('Admin Personas API', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  describe('GET /api/admin/personas', () => {
    it('admin이 아니면 403을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(USER_SESSION)
      const req = new NextRequest('http://localhost:3000/api/admin/personas')
      const response = await GET(req)
      expect(response.status).toBe(403)
    })

    it('admin이면 모든 페르소나를 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
      mockPrisma.persona.findMany.mockResolvedValue([
        { id: 'p1', slug: 'elon-musk', name: 'Elon Musk', visibility: 'PUBLIC', isActive: true },
      ] as never)

      const req = new NextRequest('http://localhost:3000/api/admin/personas')
      const response = await GET(req)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveLength(1)
    })
  })

  describe('POST /api/admin/personas', () => {
    it('새 페르소나를 생성한다', async () => {
      mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
      mockPrisma.persona.create.mockResolvedValue({ id: 'p-new', slug: 'new-persona', name: 'New' } as never)

      const req = new NextRequest('http://localhost:3000/api/admin/personas', {
        method: 'POST',
        body: JSON.stringify({ slug: 'new-persona', name: 'New Persona' }),
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await POST(req)
      expect(response.status).toBe(201)
    })
  })

  describe('PATCH /api/admin/personas/[slug]', () => {
    it('페르소나를 수정한다', async () => {
      mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
      mockPrisma.persona.update.mockResolvedValue({ id: 'p1', slug: 'elon-musk', name: 'Elon Musk Updated' } as never)

      const req = new NextRequest('http://localhost:3000/api/admin/personas/elon-musk', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Elon Musk Updated' }),
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await PATCH(req, { params: Promise.resolve({ slug: 'elon-musk' }) })
      expect(response.status).toBe(200)
    })
  })

  describe('DELETE /api/admin/personas/[slug]', () => {
    it('페르소나를 소프트 삭제한다', async () => {
      mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
      mockPrisma.persona.update.mockResolvedValue({ id: 'p1', isActive: false } as never)

      const req = new NextRequest('http://localhost:3000/api/admin/personas/elon-musk', { method: 'DELETE' })
      const response = await DELETE(req, { params: Promise.resolve({ slug: 'elon-musk' }) })
      expect(response.status).toBe(200)
    })
  })
})
