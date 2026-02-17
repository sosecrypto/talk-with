import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { mockPrisma, resetPrismaMocks } from '../mocks/prisma'
import { MOCK_SESSION, MOCK_SESSION_NULL } from '../fixtures/user'
import { MOCK_CONVERSATIONS_LIST } from '../fixtures/conversation'

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
}))

vi.mock('next-auth', () => ({ getServerSession: mocks.getServerSession }))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))

import { GET, POST } from '@/app/api/conversations/route'

describe('/api/conversations', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  describe('GET', () => {
    it('인증 없으면 401을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION_NULL)

      const response = await GET()

      expect(response.status).toBe(401)
    })

    it('사용자의 대화 목록을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.findMany.mockResolvedValue(MOCK_CONVERSATIONS_LIST as never)

      const response = await GET()
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json).toHaveLength(2)
      expect(json[0].id).toBe('conv-1')
    })

    it('updatedAt 내림차순으로 정렬한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.findMany.mockResolvedValue([] as never)

      await GET()

      expect(mockPrisma.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { updatedAt: 'desc' },
        })
      )
    })

    it('에러 발생 시 500을 반환한다', async () => {
      mocks.getServerSession.mockRejectedValue(new Error('DB error'))

      const response = await GET()

      expect(response.status).toBe(500)
    })
  })

  describe('POST', () => {
    it('인증 없으면 401을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION_NULL)

      const req = new NextRequest('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      expect(response.status).toBe(401)
    })

    it('새 대화를 생성한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.create.mockResolvedValue({
        id: 'new-conv',
        title: 'My Chat',
        userId: 'user-1',
      } as never)

      const req = new NextRequest('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ title: 'My Chat' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      const json = await response.json()

      expect(response.status).toBe(201)
      expect(json.title).toBe('My Chat')
    })

    it('title 없으면 null로 생성한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.create.mockResolvedValue({
        id: 'new-conv',
        title: null,
      } as never)

      const req = new NextRequest('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      expect(response.status).toBe(201)
    })

    it('에러 발생 시 500을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.create.mockRejectedValue(new Error('DB error'))

      const req = new NextRequest('http://localhost:3000/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      expect(response.status).toBe(500)
    })
  })
})
