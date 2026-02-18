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

import { GET } from '@/app/api/admin/users/route'
import { PATCH } from '@/app/api/admin/users/[id]/route'

const ADMIN_SESSION = { user: { id: 'admin-1', role: 'admin', name: 'Admin', email: 'admin@test.com' } }
const USER_SESSION = { user: { id: 'user-1', role: 'user', name: 'User', email: 'user@test.com' } }

describe('Admin Users API', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  describe('GET /api/admin/users', () => {
    it('admin이 아니면 403을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(USER_SESSION)
      const req = new NextRequest('http://localhost:3000/api/admin/users')
      const response = await GET(req)
      expect(response.status).toBe(403)
    })

    it('admin이면 사용자 목록을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'u1', name: 'User 1', email: 'user1@test.com', role: 'user' },
      ] as never)
      mockPrisma.user.count.mockResolvedValue(1 as never)

      const req = new NextRequest('http://localhost:3000/api/admin/users?page=1&limit=20')
      const response = await GET(req)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.users).toHaveLength(1)
      expect(data.total).toBe(1)
    })
  })

  describe('PATCH /api/admin/users/[id]', () => {
    it('자기 자신의 role은 변경할 수 없다', async () => {
      mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)

      const req = new NextRequest('http://localhost:3000/api/admin/users/admin-1', {
        method: 'PATCH',
        body: JSON.stringify({ role: 'user' }),
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await PATCH(req, { params: Promise.resolve({ id: 'admin-1' }) })
      expect(response.status).toBe(400)
    })

    it('다른 사용자의 role을 변경할 수 있다', async () => {
      mocks.getServerSession.mockResolvedValue(ADMIN_SESSION)
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1', role: 'admin' } as never)

      const req = new NextRequest('http://localhost:3000/api/admin/users/user-1', {
        method: 'PATCH',
        body: JSON.stringify({ role: 'admin' }),
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await PATCH(req, { params: Promise.resolve({ id: 'user-1' }) })
      expect(response.status).toBe(200)
    })
  })
})
