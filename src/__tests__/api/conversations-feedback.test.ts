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

import { POST } from '@/app/api/conversations/[id]/feedback/route'

const USER_SESSION = {
  user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
  expires: '2099-01-01T00:00:00.000Z',
}

function createRequest(conversationId: string, body: Record<string, unknown>) {
  return new NextRequest(
    `http://localhost:3000/api/conversations/${conversationId}/feedback`,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

function createParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe('POST /api/conversations/:id/feedback', () => {
  beforeEach(() => {
    resetPrismaMocks()
    mocks.getServerSession.mockReset()
  })

  it('인증되지 않으면 401을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(null)
    const req = createRequest('conv-1', { messageId: 'msg-1', thumbsUp: true })
    const response = await POST(req, createParams('conv-1'))
    expect(response.status).toBe(401)
  })

  it('messageId가 없으면 400을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)
    const req = createRequest('conv-1', { thumbsUp: true })
    const response = await POST(req, createParams('conv-1'))
    expect(response.status).toBe(400)
  })

  it('thumbsUp이 boolean이 아니면 400을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)
    const req = createRequest('conv-1', { messageId: 'msg-1', thumbsUp: 'yes' })
    const response = await POST(req, createParams('conv-1'))
    expect(response.status).toBe(400)
  })

  it('대화가 존재하지 않으면 404를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)
    mockPrisma.conversation.findFirst.mockResolvedValue(null as never)
    const req = createRequest('conv-999', { messageId: 'msg-1', thumbsUp: true })
    const response = await POST(req, createParams('conv-999'))
    expect(response.status).toBe(404)
  })

  it('이미 피드백이 있으면 409를 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)
    mockPrisma.conversation.findFirst.mockResolvedValue({ id: 'conv-1', userId: 'user-1' } as never)
    mockPrisma.conversationFeedback.findFirst.mockResolvedValue({ id: 'fb-1' } as never)
    const req = createRequest('conv-1', { messageId: 'msg-1', thumbsUp: true })
    const response = await POST(req, createParams('conv-1'))
    expect(response.status).toBe(409)
  })

  it('피드백을 성공적으로 생성한다 (thumbsUp만)', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)
    mockPrisma.conversation.findFirst.mockResolvedValue({ id: 'conv-1', userId: 'user-1' } as never)
    mockPrisma.conversationFeedback.findFirst.mockResolvedValue(null as never)
    mockPrisma.conversationFeedback.create.mockResolvedValue({
      id: 'fb-new',
      conversationId: 'conv-1',
      userId: 'user-1',
      messageId: 'msg-1',
      thumbsUp: true,
    } as never)
    const req = createRequest('conv-1', { messageId: 'msg-1', thumbsUp: true })
    const response = await POST(req, createParams('conv-1'))
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.thumbsUp).toBe(true)
  })

  it('상세 피드백 (feedbackType, comment, rating) 포함하여 생성한다', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)
    mockPrisma.conversation.findFirst.mockResolvedValue({ id: 'conv-1', userId: 'user-1' } as never)
    mockPrisma.conversationFeedback.findFirst.mockResolvedValue(null as never)
    mockPrisma.conversationFeedback.create.mockResolvedValue({
      id: 'fb-new',
      conversationId: 'conv-1',
      userId: 'user-1',
      messageId: 'msg-2',
      thumbsUp: false,
      feedbackType: 'accuracy',
      comment: 'Not quite right',
      rating: 2,
    } as never)
    const req = createRequest('conv-1', {
      messageId: 'msg-2',
      thumbsUp: false,
      feedbackType: 'accuracy',
      comment: 'Not quite right',
      rating: 2,
    })
    const response = await POST(req, createParams('conv-1'))
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.thumbsUp).toBe(false)
    expect(data.feedbackType).toBe('accuracy')
    expect(data.rating).toBe(2)
  })

  it('rating이 1-5 범위 밖이면 400을 반환한다', async () => {
    mocks.getServerSession.mockResolvedValue(USER_SESSION)
    const req = createRequest('conv-1', { messageId: 'msg-1', thumbsUp: true, rating: 6 })
    const response = await POST(req, createParams('conv-1'))
    expect(response.status).toBe(400)
  })
})
