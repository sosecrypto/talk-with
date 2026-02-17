import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { mockPrisma, resetPrismaMocks } from '../mocks/prisma'
import { MOCK_SESSION, MOCK_SESSION_NULL } from '../fixtures/user'

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
}))

vi.mock('next-auth', () => ({ getServerSession: mocks.getServerSession }))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))

import { GET, PATCH, DELETE } from '@/app/api/conversations/[id]/route'

function createParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe('/api/conversations/[id]', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  describe('GET', () => {
    it('인증 없으면 401을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION_NULL)

      const req = new NextRequest('http://localhost:3000/api/conversations/c-1')
      const response = await GET(req, createParams('c-1'))

      expect(response.status).toBe(401)
    })

    it('대화를 메시지와 함께 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.findFirst.mockResolvedValue({
        id: 'c-1',
        title: 'Test',
        messages: [{ id: 'm-1', role: 'user', content: 'Hi', attachments: [] }],
      } as never)

      const req = new NextRequest('http://localhost:3000/api/conversations/c-1')
      const response = await GET(req, createParams('c-1'))
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.messages).toHaveLength(1)
    })

    it('존재하지 않는 대화면 404를 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.findFirst.mockResolvedValue(null as never)

      const req = new NextRequest('http://localhost:3000/api/conversations/nonexistent')
      const response = await GET(req, createParams('nonexistent'))

      expect(response.status).toBe(404)
    })
  })

  describe('PATCH', () => {
    it('인증 없으면 401을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION_NULL)

      const req = new NextRequest('http://localhost:3000/api/conversations/c-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'New Title' }),
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await PATCH(req, createParams('c-1'))

      expect(response.status).toBe(401)
    })

    it('대화 title을 업데이트한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.findFirst.mockResolvedValue({ id: 'c-1' } as never)
      mockPrisma.conversation.update.mockResolvedValue({
        id: 'c-1',
        title: 'Updated Title',
      } as never)

      const req = new NextRequest('http://localhost:3000/api/conversations/c-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated Title' }),
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await PATCH(req, createParams('c-1'))
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.title).toBe('Updated Title')
    })

    it('존재하지 않는 대화면 404를 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.findFirst.mockResolvedValue(null as never)

      const req = new NextRequest('http://localhost:3000/api/conversations/c-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'New' }),
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await PATCH(req, createParams('c-1'))

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE', () => {
    it('인증 없으면 401을 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION_NULL)

      const req = new NextRequest('http://localhost:3000/api/conversations/c-1', { method: 'DELETE' })
      const response = await DELETE(req, createParams('c-1'))

      expect(response.status).toBe(401)
    })

    it('대화를 삭제한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.findFirst.mockResolvedValue({ id: 'c-1' } as never)
      mockPrisma.conversation.delete.mockResolvedValue({} as never)

      const req = new NextRequest('http://localhost:3000/api/conversations/c-1', { method: 'DELETE' })
      const response = await DELETE(req, createParams('c-1'))
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.success).toBe(true)
      expect(mockPrisma.conversation.delete).toHaveBeenCalledWith({ where: { id: 'c-1' } })
    })

    it('존재하지 않는 대화면 404를 반환한다', async () => {
      mocks.getServerSession.mockResolvedValue(MOCK_SESSION)
      mockPrisma.conversation.findFirst.mockResolvedValue(null as never)

      const req = new NextRequest('http://localhost:3000/api/conversations/c-1', { method: 'DELETE' })
      const response = await DELETE(req, createParams('c-1'))

      expect(response.status).toBe(404)
    })
  })
})
